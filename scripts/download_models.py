"""
Disha — Model Download Script
Downloads all required AI models from Qualcomm AI Hub and Hugging Face.
Run this once with internet access before going offline.

Usage:
    python scripts/download_models.py [--all | --model MODEL_NAME]
"""
import os
import sys
import argparse
import hashlib
from pathlib import Path

# Add project root to path
PROJECT_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(PROJECT_ROOT))

from backend.config import MODELS, MODELS_DIR


# ─── Download Registry ───────────────────────────────────────────────────────
DOWNLOAD_URLS = {
    "tutor_llm": {
        "url": "https://huggingface.co/microsoft/Phi-3-mini-4k-instruct-onnx/resolve/main/cpu_and_mobile/cpu-int4-rtn-block-32-acc-level-4/phi3-mini-4k-instruct-cpu-int4-rtn-block-32-acc-level-4.onnx",
        "filename": "phi3-mini-4k-int4.onnx",
        "description": "Phi-3 Mini 4K Instruct (INT4 quantized) — Multilingual tutor LLM",
    },
    "whisper_tiny": {
        "url": "https://huggingface.co/openai/whisper-tiny/resolve/main/onnx/model.onnx",
        "filename": "whisper-tiny.onnx",
        "description": "Whisper Tiny — Speech-to-Text for Hindi/English",
    },
    "tts_fastspeech": {
        "url": "https://huggingface.co/espnet/fastspeech2_onnx/resolve/main/fastspeech2.onnx",
        "filename": "fastspeech2.onnx",
        "description": "FastSpeech2 — Text-to-Speech synthesis",
    },
    "tts_vocoder": {
        "url": "https://huggingface.co/espnet/hifigan_onnx/resolve/main/hifigan.onnx",
        "filename": "hifigan.onnx",
        "description": "HiFi-GAN — Neural vocoder for TTS",
    },
    "hand_landmark": {
        "url": "https://huggingface.co/qualcomm/MediaPipeHandLandmark/resolve/main/model.onnx",
        "filename": "mediapipe-hand-landmark.onnx",
        "description": "MediaPipe Hand Landmark — Hand pose detection (Qualcomm AI Hub)",
    },
    "gesture_classifier": {
        "url": "https://huggingface.co/disha-ai/isl-gesture-classifier/resolve/main/gesture-classifier.onnx",
        "filename": "gesture-classifier.onnx",
        "description": "ISL Gesture Classifier — Indian Sign Language detection",
    },
    "ocr_trocr": {
        "url": "https://huggingface.co/microsoft/trocr-base-printed/resolve/main/onnx/model.onnx",
        "filename": "trocr-base.onnx",
        "description": "TrOCR Base — Optical Character Recognition",
    },
}


def download_file(url: str, dest_path: Path, description: str):
    """Download a file with progress indication."""
    try:
        import urllib.request
        
        print(f"\n📥 Downloading: {description}")
        print(f"   URL: {url}")
        print(f"   Destination: {dest_path}")
        
        if dest_path.exists():
            print(f"   ⏭️  Already exists, skipping. Delete to re-download.")
            return True

        dest_path.parent.mkdir(parents=True, exist_ok=True)

        def progress_hook(block_num, block_size, total_size):
            downloaded = block_num * block_size
            if total_size > 0:
                percent = min(100, downloaded * 100 / total_size)
                mb_downloaded = downloaded / (1024 * 1024)
                mb_total = total_size / (1024 * 1024)
                bar_len = 30
                filled = int(bar_len * percent / 100)
                bar = "█" * filled + "░" * (bar_len - filled)
                print(f"\r   [{bar}] {percent:.1f}% ({mb_downloaded:.1f}/{mb_total:.1f} MB)", end="", flush=True)

        urllib.request.urlretrieve(url, str(dest_path), reporthook=progress_hook)
        print(f"\n   ✅ Downloaded successfully!")
        return True

    except Exception as e:
        print(f"\n   ❌ Download failed: {e}")
        return False


def main():
    parser = argparse.ArgumentParser(
        description="Download AI models for Disha offline learning companion"
    )
    parser.add_argument(
        "--all", action="store_true",
        help="Download all models"
    )
    parser.add_argument(
        "--model", type=str,
        help="Download a specific model (e.g., whisper_tiny, ocr_trocr)"
    )
    parser.add_argument(
        "--list", action="store_true",
        help="List available models and their status"
    )
    args = parser.parse_args()

    print("🧭 Disha — Model Download Manager")
    print("=" * 50)

    MODELS_DIR.mkdir(parents=True, exist_ok=True)

    if args.list or (not args.all and not args.model):
        print("\nAvailable models:\n")
        for key, info in DOWNLOAD_URLS.items():
            model_config = MODELS.get(key, {})
            path = model_config.get("path", MODELS_DIR / info["filename"])
            status = "✅ Downloaded" if path.exists() else "❌ Not downloaded"
            size_mb = model_config.get("size_mb", "?")
            print(f"  {key:25s} │ {status} │ ~{size_mb} MB")
            print(f"  {'':25s} │ {info['description']}")
            print()
        
        if not args.all and not args.model:
            print("Usage:")
            print("  python scripts/download_models.py --all        Download all models")
            print("  python scripts/download_models.py --model KEY  Download specific model")
            return

    models_to_download = {}

    if args.all:
        models_to_download = DOWNLOAD_URLS
    elif args.model:
        if args.model in DOWNLOAD_URLS:
            models_to_download = {args.model: DOWNLOAD_URLS[args.model]}
        else:
            print(f"❌ Unknown model: {args.model}")
            print(f"   Available: {', '.join(DOWNLOAD_URLS.keys())}")
            return

    success_count = 0
    fail_count = 0

    for key, info in models_to_download.items():
        dest = MODELS_DIR / info["filename"]
        ok = download_file(info["url"], dest, info["description"])
        if ok:
            success_count += 1
        else:
            fail_count += 1

    print(f"\n{'=' * 50}")
    print(f"✅ Downloaded: {success_count}  ❌ Failed: {fail_count}")
    
    if fail_count > 0:
        print("\n⚠️  Some downloads failed. The app will still work in mock mode")
        print("   for those features. You can retry later with internet access.")
    
    print("\n🚀 You can now run the app offline!")


if __name__ == "__main__":
    main()
