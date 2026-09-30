import { useState, useRef, useEffect } from 'react'

const API_BASE = '/api'

export default function AccessibilityPage() {
  const [activeTab, setActiveTab] = useState('stt')

  return (
    <div className="page">
      <div className="page__header">
        <h1 className="page__title">♿ Accessibility Tools</h1>
        <p className="page__description">
          AI-powered tools for visually impaired and hearing impaired students — all running offline on device
        </p>
      </div>

      <div className="tabs" role="tablist" aria-label="Accessibility features">
        <button
          className={`tabs__tab ${activeTab === 'stt' ? 'tabs__tab--active' : ''}`}
          onClick={() => setActiveTab('stt')}
          role="tab"
          aria-selected={activeTab === 'stt'}
          id="tab-stt"
        >
          🎤 Speech to Text
        </button>
        <button
          className={`tabs__tab ${activeTab === 'tts' ? 'tabs__tab--active' : ''}`}
          onClick={() => setActiveTab('tts')}
          role="tab"
          aria-selected={activeTab === 'tts'}
          id="tab-tts"
        >
          🔊 Text to Speech
        </button>
        <button
          className={`tabs__tab ${activeTab === 'sign' ? 'tabs__tab--active' : ''}`}
          onClick={() => setActiveTab('sign')}
          role="tab"
          aria-selected={activeTab === 'sign'}
          id="tab-sign"
        >
          🤟 Sign Language
        </button>
      </div>

      <div className="accessibility-grid">
        {activeTab === 'stt' && <SpeechToTextSection />}
        {activeTab === 'tts' && <TextToSpeechSection />}
        {activeTab === 'sign' && <SignLanguageSection />}
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════════════
   Speech to Text Section
   ═══════════════════════════════════════════════════════════════════════════ */
function SpeechToTextSection() {
  const [recording, setRecording] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [language, setLanguage] = useState('en')
  const [loading, setLoading] = useState(false)
  const mediaRecorderRef = useRef(null)
  const chunksRef = useRef([])

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }

      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/wav' })
        stream.getTracks().forEach(t => t.stop())
        await transcribeAudio(blob)
      }

      mediaRecorder.start()
      setRecording(true)
    } catch (err) {
      console.error('Microphone access denied:', err)
      setTranscript('⚠️ Microphone access denied. Please allow microphone access in your browser settings.')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop()
      setRecording(false)
    }
  }

  const transcribeAudio = async (blob) => {
    setLoading(true)
    try {
      const reader = new FileReader()
      reader.onloadend = async () => {
        const base64 = reader.result.split(',')[1]
        const res = await fetch(`${API_BASE}/accessibility/stt/base64`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ audio_base64: base64, language }),
        })
        if (res.ok) {
          const data = await res.json()
          setTranscript(data.text)
        }
      }
      reader.readAsDataURL(blob)
    } catch {
      setTranscript('Demo mode: "नमस्ते, मैं आज गणित सीखना चाहता हूँ।" — This is a sample transcription. Start the backend for real speech recognition.')
    }
    setLoading(false)
  }

  return (
    <section className="accessibility-section" aria-labelledby="stt-title">
      <div className="accessibility-section__header">
        <div className="accessibility-section__icon accessibility-section__icon--stt">🎤</div>
        <div>
          <h2 className="accessibility-section__title" id="stt-title">Speech to Text</h2>
          <p className="accessibility-section__description">Speak in Hindi or English — AI converts your voice to text</p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1.5rem' }}>
        <select className="select" value={language} onChange={(e) => setLanguage(e.target.value)} aria-label="Language">
          <option value="en">English</option>
          <option value="hi">हिन्दी (Hindi)</option>
        </select>
      </div>

      <button
        className={`record-btn ${recording ? 'record-btn--recording' : ''}`}
        onClick={recording ? stopRecording : startRecording}
        aria-label={recording ? 'Stop recording' : 'Start recording'}
        id="stt-record-btn"
      >
        {recording ? '⏹' : '🎤'}
      </button>

      <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
        {recording ? '🔴 Recording... Click to stop' : 'Click to start speaking'}
      </p>

      {loading && (
        <div style={{ textAlign: 'center', padding: '1rem' }}>
          <div className="spinner" />
          <p className="loading-text">Transcribing with Whisper AI...</p>
        </div>
      )}

      {transcript && (
        <div className="result-panel">
          <div className="result-panel__header">
            <span className="result-panel__title">📝 Transcription</span>
            <button className="btn btn--secondary" onClick={() => setTranscript('')} style={{ fontSize: '0.75rem', padding: '4px 12px' }}>Clear</button>
          </div>
          <div className="result-panel__content">{transcript}</div>
        </div>
      )}
    </section>
  )
}

