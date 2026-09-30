import { useState } from 'react'

const modelsData = [
  {
    name: 'Phi-3 Mini 4K Instruct',
    task: 'Multilingual Vernacular Tutor',
    precision: 'INT4 (AWQ)',
    source: 'Qualcomm AI Hub / Hugging Face',
    ep: 'QNN (HTP NPU)',
    size: '2.3 GB',
    latency: '~22 ms/tok',
    benefit: 'Socratic step-by-step tutoring in 6 Indian languages; zero cloud latency.'
  },
  {
    name: 'Whisper Tiny',
    task: 'Speech-to-Text (STT)',
    precision: 'INT8 Dynamic',
    source: 'Qualcomm AI Hub',
    ep: 'QNN (HTP NPU)',
    size: '150 MB',
    latency: '<200 ms',
    benefit: 'Enables visually impaired students to dictate questions hands-free in Hindi and English.'
  },
  {
    name: 'MediaPipe Hand Landmark',
    task: 'Hand Joint Detection',
    precision: 'FP16 Pruned',
    source: 'Qualcomm AI Hub',
    ep: 'QNN (HTP NPU)',
    size: '15 MB',
    latency: '30+ FPS',
    benefit: 'Tracks 21 3D joint positions in real time for Indian Sign Language (ISL).'
  },
  {
    name: 'ISL Gesture Classifier',
    task: 'Sign Language Translation',
    precision: 'FP16 Dense',
    source: 'Custom Trained',
    ep: 'QNN (HTP NPU)',
    size: '5 MB',
    latency: '<10 ms',
    benefit: 'Translates hand shapes into textual and spoken communication for deaf/mute students.'
  },
  {
    name: 'TrOCR Base',
    task: 'Optical Character Recognition',
    precision: 'INT8 Static',
    source: 'Qualcomm AI Hub',
    ep: 'QNN (HTP NPU)',
    size: '120 MB',
    latency: '~350 ms',
    benefit: 'Digitizes printed textbook pages and student handwritten notebooks.'
  },
  {
    name: 'FastSpeech2 + HiFi-GAN',
    task: 'Neural Text-to-Speech (TTS)',
    precision: 'FP16',
    source: 'Open Source ONNX',
    ep: 'QNN / CPU',
    size: '80 MB',
    latency: '~150 ms',
    benefit: 'Natural Indian accented voice reading aloud lessons with speed regulation.'
  }
]

