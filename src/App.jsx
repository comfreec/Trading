import React from 'react'
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import Home from './pages/Home'
import CustomerSimulator from './pages/CustomerSimulator'
import ScriptLibrary from './pages/ScriptLibrary'
import ProductQuiz from './pages/ProductQuiz'
import PerformanceTracker from './pages/PerformanceTracker'
import RolePlay from './pages/RolePlay'
import Community from './pages/Community'
import './App.css'

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
  const [menuOpen, setMenuOpen] = React.useState(false)

  return (
    <ErrorBoundary>
      <Router>
        <div className="app">
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
    </ErrorBoundary>
  )
}

export default App
