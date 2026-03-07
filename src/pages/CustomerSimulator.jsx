import React, { useState } from 'react'
import { ResponseEngine } from '../data/responseEngine'
import { SalesCoach } from '../data/salesCoach'
import { MissionTracker } from '../data/missionSystem'
import { LevelSystem } from '../data/levelSystem'
import './CustomerSimulator.css'

function CustomerSimulator() {
  const [responseEngine, setResponseEngine] = useState(null)
  const [salesCoach] = useState(new SalesCoach())
  const [missionTracker] = useState(new MissionTracker())
  const [levelSystem] = useState(new LevelSystem())
  const [selectedCustomer, setSelectedCustomer] = useState(null)
  const [conversation, setConversation] = useState([])
  const [userInput, setUserInput] = useState('')
  const [showTips, setShowTips] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [recognition, setRecognition] = useState(null)
  const [conversationState, setConversationState] = useState({
    stage: 'initial',
    mentionedTopics: [],
    responseCount: 0
  })
  const [evaluations, setEvaluations] = useState([])
  const [showFeedback, setShowFeedback] = useState(true)
  const [currentFeedback, setCurrentFeedback] = useState(null)
  const [showReport, setShowReport] = useState(false)
  const [finalReport, setFinalReport] = useState(null)
  const [activeMissions, setActiveMissions] = useState([])
  const [completedMissionsInSession, setCompletedMissionsInSession] = useState([])
  const [expGained, setExpGained] = useState(0)
  const [voiceEnabled, setVoiceEnabled] = useState(true)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [selectedVoice, setSelectedVoice] = useState(null)
  const [availableVoices, setAvailableVoices] = useState([])

  // 음성 인식 초기화
  React.useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    
    if (!SpeechRecognition) {
      console.log('Speech Recognition not supported')
      return
    }

    try {
      const recognitionInstance = new SpeechRecognition()
      
      recognitionInstance.continuous = false
      recognitionInstance.interimResults = true
      recognitionInstance.lang = 'ko-KR'
      recognitionInstance.maxAlternatives = 1
      
      recognitionInstance.onstart = () => {
        console.log('🎤 음성 인식 시작됨')
        setIsListening(true)
      }
      
      recognitionInstance.onresult = (event) => {
        console.log('📝 음성 인식 결과:', event)
        
        let transcript = ''
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript
        }
        
        console.log('인식된 텍스트:', transcript)
        setUserInput(transcript)
        
        if (event.results[event.results.length - 1].isFinal) {
          console.log('✅ 최종 결과 확정')
        }
      }
      
      recognitionInstance.onerror = (event) => {
        console.error('❌ 음성 인식 오류:', event.error, event)
        setIsListening(false)
        
        let errorMessage = ''
        
        switch(event.error) {
          case 'no-speech':
            errorMessage = '음성이 감지되지 않았습니다.\n\n조용한 곳에서 다시 시도해주세요.'
            break
          case 'audio-capture':
            errorMessage = '마이크를 사용할 수 없습니다.\n\n다른 앱이 마이크를 사용 중인지 확인해주세요.'
            break
          case 'not-allowed':
            errorMessage = '마이크 권한이 거부되었습니다.\n\nChrome 설정에서 이 사이트의 마이크 권한을 확인해주세요.'
            break
          case 'network':
            errorMessage = '네트워크 오류입니다.\n\n인터넷 연결을 확인해주세요.'
            break
          case 'aborted':
            console.log('사용자가 음성 인식 중단')
            return
          case 'service-not-allowed':
            errorMessage = '음성 인식 서비스를 사용할 수 없습니다.\n\n브라우저를 업데이트하거나 다시 시작해주세요.'
            break
          default:
            errorMessage = `음성 인식 오류: ${event.error}\n\n페이지를 새로고침하고 다시 시도해주세요.`
        }
        
        if (errorMessage) {
          alert(errorMessage)
        }
      }
      
      recognitionInstance.onend = () => {
        console.log('🛑 음성 인식 종료됨')
        setIsListening(false)
      }
      
      setRecognition(recognitionInstance)
      console.log('✅ 음성 인식 초기화 완료')
    } catch (error) {
      console.error('❌ 음성 인식 초기화 실패:', error)
    }
  }, [])

  // TTS 음성 초기화
  React.useEffect(() => {
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices()
      const koreanVoices = voices.filter(voice => voice.lang.startsWith('ko'))
      
      console.log('사용 가능한 한국어 음성:', koreanVoices)
      setAvailableVoices(koreanVoices)
      
      // 기본 음성 선택 (여성 음성 우선)
      const femaleVoice = koreanVoices.find(v => 
        v.name.includes('Female') || 
        v.name.includes('여성') || 
        v.name.includes('Yuna') ||
        v.name.includes('Heami')
      )
      setSelectedVoice(femaleVoice || koreanVoices[0] || null)
    }

    loadVoices()
    
    // 일부 브라우저는 비동기로 음성을 로드함
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices
    }
  }, [])

  // 음성 출력 함수
  const speakText = (text) => {
    if (!voiceEnabled || !text) return

    // 이전 음성 중지
    window.speechSynthesis.cancel()

    const utterance = new SpeechSynthesisUtterance(text)
    
    // 음성 설정
    if (selectedVoice) {
      utterance.voice = selectedVoice
    }
    utterance.lang = 'ko-KR'
    utterance.rate = 1.0 // 속도 (0.1 ~ 10)
    utterance.pitch = 1.0 // 음높이 (0 ~ 2)
    utterance.volume = 1.0 // 볼륨 (0 ~ 1)

    utterance.onstart = () => {
      console.log('🔊 음성 출력 시작')
      setIsSpeaking(true)
    }

    utterance.onend = () => {
      console.log('🔇 음성 출력 종료')
      setIsSpeaking(false)
    }

    utterance.onerror = (event) => {
      console.error('음성 출력 오류:', event)
      setIsSpeaking(false)
    }

    window.speechSynthesis.speak(utterance)
  }

  // 음성 중지 함수
  const stopSpeaking = () => {
    window.speechSynthesis.cancel()
    setIsSpeaking(false)
  }

  const customerTypes = [
    {
      id: 1,
      name: '가격 민감형 고객',
      icon: '💰',
      description: '가격과 할인에 민감하고 비용 대비 효과를 중시',
      personality: '가격이 제일 중요해요. 다른 곳보다 저렴한가요?',
      tips: ['가격보다 장기적 가치 강조', '렌탈의 경제성 설명', '프로모션 정보 제공']
    },
    {
      id: 2,
      name: '품질 중시형 고객',
      icon: '⭐',
      description: '제품의 품질과 브랜드 신뢰도를 최우선으로 고려',
      personality: '품질이 정말 좋은가요? 오래 사용할 수 있나요?',
      tips: ['코웨이 브랜드 신뢰도 강조', '기술력과 품질 인증 설명', 'A/S 시스템 안내']
    },
    {
      id: 3,
      name: '비교 검토형 고객',
      icon: '🔍',
      description: '여러 제품을 꼼꼼히 비교하고 신중하게 결정',
      personality: '다른 제품들과 비교해보고 싶어요. 차이점이 뭔가요?',
      tips: ['경쟁사 대비 차별점 명확히', '객관적 데이터 제시', '체험 기회 제공']
    },
    {
      id: 4,
      name: '빠른 결정형 고객',
      icon: '⚡',
      description: '빠르게 결정하고 즉시 실행을 원함',
      personality: '좋으면 바로 할게요. 언제 설치 가능한가요?',
      tips: ['핵심 혜택만 간결하게', '즉시 진행 가능 강조', '빠른 프로세스 안내']
    },
    {
      id: 5,
      name: '건강 관심형 고객',
      icon: '🏥',
      description: '건강과 위생에 관심이 많고 케어 서비스 중시',
      personality: '매트리스 청소가 건강에 얼마나 중요한가요?',
      tips: ['건강 효과 구체적 설명', '진드기/알레르기 예방 강조', '정기 케어의 중요성']
    }
  ]

  const startSimulation = (customer) => {
    setSelectedCustomer(customer)
    
    // 새로운 응답 엔진 생성
    const engine = new ResponseEngine(customer.id)
    setResponseEngine(engine)
    
    // 첫 인사 생성
    const greeting = engine.generateResponse('안녕하세요')
    
    setConversation([
      { speaker: 'customer', text: greeting }
    ])
    
    // 음성으로 인사
    setTimeout(() => speakText(greeting), 500)
    
    setConversationState({
      stage: 'initial',
      mentionedTopics: [],
      responseCount: 0
    })
    setEvaluations([])
    setShowTips(false)
    setShowReport(false)
    setCurrentFeedback(null)
    setCompletedMissionsInSession([])
    setExpGained(0)
    
    // 활성 미션 로드
    const missions = missionTracker.getAvailableMissions()
    setActiveMissions(missions.slice(0, 3)) // 상위 3개만 표시
  }

  const handleSendMessage = () => {
    if (!userInput.trim() || !responseEngine) return

    const newConversation = [
      ...conversation,
      { speaker: 'agent', text: userInput }
    ]

    // 실시간 평가
    const evaluation = salesCoach.evaluateResponse(userInput, selectedCustomer.id, {
      responseCount: conversationState.responseCount,
      sentiment: conversationState.stage,
      mentionedTopics: conversationState.mentionedTopics
    })
    
    const newEvaluations = [...evaluations, evaluation]
    setEvaluations(newEvaluations)
    
    // 피드백 표시
    setCurrentFeedback(evaluation)

    // 새로운 응답 엔진 사용
    const customerResponse = responseEngine.generateResponse(userInput)
    newConversation.push({ 
      speaker: 'customer', 
      text: customerResponse,
      evaluation: evaluation
    })

    setConversation(newConversation)
    
    // 고객 응답을 음성으로 출력
    setTimeout(() => speakText(customerResponse), 300)
    
    const newState = {
      stage: responseEngine.sentiment,
      mentionedTopics: Array.from(responseEngine.mentionedTopics),
      responseCount: responseEngine.responseCount
    }
    setConversationState(newState)
    
    // 미션 체크
    const conversationData = {
      messageCount: responseEngine.responseCount,
      sentiment: responseEngine.sentiment,
      mentionedTopics: Array.from(responseEngine.mentionedTopics),
      customerType: selectedCustomer.id,
      averageScore: Math.round(newEvaluations.reduce((sum, e) => sum + e.totalScore, 0) / newEvaluations.length),
      empathyScore: Math.round(newEvaluations.reduce((sum, e) => sum + e.scores.empathy, 0) / newEvaluations.length),
      persuasionScore: Math.round(newEvaluations.reduce((sum, e) => sum + e.scores.persuasion, 0) / newEvaluations.length),
      professionalismScore: Math.round(newEvaluations.reduce((sum, e) => sum + e.scores.professionalism, 0) / newEvaluations.length),
      timingScore: Math.round(newEvaluations.reduce((sum, e) => sum + e.scores.timing, 0) / newEvaluations.length),
      hasClosing: userInput.includes('계약') || userInput.includes('신청') || userInput.includes('진행')
    }
    
    const newlyCompleted = missionTracker.checkMissions(conversationData)
    if (newlyCompleted.length > 0) {
      setCompletedMissionsInSession([...completedMissionsInSession, ...newlyCompleted])
      
      // 경험치 추가
      let totalExp = 0
      newlyCompleted.forEach(mission => {
        totalExp += mission.reward.exp
        if (mission.reward.badge) {
          levelSystem.earnBadge(mission.reward.badge)
        }
      })
      const expResult = levelSystem.addExp(totalExp, '미션 완료')
      setExpGained(expGained + totalExp)
      
      if (expResult.leveledUp) {
        alert(`🎉 레벨업! ${expResult.newLevel.title}이 되었습니다!`)
      }
    }
    
    // 일일 통계 업데이트
    missionTracker.updateDailyStats(evaluation.totalScore)
    
    setUserInput('')
  }

  const resetSimulation = () => {
    stopSpeaking() // 음성 중지
    setSelectedCustomer(null)
    setConversation([])
    setConversationState({
      stage: 'initial',
      mentionedTopics: [],
      responseCount: 0
    })
    setUserInput('')
    setShowTips(false)
    setResponseEngine(null)
    setEvaluations([])
    setCurrentFeedback(null)
    setShowReport(false)
    setFinalReport(null)
    setActiveMissions([])
    setCompletedMissionsInSession([])
    setExpGained(0)
    if (isListening && recognition) {
      recognition.stop()
      setIsListening(false)
    }
  }

  const endConversation = () => {
    stopSpeaking() // 음성 중지
    
    if (evaluations.length === 0) {
      alert('대화를 먼저 시작해주세요!')
      return
    }
    
    // 최종 리포트 생성
    const report = salesCoach.generateDetailedReport(
      responseEngine.conversationHistory,
      evaluations,
      selectedCustomer.id
    )
    
    setFinalReport(report)
    setShowReport(true)
    
    // 통계 업데이트
    const conversationData = {
      messageCount: responseEngine.responseCount,
      averageScore: report.summary.averageScore,
      customerType: selectedCustomer.id
    }
    levelSystem.updateStats(conversationData)
    missionTracker.updateCustomerTypeProgress(selectedCustomer.id, report.summary.averageScore)
    
    // 기본 경험치 추가
    const baseExp = Math.round(report.summary.averageScore * 2)
    const expResult = levelSystem.addExp(baseExp, '대화 완료')
    setExpGained(expGained + baseExp)
    
    if (expResult.leveledUp) {
      setTimeout(() => {
        alert(`🎉 레벨업! ${expResult.newLevel.title}이 되었습니다!`)
      }, 500)
    }
  }

  const toggleVoiceInput = () => {
    if (!recognition) {
      const userAgent = navigator.userAgent.toLowerCase()
      let browserInfo = ''
      
      if (userAgent.includes('chrome')) {
        browserInfo = 'Chrome 브라우저를 사용 중이지만 음성 인식이 지원되지 않습니다.'
      } else if (userAgent.includes('safari')) {
        browserInfo = 'Safari 브라우저는 iOS 14.5 이상에서 음성 인식을 지원합니다.'
      } else if (userAgent.includes('firefox')) {
        browserInfo = 'Firefox는 음성 인식을 지원하지 않습니다. Chrome 또는 Safari를 사용해주세요.'
      } else {
        browserInfo = '이 브라우저는 음성 인식을 지원하지 않습니다.'
      }
      
      alert(`${browserInfo}\n\n권장 브라우저:\n- Android: Chrome\n- iOS: Safari (14.5 이상)`)
      return
    }

    if (isListening) {
      console.log('🛑 음성 인식 중지 요청')
      try {
        recognition.stop()
      } catch (error) {
        console.error('Stop recognition error:', error)
      }
      setIsListening(false)
    } else {
      console.log('🎤 음성 인식 시작 요청')
      
      setTimeout(() => {
        try {
          setUserInput('')
          
          if (isListening) {
            console.log('⚠️ 이미 실행 중')
            return
          }
          
          recognition.start()
          console.log('✅ recognition.start() 호출 완료')
        } catch (error) {
          console.error('❌ Start recognition error:', error)
          setIsListening(false)
          
          if (error.message && error.message.includes('not-allowed')) {
            alert('마이크 권한이 필요합니다.\n\n해결 방법:\n1. 주소창 왼쪽 아이콘 터치\n2. "사이트 설정" 선택\n3. "마이크" 권한 허용\n4. 페이지 새로고침')
          } else if (error.message && error.message.includes('already started')) {
            alert('음성 인식이 이미 실행 중입니다.\n\n잠시 후 다시 시도해주세요.')
          } else {
            alert(`음성 인식 시작 오류\n\n페이지를 새로고침하고 다시 시도해주세요.\n\n오류: ${error.message}`)
          }
        }
      }, 100)
    }
  }

  return (
    <div className="simulator">
      <div className="simulator-header">
        <h1>🎭 고객 시나리오 시뮬레이터</h1>
        <p>실전 영업 트레이닝 - 700+ 대화 패턴 | AI 코치 피드백</p>
        <div className="user-progress">
          <div className="level-badge">
            <span className="level-icon">{levelSystem.getCurrentLevel().icon}</span>
            <span className="level-text">Lv.{levelSystem.getCurrentLevel().level} {levelSystem.getCurrentLevel().title}</span>
          </div>
          <div className="exp-bar">
            <div className="exp-fill" style={{width: `${levelSystem.getProgressToNextLevel()}%`}}></div>
            <span className="exp-text">{levelSystem.currentExp} EXP</span>
          </div>
        </div>
      </div>

      {!selectedCustomer ? (
        <div className="customer-selection">
          <h2>고객 유형을 선택하세요</h2>
          <div className="customer-grid">
            {customerTypes.map(customer => (
              <div key={customer.id} className="customer-card" onClick={() => startSimulation(customer)}>
                <div className="customer-icon">{customer.icon}</div>
                <h3>{customer.name}</h3>
                <p>{customer.description}</p>
                <div className="customer-difficulty">
                  난이도: {levelSystem.getCustomerDifficulty(customer.id, levelSystem.getCurrentLevel().level)}
                </div>
              </div>
            ))}
          </div>
          
          <div className="stats-summary">
            <h3>📊 내 통계</h3>
            <div className="stats-grid">
              <div className="stat-item">
                <div className="stat-value">{levelSystem.stats.totalConversations}</div>
                <div className="stat-label">총 대화 수</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">{levelSystem.stats.highestScore}</div>
                <div className="stat-label">최고 점수</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">{levelSystem.stats.averageScore}</div>
                <div className="stat-label">평균 점수</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">{levelSystem.earnedBadges.length}</div>
                <div className="stat-label">획득 배지</div>
              </div>
            </div>
          </div>
        </div>
      ) : showReport ? (
        <div className="final-report">
          <div className="report-header">
            <h2>📊 대화 분석 리포트</h2>
            <button onClick={resetSimulation} className="close-btn">닫기</button>
          </div>
          
          <div className="report-summary">
            <div className="grade-display" style={{backgroundColor: finalReport.summary.grade.color}}>
              <div className="grade-letter">{finalReport.summary.grade.grade}</div>
              <div className="grade-label">{finalReport.summary.grade.label}</div>
            </div>
            <div className="summary-stats">
              <div className="summary-item">
                <span className="summary-label">총점</span>
                <span className="summary-value">{finalReport.summary.averageScore}점</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">대화 수</span>
                <span className="summary-value">{finalReport.summary.totalMessages}회</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">획득 EXP</span>
                <span className="summary-value">+{expGained}</span>
              </div>
            </div>
          </div>
          
          <div className="detailed-scores">
            <h3>세부 점수</h3>
            <div className="score-bars">
              <div className="score-bar-item">
                <span className="score-label">공감도</span>
                <div className="score-bar">
                  <div className="score-fill" style={{width: `${finalReport.detailedScores.empathy}%`}}></div>
                </div>
                <span className="score-value">{finalReport.detailedScores.empathy}</span>
              </div>
              <div className="score-bar-item">
                <span className="score-label">설득력</span>
                <div className="score-bar">
                  <div className="score-fill" style={{width: `${finalReport.detailedScores.persuasion}%`}}></div>
                </div>
                <span className="score-value">{finalReport.detailedScores.persuasion}</span>
              </div>
              <div className="score-bar-item">
                <span className="score-label">전문성</span>
                <div className="score-bar">
                  <div className="score-fill" style={{width: `${finalReport.detailedScores.professionalism}%`}}></div>
                </div>
                <span className="score-value">{finalReport.detailedScores.professionalism}</span>
              </div>
              <div className="score-bar-item">
                <span className="score-label">타이밍</span>
                <div className="score-bar">
                  <div className="score-fill" style={{width: `${finalReport.detailedScores.timing}%`}}></div>
                </div>
                <span className="score-value">{finalReport.detailedScores.timing}</span>
              </div>
            </div>
          </div>
          
          {finalReport.strengths.length > 0 && (
            <div className="report-section">
              <h3>👍 잘한 점</h3>
              <ul>
                {finalReport.strengths.map((strength, idx) => (
                  <li key={idx}>{strength}</li>
                ))}
              </ul>
            </div>
          )}
          
          {finalReport.improvements.length > 0 && (
            <div className="report-section">
              <h3>💡 개선할 점</h3>
              {finalReport.improvements.map((improvement, idx) => (
                <div key={idx} className="improvement-item">
                  <h4>{improvement.area}</h4>
                  <p><strong>문제:</strong> {improvement.issue}</p>
                  <p><strong>해결:</strong> {improvement.action}</p>
                  <p className="example"><strong>예시:</strong> {improvement.example}</p>
                </div>
              ))}
            </div>
          )}
          
          {completedMissionsInSession.length > 0 && (
            <div className="report-section">
              <h3>🎯 완료한 미션</h3>
              <div className="completed-missions">
                {completedMissionsInSession.map((mission, idx) => (
                  <div key={idx} className="mission-completed">
                    <span className="mission-icon">{mission.icon}</span>
                    <div>
                      <div className="mission-title">{mission.title}</div>
                      <div className="mission-reward">+{mission.reward.exp} EXP {mission.reward.badge && `| 🏅 ${mission.reward.badge}`}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div className="report-actions">
            <button onClick={resetSimulation} className="primary-btn">다른 고객 연습하기</button>
            <button onClick={() => startSimulation(selectedCustomer)} className="secondary-btn">같은 유형 다시 연습</button>
          </div>
        </div>
      ) : (
        <div className="simulation-area">
          <div className="simulation-header">
            <div className="customer-info">
              <span className="customer-icon-large">{selectedCustomer.icon}</span>
              <div>
                <h3>{selectedCustomer.name}</h3>
                <p>{selectedCustomer.description}</p>
              </div>
            </div>
            <div className="simulation-actions">
              <button 
                onClick={() => setVoiceEnabled(!voiceEnabled)} 
                className={`voice-toggle-btn ${voiceEnabled ? 'active' : ''}`}
                title="고객 음성 응답"
              >
                {voiceEnabled ? '🔊 음성 켜짐' : '🔇 음성 꺼짐'}
              </button>
              {isSpeaking && (
                <button onClick={stopSpeaking} className="stop-speaking-btn">
                  ⏹️ 음성 중지
                </button>
              )}
              <button onClick={() => setShowTips(!showTips)} className="tips-btn">
                💡 {showTips ? '팁 숨기기' : '팁 보기'}
              </button>
              <button onClick={() => setShowFeedback(!showFeedback)} className="feedback-btn">
                📊 {showFeedback ? '피드백 숨기기' : '피드백 보기'}
              </button>
              <button onClick={endConversation} className="end-btn">
                ✅ 대화 종료
              </button>
              <button onClick={resetSimulation} className="reset-btn">
                🔄 다시 시작
              </button>
            </div>
          </div>

          {showTips && (
            <div className="tips-panel">
              <h4>💡 영업 팁</h4>
              <ul>
                {selectedCustomer.tips.map((tip, index) => (
                  <li key={index}>{tip}</li>
                ))}
              </ul>
            </div>
          )}

          {voiceEnabled && availableVoices.length > 0 && (
            <div className="voice-settings">
              <span>🎙️ 고객 음성:</span>
              <select 
                value={selectedVoice?.name || ''} 
                onChange={(e) => {
                  const voice = availableVoices.find(v => v.name === e.target.value)
                  setSelectedVoice(voice)
                }}
                className="voice-select"
              >
                {availableVoices.map(voice => (
                  <option key={voice.name} value={voice.name}>
                    {voice.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {activeMissions.length > 0 && (
            <div className="active-missions">
              <h4>🎯 진행 중인 미션</h4>
              <div className="mission-list">
                {activeMissions.map(mission => (
                  <div key={mission.id} className="mission-item">
                    <span className="mission-icon">{mission.icon}</span>
                    <div className="mission-info">
                      <div className="mission-title">{mission.title}</div>
                      <div className="mission-desc">{mission.description}</div>
                    </div>
                    <div className="mission-reward">+{mission.reward.exp} EXP</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!isListening && (
            <div className="mobile-voice-guide">
              <p>📱 모바일에서 음성이 안 되나요?</p>
              <details>
                <summary>해결 방법 보기</summary>
                <ol>
                  <li>주소창 왼쪽의 아이콘(🔒 또는 ⓘ) 터치</li>
                  <li>"사이트 설정" 또는 "권한" 선택</li>
                  <li>"마이크" 찾아서 "허용"으로 변경</li>
                  <li>페이지 새로고침 (F5 또는 당겨서 새로고침)</li>
                </ol>
                <p style={{marginTop: '10px', fontSize: '14px', color: '#666'}}>
                  💡 팁: 한 번 차단하면 자동으로 다시 요청하지 않아요. 
                  위 방법으로 직접 허용해주셔야 합니다.
                </p>
              </details>
            </div>
          )}

          <div className="conversation-area">
            {conversation.map((msg, index) => (
              <div key={index} className={`message ${msg.speaker}`}>
                <div className="message-bubble">
                  {msg.text}
                  {msg.evaluation && showFeedback && (
                    <div className="message-score">
                      점수: {msg.evaluation.totalScore}점
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {currentFeedback && showFeedback && (
            <div className="instant-feedback">
              <div className="feedback-scores">
                <span className="feedback-score">공감 {currentFeedback.scores.empathy}</span>
                <span className="feedback-score">설득 {currentFeedback.scores.persuasion}</span>
                <span className="feedback-score">전문성 {currentFeedback.scores.professionalism}</span>
                <span className="feedback-score">타이밍 {currentFeedback.scores.timing}</span>
                <span className="feedback-total">총점 {currentFeedback.totalScore}</span>
              </div>
              {currentFeedback.feedback.length > 0 && (
                <div className="feedback-messages">
                  {currentFeedback.feedback.map((fb, idx) => (
                    <div key={idx} className="feedback-msg">{fb}</div>
                  ))}
                </div>
              )}
              {currentFeedback.missedOpportunities.length > 0 && (
                <div className="missed-opportunities">
                  <strong>놓친 기회:</strong>
                  {currentFeedback.missedOpportunities.map((opp, idx) => (
                    <div key={idx} className="opportunity">
                      <div>{opp.message}</div>
                      <div className="suggestion">💡 {opp.suggestion}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="input-area">
            <button 
              onClick={toggleVoiceInput} 
              className={`voice-btn ${isListening ? 'listening' : ''}`}
              title="음성 입력"
            >
              {isListening ? '🎤' : '🎙️'}
            </button>
            <input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder={isListening ? "듣고 있습니다..." : "고객에게 할 말을 입력하거나 음성으로 말하세요..."}
              disabled={isListening}
            />
            <button onClick={handleSendMessage} className="send-btn" disabled={isListening}>
              전송
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default CustomerSimulator
