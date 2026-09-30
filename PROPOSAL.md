# 🧭 Disha (दिशा) — Offline AI Learning & Accessibility Companion
## Official Challenge Proposal: Snapdragon® AI Lab Build & Present Challenge (India)
### Target Hardware: Snapdragon® X Series-powered HP Copilot+ PCs (Hexagon™ NPU, 45 TOPS)

---

## 1. Project Overview

| Project Field | Submission Detail |
| :--- | :--- |
| **Project Title** | **Disha (दिशा)** — Offline AI Learning & Accessibility Companion for Rural India |
| **Category / Track** | On-Device Generative AI & Accessibility on Snapdragon Copilot+ PCs |
| **Target Audience** | K-12 students in rural/semi-urban schools, gram panchayat digital libraries, visually/hearing-impaired learners |
| **Target Hardware Platform** | **HP Copilot+ PCs powered by Snapdragon® X Elite / Plus** |
| **NPU Acceleration** | **Qualcomm® Hexagon™ NPU (45 TOPS)** via ONNX Runtime + `QNNExecutionProvider` |
| **Models Used** | Sourced & quantized via **Qualcomm AI Hub** (Phi-3-mini INT4, Whisper Tiny INT8, TrOCR Base, MediaPipe Hand Pose) |
| **Connectivity Requirement** | **100% Offline** (Zero internet connection or cloud API calls required) |

---

## 2. Problem Statement & Motivation

### The Unspoken Educational Crisis in Rural India
1. **The Digital Connectivity Void**:
   - India has over 1.5 million schools and 250+ million students, with more than 65% in rural areas.
   - Despite rapid smartphone proliferation, broadband in rural schools and village study centers is sporadic, low-bandwidth, or completely unavailable.
   - Prominent modern AI educational tools (ChatGPT, Khanmigo, Gemini) require continuous high-speed internet and expensive recurrent subscriptions, widening the educational inequality gap between urban and rural children.

2. **The Special-Needs Exclusion**:
   - Over 12 million Indian children live with visual, speech, or hearing disabilities.
   - Certified Indian Sign Language (ISL) teachers are virtually absent in tier-2/3 villages.
   - Visually impaired students rely on scarce Braille textbooks and lack interactive conversational screen readers in their mother tongues.

3. **The Linguistic Diversity Divide**:
   - Rural students predominantly learn in regional vernacular languages (Hindi, Tamil, Telugu, Kannada, Bengali).
   - Most existing edtech software is English-centric and culturally detached from rural Indian contexts.

4. **Power Cuts & Infrastructure Fragility**:
   - Rural communities frequently experience 4–8 hours of daily power cuts.
   - Traditional desktop towers and power-hungry GPU laptops throttle and deplete battery in 2–3 hours under AI workloads.

---

## 3. The Solution: Disha (दिशा)

**Disha** transforms an HP Copilot+ PC into an autonomous, all-day AI classroom tutor and universal accessibility station. It executes **100% on-device AI inference** across natural language, computer vision, and speech processing on the 45 TOPS Qualcomm Hexagon NPU.

