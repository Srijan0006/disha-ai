# 🧭 Disha — Offline AI Learning & Accessibility Companion

> **Bringing personalized education and accessibility tools to every student in rural India — no internet required.**

Disha is a 100% offline AI-powered desktop application built for **Snapdragon-powered HP Copilot+ PCs**. It runs all AI inference on-device using the **Snapdragon Hexagon NPU (45 TOPS)** via ONNX Runtime with QNN Execution Provider.

---

## 🌟 Features

### 🎓 Multilingual AI Tutor
- Chat with an on-device LLM (Phi-3 Mini 4K, INT4 quantized)
- Supports **Hindi**, **Tamil**, **Telugu**, **English**, and more
- Subject-specific tutoring: Math, Science, English, Social Studies
- Step-by-step explanations with relatable Indian examples

### 🎤 Speech-to-Text (STT)
- **Whisper Tiny** model running on NPU
- Real-time Hindi and English voice transcription
- Designed for **visually impaired** students

### 🔊 Text-to-Speech (TTS)
- Neural TTS with **FastSpeech2 + HiFi-GAN**
- Falls back to system TTS when neural models are unavailable
- Adjustable speed control
- Multi-language voice synthesis

### 🤟 Sign Language Detection
- **MediaPipe Hand Landmark** + custom gesture classifier
- Real-time webcam-based **Indian Sign Language (ISL)** recognition
- Live gesture-to-text translation
- Designed for **hearing impaired** students

### 📄 Document Scanner & Homework Help
- **TrOCR** for printed/handwritten text extraction
- Camera/upload-based document scanning
- AI-powered summarization, explanation, and quiz generation
- "Scan → Extract → Explain" homework help pipeline

### 🔋 Battery Efficient
- All inference on NPU — minimal battery draw
- Fanless operation suitable for classrooms
- No cloud dependency, no data plans needed

---

## 🏗️ Architecture

```
┌──────────────────────────────────────────────────┐
│              Disha Desktop App                    │
│   ┌──────────────────────────────────────────┐   │
│   │      React Frontend (Vite)               │   │
│   │  • Multilingual UI (6 languages)         │   │
│   │  • Accessibility-first design            │   │
│   │  • Glassmorphism dark theme              │   │
│   └──────────────┬───────────────────────────┘   │
│                  │ REST API                       │
│   ┌──────────────▼───────────────────────────┐   │
│   │       Python Backend (FastAPI)            │   │
│   │  ┌─────────┐ ┌─────────┐ ┌───────────┐  │   │
│   │  │ Tutor   │ │ Access- │ │ Doc Scan  │  │   │
│   │  │ Module  │ │ ibility │ │ Module    │  │   │
│   │  └────┬────┘ └────┬────┘ └─────┬─────┘  │   │
│   │       │            │            │         │   │
│   │  ┌────▼────────────▼────────────▼─────┐  │   │
│   │  │     ONNX Runtime + QNN EP          │  │   │
│   │  │     (Snapdragon NPU Inference)     │  │   │
│   │  └────────────────────────────────────┘  │   │
│   └──────────────────────────────────────────┘   │
└──────────────────────────────────────────────────┘
```

## 🤖 AI Models Used

| Feature | Model | Source | NPU Optimized |
|---|---|---|---|
| Multilingual Tutor | Phi-3-mini-4k (INT4) | Qualcomm AI Hub / HF | ✅ |
| Speech-to-Text | Whisper Tiny (INT8) | Qualcomm AI Hub | ✅ |
| Text-to-Speech | FastSpeech2 + HiFi-GAN | Open Source ONNX | ✅ |
| Hand Detection | MediaPipe Hand Landmark | Qualcomm AI Hub | ✅ |
| Gesture Classifier | Custom ISL Classifier | Custom trained | ✅ |
| OCR | TrOCR Base | Qualcomm AI Hub | ✅ |

---

## 🚀 Setup & Installation

### Prerequisites
- **Windows 11 ARM64** (Snapdragon X Elite/Plus recommended)
- **Python 3.11+** (AMD64 build for Qualcomm compatibility)
- **Node.js 18+**

