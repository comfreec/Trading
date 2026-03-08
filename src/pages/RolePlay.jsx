import React, { useState, useRef, useEffect } from 'react'
import { GeminiEngine, getAPIKeys } from '../data/geminiEngine'
import './RolePlay.css'

function RolePlay() {
  const [useGemini, setUseGemini] = useState(true)
  const [apiKeys] = useState(getAPIKeys())
  const [selectedScenario, setSelectedScenario] = useState(null)
  const [geminiEngine, setGeminiEngine] = useState(null)
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
    utterance.rate = 1.0
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
        } catch (error) {
          console.error('자동 음성 인식 시작 실패:', error)
          setIsWaitingForSpeech(false)
        }
      } else {
        setIsWaitingForSpeech(false)
      }
    }, 800)
  }

  const startScenario = async (scenario) => {
    setSelectedScenario(scenario)
    
    if (useGemini && apiKeys.length > 0) {
      // Gemini 엔진 생성 (롤플레이용 커스텀 페르소나)
      const engine = new GeminiEngine(scenario.id)
      // 페르소나 오버라이드
      engine.personas[scenario.id] = scenario.persona
      setGeminiEngine(engine)
      
      // 첫 인사 생성
      const greeting = await engine.generateResponse('안녕하세요')
      setConversation([{ speaker: 'customer', text: greeting }])
      
      // 대화창으로 자동 스크롤
      setTimeout(() => {
        const conversationArea = document.querySelector('.conversation-area')
        if (conversationArea) {
          conversationArea.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
      }, 100)
      
      setTimeout(() => {
        speakText(greeting, () => {
          if (handsFreeMode) startAutoListening()
        })
      }, 500)
    } else {
      // 기본 인사
      const greeting = '안녕하세요. 무슨 일로 오셨나요?'
      setConversation([{ speaker: 'customer', text: greeting }])
      
      // 대화창으로 자동 스크롤
      setTimeout(() => {
        const conversationArea = document.querySelector('.conversation-area')
        if (conversationArea) {
          conversationArea.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
      }, 100)
      
      setTimeout(() => {
        speakText(greeting, () => {
          if (handsFreeMode) startAutoListening()
        })
      }, 500)
    }
  }

  const handleSendMessage = async () => {
    if (!userInput.trim()) return

    const newConversation = [
      ...conversation,
      { speaker: 'agent', text: userInput }
    ]

    let customerResponse
    if (useGemini && apiKeys.length > 0 && geminiEngine) {
      customerResponse = await geminiEngine.generateResponse(userInput)
    } else {
      customerResponse = '네, 알겠습니다. 그런데 좀 더 자세히 설명해주실 수 있나요?'
    }

    newConversation.push({ speaker: 'customer', text: customerResponse })
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
    setConversation([])
    setUserInput('')
    setHandsFreeMode(true)
    setIsWaitingForSpeech(false)
    if (isListening && recognition) {
      recognition.stop()
      setIsListening(false)
    }
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

  return (
    <div className="roleplay">
      <div className="roleplay-header">
        <h1>🎤 AI 롤플레잉 연습</h1>
        <p>Gemini AI와 실전처럼 대화하며 연습하세요</p>
      </div>

      {!selectedScenario ? (
        <div className="scenarios-section">
          <div className="gemini-status-banner">
            {useGemini && apiKeys.length > 0 ? (
              <span className="status-active">✅ Gemini AI 활성화 - 실시간 자연스러운 대화</span>
            ) : (
              <span className="status-warning">⚠️ Gemini API 키를 추가하면 더 자연스러운 대화가 가능합니다</span>
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
      ) : (
        <div className="conversation-container">
          <div className="conversation-header">
            <div className="scenario-info">
              <span className="scenario-icon-large">{selectedScenario.icon}</span>
              <div>
                <h3>{selectedScenario.title}</h3>
                <p>{selectedScenario.description}</p>
              </div>
            </div>
            <div className="conversation-actions">
              <button 
                onClick={() => setVoiceEnabled(!voiceEnabled)} 
                className={`voice-toggle-btn ${voiceEnabled ? 'active' : ''}`}
              >
                {voiceEnabled ? '🔊 음성 켜짐' : '🔇 음성 꺼짐'}
              </button>
              <button onClick={resetScenario} className="reset-btn">
                🔄 다시 시작
              </button>
            </div>
          </div>

          {handsFreeMode && (
            <div className="handsfree-status">
              <div className="status-indicator">
                {isSpeaking ? (
                  <span className="status-speaking">🔊 고객이 말하는 중...</span>
                ) : isWaitingForSpeech ? (
                  <span className="status-waiting">⏳ 음성 인식 준비 중...</span>
                ) : isListening ? (
                  <span className="status-listening">🎤 당신 차례입니다. 말씀하세요!</span>
                ) : (
                  <span className="status-ready">✅ 준비됨</span>
                )}
              </div>
              {/iPhone|iPad|iPod|Android/i.test(navigator.userAgent) && !isListening && !isSpeaking && (
                <button onClick={handleMobileTouchToSpeak} className="mobile-speak-btn">
                  👆 터치하여 말하기
                </button>
              )}
            </div>
          )}

          <div className="conversation-area">
            {conversation.map((msg, index) => (
              <div key={index} className={`message ${msg.speaker}`}>
                <div className="message-bubble">
                  {msg.text}
                </div>
              </div>
            ))}
          </div>

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
    </div>
  )
}

export default RolePlay