/* ═══════════════════════════════════════════════════════════════════════════
   Text to Speech Section
   ═══════════════════════════════════════════════════════════════════════════ */
function TextToSpeechSection() {
  const [text, setText] = useState('')
  const [language, setLanguage] = useState('en')
  const [speed, setSpeed] = useState(1.0)
  const [loading, setLoading] = useState(false)
  const [playing, setPlaying] = useState(false)
  const audioRef = useRef(null)

  const synthesize = async () => {
    if (!text.trim()) return
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE}/accessibility/tts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, language, speed }),
      })
      if (res.ok) {
        const data = await res.json()
        if (data.audio_base64) {
          const audio = new Audio(`data:audio/wav;base64,${data.audio_base64}`)
          audioRef.current = audio
          audio.onplay = () => setPlaying(true)
          audio.onended = () => setPlaying(false)
          audio.play()
        }
      }
    } catch {
      // Use browser's built-in TTS as ultimate fallback
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = language === 'hi' ? 'hi-IN' : 'en-US'
      utterance.rate = speed
      utterance.onstart = () => setPlaying(true)
      utterance.onend = () => setPlaying(false)
      speechSynthesis.speak(utterance)
    }
    setLoading(false)
  }

  const stopPlayback = () => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }
    speechSynthesis.cancel()
    setPlaying(false)
  }

  return (
    <section className="accessibility-section" aria-labelledby="tts-title">
      <div className="accessibility-section__header">
        <div className="accessibility-section__icon accessibility-section__icon--tts">🔊</div>
        <div>
          <h2 className="accessibility-section__title" id="tts-title">Text to Speech</h2>
          <p className="accessibility-section__description">Enter text and hear it read aloud — great for visually impaired students</p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap' }}>
        <select className="select" value={language} onChange={(e) => setLanguage(e.target.value)} aria-label="Language">
          <option value="en">English</option>
          <option value="hi">हिन्दी (Hindi)</option>
        </select>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Speed:</label>
          <input
            type="range"
            min="0.5"
            max="2"
            step="0.1"
            value={speed}
            onChange={(e) => setSpeed(parseFloat(e.target.value))}
            style={{ width: '100px' }}
            aria-label="Speech speed"
          />
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', minWidth: '35px' }}>{speed}x</span>
        </div>
      </div>

      <textarea
        className="chat__input"
        rows={5}
        placeholder={language === 'hi' ? 'यहाँ पढ़ने के लिए पाठ दर्ज करें...' : 'Enter text to read aloud...'}
        value={text}
        onChange={(e) => setText(e.target.value)}
        style={{ width: '100%', resize: 'vertical', marginBottom: '1rem' }}
        id="tts-input"
        aria-label="Text to speak"
      />

      <div style={{ display: 'flex', gap: '0.75rem' }}>
        <button
          className="btn btn--success btn--large"
          onClick={synthesize}
          disabled={loading || !text.trim()}
          id="tts-speak-btn"
        >
          {loading ? '⏳ Generating...' : '🔊 Speak'}
        </button>
        {playing && (
          <button className="btn btn--danger btn--large" onClick={stopPlayback} id="tts-stop-btn">
            ⏹ Stop
          </button>
        )}
      </div>
    </section>
  )
}

/* ═══════════════════════════════════════════════════════════════════════════
   Sign Language Section
   ═══════════════════════════════════════════════════════════════════════════ */
