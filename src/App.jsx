import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import Home from './pages/Home'
import CustomerSimulator from './pages/CustomerSimulator'
import ScriptLibrary from './pages/ScriptLibrary'
import ProductQuiz from './pages/ProductQuiz'
import RolePlay from './pages/RolePlay'
import Community from './pages/Community'
import Admin from './pages/Admin'
import ConversationHistory from './pages/ConversationHistory'
import MyScripts from './pages/MyScripts'
import LiveCoach from './pages/LiveCoach'
import './App.css'

// 로그인 컴포넌트
function Login({ onLogin }) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    setTimeout(() => {
      if (password === '0070') {
        onLogin()
      } else {
        setError('비밀번호가 틀렸습니다. 다시 입력해주세요.')
        setPassword('')
      }
      setIsLoading(false)
    }, 600)
  }

  return (
    <div className="login-container">
      <div className="bg-shape shape-1"></div>
      <div className="bg-shape shape-2"></div>
      <div className="bg-shape shape-3"></div>
      <div className="bg-gradient"></div>

      <div className="login-card">
        <div className="login-header">
          <div className="logo-wrapper">
            <div className="logo-shape">
              <span className="logo-icon">🎯</span>
            </div>
          </div>
          <h1>코웨이 영업 마스터</h1>
          <p>영업 실력을 한 단계 높여보세요</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="password">
              <span className="label-icon">🔒</span>
              비밀번호
            </label>
            <div className="password-input-wrapper">
              <span className="input-prefix">🔑</span>
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="비밀번호를 입력하세요"
                autoComplete="off"
                autoFocus
              />
              <button 
                type="button" 
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          {error && (
            <div className="error-message">
              <span className="error-icon">⚠️</span>
              {error}
            </div>
          )}

          <button type="submit" className="login-button" disabled={isLoading}>
            {isLoading ? '로그인 중...' : '로그인'}
          </button>
        </form>

        <div className="login-footer">
          <p className="help-text">💡 비밀번호를 잊으셨나요? 관리자에게 문의하세요.</p>
        </div>
      </div>
    </div>
  )
}

// 에러 바운더리
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('에러 발생:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', background: '#f44336', color: 'white' }}>
          <h1>앱 에러 발생</h1>
          <p>{this.state.error?.message}</p>
        </div>
      )
    }
    return this.props.children
  }
}

function App() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  // 로컬 스토리지에서 로그인 상태 확인 (자동 로그인)
  useEffect(() => {
    const savedLoginState = localStorage.getItem('isLoggedIn')
    if (savedLoginState === 'true') {
      setIsLoggedIn(true)
    }
  }, [])

  // 로그인 처리
  const handleLogin = () => {
    setIsLoggedIn(true)
    localStorage.setItem('isLoggedIn', 'true')
  }

  // 로그아웃 처리
  const handleLogout = () => {
    setIsLoggedIn(false)
    localStorage.removeItem('isLoggedIn')
  }

  // 메뉴 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuOpen && !e.target.closest('.nav-container')) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [menuOpen])

  // 메뉴 열릴 때 body 스크롤 방지
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [menuOpen])

  // 로그인되지 않은 경우 로그인 페이지 표시
  if (!isLoggedIn) {
    return <Login onLogin={handleLogin} />
  }

  // 기존 App.jsx 완전히 그대로!
  return (
    <ErrorBoundary>
      <Router>
        <div className="app">
          <nav className="navbar">
            <div className="nav-container">
              <Link to="/" className="logo">
                🎯 코웨이 영업 마스터
              </Link>
              <button 
                className={`menu-toggle ${menuOpen ? 'active' : ''}`} 
                onClick={(e) => {
                  e.stopPropagation()
                  setMenuOpen(!menuOpen)
                }}
                aria-label="메뉴"
              >
                <span></span>
                <span></span>
                <span></span>
              </button>
              <ul className={`nav-menu ${menuOpen ? 'active' : ''}`}>
                <li><Link to="/" onClick={() => setMenuOpen(false)}>홈</Link></li>
                <li><Link to="/live-coach" onClick={() => setMenuOpen(false)}>실시간 코칭</Link></li>
                <li><Link to="/simulator" onClick={() => setMenuOpen(false)}>고객 시뮬레이터</Link></li>
                <li><Link to="/roleplay" onClick={() => setMenuOpen(false)}>롤플레잉</Link></li>
                <li><Link to="/scripts" onClick={() => setMenuOpen(false)}>영업 스크립트</Link></li>
                <li><Link to="/my-scripts" onClick={() => setMenuOpen(false)}>나만의 멘트</Link></li>
                <li><Link to="/quiz" onClick={() => setMenuOpen(false)}>제품 퀴즈</Link></li>
                <li><Link to="/history" onClick={() => setMenuOpen(false)}>대화 기록</Link></li>
                <li><Link to="/community" onClick={() => setMenuOpen(false)}>커뮤니티</Link></li>
                <li><button onClick={handleLogout} className="logout-btn">로그아웃</button></li>
              </ul>
            </div>
          </nav>
          
          {/* 모바일 메뉴 오버레이 */}
          {menuOpen && <div className="menu-overlay" onClick={() => setMenuOpen(false)}></div>}

          <main className="main-content">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/live-coach" element={<LiveCoach />} />
              <Route path="/simulator" element={<CustomerSimulator />} />
              <Route path="/roleplay" element={<RolePlay />} />
              <Route path="/scripts" element={<ScriptLibrary />} />
              <Route path="/my-scripts" element={<MyScripts />} />
              <Route path="/quiz" element={<ProductQuiz />} />
              <Route path="/history" element={<ConversationHistory />} />
              <Route path="/community" element={<Community />} />
              <Route path="/admin" element={<Admin />} />
            </Routes>
          </main>
        </div>
      </Router>
    </ErrorBoundary>
  )
}

export default App
