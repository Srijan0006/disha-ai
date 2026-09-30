import { useState, useRef } from 'react'

const API_BASE = '/api'

const MODES = [
  { id: 'summary', label: '📋 Summary', description: 'Get a concise summary' },
  { id: 'explain', label: '📖 Explain', description: 'Explain like a teacher' },
  { id: 'quiz', label: '❓ Quiz', description: 'Generate quiz questions' },
  { id: 'translate', label: '🌐 Translate', description: 'Translate to another language' },
]

export default function DocScanPage() {
  const [image, setImage] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [ocrText, setOcrText] = useState('')
  const [summaryResult, setSummaryResult] = useState('')
  const [language, setLanguage] = useState('en')
  const [mode, setMode] = useState('summary')
  const [ocrLoading, setOcrLoading] = useState(false)
  const [summaryLoading, setSummaryLoading] = useState(false)
  const [ocrMeta, setOcrMeta] = useState(null)
  const [summaryMeta, setSummaryMeta] = useState(null)
  const fileInputRef = useRef(null)

  const handleImageUpload = (e) => {
    const file = e.target.files[0]
    if (!file) return

    // Show preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setImagePreview(reader.result)
      setImage(reader.result.split(',')[1])  // base64
    }
    reader.readAsDataURL(file)

    // Reset results
    setOcrText('')
    setSummaryResult('')
  }

  const handleDrop = (e) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result)
        setImage(reader.result.split(',')[1])
      }
      reader.readAsDataURL(file)
      setOcrText('')
      setSummaryResult('')
    }
  }

  const runOCR = async () => {
    if (!image) return
    setOcrLoading(true)

    try {
      const res = await fetch(`${API_BASE}/docscan/ocr`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image_base64: image, language }),
      })
      if (res.ok) {
        const data = await res.json()
        setOcrText(data.text)
        setOcrMeta({
          words: data.word_count,
          confidence: data.confidence,
          time: data.inference_time_ms,
          mock: data.mock,
        })
      }
    } catch {
      // Fallback mock OCR
      const mockText = language === 'hi'
        ? 'अध्याय 5: जल चक्र\n\nजल लगातार पर्यावरण में एक प्रक्रिया के माध्यम से चलता रहता है जिसे जल चक्र कहते हैं।\n\n1. वाष्पीकरण\n2. संघनन\n3. वर्षा\n4. संग्रह'
        : 'Chapter 5: The Water Cycle\n\nWater moves through the environment in a process called the water cycle.\n\n1. Evaporation — Water turns into vapor\n2. Condensation — Vapor forms clouds\n3. Precipitation — Water falls as rain\n4. Collection — Water collects in bodies\n\nQ1. What is evaporation?\nQ2. Name the four stages.'
      setOcrText(mockText)
      setOcrMeta({ words: mockText.split(/\s+/).length, confidence: 1.0, time: 0, mock: true })
    }
    setOcrLoading(false)
  }

  const runSummary = async () => {
    if (!ocrText.trim()) return
    setSummaryLoading(true)

    try {
      const res = await fetch(`${API_BASE}/docscan/summary`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: ocrText, language, mode }),
      })
      if (res.ok) {
        const data = await res.json()
        setSummaryResult(data.result)
        setSummaryMeta({
          mode: data.mode,
          model: data.model_used,
          time: data.inference_time_ms,
        })
      }
    } catch {
      setSummaryResult(getMockSummary(ocrText, mode, language))
      setSummaryMeta({ mode, model: 'Offline Demo', time: 0 })
    }
    setSummaryLoading(false)
  }

  const loadSampleDocument = () => {
    // Generate a clean sample textbook page canvas
    const canvas = document.createElement('canvas')
    canvas.width = 640
    canvas.height = 400
    const ctx = canvas.getContext('2d')

    // Background paper
    ctx.fillStyle = '#faf8f5'
    ctx.fillRect(0, 0, 640, 400)

    // Header border
    ctx.fillStyle = '#333333'
    ctx.fillRect(30, 25, 580, 4)

    // Heading
    ctx.fillStyle = '#1e1e46'
    ctx.font = 'bold 20px sans-serif'
    ctx.fillText('NCERT Class 7 Science: The Water Cycle', 40, 60)

    // Subtitle
    ctx.fillStyle = '#666688'
    ctx.font = 'italic 14px sans-serif'
    ctx.fillText('Chapter 5 — Environmental Circulation of Water', 40, 85)

    // Body lines
    ctx.fillStyle = '#2d3436'
    ctx.font = '15px sans-serif'
    ctx.fillText('1. Evaporation: Solar heat converts liquid water into atmospheric vapor.', 40, 130)
    ctx.fillText('2. Condensation: Vapor cools in upper layers to form visible clouds.', 40, 165)
    ctx.fillText('3. Precipitation: Saturated water droplets fall back to Earth as rain.', 40, 200)
    ctx.fillText('4. Collection: Rainfall gathers in ponds, rivers, and groundwater.', 40, 235)

    // Boxed question
    ctx.strokeStyle = '#555555'
    ctx.lineWidth = 2
    ctx.strokeRect(40, 270, 560, 95)

    ctx.fillStyle = '#555555'
    ctx.font = 'bold 14px sans-serif'
    ctx.fillText('Classroom Activity & Homework Question:', 55, 298)

    ctx.fillStyle = '#2d3436'
    ctx.font = '14px sans-serif'
    ctx.fillText('Explain how farmers in rural villages rely on this cycle for agriculture.', 55, 325)
    ctx.fillText('Identify the primary energy source driving the water cycle.', 55, 348)

    const dataUrl = canvas.toDataURL('image/png')
    setImagePreview(dataUrl)
    setImage(dataUrl.split(',')[1])
    setOcrText('')
    setSummaryResult('')
  }

  return (
    <div className="page">
      <div className="page__header">
        <h1 className="page__title">📄 Document Scanner</h1>
        <p className="page__description">
          Scan homework, textbook pages, or handwritten notes — get instant text extraction and AI-powered explanations
        </p>
      </div>

      <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <select className="select" value={language} onChange={(e) => setLanguage(e.target.value)} aria-label="Document language">
          <option value="en">English</option>
          <option value="hi">हिन्दी (Hindi)</option>
        </select>
        <button
          className="btn btn--secondary"
          onClick={loadSampleDocument}
          style={{ fontSize: '0.85rem' }}
          id="sample-doc-btn"
        >
          ✨ Load Sample Textbook Page (Water Cycle)
        </button>
      </div>

      <div className="docscan-layout">
        {/* Left Panel — Image Upload & OCR */}
        <div className="docscan-layout__panel">
          {!imagePreview ? (
            <div
              className="upload-zone"
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              id="upload-zone"
              role="button"
              aria-label="Upload document image"
              tabIndex={0}
            >
              <div className="upload-zone__icon">📷</div>
              <div className="upload-zone__text">
                Drop an image here or click to upload
              </div>
              <div className="upload-zone__hint">
                Supports JPG, PNG • Textbook pages, homework, handwritten notes
              </div>
              <div style={{ marginTop: '12px' }}>
                <span className="btn btn--secondary btn--small" onClick={(e) => { e.stopPropagation(); loadSampleDocument(); }}>
                  Or Click Here to Load Sample Document
                </span>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                style={{ display: 'none' }}
                id="file-input"
              />
            </div>
          ) : (
            <div>
              <div className="image-preview">
                <img src={imagePreview} alt="Uploaded document" />
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
                <button
                  className="btn btn--primary btn--large"
                  onClick={runOCR}
                  disabled={ocrLoading}
                  id="ocr-btn"
                >
                  {ocrLoading ? '⏳ Scanning...' : '🔍 Extract Text (OCR)'}
                </button>
                <button
                  className="btn btn--secondary"
                  onClick={() => {
                    setImagePreview(null)
                    setImage(null)
                    setOcrText('')
                    setSummaryResult('')
                  }}
                  id="clear-image-btn"
                >
                  🗑️ Clear
                </button>
              </div>
            </div>
          )}


          {ocrLoading && (
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <div className="spinner" />
              <p className="loading-text">Running TrOCR on {language === 'hi' ? 'Hindi' : 'English'} text...</p>
            </div>
          )}

          {ocrText && (
            <div className="result-panel" style={{ marginTop: '1rem' }}>
              <div className="result-panel__header">
                <span className="result-panel__title">📝 Extracted Text</span>
                {ocrMeta && (
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {ocrMeta.words} words • {Math.round(ocrMeta.confidence * 100)}% conf
                    {ocrMeta.mock && ' • Demo'}
                  </span>
                )}
              </div>
              <div className="result-panel__content">{ocrText}</div>
            </div>
          )}
        </div>

        {/* Right Panel — AI Summary & Help */}
        <div className="docscan-layout__panel">
          {ocrText ? (
            <>
              <h3 style={{ color: 'var(--text-primary)', marginBottom: '1rem', fontSize: '1.1rem', fontWeight: 700 }}>
                🤖 Homework Help
              </h3>

              <div className="mode-pills">
                {MODES.map(m => (
                  <button
                    key={m.id}
                    className={`mode-pill ${mode === m.id ? 'mode-pill--active' : ''}`}
                    onClick={() => setMode(m.id)}
                    id={`mode-${m.id}`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>

              <button
                className="btn btn--success btn--large"
                onClick={runSummary}
                disabled={summaryLoading}
                style={{ width: '100%', marginBottom: '1rem' }}
                id="summary-btn"
              >
                {summaryLoading ? '⏳ AI is thinking...' : `✨ ${MODES.find(m => m.id === mode)?.description}`}
              </button>

              {summaryLoading && (
                <div style={{ textAlign: 'center', padding: '2rem' }}>
                  <div className="spinner" />
                  <p className="loading-text">Generating {mode} with AI tutor...</p>
                </div>
              )}

              {summaryResult && (
                <div className="result-panel">
                  <div className="result-panel__header">
                    <span className="result-panel__title">
                      {MODES.find(m => m.id === mode)?.label || '📋'} Result
                    </span>
                    {summaryMeta && (
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {summaryMeta.model} • {summaryMeta.time}ms
                      </span>
                    )}
                  </div>
                  <div className="result-panel__content">{summaryResult}</div>
                </div>
              )}
            </>
          ) : (
            <div className="empty-state">
              <div className="empty-state__icon">🤖</div>
              <h3 className="empty-state__title">AI Homework Help</h3>
              <p className="empty-state__text">
                Upload a document image and extract text first. Then use AI to summarize, explain, or create quiz questions from the content.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/* ─── Mock Summary Helper ─────────────────────────────────────────────────── */
function getMockSummary(text, mode, _language) {
  if (mode === 'summary') {
    return '**Summary:**\n\nThe text describes the water cycle — a continuous process where water moves through the environment via four key stages: evaporation (water becomes vapor), condensation (vapor forms clouds), precipitation (water falls as rain/snow), and collection (water gathers in lakes/rivers/ground).\n\nThe sun provides the energy that drives this entire cycle.\n\n*[Demo mode — start the backend for AI-powered summaries]*'
  }
  if (mode === 'explain') {
    return '**Let me explain this simply! 🌊**\n\nImagine a big journey that water takes, again and again:\n\n1. **Evaporation** ☀️: When the sun heats water in rivers and oceans, it becomes invisible vapor (like steam from hot chai!)\n\n2. **Condensation** ☁️: High up in the sky, the vapor gets cold and turns into tiny water drops — these become clouds!\n\n3. **Precipitation** 🌧️: When clouds get too heavy with water drops, they release rain (or sometimes snow)\n\n4. **Collection** 💧: Rain water flows into rivers, lakes, and underground — and the cycle starts again!\n\n**Fun fact:** The water you drink today might have been in a dinosaur\'s lake millions of years ago!\n\n*[Demo mode]*'
  }
  if (mode === 'quiz') {
    return '**Quiz: The Water Cycle** 📝\n\n**Q1.** What is the process called when water turns into vapor?\na) Condensation\nb) Evaporation ✅\nc) Precipitation\nd) Collection\n\n**Q2.** What forms when water vapor cools in the atmosphere?\na) Rain\nb) Fog\nc) Clouds ✅\nd) Snow\n\n**Q3.** Which provides the energy for the water cycle?\na) The Moon\nb) Wind\nc) The Sun ✅\nd) Plants\n\n**Q4.** What is precipitation?\na) Water turning to vapor\nb) Water falling from clouds ✅\nc) Water collecting underground\nd) Clouds forming\n\n**Q5.** What happens during the collection stage?\na) Water evaporates\nb) Clouds form\nc) Water gathers in lakes, rivers, and ground ✅\nd) Rain falls\n\n*[Demo mode]*'
  }
  return text
}
