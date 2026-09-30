"""
Disha — NPU Runtime Manager
Shared ONNX Runtime session manager with QNN Execution Provider support.
Handles model loading, session caching, and graceful fallback to CPU.
"""
import logging
from pathlib import Path
from typing import Optional

logger = logging.getLogger("disha.npu_runtime")

# Try to import onnxruntime — may not be installed yet
try:
    import onnxruntime as ort
    ORT_AVAILABLE = True
except ImportError:
    ORT_AVAILABLE = False
    logger.warning("onnxruntime not installed. AI features will use mock mode.")

from backend.config import EXECUTION_PROVIDERS, QNN_PROVIDER_OPTIONS, DEMO_MODE


class NPURuntime:
    """
    Manages ONNX Runtime inference sessions with Snapdragon NPU acceleration.
    
    - Caches loaded sessions to avoid redundant model loading.
    - Falls back from QNN EP → CPU EP automatically.
    - Provides NPU status information for the dashboard.
    """

    def __init__(self):
        self._sessions: dict[str, ort.InferenceSession] = {} if ORT_AVAILABLE else {}
        self._npu_available = False
        self._demo_mode = DEMO_MODE
        self._check_npu_availability()

    def _check_npu_availability(self):
        """Check if QNN Execution Provider (Snapdragon NPU) is available."""
        if self._demo_mode:
            self._npu_available = True
            logger.info("✅ DEMO MODE: Simulating Snapdragon NPU (QNN EP) availability")
            return

        if not ORT_AVAILABLE:
            self._npu_available = False
            return

        available_providers = ort.get_available_providers()
        self._npu_available = "QNNExecutionProvider" in available_providers
        
        if self._npu_available:
            logger.info("✅ Snapdragon NPU (QNN EP) is available!")
        else:
            logger.info(
                f"ℹ️  QNN EP not available. Using CPU fallback. "
                f"Available providers: {available_providers}"
            )

    @property
    def is_npu_available(self) -> bool:
        return self._npu_available

    @property
    def is_demo_mode(self) -> bool:
        return self._demo_mode

    def set_demo_mode(self, enabled: bool):
        """Toggle demo mode at runtime."""
        self._demo_mode = enabled
        self._check_npu_availability()

    @property
    def runtime_status(self) -> dict:
        """Return runtime status info for the dashboard."""
        if self._demo_mode:
            return {
                "ort_available": True,
                "npu_available": True,
                "active_provider": "QNNExecutionProvider (Snapdragon Hexagon NPU)",
                "loaded_models": ["tutor_llm", "whisper_tiny", "tts_fastspeech", "tts_vocoder", "hand_landmark", "gesture_classifier", "ocr_trocr"],
                "ort_version": "1.20.0",
                "demo_mode": True,
                "npu_utilization": 23,
                "npu_tops": 45,
            }
        return {
            "ort_available": ORT_AVAILABLE,
            "npu_available": self._npu_available,
            "active_provider": "QNNExecutionProvider" if self._npu_available else "CPUExecutionProvider",
            "loaded_models": list(self._sessions.keys()),
            "ort_version": ort.__version__ if ORT_AVAILABLE else None,
        }

    def load_model(self, model_key: str, model_path: Path) -> Optional[object]:
        """
        Load an ONNX model and create an inference session.
        
        Args:
            model_key: Unique identifier for caching (e.g., "whisper_tiny")
            model_path: Path to the .onnx model file
            
        Returns:
            ONNX Runtime InferenceSession or None if loading fails
        """
        if not ORT_AVAILABLE:
            logger.warning(f"Cannot load model '{model_key}': onnxruntime not installed")
            return None

        # Return cached session if already loaded
        if model_key in self._sessions:
            logger.debug(f"Using cached session for '{model_key}'")
            return self._sessions[model_key]

        if not model_path.exists():
            logger.warning(
                f"Model file not found: {model_path}. "
                f"Run 'python scripts/download_models.py' to download models."
            )
            return None

        # Build provider list with options
        providers = []
        provider_options = []

        if self._npu_available and "QNNExecutionProvider" in EXECUTION_PROVIDERS:
            providers.append("QNNExecutionProvider")
            provider_options.append(QNN_PROVIDER_OPTIONS)

        providers.append("CPUExecutionProvider")
        provider_options.append({})

        try:
            session_options = ort.SessionOptions()
            session_options.graph_optimization_level = (
                ort.GraphOptimizationLevel.ORT_ENABLE_ALL
            )
            # Enable parallel execution for better throughput
            session_options.execution_mode = ort.ExecutionMode.ORT_PARALLEL

            session = ort.InferenceSession(
                str(model_path),
                sess_options=session_options,
                providers=providers,
                provider_options=provider_options,
            )

            self._sessions[model_key] = session
            active_provider = session.get_providers()[0]
            logger.info(
                f"✅ Loaded model '{model_key}' on {active_provider} "
                f"({model_path.name})"
            )
            return session

        except Exception as e:
            logger.error(f"❌ Failed to load model '{model_key}': {e}")
            return None

    def run_inference(
        self, model_key: str, input_dict: dict
    ) -> Optional[list]:
        """
        Run inference on a loaded model.
        
        Args:
            model_key: The model identifier used during loading
            input_dict: Dictionary mapping input names to numpy arrays
            
        Returns:
            List of output numpy arrays, or None on failure
        """
        session = self._sessions.get(model_key)
        if session is None:
            logger.error(f"Model '{model_key}' is not loaded")
            return None

        try:
            outputs = session.run(None, input_dict)
            return outputs
        except Exception as e:
            logger.error(f"Inference failed for '{model_key}': {e}")
            return None

    def unload_model(self, model_key: str):
        """Unload a model to free memory."""
        if model_key in self._sessions:
            del self._sessions[model_key]
            logger.info(f"Unloaded model '{model_key}'")

    def unload_all(self):
        """Unload all models."""
        self._sessions.clear()
        logger.info("All models unloaded")


# Global singleton instance
npu_runtime = NPURuntime()
