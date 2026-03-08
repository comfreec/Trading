import React from 'react'
import { Link } from 'react-router-dom'
import './Home.css'

function Home() {
  const features = [
    {
      icon: '🎭',
      title: '고객 시나리오 시뮬레이터',
      description: 'AI 기반 실전 대화 연습 - 700+ 대화 패턴',
      link: '/simulator',
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      badge: 'AI 추천'
    },
    {
      icon: '🎤',
      title: 'AI 롤플레잉 연습',
      description: 'Gemini AI와 실시간 음성 대화 연습',
      link: '/roleplay',
      gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      badge: '인기'
    },
    {
      icon: '📝',
      title: '영업 스크립트 라이브러리',
      description: '상황별 효과적인 멘트 150+ 스크립트',
      link: '/scripts',
      gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
    },
    {
      icon: '🧠',
      title: '제품 지식 퀴즈',
      description: '145개 문제로 코웨이 전 제품 마스터',
      link: '/quiz',
      gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      badge: 'NEW'
    },
    {
      icon: '👥',
      title: '커뮤니티',
      description: '영업 노하우와 경험 공유하기',
      link: '/community',
      gradient: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)'
    }
  ]

  return (
    <div className="home">
      <div className="hero">
        <div className="hero-badge">🚀 AI 기반 영업 트레이닝</div>
        <h1>코웨이 마스터</h1>
        <p className="hero-subtitle">최첨단 AI 기술로 최고의 영업 전문가로 성장하세요</p>
        <div className="hero-features">
          <span className="hero-tag">✨ Gemini AI 대화</span>
          <span className="hero-tag">🎯 실전 시뮬레이션</span>
          <span className="hero-tag">📊 145+ 퀴즈</span>
        </div>
      </div>

      <div className="features-section">
        <h2 className="section-title">트레이닝 프로그램</h2>
        <div className="features-grid">
          {features.map((feature, index) => (
            <Link to={feature.link} key={index} className="feature-card">
              <div className="card-gradient" style={{background: feature.gradient}}></div>
              {feature.badge && <div className="feature-badge">{feature.badge}</div>}
              <div className="feature-content">
                <div className="feature-icon">{feature.icon}</div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
                <div className="card-arrow">→</div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <div className="stats-section">
        <div className="stat-card">
          <div className="stat-icon">🎯</div>
          <h2>700+</h2>
          <p>AI 대화 패턴</p>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📚</div>
          <h2>150+</h2>
          <p>영업 스크립트</p>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🧠</div>
          <h2>145+</h2>
          <p>제품 지식 퀴즈</p>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🤖</div>
          <h2>Gemini</h2>
          <p>AI 엔진 탑재</p>
        </div>
      </div>

      <div className="cta-section">
        <h2>지금 바로 시작하세요</h2>
        <p>AI와 함께하는 스마트한 영업 트레이닝</p>
        <Link to="/simulator" className="cta-button">
          <span>시작하기</span>
          <span className="cta-arrow">→</span>
        </Link>
      </div>
    </div>
  )
}

export default Home
