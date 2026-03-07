import React, { useState } from 'react'
import './RolePlay.css'

function RolePlay() {
  const [isRecording, setIsRecording] = useState(false)
  const [recordings, setRecordings] = useState([
    {
      id: 1,
      title: '가격 협상 연습',
      date: '2026-03-05',
      duration: '3:24',
      score: 85,
      feedback: ['가격 대비 가치 설명이 좋았습니다', '좀 더 자신감 있는 톤이 필요합니다']
    },
    {
      id: 2,
      title: '제품 설명 연습',
      date: '2026-03-03',
      duration: '2:15',
      score: 92,
      feedback: ['명확한 설명이 인상적입니다', '고객 질문에 대한 대응이 완벽합니다']
    }
  ])

  const [selectedScenario, setSelectedScenario] = useState(null)

  const scenarios = [
    {
      id: 1,
      title: '첫 방문 고객 응대',
      icon: '👋',
      description: '처음 방문한 고객에게 서비스를 소개하고 신뢰를 구축하세요',
      keyPoints: ['친근한 인사', '서비스 소개', '고객 니즈 파악'],
      timeLimit: '3분'
    },
    {
      id: 2,
      title: '가격 협상',
      icon: '💰',
      description: '가격에 민감한 고객을 설득하고 가치를 전달하세요',
      keyPoints: ['가치 강조', '장기 경제성', '프로모션 안내'],
      timeLimit: '5분'
    },
    {
      id: 3,
      title: '제품 비교 설명',
      icon: '🔍',
      description: '경쟁사 제품과 비교하며 코웨이의 차별점을 설명하세요',
      keyPoints: ['객관적 비교', '차별화 포인트', '고객 혜택'],
      timeLimit: '4분'
    },
    {
      id: 4,
      title: '거절 대응',
      icon: '🛡️',
      description: '고객의 거절을 극복하고 재제안하세요',
      keyPoints: ['공감 표현', '대안 제시', '부담 완화'],
      timeLimit: '3분'
    },
    {
      id: 5,
      title: '클로징',
      icon: '🎯',
      description: '관심 있는 고객을 계약으로 이끄세요',
      keyPoints: ['긍정 신호 포착', '결정 유도', '다음 단계 안내'],
      timeLimit: '2분'
    }
  ]

  const expertScripts = [
    {
      scenario: '첫 방문 고객 응대',
      script: '안녕하세요! 코웨이 홈케어닥터입니다. 오늘 매트리스 케어 서비스로 방문했는데요, 혹시 매트리스 사용하신 지 얼마나 되셨나요? 보통 3년 이상 사용하시면 진드기와 먼지가 많이 쌓여있어서 건강에 좋지 않거든요.',
      tone: '밝고 친근하면서도 전문적인 톤',
      rating: 5.0
    },
    {
      scenario: '가격 협상',
      script: '가격이 부담되실 수 있죠. 하지만 렌탈은 초기 비용 없이 월 3만원대로 시작하실 수 있고요, 고장 시 무상 A/S와 정기 관리까지 포함이에요. 10년 사용하시면 구매보다 훨씬 경제적입니다.',
      tone: '이해하는 듯한 공감 후 확신에 찬 설명',
      rating: 4.9
    }
  ]

  const handleStartRecording = (scenario) => {
    setSelectedScenario(scenario)
    setIsRecording(true)
    // 실제로는 Web Audio API를 사용하여 녹음 구현
  }

  const handleStopRecording = () => {
    setIsRecording(false)
    // 녹음 저장 로직
    const newRecording = {
      id: recordings.length + 1,
      title: selectedScenario.title,
      date: new Date().toISOString().split('T')[0],
      duration: '2:30',
      score: Math.floor(Math.random() * 20) + 80,
      feedback: [
        '전반적으로 좋은 설명이었습니다',
        '좀 더 구체적인 예시를 들면 좋겠습니다'
      ]
    }
    setRecordings([newRecording, ...recordings])
    setSelectedScenario(null)
  }

  return (
    <div className="roleplay">
      <div className="roleplay-header">
        <h1>🎤 롤플레잉 연습</h1>
        <p>실전처럼 연습하고 피드백을 받으세요</p>
      </div>

      {!isRecording ? (
        <>
          <div className="scenarios-section">
            <h2>연습 시나리오 선택</h2>
            <div className="scenarios-grid">
              {scenarios.map(scenario => (
                <div key={scenario.id} className="scenario-card">
                  <div className="scenario-icon">{scenario.icon}</div>
                  <h3>{scenario.title}</h3>
                  <p>{scenario.description}</p>
                  <div className="scenario-details">
                    <div className="key-points">
                      <strong>핵심 포인트:</strong>
                      <ul>
                        {scenario.keyPoints.map((point, index) => (
                          <li key={index}>{point}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="time-limit">
                      ⏱️ 권장 시간: {scenario.timeLimit}
                    </div>
                  </div>
                  <button 
                    onClick={() => handleStartRecording(scenario)}
                    className="start-btn"
                  >
                    🎤 연습 시작
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="expert-section">
            <h2>⭐ 베테랑 영업사원의 모범 답변</h2>
            <div className="expert-scripts">
              {expertScripts.map((expert, index) => (
                <div key={index} className="expert-card">
                  <h3>{expert.scenario}</h3>
                  <div className="expert-script">
                    <strong>스크립트:</strong>
                    <p>"{expert.script}"</p>
                  </div>
                  <div className="expert-tone">
                    <strong>톤:</strong> {expert.tone}
                  </div>
                  <div className="expert-rating">
                    ⭐ {expert.rating}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="recordings-section">
            <h2>내 연습 기록</h2>
            <div className="recordings-list">
              {recordings.map(recording => (
                <div key={recording.id} className="recording-card">
                  <div className="recording-header">
                    <div>
                      <h3>{recording.title}</h3>
                      <p className="recording-date">{recording.date}</p>
                    </div>
                    <div className="recording-score" style={{
                      color: recording.score >= 90 ? '#43e97b' : recording.score >= 70 ? '#4facfe' : '#fa709a'
                    }}>
                      {recording.score}점
                    </div>
                  </div>
                  <div className="recording-info">
                    <span>⏱️ {recording.duration}</span>
                  </div>
                  <div className="recording-feedback">
                    <strong>피드백:</strong>
                    <ul>
                      {recording.feedback.map((fb, index) => (
                        <li key={index}>{fb}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="recording-actions">
                    <button className="play-btn">▶️ 재생</button>
                    <button className="delete-btn">🗑️ 삭제</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        <div className="recording-area">
          <div className="recording-card-active">
            <div className="scenario-info">
              <div className="scenario-icon-large">{selectedScenario.icon}</div>
              <h2>{selectedScenario.title}</h2>
              <p>{selectedScenario.description}</p>
            </div>

            <div className="recording-indicator">
              <div className="recording-pulse"></div>
              <span>녹음 중...</span>
            </div>

            <div className="key-points-reminder">
              <h3>💡 기억하세요</h3>
              <ul>
                {selectedScenario.keyPoints.map((point, index) => (
                  <li key={index}>{point}</li>
                ))}
              </ul>
            </div>

            <button onClick={handleStopRecording} className="stop-btn">
              ⏹️ 녹음 종료
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default RolePlay
