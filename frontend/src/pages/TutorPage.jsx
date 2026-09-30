import { useState, useRef, useEffect } from 'react'

const API_BASE = '/api'

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'हिन्दी (Hindi)' },
  { code: 'ta', label: 'தமிழ் (Tamil)' },
  { code: 'te', label: 'తెలుగు (Telugu)' },
]

const SUBJECTS = [
  { id: 'general', label: '💡 General', emoji: '💡' },
  { id: 'math', label: '📐 Math', emoji: '📐' },
  { id: 'science', label: '🔬 Science', emoji: '🔬' },
  { id: 'english', label: '📖 English', emoji: '📖' },
  { id: 'social', label: '🌍 Social Studies', emoji: '🌍' },
  { id: 'hindi', label: '🇮🇳 Hindi', emoji: '🇮🇳' },
]

export default function TutorPage() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Namaste! 🙏 I\'m **Disha**, your AI learning companion.\n\nI can help you with **Math**, **Science**, **English**, **Hindi**, and more!\n\nPick a subject and ask me anything. I\'ll explain it step by step. 😊',
      meta: { model: 'Welcome', time: 0 },
    },
  ])
  const [input, setInput] = useState('')
  const [language, setLanguage] = useState('en')
  const [subject, setSubject] = useState('general')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async () => {
    const text = input.trim()
    if (!text || loading) return

    const userMsg = { role: 'user', content: text }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)

    try {
      const res = await fetch(`${API_BASE}/tutor/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, language, subject }),
      })

      if (res.ok) {
        const data = await res.json()
        setMessages(prev => [
          ...prev,
          {
            role: 'assistant',
            content: data.response,
            meta: { model: data.model_used, time: data.inference_time_ms },
          },
        ])
      } else {
        throw new Error('API error')
      }
    } catch {
      // Fallback response when backend is unavailable
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: getFallbackResponse(text, language, subject),
          meta: { model: 'Offline Fallback', time: 0 },
        },
      ])
    }
    setLoading(false)
    inputRef.current?.focus()
  }

  const clearChat = async () => {
    try {
      await fetch(`${API_BASE}/tutor/clear`, { method: 'POST' })
    } catch { /* ignore */ }
    setMessages([{
      role: 'assistant',
      content: 'Chat cleared! What would you like to learn about? 📚',
      meta: { model: 'System', time: 0 },
    }])
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className="page">
      <div className="page__header">
        <h1 className="page__title">🎓 AI Tutor</h1>
        <p className="page__description">
          Your personal multilingual teacher — ask any question, get step-by-step explanations
        </p>
      </div>

      <div className="chat-container">
        {/* Controls */}
        <div className="chat__controls">
          <select
            className="select"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            id="language-selector"
            aria-label="Select language"
          >
            {LANGUAGES.map(lang => (
              <option key={lang.code} value={lang.code}>{lang.label}</option>
            ))}
          </select>

          <select
            className="select"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            id="subject-selector"
            aria-label="Select subject"
          >
            {SUBJECTS.map(subj => (
              <option key={subj.id} value={subj.id}>{subj.label}</option>
            ))}
          </select>

          <button className="btn btn--danger" onClick={clearChat} id="clear-chat-btn">
            🗑️ Clear Chat
          </button>
        </div>

        {/* Messages */}
        <div className="chat__messages" role="log" aria-label="Chat messages">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`chat__bubble chat__bubble--${msg.role}`}
            >
              <div dangerouslySetInnerHTML={{ __html: formatMarkdown(msg.content) }} />
              {msg.meta && (
                <div className="chat__bubble-meta">
                  <span>{msg.meta.model}</span>
                  {msg.meta.time > 0 && <span>{msg.meta.time}ms</span>}
                </div>
              )}
            </div>
          ))}
          {loading && (
            <div className="chat__bubble chat__bubble--assistant">
              <div className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }} />
              <div className="chat__bubble-meta">
                <span>Thinking...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Chips */}
        <div className="prompt-chips" style={{ padding: '0 1rem' }}>
          {[
            { label: '🌱 Photosynthesis (Class 7)', text: 'Can you explain photosynthesis with a simple village farm example?' },
            { label: '📐 Solve: 3x + 15 = 45', text: 'Step by step, how do I solve the equation: 3x + 15 = 45?' },
            { label: '⚡ Newton\'s Laws', text: 'Explain Newton\'s three laws of motion with everyday Indian examples.' },
            { label: '💧 जल चक्र (Water Cycle)', text: 'जल चक्र क्या है और यह हमारे किसानों के लिए क्यों जरूरी है?' },
          ].map((chip, idx) => (
            <button
              key={idx}
              className="prompt-chip"
              onClick={() => {
                setInput(chip.text)
                inputRef.current?.focus()
              }}
            >
              {chip.label}
            </button>
          ))}
        </div>

        {/* Input */}
        <div className="chat__input-row">
          <input
            ref={inputRef}
            className="chat__input"
            type="text"
            placeholder={language === 'hi' ? 'अपना प्रश्न यहाँ लिखें...' : 'Type your question here...'}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={loading}
            id="chat-input"
            aria-label="Type your message"
          />
          <button
            className="btn btn--primary btn--icon"
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            id="send-btn"
            aria-label="Send message"
          >
            ➤
          </button>
        </div>
      </div>
    </div>
  )
}

/* ─── Helpers ─────────────────────────────────────────────────────────────── */

function formatMarkdown(text) {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`([^`]+)`/g, '<code style="background:rgba(108,92,231,0.2);padding:2px 6px;border-radius:4px;font-size:0.85em">$1</code>')
    .replace(/```([\s\S]*?)```/g, '<pre style="background:rgba(0,0,0,0.3);padding:12px;border-radius:8px;overflow-x:auto;font-size:0.85em;margin:8px 0"><code>$1</code></pre>')
    .replace(/\n/g, '<br>')
}

function getFallbackResponse(message, language, subject) {
  const lower = message.toLowerCase()

  if (['hello', 'hi', 'hey', 'namaste', 'नमस्ते'].some(g => lower.includes(g))) {
    return language === 'hi'
      ? 'नमस्ते! 👋 मैं दिशा हूँ। आज आप क्या सीखना चाहेंगे?'
      : "Hello! 👋 I'm Disha. What would you like to learn today?"
  }

  if (subject === 'math') {
    return '**Math Help** 📐\n\nI\'d love to help with your math question! Try asking about:\n- **Addition & Subtraction**\n- **Multiplication & Division**\n- **Fractions & Percentages**\n- **Algebra basics**\n- **Geometry**\n\n*Note: Connect the backend server for detailed AI-powered explanations!*'
  }

  if (subject === 'science') {
    return '**Science Help** 🔬\n\nI can help you explore:\n- **Photosynthesis** 🌱\n- **The Water Cycle** 💧\n- **Human Body** 🫀\n- **Forces & Motion** ⚡\n- **Light & Sound** 🔦\n\n*Start the backend server for full AI tutor capabilities!*'
  }

  return `Great question about **${subject}**! 🎯\n\nI'm running in offline demo mode. Start the Python backend to unlock full AI tutoring:\n\n\`python -m backend.main\`\n\nI'll then be able to give you detailed, step-by-step explanations in ${language === 'hi' ? 'Hindi' : 'English'}! 💪`
}