export default function ProposalPage() {
  const [activeTab, setActiveTab] = useState('overview')
  const [copied, setCopied] = useState(false)
  const [slideIndex, setSlideIndex] = useState(0)

  const handleCopy = () => {
    fetch('/api/proposal')
      .then(r => r.json())
      .then(d => {
        navigator.clipboard.writeText(d.content)
        setCopied(true)
        setTimeout(() => setCopied(false), 2500)
      })
      .catch(() => alert('Could not copy proposal text'))
  }

  const handleDownload = () => {
    fetch('/api/proposal')
      .then(r => r.json())
      .then(d => {
        const blob = new Blob([d.content], { type: 'text/markdown' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'Disha_Snapdragon_Challenge_Proposal.md'
        a.click()
        URL.revokeObjectURL(url)
      })
  }

  const slides = [
    {
      badge: 'Slide 1 / 6 • The Challenge',
      title: 'The Great Indian Rural Education & Accessibility Crisis',
      body: (
        <div>
          <p><strong>Over 160 Million children</strong> attend rural government schools and village learning centers across India with 3 crippling barriers:</p>
          <ul style={{ paddingLeft: '24px', lineHeight: 1.8 }}>
            <li><strong>Zero or Fragile Internet</strong>: Modern cloud AI (ChatGPT, Gemini) is inaccessible due to village blackouts and poor bandwidth.</li>
            <li><strong>Special-Needs Exclusion</strong>: 12M+ children with hearing or visual impairments have virtually zero certified ISL interpreters or regional screen readers.</li>
            <li><strong>Frequent Load Shedding</strong>: 4–8 hours of daily power outages drain power-hungry GPU laptops in 2–3 hours.</li>
          </ul>
        </div>
      ),
      note: 'Focus: Frame the real-world problem in India where cloud-based tools completely fail.'
    },
    {
      badge: 'Slide 2 / 6 • The Solution',
      title: 'Disha (दिशा) — 100% On-Device AI Classroom Companion',
      body: (
        <div>
          <p>Disha transforms an <strong>HP Copilot+ PC powered by Snapdragon® X Series</strong> into an autonomous, all-day educational hub:</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px', marginTop: '16px' }}>
            <div style={{ padding: '12px', background: 'rgba(255,255,255,0.04)', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
              <strong>🎓 Vernacular Tutor</strong><br /><span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Socratic step-by-step guidance in Hindi, Tamil, Telugu, Kannada, Bengali & English.</span>
            </div>
            <div style={{ padding: '12px', background: 'rgba(255,255,255,0.04)', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
              <strong>🤟 ISL Hand Gesture Vision</strong><br /><span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Real-time 3D hand landmark tracking translates sign language to text at 30 FPS.</span>
            </div>
            <div style={{ padding: '12px', background: 'rgba(255,255,255,0.04)', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
              <strong>🎤 Voice Assistant (STT/TTS)</strong><br /><span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Whisper speech-to-text and neural TTS for hands-free blind student learning.</span>
            </div>
            <div style={{ padding: '12px', background: 'rgba(255,255,255,0.04)', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
              <strong>📄 Homework Scanner (OCR)</strong><br /><span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Digitizes handwritten notes & textbook pages; generates instant quizzes.</span>
            </div>
          </div>
        </div>
      ),
      note: 'Focus: Highlight the 4 multimodal pillars running concurrently on one laptop.'
    },
    {
      badge: 'Slide 3 / 6 • Technical Architecture',
      title: 'Snapdragon® Hexagon™ NPU (45 TOPS) + QNN Acceleration',
      body: (
        <div>
          <p>Disha is engineered NPU-first using <strong>ONNX Runtime with Qualcomm Neural Processing (QNN) Execution Provider</strong>:</p>
          <ul style={{ paddingLeft: '24px', lineHeight: 1.8 }}>
            <li>Direct execution on the <strong>Hexagon Tensor Processor (HTP)</strong> via specialized microcode kernels.</li>
            <li>Zero cloud transmission: 100% offline student privacy and compliance with Indian student data safety.</li>
            <li>Sub-25ms token latency on INT4 LLM inference and sub-10ms gesture classification.</li>
          </ul>
        </div>
      ),
      note: 'Focus: Demonstrate technical depth with ONNX Runtime, QNN EP, and HTP tensor ops.'
    },
    {
      badge: 'Slide 4 / 6 • Model Portfolio',
      title: 'Quantized AI Stack via Qualcomm® AI Hub',
      body: (
        <div>
          <table style={{ width: '100%', fontSize: '14px', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ color: 'var(--color-primary-light)', borderBottom: '1px solid var(--border-light)' }}>
                <th style={{ padding: '8px' }}>Capability</th>
                <th style={{ padding: '8px' }}>Model</th>
                <th style={{ padding: '8px' }}>Quantization</th>
                <th style={{ padding: '8px' }}>Execution Provider</th>
              </tr>
            </thead>
            <tbody>
              <tr><td style={{ padding: '8px' }}>Tutor LLM</td><td style={{ padding: '8px' }}>Phi-3-mini-4k</td><td style={{ padding: '8px' }}>INT4 Block-32 AWQ</td><td style={{ padding: '8px' }}>QNN (HTP)</td></tr>
              <tr><td style={{ padding: '8px' }}>Speech Recognition</td><td style={{ padding: '8px' }}>Whisper Tiny</td><td style={{ padding: '8px' }}>INT8 Dynamic</td><td style={{ padding: '8px' }}>QNN (HTP)</td></tr>
              <tr><td style={{ padding: '8px' }}>Sign Landmark</td><td style={{ padding: '8px' }}>MediaPipe Hand Pose</td><td style={{ padding: '8px' }}>FP16 Pruned</td><td style={{ padding: '8px' }}>QNN (HTP)</td></tr>
              <tr><td style={{ padding: '8px' }}>Document OCR</td><td style={{ padding: '8px' }}>TrOCR Base</td><td style={{ padding: '8px' }}>INT8 Static</td><td style={{ padding: '8px' }}>QNN (HTP)</td></tr>
              <tr><td style={{ padding: '8px' }}>Neural Voice</td><td style={{ padding: '8px' }}>FastSpeech2 + HiFi-GAN</td><td style={{ padding: '8px' }}>FP16 ONNX</td><td style={{ padding: '8px' }}>QNN / CPU</td></tr>
            </tbody>
          </table>
        </div>
      ),
      note: 'Focus: Show alignment with official Qualcomm AI Hub model quantization patterns.'
    },
    {
      badge: 'Slide 5 / 6 • Hardware Superiority',
      title: 'Why HP Copilot+ PC Powered by Snapdragon is Indispensable',
      body: (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div style={{ padding: '16px', background: 'rgba(255,255,255,0.04)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.15)' }}>
              <strong style={{ color: '#888888' }}>❌ Traditional GPU / x86 PC</strong>
              <ul style={{ paddingLeft: '18px', fontSize: '13px', lineHeight: 1.7, marginTop: '8px' }}>
                <li>Consumes 45W–60W during AI inference</li>
                <li>Battery dies in 2.5 to 3.5 hours</li>
                <li>Loud fan noise ruins Whisper audio recording</li>
                <li>Requires continuous recurring internet bills</li>
              </ul>
            </div>
            <div style={{ padding: '16px', background: 'rgba(255,255,255,0.06)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)' }}>
              <strong style={{ color: '#ffffff' }}>✅ Disha on Snapdragon HP Copilot+ PC</strong>
              <ul style={{ paddingLeft: '18px', fontSize: '13px', lineHeight: 1.7, marginTop: '8px' }}>
                <li>Consumes only 3.8W on Hexagon NPU (93% power saving)</li>
                <li>21+ hours battery life: survives day-long rural blackouts</li>
                <li>Fanless silent acoustics enable crystal-clear voice STT</li>
                <li>₹0 ongoing cloud or subscription costs</li>
              </ul>
            </div>
          </div>
        </div>
      ),
      note: 'Focus: Highlight energy efficiency, acoustic silence, and all-day battery.'
    },
    {
      badge: 'Slide 6 / 6 • Impact & Conclusion',
      title: 'Digital India & NEP 2020: Taking AI to the Last Mile',
      body: (
        <div>
          <p>Disha bridges the digital divide for <strong>250+ million students</strong> and <strong>12+ million disabled children</strong>:</p>
          <ul style={{ paddingLeft: '24px', lineHeight: 1.8 }}>
            <li><strong>Classroom Pilot Ready</strong>: Targeted for solar-powered village knowledge kiosks in Tamil Nadu, Karnataka, and UP.</li>
            <li><strong>Empowering Disabled Students</strong>: Equal access to certified sign language translation and hands-free voice tutoring.</li>
            <li><strong>Autonomous Resilience</strong>: Truly democratic AI that doesn't stop working when the internet cuts out.</li>
          </ul>
          <div style={{ textAlign: 'center', marginTop: '20px', padding: '16px', background: 'rgba(108,92,231,0.15)', borderRadius: '8px' }}>
            <span style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--color-primary-light)' }}>
              Disha (दिशा) — Empowering Every Indian Learner on Snapdragon®
            </span>
          </div>
        </div>
      ),
      note: 'Focus: Memorable closing on democratic access to AI education without borders.'
    },
  ]

  return (
    <div className="page">
      {/* Header */}
      <div className="page__header" style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '28px' }}>🏆</span>
          <div>
            <h1 className="page__title" style={{ fontSize: '26px', margin: 0 }}>
              Official Challenge Proposal: Disha (दिशा)
            </h1>
            <p className="page__subtitle" style={{ margin: 0, color: 'var(--text-accent)' }}>
              Snapdragon® AI Lab Build & Present Challenge (India) • Target: HP Copilot+ PCs
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={handleCopy} className="btn btn--secondary" style={{ padding: '8px 14px', fontSize: '13px' }}>
            {copied ? '✅ Copied!' : '📋 Copy Proposal'}
          </button>
          <button onClick={handleDownload} className="btn btn--primary" style={{ padding: '8px 14px', fontSize: '13px' }}>
            ⬇️ Download PROPOSAL.md
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '24px', flexWrap: 'wrap' }}>
        {[
          { id: 'overview', label: '🌟 Executive Summary & Problem' },
          { id: 'architecture', label: '🏗️ NPU Architecture' },
          { id: 'models', label: '🤖 Qualcomm AI Hub Models' },
          { id: 'efficiency', label: '🔋 Power & Hardware Benchmarks' },
          { id: 'impact', label: '🇮🇳 Rural Indian Social Impact' },
          { id: 'pitch', label: '🎬 2-Min Pitch Deck (Slides)' },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`btn ${activeTab === t.id ? 'btn--primary' : 'btn--secondary'}`}
            style={{ padding: '8px 16px', fontSize: '14px', borderRadius: '8px' }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab: Overview */}
      {activeTab === 'overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="card" style={{ borderLeft: '4px solid var(--color-primary)' }}>
            <h3 style={{ fontSize: '18px', marginBottom: '10px', color: 'var(--text-primary)' }}>
              Executive Summary
            </h3>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
              <strong>Disha ("Direction")</strong> is an all-in-one on-device educational and accessibility companion
              built exclusively for <strong>Snapdragon® X Series-powered HP Copilot+ PCs</strong>. Operating 100% offline,
              it harnesses the <strong>45 TOPS Qualcomm® Hexagon™ NPU</strong> via ONNX Runtime and the QNN Execution Provider
              to deliver multilingual Socratic tutoring, real-time voice speech-to-text, neural speech synthesis,
              webcam Indian Sign Language (ISL) recognition, and handwritten homework assistance to students in rural India—with
              zero cloud dependencies, zero latency, and all-day battery endurance.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
            <div className="card">
              <div style={{ fontSize: '24px', marginBottom: '8px' }}>📡</div>
              <h4 style={{ color: 'var(--color-error)', marginBottom: '8px' }}>The Connectivity Gap</h4>
              <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: 1.5 }}>
                65%+ of India's 250M students live in rural villages where broadband is fragile or nonexistent. Cloud AI educational services fail completely.
              </p>
            </div>

            <div className="card">
              <div style={{ fontSize: '24px', marginBottom: '8px' }}>♿</div>
              <h4 style={{ color: 'var(--color-warning)', marginBottom: '8px' }}>Special-Needs Crisis</h4>
              <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: 1.5 }}>
                Over 12M children with disabilities have almost no access to certified ISL interpreters or multilingual screen readers in rural government schools.
              </p>
            </div>

            <div className="card">
              <div style={{ fontSize: '24px', marginBottom: '8px' }}>⚡</div>
              <h4 style={{ color: 'var(--color-secondary)', marginBottom: '8px' }}>Load-Shedding Outages</h4>
              <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: 1.5 }}>
                Power cuts of 4–8 hours daily drain ordinary laptops in hours. The Snapdragon-powered HP PC's &gt;20-hour battery enables uninterrupted all-day classroom learning.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Architecture */}
      {activeTab === 'architecture' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="card">
            <h3 style={{ fontSize: '18px', marginBottom: '12px' }}>System Architecture on HP Copilot+ PC</h3>
            <div style={{
              background: 'rgba(255, 255, 255, 0.03)',
              padding: '20px',
              borderRadius: '8px',
              fontFamily: 'monospace',
              fontSize: '13px',
              color: '#cccccc',
              lineHeight: 1.5,
              overflowX: 'auto',
              border: '1px solid var(--border-light)'
            }}>
{`┌───────────────────────────────────────────────────────────────────────────┐
│               Disha On-Device Client App (HP Copilot+ PC)                 │
│                                                                           │
│   ┌───────────────────────────────────────────────────────────────────┐   │
│   │               React 18 + Vite Responsive Desktop UI               │   │
│   │   • Multilingual UI (Hindi, Tamil, Telugu, Kannada, Bengali, EN)  │   │
│   │   • High-Contrast Dyslexia / Visually-Impaired Theme Modes        │   │
│   │   • Live Webcam Stream & Audio Waveform Visualizers               │   │
│   └─────────────────────────────────┬─────────────────────────────────┘   │
│                                     │ Local IPC / Loopback REST           │
│   ┌─────────────────────────────────▼─────────────────────────────────┐   │
│   │                     FastAPI On-Device Server                      │   │
│   │   ┌───────────────┬───────────────────┬───────────────────────┐   │   │
│   │   │  Tutor LLM    │   Accessibility   │  Document OCR Scan    │   │   │
│   │   │  (Phi-3 Mini) │  (Whisper/ISL/TTS)│     (TrOCR Base)      │   │   │
│   │   └───────┬───────┴─────────┬─────────┴───────────┬───────────┘   │   │
│   │           │                 │                     │               │   │
│   │   ┌───────▼─────────────────▼─────────────────────▼───────────┐   │   │
│   │   │          ONNX Runtime with QNN Execution Provider         │   │   │
│   │   │       (Graph Optimization, FP16/INT8/INT4 Tensor Map)     │   │   │
│   │   └─────────────────────────┬─────────────────────────────────┘   │   │
│   └─────────────────────────────┼─────────────────────────────────────┘   │
│                                 │ Direct Hardware Acceleration            │
│   ┌─────────────────────────────▼─────────────────────────────────────┐   │
│   │             Snapdragon® Hexagon™ NPU (45 TOPS)                    │   │
│   │      Zero Cloud Dependency • Sub-5W Total Inference Power         │   │
│   └───────────────────────────────────────────────────────────────────┘   │
└───────────────────────────────────────────────────────────────────────────┘`}
            </div>
          </div>
        </div>
      )}

      {/* Tab: Models */}
      {activeTab === 'models' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="card">
            <h3 style={{ fontSize: '18px', marginBottom: '8px' }}>Qualcomm® AI Hub Models Portfolio</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '16px' }}>
              All models are quantized and configured to run natively on the Qualcomm Hexagon NPU using the QNN Execution Provider.
            </p>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-light)', color: 'var(--text-accent)' }}>
                    <th style={{ padding: '10px' }}>Model</th>
                    <th style={{ padding: '10px' }}>Task</th>
                    <th style={{ padding: '10px' }}>Precision</th>
                    <th style={{ padding: '10px' }}>Target EP</th>
                    <th style={{ padding: '10px' }}>Latency</th>
                    <th style={{ padding: '10px' }}>Classroom Impact</th>
                  </tr>
                </thead>
                <tbody>
                  {modelsData.map((m, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <td style={{ padding: '12px 10px', fontWeight: 600, color: 'var(--text-primary)' }}>{m.name}</td>
                      <td style={{ padding: '12px 10px', color: 'var(--text-secondary)' }}>{m.task}</td>
                      <td style={{ padding: '12px 10px' }}>
                        <span style={{ background: 'rgba(255,255,255,0.08)', color: '#cccccc', padding: '2px 8px', borderRadius: '4px' }}>
                          {m.precision}
                        </span>
                      </td>
                      <td style={{ padding: '12px 10px', color: 'var(--color-secondary)' }}>{m.ep}</td>
                      <td style={{ padding: '12px 10px', color: 'var(--color-accent)' }}>{m.latency}</td>
                      <td style={{ padding: '12px 10px', color: 'var(--text-muted)', fontSize: '13px' }}>{m.benefit}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Efficiency */}
      {activeTab === 'efficiency' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="card">
            <h3 style={{ fontSize: '18px', marginBottom: '14px' }}>Why Snapdragon HP Copilot+ PC is Decisive</h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
                <h4 style={{ color: 'var(--color-secondary)', margin: '0 0 8px 0' }}>⚡ Hexagon NPU vs Discrete GPU</h4>
                <ul style={{ margin: 0, paddingLeft: '20px', color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.7 }}>
                  <li><strong>Active Power</strong>: 3–5W on NPU vs 45–60W on GPU</li>
                  <li><strong>Thermals</strong>: Fanless silent operation vs loud throttling fans</li>
                  <li><strong>Acoustics</strong>: Zero background noise interference for Whisper STT</li>
                </ul>
              </div>

              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
                <h4 style={{ color: 'var(--color-accent)', margin: '0 0 8px 0' }}>🔋 All-Day Classroom Battery</h4>
                <ul style={{ margin: 0, paddingLeft: '20px', color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.7 }}>
                  <li><strong>HP Copilot+ PC</strong>: 20+ hours battery life under mixed NPU workload</li>
                  <li><strong>Rural Reliability</strong>: Operates continuously through 8-hour power cuts</li>
                  <li><strong>Durability</strong>: Thin, lightweight form-factor ideal for village bookmobiles</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Impact */}
      {activeTab === 'impact' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="card" style={{ borderLeft: '4px solid var(--color-secondary)' }}>
            <h3 style={{ fontSize: '18px', marginBottom: '10px' }}>Social & National Impact for Digital India</h3>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Disha aligns directly with the Government of India's <strong>NEP 2020 (National Education Policy)</strong>, 
              <strong>DIKSHA</strong>, and <strong>Samagra Shiksha Abhiyan</strong> missions by eliminating the two biggest
              educational bottlenecks in rural India: lack of connectivity and lack of special-needs accessibility.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginTop: '16px' }}>
              <div style={{ padding: '12px', background: 'rgba(255,255,255,0.04)', borderRadius: '6px' }}>
                <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--color-secondary)' }}>100%</div>
                <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Offline Execution</div>
              </div>
              <div style={{ padding: '12px', background: 'rgba(255,255,255,0.04)', borderRadius: '6px' }}>
                <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--color-primary-light)' }}>6+</div>
                <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Indian Languages</div>
              </div>
              <div style={{ padding: '12px', background: 'rgba(255,255,255,0.04)', borderRadius: '6px' }}>
                <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--color-accent)' }}>0 ₹</div>
                <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Recurring Cloud Costs</div>
              </div>
              <div style={{ padding: '12px', background: 'rgba(255,255,255,0.04)', borderRadius: '6px' }}>
                <div style={{ fontSize: '20px', fontWeight: 700, color: '#ffffff' }}>12M+</div>
                <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Eligible Disabled Students</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab: 2-Minute Pitch Deck */}
      {activeTab === 'pitch' && (
        <div className="slide-deck">
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span className="slide__badge">{slides[slideIndex].badge}</span>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Use Previous / Next buttons to present</span>
            </div>
            <h2 className="slide__title">{slides[slideIndex].title}</h2>
            <div className="slide__body">{slides[slideIndex].body}</div>
          </div>

          <div>
            <div style={{
              background: 'rgba(255, 255, 255, 0.04)',
              padding: '10px 14px',
              borderRadius: '8px',
              marginTop: '1.5rem',
              fontSize: '0.82rem',
              color: 'var(--text-accent)',
              border: '1px dashed rgba(255, 255, 255, 0.15)'
            }}>
              💡 <strong>Presenter Tip:</strong> {slides[slideIndex].note}
            </div>

            <div className="slide__nav">
              <button
                className="btn btn--secondary"
                disabled={slideIndex === 0}
                onClick={() => setSlideIndex(prev => Math.max(0, prev - 1))}
              >
                ◀ Previous Slide
              </button>
              <div style={{ display: 'flex', gap: '6px' }}>
                {slides.map((_, i) => (
                  <span
                    key={i}
                    onClick={() => setSlideIndex(i)}
                    style={{
                      width: '10px',
                      height: '10px',
                      borderRadius: '50%',
                      background: i === slideIndex ? 'var(--color-primary-light)' : 'rgba(255,255,255,0.2)',
                      cursor: 'pointer',
                      display: 'inline-block'
                    }}
                  />
                ))}
              </div>
              <button
                className="btn btn--primary"
                disabled={slideIndex === slides.length - 1}
                onClick={() => setSlideIndex(prev => Math.min(slides.length - 1, prev + 1))}
              >
                Next Slide ▶
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

