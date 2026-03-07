import React from 'react'
import { Link } from 'react-router-dom'
import './Home.css'

function Home() {
  const features = [
    {
      icon: '🎭',
      title: '고객 시나리오 시뮬레이터',
      description: '다양한 고객 유형과 실전 대화 연습',
      link: '/simulator',
      color: '#667eea'
    },
    {
      icon: '📝',
      title: '영업 스크립트 라이브러리',
      description: '상황별 효과적인 멘트와 성공 사례',
      link: '/scripts',
      color: '#f093fb'
    },
    {
      icon: '🧠',
      title: '제품 지식 퀴즈',
      description: '매트리스케어와 렌탈 상품 마스터하기',
      link: '/quiz',
      color: '#4facfe'
    },
    {
      icon: '📊',
      title: '실적 추적 & 목표 관리',
      description: '영업 성과를 한눈에 확인하고 관리',
      link: '/performance',
      color: '#43e97b'
    },
    {
      icon: '🎤',
      title: '롤플레잉 연습',
      description: '음성 녹음으로 실전 연습하기',
      link: '/roleplay',
      color: '#fa709a'
    },
    {
      icon: '👥',
      title: '커뮤니티',
      description: '동료들과 노하우 공유하기',
      link: '/community',
      color: '#30cfd0'
    }
  ]

  return (
    <div className="home">
      <div className="hero">
        <h1>🏆 코웨이 영업 마스터 트레이닝</h1>
        <p>매트리스케어 서비스부터 렌탈 영업까지, 최고의 영업 전문가로 성장하세요</p>
      </div>

      <div className="features-grid">
        {features.map((feature, index) => (
          <Link to={feature.link} key={index} className="feature-card" style={{'--card-color': feature.color}}>
            <div className="feature-icon">{feature.icon}</div>
            <h3>{feature.title}</h3>
            <p>{feature.description}</p>
          </Link>
        ))}
      </div>

      <div className="stats-section">
        <div className="stat-card">
          <h2>500+</h2>
          <p>영업 시나리오</p>
        </div>
        <div className="stat-card">
          <h2>1000+</h2>
          <p>실전 스크립트</p>
        </div>
        <div className="stat-card">
          <h2>200+</h2>
          <p>제품 지식 퀴즈</p>
        </div>
      </div>
    </div>
  )
}

export default Home
