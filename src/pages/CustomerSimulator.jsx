import React, { useState, useRef, useCallback } from 'react'
import { ResponseEngine } from '../data/responseEngine'
import { GeminiEngine, getAPIKeys, addAPIKey, removeAPIKey, resetFailedKeys } from '../data/geminiEngine'
import { SalesCoach } from '../data/salesCoach'
import { MissionTracker } from '../data/missionSystem'
import { LevelSystem } from '../data/levelSystem'
import { db } from '../firebase/config'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import './CustomerSimulator.css'

function CustomerSimulator() {
  const [responseEngine, setResponseEngine] = useState(null)
  const [useGemini, setUseGemini] = useState(true) // Gemini 사용 여부
  const [showAPIKeyManager, setShowAPIKeyManager] = useState(false)
  const [apiKeys, setApiKeys] = useState(getAPIKeys())
  const [newApiKey, setNewApiKey] = useState('')
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
  const [handsFreeMode, setHandsFreeMode] = useState(true) // 기본값 true로 변경
  const [isWaitingForSpeech, setIsWaitingForSpeech] = useState(false)
  const [micPermission, setMicPermission] = useState('prompt') // 'granted', 'denied', 'prompt'
  const [statusMessage, setStatusMessage] = useState(null) // UI 메시지 표시용
  const [isRecording, setIsRecording] = useState(false)
  const [mediaRecorder, setMediaRecorder] = useState(null)
  const [audioChunks, setAudioChunks] = useState([])
  const [recordedAudioUrl, setRecordedAudioUrl] = useState(null)
  
  const [showMissions, setShowMissions] = useState(false) // 미션 표시 상태
  
  // Ref로 최신 상태 유지
  const handsFreeRef = useRef(handsFreeMode)
  const userInputRef = useRef('')
  const handleSendRef = useRef(null)
  
  React.useEffect(() => {
    handsFreeRef.current = handsFreeMode
  }, [handsFreeMode])
  
  React.useEffect(() => {
    userInputRef.current = userInput
  }, [userInput])

  // 마이크 권한 체크
  React.useEffect(() => {
    if (navigator.permissions && navigator.permissions.query) {
      navigator.permissions.query({ name: 'microphone' }).then(permissionStatus => {
        setMicPermission(permissionStatus.state)
        
        permissionStatus.onchange = () => {
          setMicPermission(permissionStatus.state)
        }
      }).catch(err => {
        console.log('권한 체크 실패:', err)
      })
    }
  }, [])

  // 마이크 권한 요청
  const requestMicPermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      stream.getTracks().forEach(track => track.stop())
      setMicPermission('granted')
      setStatusMessage({ type: 'success', text: '✅ 마이크 권한이 허용되었습니다! 이제 음성 기능을 사용할 수 있습니다.' })
      setTimeout(() => setStatusMessage(null), 3000)
      return true
    } catch (err) {
      console.error('마이크 권한 거부:', err)
      setMicPermission('denied')
      setStatusMessage({ 
        type: 'error', 
        text: '❌ 마이크 권한이 거부되었습니다. 주소창 왼쪽 자물쇠(🔒)를 클릭하여 마이크 권한을 허용해주세요.' 
      })
      return false
    }
  }

  // 음성 인식 초기화
  React.useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    
    if (!SpeechRecognition) {
      console.log('Speech Recognition not supported')
      return
    }

    try {
      const recognitionInstance = new SpeechRecognition()
      
      recognitionInstance.continuous = false // 단일 발화 모드
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
        userInputRef.current = transcript
        
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
            // 핸즈프리 모드에서는 조용히 다시 시작
            if (handsFreeRef.current) {
              console.log('음성 없음 - 다시 시도')
              setTimeout(() => {
                if (handsFreeRef.current && !isSpeaking) {
                  try {
                    recognitionInstance.start()
                  } catch (e) {
                    console.log('재시작 실패:', e)
                  }
                }
              }, 1000)
              return
            }
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
        
        // 핸즈프리 모드에서 텍스트가 있으면 자동 전송
        const currentInput = userInputRef.current
        if (handsFreeRef.current && currentInput && currentInput.trim()) {
          console.log('핸즈프리: 자동 전송 -', currentInput)
          setTimeout(() => {
            if (handleSendRef.current) {
              console.log('핸즈프리: handleSend 호출')
              handleSendRef.current()
            }
          }, 500)
        }
      }
      
      setRecognition(recognitionInstance)
      console.log('✅ 음성 인식 초기화 완료')
    } catch (error) {
      console.error('❌ 음성 인식 초기화 실패:', error)
    }
  }, [handsFreeMode])

  // TTS 음성 초기화
  React.useEffect(() => {
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices()
      const koreanVoices = voices.filter(voice => voice.lang.startsWith('ko'))
      
      console.log('사용 가능한 한국어 음성:', koreanVoices)
      setAvailableVoices(koreanVoices)
      
      // 랜덤하게 한국어 음성 선택
      if (koreanVoices.length > 0) {
        const randomVoice = koreanVoices[Math.floor(Math.random() * koreanVoices.length)]
        setSelectedVoice(randomVoice)
        console.log(`🎤 선택된 음성: ${randomVoice.name} (총 ${koreanVoices.length}개 한국어 음성 사용 가능)`)
      }
    }

    loadVoices()
    
    // 일부 브라우저는 비동기로 음성을 로드함
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices
    }
  }, [])

  // 음성 출력 함수
  const speakText = (text, onEndCallback) => {
    if (!voiceEnabled || !text) {
      if (onEndCallback) onEndCallback()
      return
    }

    // 이전 음성 중지
    window.speechSynthesis.cancel()

    // 매번 랜덤하게 음성 선택
    const voices = window.speechSynthesis.getVoices()
    const koreanVoices = voices.filter(voice => voice.lang.startsWith('ko'))
    const randomVoice = koreanVoices.length > 0 
      ? koreanVoices[Math.floor(Math.random() * koreanVoices.length)]
      : selectedVoice

    const utterance = new SpeechSynthesisUtterance(text)
    
    // 음성 설정
    if (randomVoice) {
      utterance.voice = randomVoice
      console.log(`🎤 사용 중인 음성: ${randomVoice.name}`)
    }
    utterance.lang = 'ko-KR'
    utterance.rate = 1.4 // 속도 (0.1 ~ 10) - 빠르게
    utterance.pitch = 1.0 // 음높이 (0 ~ 2)
    utterance.volume = 1.0 // 볼륨 (0 ~ 1)

    utterance.onstart = () => {
      console.log('🔊 음성 출력 시작')
      setIsSpeaking(true)
    }

    utterance.onend = () => {
      console.log('🔇 음성 출력 종료')
      setIsSpeaking(false)
      if (onEndCallback) {
        setTimeout(onEndCallback, 500) // 0.5초 후 콜백 실행
      }
    }

    utterance.onerror = (event) => {
      console.error('음성 출력 오류:', event)
      setIsSpeaking(false)
      if (onEndCallback) onEndCallback()
    }

    window.speechSynthesis.speak(utterance)
  }

  // 음성 중지 함수
  const stopSpeaking = () => {
    window.speechSynthesis.cancel()
    setIsSpeaking(false)
  }

  // 핸즈프리 모드: 음성 인식 자동 시작
  const startAutoListening = () => {
    if (!recognition) {
      console.log('❌ recognition 없음')
      return
    }
    
    if (!handsFreeRef.current) {
      console.log('❌ 핸즈프리 모드 꺼짐')
      return
    }
    
    console.log('🎤 startAutoListening 호출됨', { isListening, isSpeaking, handsFreeMode: handsFreeRef.current })
    
    setIsWaitingForSpeech(true)
    
    setTimeout(() => {
      // 최신 상태 다시 확인
      if (!handsFreeRef.current) {
        console.log('❌ 핸즈프리 모드 꺼짐 (재확인)')
        setIsWaitingForSpeech(false)
        return
      }
      
      if (isListening) {
        console.log('⚠️ 이미 음성 인식 중')
        setIsWaitingForSpeech(false)
        return
      }
      
      if (isSpeaking) {
        console.log('⚠️ 아직 음성 출력 중 - 1초 후 재시도')
        setTimeout(() => {
          if (handsFreeRef.current && !isListening && !isSpeaking) {
            startAutoListening()
          }
        }, 1000)
        return
      }
      
      try {
        recognition.start()
        console.log('✅ 핸즈프리: 자동 음성 인식 시작!')
        setIsWaitingForSpeech(false)
      } catch (error) {
        console.error('❌ 자동 음성 인식 시작 실패:', error)
        setIsWaitingForSpeech(false)
        
        if (error.message && error.message.includes('already started')) {
          console.log('⚠️ 이미 실행 중 (에러)')
        } else {
          // 실패하면 1.5초 후 재시도
          console.log('🔄 1.5초 후 재시도')
          setTimeout(() => {
            if (handsFreeRef.current && !isListening && !isSpeaking) {
              startAutoListening()
            }
          }, 1500)
        }
      }
    }, 1000) // 딜레이를 1초로 증가
  }

  // 핸즈프리 모드 토글
  const toggleHandsFreeMode = async () => {
    const newMode = !handsFreeMode
    
    // 마이크 권한 체크
    if (newMode && micPermission !== 'granted') {
      const granted = await requestMicPermission()
      if (!granted) {
        return
      }
    }
    
    setHandsFreeMode(newMode)
    
    if (newMode) {
      setVoiceEnabled(true) // 음성 자동 활성화
      
      // 모바일 감지
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
      
      if (isMobile) {
        setStatusMessage({ 
          type: 'success', 
          text: '🎙️ 핸즈프리 모드 ON! 고객 음성 후 화면 터치 → 말하기 → 자동 전송' 
        })
      } else {
        setStatusMessage({ 
          type: 'success', 
          text: '🎙️ 핸즈프리 모드 ON! 고객 말 끝나면 자동으로 당신 차례 → 말하면 자동 전송' 
        })
      }
      
      setTimeout(() => setStatusMessage(null), 5000)
      
      // 대화 중이면 바로 음성 인식 시작 (데스크톱만)
      if (conversation.length > 0 && !isMobile) {
        startAutoListening()
      }
    } else {
      setIsWaitingForSpeech(false)
      if (isListening && recognition) {
        recognition.stop()
      }
      setStatusMessage({ type: 'info', text: '핸즈프리 모드 OFF' })
      setTimeout(() => setStatusMessage(null), 2000)
    }
  }

  // 모바일용 터치로 음성 인식 시작
  const handleMobileTouchToSpeak = () => {
    if (handsFreeMode && !isListening && !isSpeaking && !isWaitingForSpeech) {
      startAutoListening()
    }
  }

  const customerTypes = [
    {
      id: 1,
      name: '가격 민감형',
      icon: '💰',
      description: '비용 대비 효과를 중시하며 할인과 프로모션에 관심',
      personality: '가격이 제일 중요해요. 다른 곳보다 저렴한가요?',
      tips: ['장기적 가치와 경제성 강조', '렌탈의 실질적 이점 설명', '프로모션 정보 적극 활용'],
      mode: 'customer-first'
    },
    {
      id: 2,
      name: '품질 중시형',
      icon: '⭐',
      description: '제품 품질과 브랜드 신뢰도를 최우선으로 고려',
      personality: '품질이 정말 좋은가요? 오래 사용할 수 있나요?',
      tips: ['코웨이 브랜드 가치 강조', '기술력과 품질 인증 제시', 'A/S 시스템의 우수성 설명'],
      mode: 'customer-first'
    },
    {
      id: 3,
      name: '비교 검토형',
      icon: '🔍',
      description: '여러 제품을 꼼꼼히 비교하며 신중하게 결정',
      personality: '다른 제품들과 비교해보고 싶어요. 차이점이 뭔가요?',
      tips: ['경쟁사 대비 차별점 명확히 제시', '객관적 데이터와 수치 활용', '체험 기회 적극 제안'],
      mode: 'customer-first'
    },
    {
      id: 4,
      name: '빠른 결정형',
      icon: '⚡',
      description: '신속한 의사결정을 선호하며 즉시 실행을 원함',
      personality: '좋으면 바로 할게요. 언제 설치 가능한가요?',
      tips: ['핵심 혜택만 간결하게 전달', '즉시 진행 가능함을 강조', '빠른 프로세스 안내'],
      mode: 'customer-first'
    },
    {
      id: 5,
      name: '건강 관심형',
      icon: '🏥',
      description: '건강과 위생을 중시하며 케어 서비스에 높은 관심',
      personality: '매트리스 청소가 건강에 얼마나 중요한가요?',
      tips: ['건강 효과를 구체적으로 설명', '진드기/알레르기 예방 강조', '정기 케어의 필요성 제시'],
      mode: 'customer-first'
    },
    {
      id: 6,
      name: '케어 후 렌탈 영업',
      icon: '🧹',
      description: '케어 서비스 완료 후 자연스러운 렌탈 제안 (실전 모드)',
      personality: '케어 감사합니다. 깨끗해졌네요!',
      tips: ['케어 결과를 먼저 시각화', '진드기/먼지 사진으로 문제 인식', '자연스러운 제품 연결'],
      mode: 'agent-first'
    }
  ]

  const startSimulation = (customer) => {
    setSelectedCustomer(customer)
    
    // Gemini 또는 기본 응답 엔진 생성
    const engine = useGemini && apiKeys.length > 0 
      ? new GeminiEngine(customer.id)
      : new ResponseEngine(customer.id)
    
    setResponseEngine(engine)
    
    // 케어 후 렌탈 영업 모드 (영업사원이 먼저 말함)
    if (customer.mode === 'agent-first') {
      setConversation([])
      
      // 대화창으로 자동 스크롤
      setTimeout(() => {
        const conversationArea = document.querySelector('.conversation-area')
        if (conversationArea) {
          conversationArea.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
      }, 100)
      
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
      setActiveMissions(missions.slice(0, 3))
      
      // Gemini 엔진 초기화 (시스템 프롬프트 추가)
      if (useGemini && apiKeys.length > 0) {
        // 빈 프롬프트로 시스템 초기화만 수행
        engine.generateResponse('').then(() => {
          console.log('✅ 케어 후 렌탈 모드 초기화 완료')
        }).catch(err => {
          console.error('초기화 오류:', err)
        })
      }
      
      return
    }
    
    // 기존 모드 (고객이 먼저 말함)
    const greetingPrompts = [
      '영업사원이 방문했습니다. 첫 인사를 하세요. 고객으로서 자연스럽게 반응하세요.',
      '영업사원이 찾아왔습니다. 문을 열고 첫 반응을 보이세요.',
      '코웨이 영업사원이 방문했습니다. 어떻게 맞이하시겠어요?',
      '초인종이 울리고 영업사원이 왔습니다. 첫 마디를 하세요.',
      '영업사원이 인사를 건넵니다. 고객으로서 응답하세요.'
    ]
    
    const randomPrompt = greetingPrompts[Math.floor(Math.random() * greetingPrompts.length)]
    
    // 첫 인사 생성
    if (useGemini && apiKeys.length > 0) {
      // Gemini는 비동기이므로 별도 처리
      engine.generateResponse(randomPrompt).then(greeting => {
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
            if (handsFreeMode) {
              startAutoListening()
            }
          })
        }, 500)
      })
    } else {
      // 기본 엔진은 greeting 배열에서 랜덤 선택
      const greeting = engine.generateResponse('안녕하세요')
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
          if (handsFreeMode) {
            startAutoListening()
          }
        })
      }, 500)
    }
    
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
    setActiveMissions(missions.slice(0, 3))
  }

  const handleAddAPIKey = () => {
    if (newApiKey.trim()) {
      const success = addAPIKey(newApiKey.trim())
      if (success) {
        setApiKeys(getAPIKeys())
        setNewApiKey('')
        setStatusMessage({ type: 'success', text: '✅ API 키가 추가되었습니다!' })
        setTimeout(() => setStatusMessage(null), 2000)
      } else {
        setStatusMessage({ type: 'warning', text: '⚠️ 이미 존재하는 키입니다.' })
        setTimeout(() => setStatusMessage(null), 2000)
      }
    }
  }

  const handleRemoveAPIKey = (key) => {
    if (confirm('이 API 키를 삭제하시겠습니까?')) {
      removeAPIKey(key)
      setApiKeys(getAPIKeys())
      setStatusMessage({ type: 'info', text: 'API 키가 삭제되었습니다.' })
      setTimeout(() => setStatusMessage(null), 2000)
    }
  }

  const handleResetFailedKeys = () => {
    resetFailedKeys()
    setStatusMessage({ type: 'success', text: '✅ 실패한 키가 초기화되었습니다!' })
    setTimeout(() => setStatusMessage(null), 2000)
  }

  const handleSendMessage = async () => {
    if (!userInput.trim() || !responseEngine) return

    console.log('📤 메시지 전송:', userInput)

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

    // 응답 생성 (Gemini는 비동기)
    let customerResponse
    try {
      if (useGemini && apiKeys.length > 0) {
        customerResponse = await responseEngine.generateResponse(userInput)
      } else {
        customerResponse = responseEngine.generateResponse(userInput)
      }
    } catch (error) {
      console.error('응답 생성 오류:', error)
      customerResponse = '죄송해요, 제가 잠깐 말문이 막혔네요. 다시 한번 말씀해주시겠어요?'
      
      // 에러 메시지 표시
      setStatusMessage({ 
        type: 'error', 
        text: '⚠️ AI 응답 생성 실패. API 키를 확인해주세요.' 
      })
      setTimeout(() => setStatusMessage(null), 3000)
    }
    
    newConversation.push({ 
      speaker: 'customer', 
      text: customerResponse,
      evaluation: evaluation
    })

    setConversation(newConversation)
    
    // 고객 응답을 음성으로 출력 후 핸즈프리면 자동으로 다음 음성 인식
    setTimeout(() => {
      speakText(customerResponse, () => {
        if (handsFreeMode) {
          startAutoListening()
        }
      })
    }, 300)
    
    const newState = {
      stage: responseEngine.sentiment,
      mentionedTopics: Array.from(responseEngine.mentionedTopics || []),
      responseCount: responseEngine.responseCount
    }
    setConversationState(newState)
    
    // 미션 체크
    const conversationData = {
      messageCount: responseEngine.responseCount,
      sentiment: responseEngine.sentiment,
      mentionedTopics: Array.from(responseEngine.mentionedTopics || []),
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
        setStatusMessage({ type: 'success', text: `🎉 레벨업! ${expResult.newLevel.title}이 되었습니다!` })
        setTimeout(() => setStatusMessage(null), 3000)
      }
    }
    
    // 일일 통계 업데이트
    missionTracker.updateDailyStats(evaluation.totalScore)
    
    setUserInput('')
    setIsWaitingForSpeech(false)
  }
  
  // handleSendMessage를 ref에 저장
  React.useEffect(() => {
    handleSendRef.current = handleSendMessage
  })

  // 대화 추가 시 자동 스크롤
  React.useEffect(() => {
    const conversationArea = document.querySelector('.conversation-area')
    if (conversationArea) {
      conversationArea.scrollTop = conversationArea.scrollHeight
    }
  }, [conversation])

  const resetSimulation = () => {
    stopSpeaking() // 음성 중지
    setHandsFreeMode(false)
    setIsWaitingForSpeech(false)
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
    setIsRecording(false)
    setRecordedAudioUrl(null)
    setAudioChunks([])
    if (isListening && recognition) {
      recognition.stop()
      setIsListening(false)
    }
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      mediaRecorder.stop()
    }
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream)
      const chunks = []

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data)
        }
      }

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' })
        const url = URL.createObjectURL(blob)
        setRecordedAudioUrl(url)
        setAudioChunks(chunks)
        stream.getTracks().forEach(track => track.stop())
      }

      recorder.start()
      setMediaRecorder(recorder)
      setIsRecording(true)
      alert('🎙️ 녹음이 시작되었습니다')
    } catch (error) {
      console.error('녹음 시작 실패:', error)
      alert('❌ 녹음 시작 실패: 마이크 권한을 확인해주세요')
    }
  }

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      mediaRecorder.stop()
      setIsRecording(false)
      alert('✅ 녹음이 종료되었습니다')
    }
  }

  const saveConversation = async () => {
    if (conversation.length === 0) {
      alert('저장할 대화가 없습니다!')
      return
    }

    if (!selectedCustomer) {
      alert('❌ 저장 실패: 고객 정보가 없습니다.')
      return
    }

    try {
      const conversationData = {
        scenarioTitle: `${selectedCustomer.name}`,
        scenarioIcon: selectedCustomer.icon,
        messages: conversation.map(msg => ({
          speaker: msg.speaker,
          text: msg.text
        })),
        timestamp: serverTimestamp(),
        audioUrl: recordedAudioUrl || null
      }

      console.log('대화 저장 시도:', conversationData)
      await addDoc(collection(db, 'conversations'), conversationData)
      alert('✅ 대화가 저장되었습니다!')
    } catch (error) {
      console.error('대화 저장 실패:', error)
      console.error('에러 코드:', error.code)
      console.error('에러 메시지:', error.message)
      
      if (error.code === 'permission-denied') {
        alert('❌ 저장 실패: Firebase 권한이 없습니다. Firestore 규칙을 확인해주세요.')
      } else if (error.code === 'unavailable') {
        alert('❌ 저장 실패: 네트워크 연결을 확인해주세요.')
      } else {
        alert('❌ 저장 실패: ' + error.message)
      }
    }
  }

  const endConversation = () => {
    stopSpeaking() // 음성 중지
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
      
      setStatusMessage({ type: 'error', text: `${browserInfo} 권장: Android-Chrome, iOS-Safari` })
      return
    }

    // 마이크 권한 체크
    if (micPermission === 'denied') {
      setStatusMessage({ 
        type: 'error', 
        text: '❌ 마이크 권한이 거부되었습니다. 주소창 왼쪽 자물쇠(🔒)를 클릭하여 마이크 권한을 허용해주세요.' 
      })
      return
    }

    if (micPermission === 'prompt') {
      // 권한 요청
      requestMicPermission().then(granted => {
        if (granted) {
          // 권한 받은 후 음성 인식 시작
          setTimeout(() => toggleVoiceInput(), 500)
        }
      })
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
            setStatusMessage({ 
              type: 'error', 
              text: '마이크 권한이 필요합니다. 주소창 왼쪽 자물쇠를 클릭하여 권한을 허용해주세요.' 
            })
          } else if (error.message && error.message.includes('already started')) {
            setStatusMessage({ type: 'warning', text: '음성 인식이 이미 실행 중입니다. 잠시 후 다시 시도해주세요.' })
          } else {
            setStatusMessage({ type: 'error', text: `음성 인식 오류: ${error.message}` })
          }
        }
      }, 100)
    }
  }

  return (
    <div className="simulator">
      <div className="simulator-header">
        <h1>🎭 고객 시뮬레이터</h1>
        <p>실전 중심의 체계적인 영업 대화 트레이닝</p>
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

      {/* 상태 메시지 표시 */}
      {statusMessage && (
        <div className={`status-message ${statusMessage.type}`}>
          <span>{statusMessage.text}</span>
          <button onClick={() => setStatusMessage(null)} className="close-status">×</button>
        </div>
      )}

      {!selectedCustomer ? (
        <div className="customer-selection">
          <div className="selection-header">
            <h2>고객 유형을 선택하세요</h2>
            <button 
              onClick={() => setShowAPIKeyManager(!showAPIKeyManager)}
              className="settings-btn"
              title="Gemini AI 설정"
            >
              ⚙️ 설정
            </button>
          </div>
          
          {/* Gemini AI 설정 패널 - 모달 형태 */}
          {showAPIKeyManager && (
            <div className="settings-modal-overlay" onClick={() => setShowAPIKeyManager(false)}>
              <div className="settings-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                  <h3>🤖 Gemini AI 설정</h3>
                  <button 
                    onClick={() => setShowAPIKeyManager(false)}
                    className="modal-close-btn"
                  >
                    ✕
                  </button>
                </div>
                
                <div className="modal-body">
                  <div className="gemini-toggle-section">
                    <div className="toggle-info">
                      <h4>AI 대화 엔진</h4>
                      <p>Gemini AI로 더 자연스럽고 다양한 대화를 경험하세요</p>
                    </div>
                    <button 
                      onClick={() => setUseGemini(!useGemini)}
                      className={`toggle-switch ${useGemini ? 'active' : ''}`}
                    >
                      <span className="toggle-slider"></span>
                      <span className="toggle-label">{useGemini ? 'ON' : 'OFF'}</span>
                    </button>
                  </div>

                  <div className="gemini-status-box">
                    {useGemini ? (
                      apiKeys.length > 0 ? (
                        <span className="status-active">✅ Gemini AI 활성화 ({apiKeys.length}개 키 등록됨)</span>
                      ) : (
                        <span className="status-warning">⚠️ API 키를 추가해주세요</span>
                      )
                    ) : (
                      <span className="status-inactive">기본 응답 엔진 사용 중</span>
                    )}
                  </div>

                  <div className="api-key-section">
                    <h4>API 키 관리</h4>
                    <div className="api-key-input-section">
                      <input
                        type="text"
                        value={newApiKey}
                        onChange={(e) => setNewApiKey(e.target.value)}
                        placeholder="Gemini API 키를 입력하세요 (AIza...)"
                        className="api-key-input"
                        onKeyDown={(e) => e.key === 'Enter' && handleAddAPIKey()}
                      />
                      <button onClick={handleAddAPIKey} className="add-key-btn">
                        ➕ 추가
                      </button>
                    </div>

                    {apiKeys.length > 0 ? (
                      <div className="api-key-list">
                        <div className="api-key-list-header">
                          <span>등록된 API 키 ({apiKeys.length}개)</span>
                          <button onClick={handleResetFailedKeys} className="reset-failed-btn" title="실패한 키 초기화">
                            🔄 초기화
                          </button>
                        </div>
                        {apiKeys.map((key, index) => (
                          <div key={index} className="api-key-item">
                            <span className="key-index">#{index + 1}</span>
                            <span className="key-preview">{key.substring(0, 15)}...{key.substring(key.length - 4)}</span>
                            <button 
                              onClick={() => handleRemoveAPIKey(key)}
                              className="remove-key-btn"
                              title="삭제"
                            >
                              🗑️
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="no-keys-message">
                        <p>📝 등록된 API 키가 없습니다</p>
                        <p className="help-text">
                          <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer">
                            Google AI Studio
                          </a>에서 무료 API 키를 발급받으세요
                        </p>
                      </div>
                    )}

                    <div className="api-key-info">
                      <h4>💡 API 키 로테이션 시스템</h4>
                      <ul>
                        <li>여러 개의 API 키를 등록하면 자동으로 순환하며 사용합니다</li>
                        <li>한 키가 한도 초과 시 자동으로 다음 키로 전환됩니다</li>
                        <li>모든 키는 브라우저에 안전하게 저장됩니다</li>
                        <li>Gemini 2.5 Flash는 무료로 사용 가능합니다</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {micPermission !== 'granted' && (
            <div className="mic-permission-banner">
              <div className="permission-icon">🎤</div>
              <div className="permission-content">
                <h3>음성 기능을 사용하려면 마이크 권한이 필요합니다</h3>
                <p>실전처럼 음성으로 대화하며 영업 연습을 할 수 있습니다</p>
                <button onClick={requestMicPermission} className="permission-btn">
                  마이크 권한 허용하기
                </button>
              </div>
            </div>
          )}
          
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
                onClick={toggleHandsFreeMode}
                className={`handsfree-btn ${handsFreeMode ? 'active' : ''}`}
                title="핸즈프리 모드 - 자동 대화"
              >
                {handsFreeMode ? '🤖 핸즈프리 ON' : '🎙️ 핸즈프리 OFF'}
              </button>
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
              <button 
                onClick={isRecording ? stopRecording : startRecording}
                className={`record-btn ${isRecording ? 'recording' : ''}`}
              >
                {isRecording ? '⏹️ 녹음 중지' : '🎙️ 녹음 시작'}
              </button>
              <button 
                onClick={saveConversation}
                className="save-btn"
                disabled={conversation.length === 0}
              >
                💾 대화 저장
              </button>
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
                  <span className="status-ready">✅ 대화 준비 완료</span>
                )}
              </div>
              <p className="handsfree-tip">
                {/iPhone|iPad|iPod|Android/i.test(navigator.userAgent) 
                  ? '💡 아래 마이크 버튼을 눌러 말하세요' 
                  : '💡 핸즈프리 모드: 아래 마이크 버튼 클릭'}
              </p>
            </div>
          )}

          {activeMissions.length > 0 && (
            <div className="active-missions">
              <div 
                className="missions-header" 
                onClick={() => setShowMissions(!showMissions)}
                style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
              >
                <h4>🎯 진행 중인 미션 ({activeMissions.length})</h4>
                <span style={{ fontSize: '1.2rem', transition: 'transform 0.3s', transform: showMissions ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                  ▼
                </span>
              </div>
              {showMissions && (
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
              )}
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
            {!handsFreeMode && (
              <>
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
                    <>
                      <p>✅ 대화 준비 완료</p>
                      <button 
                        onClick={handleMobileTouchToSpeak}
                        className="inline-mic-btn"
                      >
                        🎤 말하기
                      </button>
                    </>
                  )}
                </div>
                {/* 숨겨진 전송 버튼 - 자동 전송용 */}
                <button onClick={handleSendMessage} className="send-btn-hidden" style={{display: 'none'}}>전송</button>
              </div>
            )}
          </div>

        </div>
      )}

    </div>
  )
}

export default CustomerSimulator
