# AI Models Directory

This directory contains downloaded AI model files (.onnx).
Models are not committed to git due to their large size.

Run the download script to populate this directory:

```bash
python scripts/download_models.py --all
```

## Expected Models

| File | Size | Purpose |
|---|---|---|
| phi3-mini-4k-int4.onnx | ~2.3 GB | Multilingual tutor LLM |
| whisper-tiny.onnx | ~150 MB | Speech-to-Text |
| fastspeech2.onnx | ~50 MB | Text-to-Speech |
| hifigan.onnx | ~30 MB | TTS Vocoder |
| mediapipe-hand-landmark.onnx | ~15 MB | Hand detection |
| gesture-classifier.onnx | ~5 MB | ISL gesture classification |
| trocr-base.onnx | ~120 MB | Document OCR |
