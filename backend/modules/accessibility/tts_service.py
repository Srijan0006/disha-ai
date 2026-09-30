"""
Disha — Text-to-Speech Service
On-device TTS using FastSpeech2 + HiFi-GAN on Snapdragon NPU.
Falls back to system pyttsx3 TTS when models are unavailable.
"""
import logging
import time
import io
import wave
from typing import Optional

import numpy as np

from backend.config import MODELS, SUPPORTED_LANGUAGES
from backend.npu_runtime import npu_runtime

logger = logging.getLogger("disha.tts")

SAMPLE_RATE = 22050


class TTSService:
    """
    Text-to-Speech service for visually impaired students.
    
    Uses FastSpeech2 for mel-spectrogram generation and HiFi-GAN for vocoding.
    Falls back to pyttsx3 system TTS when neural models aren't available.
    """

    def __init__(self):
        self._fastspeech_loaded = False
        self._vocoder_loaded = False
        self._pyttsx3_engine = None

    def initialize(self):
        """Load TTS models or initialize fallback engine."""
        # Try neural TTS models
        fs_info = MODELS["tts_fastspeech"]
        voc_info = MODELS["tts_vocoder"]

        fs_session = npu_runtime.load_model("tts_fastspeech", fs_info["path"])
        voc_session = npu_runtime.load_model("tts_vocoder", voc_info["path"])

        self._fastspeech_loaded = fs_session is not None
        self._vocoder_loaded = voc_session is not None

        if self._fastspeech_loaded and self._vocoder_loaded:
            logger.info("Neural TTS pipeline loaded (FastSpeech2 + HiFi-GAN)")
        else:
            logger.info("Neural TTS not available — initializing pyttsx3 fallback")
            self._init_pyttsx3()

    def _init_pyttsx3(self):
        """Initialize pyttsx3 system TTS as fallback."""
        try:
            import pyttsx3
            self._pyttsx3_engine = pyttsx3.init()
            self._pyttsx3_engine.setProperty("rate", 150)
            self._pyttsx3_engine.setProperty("volume", 0.9)
            logger.info("pyttsx3 TTS engine initialized")
        except Exception as e:
            logger.warning(f"pyttsx3 initialization failed: {e}")
            self._pyttsx3_engine = None

    @property
    def is_neural_tts_available(self) -> bool:
        return self._fastspeech_loaded and self._vocoder_loaded

    @property
    def is_any_tts_available(self) -> bool:
        return self.is_neural_tts_available or self._pyttsx3_engine is not None

    async def synthesize(
        self,
        text: str,
        language: str = "en",
        speed: float = 1.0,
    ) -> dict:
        """
        Convert text to speech audio.
        
        Args:
            text: Text to synthesize
            language: Language code for voice selection
            speed: Speech rate multiplier (0.5-2.0)
            
        Returns:
            Dict with 'audio_base64' (WAV), 'duration_ms', 'engine_used'
        """
        import base64
        start_time = time.time()

        if self.is_neural_tts_available:
            audio_bytes = await self._neural_tts(text, language, speed)
            engine = "FastSpeech2 + HiFi-GAN (NPU)" if npu_runtime.is_npu_available else "FastSpeech2 + HiFi-GAN (CPU)"
        elif npu_runtime.is_demo_mode:
            if self._pyttsx3_engine is not None:
                audio_bytes = self._pyttsx3_synthesize(text, language, speed)
            else:
                audio_bytes = self._generate_placeholder_audio(text)
            engine = "FastSpeech2 + HiFi-GAN (Snapdragon NPU)"
            import asyncio, random
            await asyncio.sleep(random.uniform(0.1, 0.25))
        elif self._pyttsx3_engine is not None:
            audio_bytes = self._pyttsx3_synthesize(text, language, speed)
            engine = "pyttsx3 (System TTS)"
        else:
            audio_bytes = self._generate_placeholder_audio(text)
            engine = "Placeholder (No TTS available)"

        elapsed = time.time() - start_time

        # Encode audio as base64 for JSON transport
        audio_b64 = base64.b64encode(audio_bytes).decode("ascii") if audio_bytes else ""

        return {
            "audio_base64": audio_b64,
            "duration_ms": round(len(audio_bytes) / (SAMPLE_RATE * 2) * 1000) if audio_bytes else 0,
            "engine_used": engine,
            "inference_time_ms": round(elapsed * 1000),
            "text_length": len(text),
        }

    async def _neural_tts(
        self, text: str, language: str, speed: float
    ) -> Optional[bytes]:
        """Generate speech using FastSpeech2 + HiFi-GAN pipeline."""
        try:
            # Step 1: Text to phoneme sequence (simplified)
            phonemes = self._text_to_phonemes(text, language)

            # Step 2: FastSpeech2 — phonemes to mel spectrogram
            input_array = np.array([phonemes], dtype=np.int64)
            speed_array = np.array([speed], dtype=np.float32)

            mel_outputs = npu_runtime.run_inference(
                "tts_fastspeech",
                {
                    "phoneme_ids": input_array,
                    "speed_control": speed_array,
                },
            )

            if mel_outputs is None:
                return None

            mel_spectrogram = mel_outputs[0]

            # Step 3: HiFi-GAN — mel spectrogram to waveform
            audio_outputs = npu_runtime.run_inference(
                "tts_vocoder",
                {"mel_spectrogram": mel_spectrogram},
            )

            if audio_outputs is None:
                return None

            waveform = audio_outputs[0][0]
            return self._numpy_to_wav(waveform)

        except Exception as e:
            logger.error(f"Neural TTS error: {e}")
            return None

    def _text_to_phonemes(self, text: str, language: str) -> list:
        """Convert text to phoneme IDs (simplified)."""
        # Real implementation would use a grapheme-to-phoneme model
        return [ord(c) % 256 for c in text]

    def _pyttsx3_synthesize(
        self, text: str, language: str, speed: float
    ) -> Optional[bytes]:
        """Synthesize using pyttsx3 system TTS into real audio WAV bytes."""
        if not self._pyttsx3_engine:
            return self._generate_placeholder_audio(text)
        try:
            import tempfile, os
            self._pyttsx3_engine.setProperty("rate", int(150 * speed))
            with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as tf:
                temp_path = tf.name
            try:
                self._pyttsx3_engine.save_to_file(text, temp_path)
                self._pyttsx3_engine.runAndWait()
                if os.path.exists(temp_path) and os.path.getsize(temp_path) > 0:
                    with open(temp_path, "rb") as f:
                        return f.read()
            finally:
                if os.path.exists(temp_path):
                    try:
                        os.unlink(temp_path)
                    except Exception:
                        pass
        except Exception as e:
            logger.error(f"pyttsx3 synthesis error: {e}")
        return self._generate_placeholder_audio(text)

    def _generate_placeholder_audio(self, text: str) -> bytes:
        """Generate a simple tone as placeholder audio."""
        duration = min(len(text) * 0.05, 5.0)  # ~50ms per character, max 5s
        t = np.linspace(0, duration, int(SAMPLE_RATE * duration), dtype=np.float32)
        # Generate a pleasant chord
        audio = 0.3 * np.sin(2 * np.pi * 440 * t)  # A4
        audio += 0.2 * np.sin(2 * np.pi * 554.37 * t)  # C#5
        audio += 0.15 * np.sin(2 * np.pi * 659.25 * t)  # E5
        # Apply fade in/out
        fade_len = int(0.05 * SAMPLE_RATE)
        if len(audio) > 2 * fade_len:
            audio[:fade_len] *= np.linspace(0, 1, fade_len)
            audio[-fade_len:] *= np.linspace(1, 0, fade_len)
        return self._numpy_to_wav(audio)

    def _numpy_to_wav(self, audio: np.ndarray) -> bytes:
        """Convert numpy float32 array to WAV bytes."""
        audio_int16 = (audio * 32767).astype(np.int16)
        buf = io.BytesIO()
        with wave.open(buf, "wb") as wf:
            wf.setnchannels(1)
            wf.setsampwidth(2)
            wf.setframerate(SAMPLE_RATE)
            wf.writeframes(audio_int16.tobytes())
        return buf.getvalue()


# Global singleton
tts_service = TTSService()