```
┌──────────────────────────────────────────────────────────────────────────┐
│                   Disha Multimodal AI Architecture                       │
│                                                                          │
│   ┌──────────────────────────────────────────────────────────────────┐   │
│   │               React Single-Page Application (SPA)                │   │
│   │   • Multilingual UI (EN, HI, TA, TE, KN, BN)                     │   │
│   │   • High-Contrast Dyslexia/Vision Themes                         │   │
│   │   • Low-latency WebSocket & REST bindings                        │   │
│   └────────────────────────────────┬─────────────────────────────────┘   │
│                                    │ HTTP / IPC                          │
│   ┌────────────────────────────────▼─────────────────────────────────┐   │
│   │                   FastAPI Python Orchestrator                    │   │
│   │                                                                  │   │
│   │   ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌───────┐  │   │
│   │   │  Tutor LLM   │ │ Speech-to-   │ │ Neural Text- │ │ ISL   │  │   │
│   │   │  Engine      │ │ Text (STT)   │ │ to-Speech    │ │ Vision│  │   │
│   │   │ (Phi-3 Mini) │ │ (Whisper)    │ │ (FastSpeech) │ │ (CV)  │  │   │
│   │   └──────┬───────┘ └──────┬───────┘ └──────┬───────┘ └───┬───┘  │   │
│   │          └────────────────┼────────────────┼─────────────┘      │   │
│   │                           ▼                ▼                    │   │
│   │   ┌──────────────────────────────────────────────────────────┐  │   │
│   │   │          ONNX Runtime with QNN Execution Provider        │  │   │
│   │   │          (Graph Optimizations & HTP Tensor Ops)          │  │   │
│   │   └───────────────────────────────┬──────────────────────────┘  │   │
│   └───────────────────────────────────┼──────────────────────────────┘   │
│                                       ▼                                  │
│   ┌──────────────────────────────────────────────────────────────────┐   │
│   │           Snapdragon® Hexagon™ NPU Hardware (45 TOPS)            │   │
│   │           Ultra-Low Power (<5W Active) • 20+ Hr Battery          │   │
│   └──────────────────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## 4. Key Functional Capabilities

### A. Multilingual Vernacular AI Tutor
- **Model**: Microsoft Phi-3 Mini 4K Instruct, INT4 AWQ quantized via Qualcomm AI Hub.
- **Languages**: Hindi, Tamil, Telugu, Kannada, Bengali, and English.
- **Pedagogical Strategy**: Step-by-step Socratic teaching aligned with NCERT and state curricula. Uses local Indian cultural allegories, village farming analogies, and everyday examples to make abstract math and science concepts intuitive.

### B. Live Webcam Indian Sign Language (ISL) Translator
- **Models**: MediaPipe Hand Landmark (FP16) + Custom ISL Gesture Classifier running at 30 FPS on the Snapdragon NPU.
- **Functionality**: Tracks 21 3D hand joints and key gestures in real time using the laptop's built-in webcam. Translates recognized gestures into continuous text and synthesized speech, empowering deaf and mute students to communicate fluidly in class.

### C. Voice Assistant for the Visually Impaired
- **Speech-to-Text (STT)**: Whisper Tiny (INT8) running on Hexagon NPU. Enables hands-free query input in Hindi and English.
- **Text-to-Speech (TTS)**: FastSpeech2 + HiFi-GAN neural vocoder. Synthesizes clear, melodious voice output with adjustable speech tempo, serving as an interactive personal reader for blind students.

### D. Document Scanner & Homework Companion
- **Model**: TrOCR Base (INT8 quantized for Qualcomm NPU).
- **Capability**: Processes photos of handwritten notebooks, chalkboard notes, or textbook pages.
- **Smart Homework Engine**: Extracts text, clarifies difficult concepts, explains mathematical working steps, and generates instant revision quizzes.

---

## 5. Why Snapdragon® & HP Copilot+ PCs are Indispensable

| Advantage | Technical Reality on Snapdragon-Powered HP PC | Why Alternative Approaches Fail |
| :--- | :--- | :--- |
| **45 TOPS Hexagon NPU** | Multi-modal concurrent inference (LLM + CV + Audio) running directly in hardware without heating or GPU throttling. | Discrete GPUs require 40W–80W power supplies, overheat rapidly in hot non-AC village classrooms, and throttle. |
| **All-Day 20+ Hr Battery** | Students and teachers can run Disha from morning assembly through evening study hours without wall-plug power. | Traditional x86 laptops discharge in 2.5–4 hours when running continuous AI workloads. |
| **Fanless Quiet Design** | HP Copilot+ PC operates in complete silence, ideal for acoustic clarity during STT/TTS and sign language recognition. | GPU laptops emit loud fan whine that contaminates microphone inputs and disrupts quiet rural classrooms. |
| **Total Privacy & Zero Cost** | All student data remains strictly on the physical laptop. No subscription fees, no data plans, no surveillance. | Cloud AI solutions require continuous billing and expose student inputs to third-party data collection. |

---

## 6. Qualcomm® AI Hub Integration Details

| AI Capability | Model Source | Optimization Technique | Target Execution Provider |
| :--- | :--- | :--- | :--- |
| **Language Reasoning** | `microsoft/Phi-3-mini-4k-instruct` | INT4 Block-32 AWQ | `QNNExecutionProvider` (HTP backend) |
| **Speech Recognition** | `openai/whisper-tiny` | INT8 Dynamic Quantization | `QNNExecutionProvider` (HTP backend) |
| **Vision Hand Pose** | MediaPipe Hand Landmark | FP16 Graph Pruning | `QNNExecutionProvider` (HTP backend) |
| **Vision OCR** | `microsoft/trocr-base-printed` | INT8 Static Quantization | `QNNExecutionProvider` (HTP backend) |
| **Speech Synthesis** | FastSpeech2 / HiFi-GAN | FP16 ONNX | `QNNExecutionProvider` / CPU Fallback |

---

## 7. Submission Checklist & Contest Rules Alignment

- [x] **Sole Ownership**: Designed, implemented, and authored solely by the submitting participant.
- [x] **Qualcomm AI Hub Models**: Extensively leverages models optimized for Qualcomm Snapdragon NPU platforms.
- [x] **HP Copilot+ PC Alignment**: Specifically architectures multi-modal AI to leverage 45 TOPS Hexagon NPU capabilities and battery longevity.
- [x] **Working Prototype**: Complete, running codebase featuring FastAPI backend, ONNX Runtime/QNN runtime manager, and high-performance React UI.
- [x] **Social & Economic Impact**: Targets India's massive rural education gap and disability accessibility deficit with zero recurrent costs.

---

<p align="center">
  <strong>Disha (दिशा) — Guiding Every Student Forward</strong><br>
  <em>Powered by Qualcomm® Snapdragon® & HP Copilot+ PCs</em>
</p>
