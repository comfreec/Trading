import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import Home from './pages/Home'
import CustomerSimulator from './pages/CustomerSimulator'
import ScriptLibrary from './pages/ScriptLibrary'
import ProductQuiz from './pages/ProductQuiz'
import PerformanceTracker from './pages/PerformanceTracker'
import RolePlay from './pages/RolePlay'
import Community from './pages/Community'
import './App.css'

function App() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [showInstallPrompt, setShowInstallPrompt] = useState(false)

  useEffect(() => {
    // PWA 설치 프롬프트 감지
    const handler = (e) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setShowInstallPrompt(true)
    }

    window.addEventListener('beforeinstallprompt', handler)

    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleInstallClick = async () => {
    if (!deferredPrompt) return

    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    
    if (outcome === 'accepted') {
      console.log('✅ PWA 설치 완료')
    }
    
    setDeferredPrompt(null)
    setShowInstallPrompt(false)
  }

  return (
    <Router>
      <div className="app">
        {showInstallPrompt && (
          <div className="install-prompt">
            <div className="install-content">
              <span>📱 앱으로 설치하고 더 편하게 사용하세요!</span>
              <div className="install-buttons">
                <button onClick={handleInstallClick} className="install-btn">
                  설치하기
                </button>
                <button onClick={() => setShowInstallPrompt(false)} className="dismiss-btn">
                  나중에
                </button>
              </div>
            </div>
          </div>
        )}

        <nav className="navbar">
          <div className="nav-container">
            <Link to="/" className="logo">
              🎯 코웨이 영업 마스터
            </Link>
            <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)}>
              ☰
            </button>
            <ul className={`nav-menu ${menuOpen ? 'active' : ''}`}>
              <li><Link to="/" onClick={() => setMenuOpen(false)}>홈</Link></li>
              <li><Link to="/simulator" onClick={() => setMenuOpen(false)}>고객 시뮬레이터</Link></li>
              <li><Link to="/scripts" onClick={() => setMenuOpen(false)}>영업 스크립트</Link></li>
              <li><Link to="/quiz" onClick={() => setMenuOpen(false)}>제품 퀴즈</Link></li>
              <li><Link to="/performance" onClick={() => setMenuOpen(false)}>실적 관리</Link></li>
              <li><Link to="/roleplay" onClick={() => setMenuOpen(false)}>롤플레잉</Link></li>
              <li><Link to="/community" onClick={() => setMenuOpen(false)}>커뮤니티</Link></li>
            </ul>
          </div>
        </nav>

        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/simulator" element={<CustomerSimulator />} />
            <Route path="/scripts" element={<ScriptLibrary />} />
            <Route path="/quiz" element={<ProductQuiz />} />
            <Route path="/performance" element={<PerformanceTracker />} />
            <Route path="/roleplay" element={<RolePlay />} />
            <Route path="/community" element={<Community />} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App
