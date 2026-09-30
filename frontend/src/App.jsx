import { Routes, Route, NavLink } from 'react-router-dom'
import { useState, useEffect } from 'react'
import DashboardPage from './pages/DashboardPage'
import TutorPage from './pages/TutorPage'
import AccessibilityPage from './pages/AccessibilityPage'
import DocScanPage from './pages/DocScanPage'
import ProposalPage from './pages/ProposalPage'

const API_BASE = '/api'

const navItems = [
  { path: '/', icon: '🏠', label: 'Dashboard' },
  { path: '/tutor', icon: '🎓', label: 'AI Tutor' },
  { path: '/accessibility', icon: '♿', label: 'Accessibility' },
  { path: '/docscan', icon: '📄', label: 'Doc Scanner' },
  { path: '/proposal', icon: '🏆', label: 'Challenge Proposal' },
]

export default function App() {
  const [status, setStatus] = useState(null)
  const [highContrast, setHighContrast] = useState(false)
  const [dyslexicFont, setDyslexicFont] = useState(false)
  const [textSize, setTextSize] = useState('normal') // normal | large | xlarge

  useEffect(() => {
    fetch(`${API_BASE}/status`)
      .then(r => r.json())
      .then(setStatus)
      .catch(() => setStatus({ status: 'offline', runtime: { npu_available: false } }))
  }, [])

  useEffect(() => {
    if (highContrast) {
      document.body.classList.add('high-contrast')
    } else {
      document.body.classList.remove('high-contrast')
    }
  }, [highContrast])

  useEffect(() => {
    if (dyslexicFont) {
      document.body.classList.add('dyslexia-font')
    } else {
      document.body.classList.remove('dyslexia-font')
    }
  }, [dyslexicFont])

  useEffect(() => {
    document.body.classList.remove('text-scale-large', 'text-scale-xlarge')
    if (textSize === 'large') document.body.classList.add('text-scale-large')
    if (textSize === 'xlarge') document.body.classList.add('text-scale-xlarge')
  }, [textSize])

  const isNpuOnline = status?.runtime?.npu_available ?? false
  const isDemoMode = status?.runtime?.demo_mode ?? false

  const toggleDemoHardware = async () => {
    try {
      const res = await fetch(`${API_BASE}/demo-mode`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: !isDemoMode }),
      })
      if (res.ok) {
        const data = await res.json()
        setStatus(prev => ({
          ...prev,
          runtime: {
            ...prev?.runtime,
            demo_mode: data.demo_mode,
            npu_available: data.runtime?.npu_available ?? data.demo_mode,
            active_provider: data.runtime?.active_provider,
          }
        }))
      }
    } catch {
      // Local toggle fallback
      setStatus(prev => ({
        ...prev,
        runtime: {
          ...prev?.runtime,
          demo_mode: !isDemoMode,
          npu_available: !isDemoMode,
        }
      }))
    }
  }

  return (
    <div className="app-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar__brand">
          <div className="sidebar__logo">🧭</div>
          <div>
            <div className="sidebar__title">Disha</div>
            <div className="sidebar__subtitle">AI Learning Companion</div>
          </div>
        </div>

        <nav className="sidebar__nav">
          {navItems.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) =>
                `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`
              }
            >
              <span className="sidebar__link-icon">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar__status">
          <div
            className="sidebar__npu-badge"
            title={isDemoMode ? "Simulated Snapdragon NPU presentation mode — Click to toggle" : "Hexagon NPU hardware status"}
            onClick={toggleDemoHardware}
            style={{ cursor: 'pointer' }}
          >
            <span className={`sidebar__npu-dot ${isNpuOnline ? 'sidebar__npu-dot--online' : 'sidebar__npu-dot--offline'}`} />
            <span>
              {status
                ? isNpuOnline
                  ? (isDemoMode ? 'Snapdragon NPU (Demo)' : 'Snapdragon NPU Active')
                  : 'CPU Mode (Offline Ready)'
                : 'Connecting...'}
            </span>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        {/* Top Accessibility Bar */}
        <div className="a11y-bar">
          <div className="a11y-bar__group">
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>♿ Accessibility:</span>
            <button
              className={`a11y-btn ${highContrast ? 'a11y-btn--active' : ''}`}
              onClick={() => setHighContrast(!highContrast)}
              title="Toggle High Contrast for low-vision learners"
            >
              👁️ High Contrast
            </button>
            <button
              className={`a11y-btn ${dyslexicFont ? 'a11y-btn--active' : ''}`}
              onClick={() => setDyslexicFont(!dyslexicFont)}
              title="Toggle Dyslexia-friendly typography"
            >
              📖 Dyslexia Font
            </button>
          </div>

          <div className="a11y-bar__group">
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Font Size:</span>
            <button
              className={`a11y-btn ${textSize === 'normal' ? 'a11y-btn--active' : ''}`}
              onClick={() => setTextSize('normal')}
            >
              A
            </button>
            <button
              className={`a11y-btn ${textSize === 'large' ? 'a11y-btn--active' : ''}`}
              onClick={() => setTextSize('large')}
            >
              A+
            </button>
            <button
              className={`a11y-btn ${textSize === 'xlarge' ? 'a11y-btn--active' : ''}`}
              onClick={() => setTextSize('xlarge')}
            >
              A++
            </button>
          </div>
        </div>

        <Routes>
          <Route path="/" element={<DashboardPage status={status} />} />
          <Route path="/tutor" element={<TutorPage />} />
          <Route path="/accessibility" element={<AccessibilityPage />} />
          <Route path="/docscan" element={<DocScanPage />} />
          <Route path="/proposal" element={<ProposalPage />} />
        </Routes>
      </main>
    </div>
  )
}

