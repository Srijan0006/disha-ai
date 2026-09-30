"""
Disha — FastAPI Backend Server
Main entry point for the on-device AI backend.
All AI inference runs locally via ONNX Runtime + QNN EP.
"""
import logging
import base64
from contextlib import asynccontextmanager

from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field

from backend.config import (
    SERVER_HOST, SERVER_PORT, SUPPORTED_LANGUAGES,
    SUBJECTS, MODELS,
)
from backend.npu_runtime import npu_runtime
from backend.modules.tutor.tutor_service import tutor_service
from backend.modules.accessibility.stt_service import stt_service
from backend.modules.accessibility.tts_service import tts_service
from backend.modules.accessibility.sign_language_service import sign_language_service
from backend.modules.docscan.ocr_service import ocr_service
from backend.modules.docscan.summary_service import summary_service

# ─── Logging ──────────────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s │ %(name)-20s │ %(levelname)-7s │ %(message)s",
    datefmt="%H:%M:%S",
)
logger = logging.getLogger("disha.server")


# ─── Lifespan (startup/shutdown) ──────────────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initialize all AI modules on startup."""
    logger.info("=" * 60)
    logger.info("  🧭 Disha — Offline AI Learning Companion")
    logger.info("  Starting up...")
    logger.info("=" * 60)

    # Initialize all services (they gracefully handle missing models)
    tutor_service.initialize()
    stt_service.initialize()
    tts_service.initialize()
    sign_language_service.initialize()
    ocr_service.initialize()

    logger.info("=" * 60)
    logger.info("  ✅ All modules initialized. Server ready.")
    logger.info(f"  NPU Status: {'✅ Available' if npu_runtime.is_npu_available else '⚠️ Using CPU fallback'}")
    logger.info("=" * 60)

    yield  # Server runs here

    # Cleanup
    npu_runtime.unload_all()
    logger.info("🧭 Disha server shut down cleanly.")


# ─── FastAPI App ──────────────────────────────────────────────────────────────
app = FastAPI(
    title="Disha — Offline AI Learning Companion",
    description="On-device AI backend for education and accessibility, powered by Snapdragon NPU",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS for Electron/browser frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ─── Request/Response Models ─────────────────────────────────────────────────
class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=5000)
    language: str = Field(default="en")
    subject: str = Field(default="general")


class TTSRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=2000)
    language: str = Field(default="en")
    speed: float = Field(default=1.0, ge=0.5, le=2.0)


class SignLanguageRequest(BaseModel):
    frame_base64: str


class OCRRequest(BaseModel):
    image_base64: str
    language: str = Field(default="en")


class SummaryRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=10000)
    language: str = Field(default="en")
    mode: str = Field(default="summary")  # summary | explain | quiz | translate


# ─── System Routes ────────────────────────────────────────────────────────────
@app.get("/api/status")
async def get_status():
    """Get system status including NPU availability and loaded models."""
    return {
        "status": "online",
        "app": "Disha",
        "version": "1.0.0",
        "runtime": npu_runtime.runtime_status,
        "modules": {
            "tutor": {"loaded": tutor_service.is_model_loaded},
            "stt": {"loaded": stt_service.is_model_loaded},
            "tts": {
                "neural": tts_service.is_neural_tts_available,
                "any": tts_service.is_any_tts_available,
            },
            "sign_language": {"loaded": sign_language_service.is_available},
            "ocr": {"loaded": ocr_service.is_model_loaded},
        },
    }


@app.get("/api/languages")
async def get_languages():
    """Get supported languages."""
    return {"languages": SUPPORTED_LANGUAGES}


@app.get("/api/subjects")
async def get_subjects():
    """Get available subjects."""
    return {"subjects": SUBJECTS}


@app.get("/api/models")
async def get_models():
    """Get model information."""
    models_info = {}
    for key, info in MODELS.items():
        models_info[key] = {
            "name": info["name"],
            "source": info["source"],
            "size_mb": info["size_mb"],
            "available": info["path"].exists(),
        }
    return {"models": models_info}


@app.get("/api/proposal")
async def get_proposal():
    """Get the official challenge proposal markdown."""
    from backend.config import BASE_DIR
    proposal_path = BASE_DIR / "PROPOSAL.md"
    if proposal_path.exists():
        return {"content": proposal_path.read_text(encoding="utf-8")}
    return {"content": "# Disha Proposal\nProposal document not found."}


@app.post("/api/demo-mode")
async def toggle_demo_mode(request: dict):
    """Toggle simulated Snapdragon NPU demo mode."""
    enabled = request.get("enabled", True)
    npu_runtime.set_demo_mode(enabled)
    return {
        "demo_mode": npu_runtime.is_demo_mode,
        "runtime": npu_runtime.runtime_status,
    }


# ─── Tutor Routes ─────────────────────────────────────────────────────────────
@app.post("/api/tutor/chat")
async def tutor_chat(request: ChatRequest):
    """Send a message to the AI tutor and get a response."""
    result = await tutor_service.chat(
        message=request.message,
        language=request.language,
        subject=request.subject,
    )
    return result


@app.post("/api/tutor/clear")
async def tutor_clear():
    """Clear the tutor conversation history."""
    tutor_service.clear_history()
    return {"status": "cleared"}


# ─── Speech-to-Text Routes ───────────────────────────────────────────────────
@app.post("/api/accessibility/stt")
async def speech_to_text(
    audio: UploadFile = File(...),
    language: str = "en",
):
    """Transcribe uploaded audio file to text."""
    audio_data = await audio.read()
    result = await stt_service.transcribe(audio_data, language)
    return result


@app.post("/api/accessibility/stt/base64")
async def speech_to_text_base64(request: dict):
    """Transcribe base64-encoded audio to text."""
    audio_b64 = request.get("audio_base64", "")
    language = request.get("language", "en")
    audio_data = base64.b64decode(audio_b64)
    result = await stt_service.transcribe(audio_data, language)
    return result


# ─── Text-to-Speech Routes ───────────────────────────────────────────────────
@app.post("/api/accessibility/tts")
async def text_to_speech(request: TTSRequest):
    """Convert text to speech audio."""
    result = await tts_service.synthesize(
        text=request.text,
        language=request.language,
        speed=request.speed,
    )
    return result


# ─── Sign Language Routes ────────────────────────────────────────────────────
@app.post("/api/accessibility/sign-language/detect")
async def detect_sign_language(request: SignLanguageRequest):
    """Process a webcam frame for sign language detection."""
    result = await sign_language_service.process_frame(request.frame_base64)
    return result


@app.post("/api/accessibility/sign-language/clear")
async def clear_sign_buffer():
    """Clear the sign language text buffer."""
    sign_language_service.clear_buffer()
    return {"status": "cleared", "text": ""}


@app.get("/api/accessibility/sign-language/text")
async def get_sign_text():
    """Get the accumulated sign language text."""
    return {"text": sign_language_service.current_text}


# ─── Document Scan Routes ────────────────────────────────────────────────────
@app.post("/api/docscan/ocr")
async def scan_document(request: OCRRequest):
    """Extract text from an image using OCR."""
    result = await ocr_service.extract_text(
        image_base64=request.image_base64,
        language=request.language,
    )
    return result


@app.post("/api/docscan/summary")
async def summarize_document(request: SummaryRequest):
    """Summarize or explain extracted document text."""
    result = await summary_service.summarize(
        text=request.text,
        language=request.language,
        mode=request.mode,
    )
    return result


# ─── Run ──────────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "backend.main:app",
        host=SERVER_HOST,
        port=SERVER_PORT,
        reload=False,
        log_level="info",
    )
