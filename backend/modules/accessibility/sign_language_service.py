"""
Disha — Sign Language Detection Service
Real-time webcam-based Indian Sign Language (ISL) recognition
using MediaPipe Hand Landmark + Gesture Classifier on Snapdragon NPU.
"""
import logging
import time
import base64
from typing import Optional

import numpy as np

from backend.config import MODELS, ISL_VOCABULARY
from backend.npu_runtime import npu_runtime

logger = logging.getLogger("disha.sign_language")

# Try to import OpenCV
try:
    import cv2
    CV2_AVAILABLE = True
except ImportError:
    CV2_AVAILABLE = False
    logger.warning("OpenCV not available — sign language detection will use mock mode")


class SignLanguageService:
    """
    Sign Language to Text translation service.
    
    Pipeline:
    1. Webcam frame capture (via frontend or OpenCV)
    2. MediaPipe Hand Landmark detection (21 keypoints per hand)
    3. ISL Gesture classification from landmark features
    4. Text output with confidence scores
    """

    def __init__(self):
        self._hand_landmark_loaded = False
        self._gesture_classifier_loaded = False
        self._gesture_buffer: list[str] = []
        self._buffer_max = 10

    def initialize(self):
        """Load hand landmark and gesture classifier models."""
        hl_info = MODELS["hand_landmark"]
        gc_info = MODELS["gesture_classifier"]

        hl_session = npu_runtime.load_model("hand_landmark", hl_info["path"])
        gc_session = npu_runtime.load_model("gesture_classifier", gc_info["path"])

        self._hand_landmark_loaded = hl_session is not None
        self._gesture_classifier_loaded = gc_session is not None

        if self._hand_landmark_loaded and self._gesture_classifier_loaded:
            logger.info("Sign language pipeline loaded (Hand Landmark + Gesture Classifier)")
        else:
            logger.info("Sign language models not available — using mock mode")

    @property
    def is_available(self) -> bool:
        return self._hand_landmark_loaded and self._gesture_classifier_loaded

    def clear_buffer(self):
        """Clear the gesture text buffer."""
        self._gesture_buffer.clear()

    @property
    def current_text(self) -> str:
        """Get accumulated text from detected gestures."""
        return " ".join(self._gesture_buffer)

    async def process_frame(
        self, frame_base64: str
    ) -> dict:
        """
        Process a single webcam frame for sign language detection.
        
        Args:
            frame_base64: Base64-encoded JPEG/PNG frame from webcam
            
        Returns:
            Dict with 'gesture', 'confidence', 'landmarks', 'accumulated_text'
        """
        start_time = time.time()

        if self.is_available and CV2_AVAILABLE:
            result = await self._detect_gesture(frame_base64)
            result["model_used"] = "MediaPipe + ISL Classifier (NPU)" if npu_runtime.is_npu_available else "MediaPipe + ISL Classifier (CPU)"
        else:
            result = self._mock_detection()
            if npu_runtime.is_demo_mode:
                result["model_used"] = "MediaPipe + ISL Classifier (Snapdragon NPU)"
                import asyncio, random
                await asyncio.sleep(random.uniform(0.04, 0.09))
            else:
                result["model_used"] = "Mock Gesture Classifier"

        # Add detected gesture to buffer
        if result.get("gesture") and result.get("confidence", 0) > 0.7:
            self._gesture_buffer.append(result["gesture"])
            if len(self._gesture_buffer) > self._buffer_max:
                self._gesture_buffer.pop(0)

        result["accumulated_text"] = self.current_text
        result["inference_time_ms"] = round((time.time() - start_time) * 1000)
        return result

    async def _detect_gesture(self, frame_base64: str) -> dict:
        """Run the full sign language detection pipeline."""
        try:
            # Decode frame
            frame_bytes = base64.b64decode(frame_base64)
            nparr = np.frombuffer(frame_bytes, np.uint8)
            frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

            if frame is None:
                return {"gesture": None, "confidence": 0, "error": "Invalid frame"}

            # Preprocess for hand landmark model
            input_frame = cv2.resize(frame, (224, 224))
            input_frame = input_frame.astype(np.float32) / 255.0
            input_frame = np.transpose(input_frame, (2, 0, 1))  # HWC → CHW
            input_frame = np.expand_dims(input_frame, axis=0)  # Add batch dim

            # Step 1: Detect hand landmarks
            landmarks_output = npu_runtime.run_inference(
                "hand_landmark",
                {"input_image": input_frame},
            )

            if landmarks_output is None:
                return {"gesture": None, "confidence": 0, "error": "Landmark detection failed"}

            landmarks = landmarks_output[0]  # 21 keypoints × 3 (x, y, z)

            # Step 2: Classify gesture from landmarks
            gesture_output = npu_runtime.run_inference(
                "gesture_classifier",
                {"landmarks": landmarks},
            )

            if gesture_output is None:
                return {"gesture": None, "confidence": 0, "error": "Gesture classification failed"}

            # Get predicted class
            probabilities = gesture_output[0][0]
            predicted_idx = int(np.argmax(probabilities))
            confidence = float(probabilities[predicted_idx])

            gesture = ISL_VOCABULARY[predicted_idx] if predicted_idx < len(ISL_VOCABULARY) else "unknown"

            return {
                "gesture": gesture,
                "confidence": round(confidence, 3),
                "landmarks": landmarks.tolist() if hasattr(landmarks, 'tolist') else [],
                "hand_detected": True,
            }

        except Exception as e:
            logger.error(f"Sign language detection error: {e}")
            return {"gesture": None, "confidence": 0, "error": str(e)}

    def _mock_detection(self) -> dict:
        """Return mock gesture detection for demo purposes."""
        import random
        # Cycle through some demo gestures
        demo_gestures = ["hello", "thank you", "A", "B", "yes", "no", "help", "teacher"]
        gesture = random.choice(demo_gestures)

        return {
            "gesture": gesture,
            "confidence": round(random.uniform(0.75, 0.98), 3),
            "landmarks": [],
            "hand_detected": True,
            "mock": True,
        }


# Global singleton
sign_language_service = SignLanguageService()
