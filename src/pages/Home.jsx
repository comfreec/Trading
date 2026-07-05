import React from 'react'
import { Link } from 'react-router-dom'
import './Home.css'

function Home() {
  const features = [
    {
      icon: '🎯',
      title: '실시간 코칭',
      description: '고객 대화 중 AI가 즉시 최적의 멘트 제안',
      link: '/live-coach',
      gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      badge: '신규'
    },
    {
      icon: '🎭',
      title: '고객 시뮬레이터',
      description: '실전 환경에서 다양한 고객 유형별 대화 연습',
      link: '/simulator',
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      badge: '핵심'
    },
    {
      icon: '🎤',
      title: 'AI 롤플레잉',
      description: 'Gemini AI와 실시간 음성 대화로 스킬 향상',
      link: '/roleplay',
      gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      badge: '인기'
    },
    {
      icon: '📝',
      title: '영업 스크립트',
      description: '검증된 상황별 멘트와 응대 화법 라이브러리',
      link: '/scripts',
      gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
    },
    {
      icon: '✍️',
      title: '나만의 멘트',
      description: 'AI로 맞춤 멘트 생성 및 저장 관리',
      link: '/my-scripts',
      gradient: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)'
    },
    {
      icon: '🧠',
      title: '제품 지식 테스트',
      description: '코웨이 전 제품군 체계적 학습과 평가',
      link: '/quiz',
      gradient: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%)'
    }
  ]

  return (
    <div className="home">
      <div className="hero">
        <div className="hero-badge">🚀 AI 기반 영업 트레이닝 플랫폼</div>
        <h1>코웨이 마스터</h1>
        <p className="hero-subtitle">실전 중심의 체계적인 학습으로 영업 전문가로 성장하세요</p>
        <div className="hero-features">
          <span className="hero-tag">✨ Gemini AI 탑재</span>
          <span className="hero-tag">🎯 실전 시뮬레이션</span>
          <span className="hero-tag">📊 맞춤형 피드백</span>
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
    </div>
  )
}

export default Home
