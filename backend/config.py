"""
Disha — Centralized Configuration
All model paths, NPU settings, language configs, and server settings.
"""
import os
from pathlib import Path

# ─── Paths ────────────────────────────────────────────────────────────────────
BASE_DIR = Path(__file__).resolve().parent.parent
MODELS_DIR = BASE_DIR / "models"
ASSETS_DIR = BASE_DIR / "assets"

# ─── Server ───────────────────────────────────────────────────────────────────
SERVER_HOST = "127.0.0.1"
SERVER_PORT = 8765

# ─── Demo Mode ────────────────────────────────────────────────────────────────
# Set DISHA_DEMO_MODE=0 to disable simulated NPU mode and force hardware-only detection.
# Defaults to "1" so hackathon demos & local testing work out of the box on any PC.
DEMO_MODE = os.environ.get("DISHA_DEMO_MODE", "1") == "1"

# ─── NPU / Runtime Settings ──────────────────────────────────────────────────
# Set to "htp" for Snapdragon NPU, "cpu" for fallback
NPU_BACKEND = os.environ.get("DISHA_NPU_BACKEND", "cpu")

QNN_PROVIDER_OPTIONS = {
    "backend_type": NPU_BACKEND,
}

# Execution providers in priority order
EXECUTION_PROVIDERS = ["QNNExecutionProvider", "CPUExecutionProvider"]
if NPU_BACKEND == "cpu":
    EXECUTION_PROVIDERS = ["CPUExecutionProvider"]

# ─── Model Paths ──────────────────────────────────────────────────────────────
MODELS = {
    "tutor_llm": {
        "path": MODELS_DIR / "phi3-mini-4k-int4.onnx",
        "name": "Phi-3 Mini 4K (INT4)",
        "source": "Qualcomm AI Hub / Hugging Face",
        "size_mb": 2300,
    },
    "whisper_tiny": {
        "path": MODELS_DIR / "whisper-tiny.onnx",
        "name": "Whisper Tiny (INT8)",
        "source": "Qualcomm AI Hub",
        "size_mb": 150,
    },
    "tts_fastspeech": {
        "path": MODELS_DIR / "fastspeech2.onnx",
        "name": "FastSpeech2",
        "source": "Open Source (ONNX)",
        "size_mb": 50,
    },
    "tts_vocoder": {
        "path": MODELS_DIR / "hifigan.onnx",
        "name": "HiFi-GAN Vocoder",
        "source": "Open Source (ONNX)",
        "size_mb": 30,
    },
    "hand_landmark": {
        "path": MODELS_DIR / "mediapipe-hand-landmark.onnx",
        "name": "MediaPipe Hand Landmark",
        "source": "Qualcomm AI Hub",
        "size_mb": 15,
    },
    "gesture_classifier": {
        "path": MODELS_DIR / "gesture-classifier.onnx",
        "name": "ISL Gesture Classifier",
        "source": "Custom trained",
        "size_mb": 5,
    },
    "ocr_trocr": {
        "path": MODELS_DIR / "trocr-base.onnx",
        "name": "TrOCR Base",
        "source": "Qualcomm AI Hub",
        "size_mb": 120,
    },
}

# ─── Language Configuration ───────────────────────────────────────────────────
SUPPORTED_LANGUAGES = {
    "en": {"name": "English", "native": "English", "tts_voice": "en"},
    "hi": {"name": "Hindi", "native": "हिन्दी", "tts_voice": "hi"},
    "ta": {"name": "Tamil", "native": "தமிழ்", "tts_voice": "ta"},
    "te": {"name": "Telugu", "native": "తెలుగు", "tts_voice": "te"},
    "kn": {"name": "Kannada", "native": "ಕನ್ನಡ", "tts_voice": "kn"},
    "bn": {"name": "Bengali", "native": "বাংলা", "tts_voice": "bn"},
}

DEFAULT_LANGUAGE = "hi"

# ─── Subjects ─────────────────────────────────────────────────────────────────
SUBJECTS = [
    {"id": "math", "name": "Mathematics", "icon": "📐"},
    {"id": "science", "name": "Science", "icon": "🔬"},
    {"id": "english", "name": "English", "icon": "📖"},
    {"id": "social", "name": "Social Studies", "icon": "🌍"},
    {"id": "hindi", "name": "Hindi", "icon": "🇮🇳"},
    {"id": "general", "name": "General Knowledge", "icon": "💡"},
]

# ─── Sign Language ────────────────────────────────────────────────────────────
ISL_VOCABULARY = [
    # Alphabets A-Z
    *[chr(i) for i in range(65, 91)],
    # Common classroom words
    "hello", "thank you", "please", "yes", "no", "help",
    "teacher", "student", "book", "pen", "write", "read",
    "question", "answer", "understand", "repeat", "stop",
    "good", "bad", "more", "less", "number", "word",
]
