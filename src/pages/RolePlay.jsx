import React, { useState, useRef, useEffect } from 'react'
import { GeminiEngine, getAPIKeys, addAPIKey, removeAPIKey, resetFailedKeys } from '../data/geminiEngine'
import { ResponseEngine } from '../data/responseEngine'
import { SalesCoach } from '../data/salesCoach'
import './RolePlay.css'

function RolePlay() {
  const [useGemini, setUseGemini] = useState(true)
  const [apiKeys, setApiKeys] = useState(getAPIKeys())
  const [showAPIKeyManager, setShowAPIKeyManager] = useState(false)
  const [newApiKey, setNewApiKey] = useState('')
  const [selectedScenario, setSelectedScenario] = useState(null)
  const [geminiEngine, setGeminiEngine] = useState(null)
  const [responseEngine, setResponseEngine] = useState(null)
  const [conversation, setConversation] = useState([])
  const [userInput, setUserInput] = useState('')
  const [isListening, setIsListening] = useState(false)
  const [recognition, setRecognition] = useState(null)
  const [voiceEnabled, setVoiceEnabled] = useState(true)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [selectedVoice, setSelectedVoice] = useState(null)
  const [availableVoices, setAvailableVoices] = useState([])
  const [handsFreeMode, setHandsFreeMode] = useState(true)
  const [isWaitingForSpeech, setIsWaitingForSpeech] = useState(false)
  const [salesCoach] = useState(new SalesCoach())
  const [evaluations, setEvaluations] = useState([])
  const [showFeedback, setShowFeedback] = useState(true)
  const [currentFeedback, setCurrentFeedback] = useState(null)
  const [showReport, setShowReport] = useState(false)
  const [finalReport, setFinalReport] = useState(null)
  
  const handsFreeRef = useRef(handsFreeMode)
  const userInputRef = useRef('')
  const handleSendRef = useRef(null)

  useEffect(() => {
    handsFreeRef.current = handsFreeMode
  }, [handsFreeMode])

  useEffect(() => {
    userInputRef.current = userInput
  }, [userInput])

  const scenarios = [
    {
      id: 1,
      title: '첫 방문 고객 응대',
      icon: '👋',
      description: '처음 방문한 고객에게 서비스를 소개하고 신뢰를 구축하세요',
      persona: {
        name: '첫 방문 고객',
        personality: '처음 만나는 영업사원에게 조심스럽고 경계심이 있습니다. 서비스에 대해 잘 모르고, 왜 필요한지 확신이 없습니다.',
        concerns: ['이 사람을 믿어도 될까', '정말 필요한 서비스일까', '시간 낭비는 아닐까', '나한테 맞는 서비스일까'],
        tone: '조심스럽고 의심 많으며, 짧게 대답하는 경향이 있습니다.'
      }
    },
    {
      id: 2,
      title: '가격 협상',
      icon: '💰',
      description: '가격에 민감한 고객을 설득하고 가치를 전달하세요',
      persona: {
        name: '가격 민감형 고객',
        personality: '가격이 제일 중요하고, 할인이나 프로모션에 관심이 많습니다. 다른 곳과 비교를 많이 하고, 추가 비용을 매우 걱정합니다.',
        concerns: ['너무 비싸지 않을까', '다른 곳이 더 싸지 않을까', '숨겨진 비용이 있지 않을까', '할인 받을 수 있을까'],
        tone: '가격에 대해 직접적으로 질문하고, 비싸다는 반응을 자주 보입니다.'
      }
    },
    {
      id: 3,
      title: '제품 비교 설명',
      icon: '🔍',
      description: '경쟁사 제품과 비교하며 코웨이의 차별점을 설명하세요',
      persona: {
        name: '비교 검토형 고객',
        personality: '여러 제품을 꼼꼼히 비교하고 신중하게 결정합니다. 데이터와 사실을 중시하며, 경쟁사 제품에 대해 많이 알고 있습니다.',
        concerns: ['다른 제품과 어떻게 다른가', '객관적인 증거가 있는가', '왜 더 비싼가', '실제 사용자 후기는 어떤가'],
        tone: '분석적이고 논리적이며, 구체적인 비교 데이터를 요구합니다.'
      }
    },
    {
      id: 4,
      title: '거절 대응',
      icon: '🛡️',
      description: '고객의 거절을 극복하고 재제안하세요',
      persona: {
        name: '거절하는 고객',
        personality: '처음부터 관심이 없거나, 이미 다른 제품을 사용 중입니다. 영업사원을 빨리 보내고 싶어합니다.',
        concerns: ['시간 낭비하고 싶지 않다', '이미 만족하는 제품이 있다', '지금은 필요 없다', '귀찮다'],
        tone: '짧고 단호하게 거절하며, 대화를 빨리 끝내려고 합니다.'
      }
    },
    {
      id: 5,
      title: '클로징',
      icon: '🎯',
      description: '관심 있는 고객을 계약으로 이끄세요',
      persona: {
        name: '관심 있는 고객',
        personality: '제품에 관심이 있지만 마지막 결정을 망설이고 있습니다. 좀 더 확신이 필요하거나 추가 혜택을 기대합니다.',
        concerns: ['지금 결정해도 될까', '더 좋은 조건은 없을까', '후회하지 않을까', '다른 사람 의견도 들어봐야 하나'],
        tone: '긍정적이지만 망설이며, "좋긴 한데..." 같은 표현을 자주 씁니다.'
      }
    },
    {
      id: 6,
      title: '건강 관심 고객',
      icon: '🏥',
      description: '건강과 위생을 중시하는 고객에게 효과를 설명하세요',
      persona: {
        name: '건강 관심형 고객',
        personality: '가족의 건강을 최우선으로 생각하며, 특히 아이나 노인이 있는 가정입니다. 효과에 대한 구체적인 설명을 원합니다.',
        concerns: ['정말 건강에 도움이 될까', '알레르기나 아토피에 효과 있을까', '안전한가', '의학적으로 입증됐나'],
        tone: '진지하고 걱정스러우며, 건강 효과에 대한 구체적인 질문을 많이 합니다.'
      }
    }
  ]

  // 음성 인식 초기화
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) return

    const recognitionInstance = new SpeechRecognition()
    recognitionInstance.continuous = false
    recognitionInstance.interimResults = true
    recognitionInstance.lang = 'ko-KR'

    recognitionInstance.onstart = () => setIsListening(true)
    
    recognitionInstance.onresult = (event) => {
      let transcript = ''
      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript
      }
      setUserInput(transcript)
      userInputRef.current = transcript
    }

    recognitionInstance.onerror = (event) => {
      console.error('음성 인식 오류:', event.error)
      setIsListening(false)
    }

    recognitionInstance.onend = () => {
      setIsListening(false)
      const currentInput = userInputRef.current
      if (handsFreeRef.current && currentInput && currentInput.trim()) {
        setTimeout(() => {
          if (handleSendRef.current) {
            handleSendRef.current()
          }
        }, 500)
      }
    }

    setRecognition(recognitionInstance)
  }, [])

  // TTS 음성 초기화
  useEffect(() => {
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices()
      const koreanVoices = voices.filter(voice => voice.lang.startsWith('ko'))
      setAvailableVoices(koreanVoices)
      const femaleVoice = koreanVoices.find(v => 
        v.name.includes('Female') || v.name.includes('여성') || v.name.includes('Yuna') || v.name.includes('Heami')
      )
      setSelectedVoice(femaleVoice || koreanVoices[0] || null)
    }

    loadVoices()
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices
    }
  }, [])

  const speakText = (text, onEndCallback) => {
    if (!voiceEnabled || !text) {
      if (onEndCallback) onEndCallback()
      return
    }

    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    
    if (selectedVoice) utterance.voice = selectedVoice
    utterance.lang = 'ko-KR'
    utterance.rate = 1.2 // 속도 약간 빠르게
    utterance.pitch = 1.0
    utterance.volume = 1.0

    utterance.onstart = () => setIsSpeaking(true)
    utterance.onend = () => {
      setIsSpeaking(false)
      if (onEndCallback) setTimeout(onEndCallback, 500)
    }
    utterance.onerror = () => {
      setIsSpeaking(false)
      if (onEndCallback) onEndCallback()
    }

    window.speechSynthesis.speak(utterance)
  }

  const startAutoListening = () => {
    if (!recognition || !handsFreeMode) return
    
    setIsWaitingForSpeech(true)
    setTimeout(() => {
      if (!isListening && handsFreeMode && !isSpeaking) {
        try {
          recognition.start()
          setIsWaitingForSpeech(false) // 시작되면 대기 상태 해제
        } catch (error) {
          console.error('자동 음성 인식 시작 실패:', error)
          setIsWaitingForSpeech(false)
          
          // 실패하면 1초 후 재시도
          if (!error.message || !error.message.includes('already started')) {
            setTimeout(() => {
              if (handsFreeRef.current && !isListening && !isSpeaking) {
                startAutoListening()
              }
            }, 1000)
          }
        }
      } else {
        setIsWaitingForSpeech(false)
      }
    }, 800)
  }

  const startScenario = async (scenario) => {
    setSelectedScenario(scenario)
    
    // 시나리오 ID를 고객 유형 ID로 매핑 (ResponseEngine 호환)
    // 1: 첫 방문 → 가격 민감형(1)
    // 2: 가격 협상 → 가격 민감형(1)
    // 3: 제품 비교 → 비교 검토형(3)
    // 4: 거절 대응 → 빠른 결정형(4)
    // 5: 클로징 → 품질 중시형(2)
    // 6: 건강 관심 → 건강 관심형(5)
    const customerTypeMap = {
      1: 1, // 첫 방문 → 가격 민감형
      2: 1, // 가격 협상 → 가격 민감형
      3: 3, // 제품 비교 → 비교 검토형
      4: 4, // 거절 대응 → 빠른 결정형
      5: 2, // 클로징 → 품질 중시형
      6: 5  // 건강 관심 → 건강 관심형
    }
    
    const customerTypeId = customerTypeMap[scenario.id] || 1
    
    let greeting = ''
    let engine = null
    let basicEngine = null
    
    if (useGemini && apiKeys.length > 0) {
      try {
        // Gemini 엔진 생성 (롤플레이용 커스텀 페르소나)
        engine = new GeminiEngine(customerTypeId)
        
        // 페르소나 오버라이드 - 올바른 형식으로 변환
        if (scenario.persona) {
          engine.personas[customerTypeId] = {
            name: scenario.persona.name || scenario.title,
            role: '롤플레이 고객',
            personality: scenario.persona.personality || '',
            background: '영업 연습 시나리오',
            concerns: scenario.persona.concerns || [],
            objections: scenario.persona.concerns || [],
            tone: scenario.persona.tone || '자연스럽게 대화합니다',
            behaviorRules: scenario.persona.personality || ''
          }
        }
        
        // 첫 인사 생성
        greeting = await engine.generateResponse('영업사원이 방문했습니다. 첫 인사를 하세요. 고객으로서 자연스럽게 반응하세요.')
        console.log('Gemini 인사:', greeting)
        
        // 성공하면 엔진 설정
        setGeminiEngine(engine)
        setResponseEngine(null)
      } catch (error) {
        console.error('Gemini 인사 생성 실패:', error)
        // Gemini 실패 시 기본 엔진 사용
        basicEngine = new ResponseEngine(customerTypeId)
        greeting = basicEngine.generateResponse('안녕하세요')
        console.log('기본 엔진 인사:', greeting)
        setGeminiEngine(null)
        setResponseEngine(basicEngine)
      }
    } else {
      // 기본 응답 엔진 사용
      basicEngine = new ResponseEngine(customerTypeId)
      greeting = basicEngine.generateResponse('안녕하세요')
      console.log('기본 엔진 인사:', greeting)
      setGeminiEngine(null)
      setResponseEngine(basicEngine)
    }
    
    // 인사 설정
    setConversation([{ speaker: 'customer', text: greeting }])
    
    // 대화창으로 자동 스크롤
    setTimeout(() => {
      const conversationArea = document.querySelector('.conversation-area')
      if (conversationArea) {
        conversationArea.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }, 100)
    
    // 음성 출력
    setTimeout(() => {
      speakText(greeting, () => {
        if (handsFreeMode) startAutoListening()
      })
    }, 500)
  }

  const handleSendMessage = async () => {
    if (!userInput.trim()) return

    const newConversation = [
      ...conversation,
      { speaker: 'agent', text: userInput }
    ]

    // 실시간 평가
    const evaluation = salesCoach.evaluateResponse(userInput, selectedScenario.id, {
      responseCount: conversation.length / 2,
      sentiment: 'neutral',
      mentionedTopics: []
    })
    
    const newEvaluations = [...evaluations, evaluation]
    setEvaluations(newEvaluations)
    
    // 피드백 표시
    setCurrentFeedback(evaluation)

    let customerResponse
    try {
      if (useGemini && apiKeys.length > 0 && geminiEngine) {
        console.log('Gemini로 응답 생성 중...')
        customerResponse = await geminiEngine.generateResponse(userInput)
        console.log('Gemini 응답:', customerResponse)
      } else if (responseEngine) {
        console.log('기본 응답 엔진 사용')
        customerResponse = responseEngine.generateResponse(userInput)
        console.log('기본 응답:', customerResponse)
      } else {
        console.log('응답 엔진 없음 - 기본 메시지')
        customerResponse = '네, 알겠습니다. 그런데 좀 더 자세히 설명해주실 수 있나요?'
      }
    } catch (error) {
      console.error('응답 생성 오류:', error)
      customerResponse = '죄송해요, 제가 잠깐 말문이 막혔네요. 다시 한번 말씀해주시겠어요?'
    }

    newConversation.push({ 
      speaker: 'customer', 
      text: customerResponse,
      evaluation: evaluation
    })
    setConversation(newConversation)
    
    setTimeout(() => {
      speakText(customerResponse, () => {
        if (handsFreeMode) startAutoListening()
      })
    }, 300)

    setUserInput('')
    setIsWaitingForSpeech(false)
  }

  useEffect(() => {
    handleSendRef.current = handleSendMessage
  })

  useEffect(() => {
    const conversationArea = document.querySelector('.conversation-area')
    if (conversationArea) {
      conversationArea.scrollTop = conversationArea.scrollHeight
    }
  }, [conversation])

  const resetScenario = () => {
    window.speechSynthesis.cancel()
    setSelectedScenario(null)
    setGeminiEngine(null)
    setResponseEngine(null)
    setConversation([])
    setUserInput('')
    setHandsFreeMode(true)
    setIsWaitingForSpeech(false)
    setEvaluations([])
    setCurrentFeedback(null)
    setShowReport(false)
    setFinalReport(null)
    if (isListening && recognition) {
      recognition.stop()
      setIsListening(false)
    }
  }

  const endConversation = () => {
    window.speechSynthesis.cancel()
    setHandsFreeMode(false)
    setIsWaitingForSpeech(false)
    
    if (isListening && recognition) {
      recognition.stop()
      setIsListening(false)
    }
    
    if (evaluations.length === 0) {
      alert('대화를 먼저 시작해주세요!')
      return
    }
    
    // 최종 리포트 생성
    const conversationHistory = conversation.map(msg => ({
      speaker: msg.speaker,
      text: msg.text
    }))
    
    const report = salesCoach.generateDetailedReport(
      conversationHistory,
      evaluations,
      selectedScenario.id
    )
    
    setFinalReport(report)
    setShowReport(true)
  }

  const toggleVoiceInput = () => {
    if (!recognition) {
      alert('이 브라우저는 음성 인식을 지원하지 않습니다. Chrome 또는 Safari를 사용해주세요.')
      return
    }

    if (isListening) {
      recognition.stop()
      setIsListening(false)
    } else {
      setTimeout(() => {
        try {
          setUserInput('')
          if (!isListening) {
            recognition.start()
          }
        } catch (error) {
          console.error('음성 인식 시작 오류:', error)
          setIsListening(false)
        }
      }, 100)
    }
  }

  const handleMobileTouchToSpeak = () => {
    if (handsFreeMode && !isListening && !isSpeaking && !isWaitingForSpeech) {
      startAutoListening()
    }
  }

  const handleAddAPIKey = () => {
    if (newApiKey.trim()) {
      const success = addAPIKey(newApiKey.trim())
      if (success) {
        setApiKeys(getAPIKeys())
        setNewApiKey('')
        alert('✅ API 키가 추가되었습니다!')
      } else {
        alert('⚠️ 이미 존재하는 키입니다.')
      }
    }
  }

  const handleRemoveAPIKey = (key) => {
    if (confirm('이 API 키를 삭제하시겠습니까?')) {
      removeAPIKey(key)
      setApiKeys(getAPIKeys())
    }
  }

  const handleResetFailedKeys = () => {
    resetFailedKeys()
    alert('✅ 실패한 키가 초기화되었습니다!')
  }

  return (
    <div className="roleplay">
      <div className="roleplay-header">
        <h1>🎤 AI 롤플레잉 연습</h1>
        <p>Gemini AI와 실전처럼 대화하며 연습하세요</p>
      </div>

      {!selectedScenario ? (
        <div className="scenarios-section">
          {/* Gemini AI 설정 패널 */}
          <div className="gemini-settings-panel" style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            padding: '25px',
            borderRadius: '15px',
            marginBottom: '30px',
            color: 'white',
            boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)'
          }}>
            <div className="gemini-header" style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '15px',
              flexWrap: 'wrap',
              gap: '15px'
            }}>
              <div className="gemini-title" style={{
                display: 'flex',
                alignItems: 'center',
                gap: '15px'
              }}>
                <span className="gemini-icon" style={{ fontSize: '32px' }}>🤖</span>
                <h3 style={{ margin: 0, color: 'white', fontSize: '20px' }}>Gemini AI 대화 엔진</h3>
                <button 
                  onClick={() => setUseGemini(!useGemini)}
                  className="gemini-toggle"
                  style={{
                    padding: '8px 20px',
                    background: useGemini ? 'white' : 'rgba(255, 255, 255, 0.2)',
                    color: useGemini ? '#667eea' : 'white',
                    border: '2px solid white',
                    borderRadius: '25px',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    cursor: 'pointer'
                  }}
                >
                  {useGemini ? 'ON' : 'OFF'}
                </button>
              </div>
              <button 
                onClick={() => setShowAPIKeyManager(!showAPIKeyManager)}
                className="api-key-manager-btn"
                style={{
                  padding: '10px 20px',
                  background: 'white',
                  color: '#667eea',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                {showAPIKeyManager ? '설정 닫기' : 'API 키 관리'}
              </button>
            </div>
            
            <div className="gemini-status" style={{
              padding: '12px 20px',
              background: 'rgba(255, 255, 255, 0.15)',
              borderRadius: '8px',
              textAlign: 'center',
              fontSize: '14px'
            }}>
              {useGemini ? (
                apiKeys.length > 0 ? (
                  <span style={{
                    color: '#4CAF50',
                    fontWeight: 'bold',
                    background: 'white',
                    padding: '8px 16px',
                    borderRadius: '20px',
                    display: 'inline-block'
                  }}>✅ Gemini AI 활성화 ({apiKeys.length}개 키 등록됨)</span>
                ) : (
                  <span style={{
                    color: '#FF9800',
                    fontWeight: 'bold',
                    background: 'white',
                    padding: '8px 16px',
                    borderRadius: '20px',
                    display: 'inline-block'
                  }}>⚠️ API 키를 추가해주세요</span>
                )
              ) : (
                <span style={{ color: 'white', opacity: 0.8 }}>기본 응답 엔진 사용 중</span>
              )}
            </div>

            {showAPIKeyManager && (
              <div className="api-key-manager" style={{
                marginTop: '20px',
                padding: '20px',
                background: 'white',
                borderRadius: '10px',
                color: '#333'
              }}>
                <div className="api-key-input-section" style={{
                  display: 'flex',
                  gap: '10px',
                  marginBottom: '20px'
                }}>
                  <input
                    type="text"
                    value={newApiKey}
                    onChange={(e) => setNewApiKey(e.target.value)}
                    placeholder="Gemini API 키를 입력하세요 (AIza...)"
                    style={{
                      flex: 1,
                      padding: '12px 16px',
                      border: '2px solid #e0e0e0',
                      borderRadius: '8px',
                      fontSize: '14px'
                    }}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddAPIKey()}
                  />
                  <button onClick={handleAddAPIKey} style={{
                    padding: '12px 24px',
                    background: '#4CAF50',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    cursor: 'pointer'
                  }}>
                    ➕ 추가
                  </button>
                </div>

                {apiKeys.length > 0 ? (
                  <div className="api-key-list">
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '15px',
                      paddingBottom: '10px',
                      borderBottom: '2px solid #e0e0e0'
                    }}>
                      <span style={{ fontWeight: 'bold', color: '#333' }}>등록된 API 키 ({apiKeys.length}개)</span>
                      <button onClick={handleResetFailedKeys} style={{
                        padding: '6px 12px',
                        background: '#FF9800',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        fontSize: '12px',
                        cursor: 'pointer'
                      }}>
                        🔄 실패 키 초기화
                      </button>
                    </div>
                    {apiKeys.map((key, index) => (
                      <div key={index} style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '15px',
                        padding: '12px 15px',
                        background: '#f8f9fa',
                        borderRadius: '8px',
                        marginBottom: '10px'
                      }}>
                        <span style={{ fontWeight: 'bold', color: '#667eea', minWidth: '30px' }}>#{index + 1}</span>
                        <span style={{ flex: 1, fontFamily: 'monospace', fontSize: '13px', color: '#666' }}>
                          {key.substring(0, 15)}...{key.substring(key.length - 4)}
                        </span>
                        <button 
                          onClick={() => handleRemoveAPIKey(key)}
                          style={{
                            padding: '6px 12px',
                            background: '#f44336',
                            color: 'white',
                            border: 'none',
                            borderRadius: '5px',
                            fontSize: '16px',
                            cursor: 'pointer'
                          }}
                        >
                          🗑️
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '30px', color: '#666' }}>
                    <p>📝 등록된 API 키가 없습니다</p>
                    <p style={{ fontSize: '14px', color: '#999' }}>
                      <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" style={{ color: '#667eea', textDecoration: 'none', fontWeight: 'bold' }}>
                        Google AI Studio
                      </a>에서 무료 API 키를 발급받으세요
                    </p>
                  </div>
                )}

                <div style={{
                  padding: '15px',
                  background: '#e3f2fd',
                  borderRadius: '8px',
                  borderLeft: '4px solid #2196F3',
                  marginTop: '15px'
                }}>
                  <h4 style={{ margin: '0 0 10px 0', color: '#1976D2', fontSize: '16px' }}>💡 API 키 로테이션 시스템</h4>
                  <ul style={{ margin: 0, paddingLeft: '20px', color: '#555' }}>
                    <li style={{ margin: '8px 0', lineHeight: 1.5, fontSize: '13px' }}>여러 개의 API 키를 등록하면 자동으로 순환하며 사용합니다</li>
                    <li style={{ margin: '8px 0', lineHeight: 1.5, fontSize: '13px' }}>한 키가 한도 초과 시 자동으로 다음 키로 전환됩니다</li>
                    <li style={{ margin: '8px 0', lineHeight: 1.5, fontSize: '13px' }}>모든 키는 브라우저에 안전하게 저장됩니다</li>
                    <li style={{ margin: '8px 0', lineHeight: 1.5, fontSize: '13px' }}>Gemini 2.5 Flash는 무료로 사용 가능합니다</li>
                  </ul>
                </div>
              </div>
            )}
          </div>

          <h2>연습 시나리오 선택</h2>
          <div className="scenarios-grid">
            {scenarios.map(scenario => (
              <div key={scenario.id} className="scenario-card">
                <div className="scenario-icon">{scenario.icon}</div>
                <h3>{scenario.title}</h3>
                <p>{scenario.description}</p>
                <div className="scenario-persona">
                  <strong>고객 유형:</strong>
                  <p>{scenario.persona.personality}</p>
                </div>
                <button 
                  onClick={() => startScenario(scenario)}
                  className="start-btn"
                >
                  🎤 대화 시작
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : showReport ? (
        <div className="final-report">
          <div className="report-header">
            <h2>📊 대화 분석 리포트</h2>
            <button onClick={resetScenario} className="close-btn">닫기</button>
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
          
          <div className="report-actions">
            <button onClick={resetScenario} className="primary-btn">다른 시나리오 연습하기</button>
            <button onClick={() => { setShowReport(false); setEvaluations([]); setConversation([]); startScenario(selectedScenario); }} className="secondary-btn">같은 시나리오 다시 연습</button>
          </div>
        </div>
      ) : (
        <div className="simulation-area">
          <div className="simulation-header">
            <div className="customer-info">
              <span className="customer-icon-large">{selectedScenario.icon}</span>
              <div>
                <h3>{selectedScenario.title}</h3>
                <p>{selectedScenario.description}</p>
              </div>
            </div>
            <div className="simulation-actions">
              <button 
                onClick={() => setVoiceEnabled(!voiceEnabled)} 
                className={`voice-toggle-btn ${voiceEnabled ? 'active' : ''}`}
              >
                {voiceEnabled ? '🔊 음성 켜짐' : '🔇 음성 꺼짐'}
              </button>
              <button 
                onClick={() => setShowFeedback(!showFeedback)} 
                className="feedback-btn"
              >
                📊 {showFeedback ? '피드백 숨기기' : '피드백 보기'}
              </button>
              <button onClick={endConversation} className="end-btn">
                ✅ 대화 종료
              </button>
              <button onClick={resetScenario} className="reset-btn">
                🔄 다시 시작
              </button>
            </div>
          </div>

          {handsFreeMode && (
            <div 
              className="handsfree-status"
              onClick={handleMobileTouchToSpeak}
              style={{ cursor: (!isListening && !isSpeaking && !isWaitingForSpeech) ? 'pointer' : 'default' }}
            >
              <div className="status-indicator">
                {isSpeaking ? (
                  <span className="status-speaking">🔊 고객이 말하는 중...</span>
                ) : isWaitingForSpeech ? (
                  <span className="status-waiting">⏳ 음성 인식 준비 중...</span>
                ) : isListening ? (
                  <span className="status-listening">🎤 당신 차례입니다. 말씀하세요!</span>
                ) : (
                  <span className="status-ready">✅ 대화 준비 완료 - 화면 터치하여 시작</span>
                )}
              </div>
              <p className="handsfree-tip">
                {/iPhone|iPad|iPod|Android/i.test(navigator.userAgent) 
                  ? '💡 화면을 터치하면 음성 인식이 시작됩니다' 
                  : '💡 핸즈프리 모드: 버튼 없이 자연스럽게 대화하세요'}
              </p>
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
            </div>
          )}

          <div className="input-area">
            {!handsFreeMode && (
              <>
                <button 
                  onClick={toggleVoiceInput} 
                  className={`voice-btn ${isListening ? 'listening' : ''}`}
                >
                  {isListening ? '🎤' : '🎙️'}
                </button>
                <input
                  type="text"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder={isListening ? "듣고 있습니다..." : "메시지를 입력하거나 음성으로 말하세요..."}
                  disabled={isListening}
                />
                <button onClick={handleSendMessage} className="send-btn" disabled={isListening}>
                  전송
                </button>
              </>
            )}
            {handsFreeMode && (
              <div className="handsfree-input-area">
                <div className="handsfree-message">
                  {isListening ? (
                    <>
                      <div className="listening-animation">
                        <span></span>
                        <span></span>
                        <span></span>
                      </div>
                      <p>🎤 듣고 있습니다... 말씀하세요!</p>
                      {userInput && <p className="recognized-text">"{userInput}"</p>}
                    </>
                  ) : isSpeaking ? (
                    <>
                      <div className="speaking-animation">
                        <span></span>
                        <span></span>
                        <span></span>
                      </div>
                      <p>🔊 고객이 응답하는 중...</p>
                    </>
                  ) : isWaitingForSpeech ? (
                    <p>⏳ 잠시만 기다려주세요...</p>
                  ) : (
                    <p>✅ 대화 준비 완료</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 모바일 터치 버튼 - 핸즈프리 모드일 때만 표시 */}
      {selectedScenario && !showReport && handsFreeMode && (
        <button 
          onClick={handleMobileTouchToSpeak}
          className={`mobile-speak-btn-fixed ${isListening ? 'listening' : ''}`}
          style={{ display: (isListening || isSpeaking || isWaitingForSpeech) ? 'none' : 'block' }}
        >
          🎤 터치하여 말하기
        </button>
      )}
    </div>
  )
}

export default RolePlay