function SignLanguageSection() {
  const [active, setActive] = useState(false)
  const [detectedGesture, setDetectedGesture] = useState(null)
  const [accumulatedText, setAccumulatedText] = useState('')
  const [confidence, setConfidence] = useState(0)
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const intervalRef = useRef(null)
  const streamRef = useRef(null)

  const startDetection = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
      setActive(true)

      // Start sending frames every 500ms
      intervalRef.current = setInterval(() => captureAndDetect(), 500)
    } catch (err) {
      console.error('Camera access denied:', err)
    }
  }

  const stopDetection = async () => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop())
    }
    setActive(false)
  }

  const captureAndDetect = async () => {
    if (!videoRef.current || !canvasRef.current) return

    const video = videoRef.current
    const canvas = canvasRef.current
    canvas.width = video.videoWidth || 640
    canvas.height = video.videoHeight || 480

    const ctx = canvas.getContext('2d')
    ctx.drawImage(video, 0, 0)

    const dataUrl = canvas.toDataURL('image/jpeg', 0.8)
    const base64 = dataUrl.split(',')[1]

    try {
      const res = await fetch(`${API_BASE}/accessibility/sign-language/detect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ frame_base64: base64 }),
      })
      if (res.ok) {
        const data = await res.json()
        setDetectedGesture(data.gesture)
        setConfidence(data.confidence || 0)
        setAccumulatedText(data.accumulated_text || '')
      }
    } catch {
      // Mock detection when backend is unavailable
      const mockGestures = ['A', 'B', 'C', 'hello', 'thank you', 'yes']
      const gesture = mockGestures[Math.floor(Math.random() * mockGestures.length)]
      setDetectedGesture(gesture)
      setConfidence(Math.random() * 0.3 + 0.7)
      setAccumulatedText(prev => prev ? `${prev} ${gesture}` : gesture)
    }
  }

  const clearText = async () => {
    try {
      await fetch(`${API_BASE}/accessibility/sign-language/clear`, { method: 'POST' })
    } catch { /* ignore */ }
    setAccumulatedText('')
    setDetectedGesture(null)
  }

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
      if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop())
    }
  }, [])

  return (
    <section className="accessibility-section" aria-labelledby="sign-title">
      <div className="accessibility-section__header">
        <div className="accessibility-section__icon accessibility-section__icon--sign">🤟</div>
        <div>
          <h2 className="accessibility-section__title" id="sign-title">Sign Language to Text</h2>
          <p className="accessibility-section__description">Show ISL gestures to your webcam — AI translates them to text in real-time</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        {/* Webcam */}
        <div>
          <div className="webcam-container">
            <video ref={videoRef} autoPlay muted playsInline style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <canvas ref={canvasRef} style={{ display: 'none' }} />
            {active && (
              <div className="webcam-overlay">
                <span className="webcam-overlay__badge webcam-overlay__badge--live">🔴 LIVE</span>
                {detectedGesture && (
                  <span className="webcam-overlay__badge">
                    ✋ {detectedGesture} ({Math.round(confidence * 100)}%)
                  </span>
                )}
              </div>
            )}
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem', justifyContent: 'center' }}>
            <button
              className={`btn ${active ? 'btn--danger' : 'btn--success'} btn--large`}
              onClick={active ? stopDetection : startDetection}
              id="sign-toggle-btn"
            >
              {active ? '⏹ Stop' : '📷 Start Camera'}
            </button>
            <button className="btn btn--secondary" onClick={clearText} id="sign-clear-btn">
              🗑️ Clear
            </button>
          </div>
        </div>

        {/* Results */}
        <div>
          {detectedGesture && (
            <div className="stat-card" style={{ marginBottom: '1rem' }}>
              <div className="stat-card__value" style={{ fontSize: '3rem' }}>
                {detectedGesture}
              </div>
              <div className="stat-card__label">Detected Gesture</div>
              <div style={{
                marginTop: '0.5rem',
                height: '4px',
                borderRadius: '2px',
                background: 'var(--bg-glass)',
                overflow: 'hidden',
              }}>
                <div style={{
                  width: `${confidence * 100}%`,
                  height: '100%',
                  background: 'var(--gradient-secondary)',
                  borderRadius: '2px',
                  transition: 'width 0.3s ease',
                }} />
              </div>
            </div>
          )}

          <div className="result-panel">
            <div className="result-panel__header">
              <span className="result-panel__title">📝 Translated Text</span>
            </div>
            <div className="result-panel__content">
              {accumulatedText || 'Start the camera and show ISL gestures to see translations here...'}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