### 1. Clone the Repository
```bash
git clone https://github.com/YOUR_USERNAME/disha.git
cd disha
```

### 2. Install Python Backend Dependencies
```bash
pip install -r requirements.txt

# For Snapdragon NPU support (on Snapdragon devices only):
pip install onnxruntime-qnn
```

### 3. Install Frontend Dependencies
```bash
cd frontend
npm install
cd ..
```

### 4. Download AI Models (requires internet — one-time only)
```bash
python scripts/download_models.py --all
```

### 5. Verify Complete Submission Readiness
```bash
python scripts/verify_submission.py
```
This runs an end-to-end check of all modules, mock/NPU inference fallback, API endpoints, and production frontend bundles.

### 6. Run the Application

**Terminal 1 — Start Backend:**
```bash
python -m backend.main
```

**Terminal 2 — Start Frontend:**
```bash
cd frontend
npm run dev
```

Open **http://localhost:5173** in your browser.

---

## 📁 Project Structure

```
SNAPDRAGON/
├── backend/
│   ├── main.py                  # FastAPI server entry point
│   ├── config.py                # Centralized configuration
│   ├── npu_runtime.py           # ONNX Runtime + QNN EP manager
│   └── modules/
│       ├── tutor/
│       │   ├── tutor_service.py # LLM chat service
│       │   └── prompts.py       # Multilingual prompt templates
│       ├── accessibility/
│       │   ├── stt_service.py   # Speech-to-Text (Whisper)
│       │   ├── tts_service.py   # Text-to-Speech (FastSpeech2)
│       │   └── sign_language_service.py  # ISL detection
│       └── docscan/
│           ├── ocr_service.py   # Document OCR (TrOCR)
│           └── summary_service.py # AI summarization
├── frontend/
│   ├── src/
│   │   ├── App.jsx              # Root layout & Accessibility Quick Toolbar
│   │   ├── index.css            # Design system, themes & NPU telemetry styles
│   │   ├── main.jsx             # React entry point
│   │   └── pages/
│   │       ├── DashboardPage.jsx     # NPU Telemetry & Feature Grid
│   │       ├── TutorPage.jsx         # Socratic Vernacular AI Tutor
│   │       ├── AccessibilityPage.jsx # Voice STT/TTS & ISL Gesture Vision
│   │       ├── DocScanPage.jsx       # OCR & Smart Homework Helper
│   │       └── ProposalPage.jsx      # Challenge Proposal & 2-Min Pitch Deck
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
├── models/                      # Downloaded AI model files
├── scripts/
│   ├── download_models.py       # Model download manager
│   └── verify_submission.py     # Automated submission readiness runner
├── PRESENTATION.md              # 6-Slide Challenge Pitch Deck
├── PROPOSAL.md                  # Comprehensive Challenge Submission Proposal
├── requirements.txt             # Python dependencies
└── README.md
```


---

## 🎯 Why Snapdragon + HP?

- **NPU-first design**: All AI inference (LLM, CV, speech) runs on the Hexagon NPU — not GPU/cloud
- **Edge AI**: Zero dependency on internet connectivity or cloud APIs
- **Battery life**: Snapdragon's efficient NPU enables all-day classroom use
- **Form factor**: HP Copilot+ PC's fanless, lightweight design is ideal for classrooms
- **Accessibility**: On-device AI enables real-time accessibility tools without latency

---

## 🏆 Challenge: Snapdragon® AI Lab Build & Present

This project is built for the **Snapdragon AI Lab Build & Present Challenge (India)**.

**Judging Criteria Addressed:**
- ✅ **Technical Implementation** — Full NPU inference pipeline with ONNX Runtime + QNN EP
- ✅ **Application Use Case & Innovation** — Solving real educational accessibility gap in rural India
- ✅ **Deployment & Accessibility** — 100% offline, multi-language, accessibility-first design
- ✅ **Presentation & Documentation** — Comprehensive docs, clean architecture, demo-ready UI

---

## 📄 License

This project is open source under the MIT License.

---

<p align="center">
  <strong>🧭 Disha — दिशा — திசா — దిశ</strong><br>
  <em>"Direction" — Guiding every student towards knowledge</em>
</p>
