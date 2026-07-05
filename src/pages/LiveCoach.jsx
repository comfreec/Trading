import React, { useState, useEffect, useRef } from 'react'
import { getAPIKeys } from '../data/geminiEngine'
import './LiveCoach.css'

function LiveCoach() {
  const [isListening, setIsListening] = useState(false)
  const [recognition, setRecognition] = useState(null)
  const [customerSpeech, setCustomerSpeech] = useState('')
  const [conversationHistory, setConversationHistory] = useState([])
  const [suggestions, setSuggestions] = useState([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [savedScripts, setSavedScripts] = useState([])
  
  const suggestionsEndRef = useRef(null)

  // 저장된 멘트 불러오기
  useEffect(() => {
    const scripts = localStorage.getItem('myScripts')
    if (scripts) {
      setSavedScripts(JSON.parse(scripts))
    }
  }, [])

  // 음성 인식 초기화
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) return

    const recognitionInstance = new SpeechRecognition()
    recognitionInstance.continuous = true
    recognitionInstance.interimResults = true
    recognitionInstance.lang = 'ko-KR'

    recognitionInstance.onstart = () => {
      setIsListening(true)
    }

    recognitionInstance.onresult = (event) => {
      let interimTranscript = ''
      let finalTranscript = ''

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript
        if (event.results[i].isFinal) {
          finalTranscript += transcript
        } else {
          interimTranscript += transcript
        }
      }

      if (finalTranscript) {
        setCustomerSpeech(finalTranscript)
        addToHistory('customer', finalTranscript)
        analyzeSpeech(finalTranscript)
      } else {
        setCustomerSpeech(interimTranscript)
      }
    }

    recognitionInstance.onerror = (event) => {
      console.error('음성 인식 오류:', event.error)
      if (event.error === 'not-allowed') {
        alert('마이크 권한이 필요합니다.')
      }
    }

    recognitionInstance.onend = () => {
      setIsListening(false)
    }

    setRecognition(recognitionInstance)
  }, [])

  // 대화 기록 추가
  const addToHistory = (speaker, text) => {
    setConversationHistory(prev => [...prev, {
      speaker,
      text,
      timestamp: new Date().toLocaleTimeString()
    }])
  }

  // 고객 발언 분석 및 멘트 제안
  const analyzeSpeech = async (speech) => {
    setIsAnalyzing(true)
    
    try {
      // 1. 저장된 멘트에서 관련 멘트 찾기
      const relevantScripts = findRelevantScripts(speech)
      
      // 2. AI로 실시간 멘트 생성
      const aiSuggestions = await generateAISuggestions(speech)
      
      // 3. 결합하여 표시
      const allSuggestions = [
        ...aiSuggestions.map(s => ({ ...s, source: 'ai' })),
        ...relevantScripts.map(s => ({ ...s, source: 'saved' }))
      ]
      
      setSuggestions(allSuggestions)
    } catch (error) {
      console.error('분석 오류:', error)
    } finally {
      setIsAnalyzing(false)
    }
  }

  // 저장된 멘트에서 관련 멘트 찾기
  const findRelevantScripts = (speech) => {
    const keywords = speech.toLowerCase().split(' ')
    
    return savedScripts
      .filter(script => {
        const scriptText = `${script.title} ${script.situation} ${script.script} ${script.tags.join(' ')}`.toLowerCase()
        return keywords.some(keyword => keyword.length > 1 && scriptText.includes(keyword))
      })
      .slice(0, 2)
      .map(script => ({
        title: script.title,
        script: script.script,
        category: script.category
      }))
  }

  // AI로 실시간 멘트 생성
  const generateAISuggestions = async (speech) => {
    const apiKeys = getAPIKeys()
    if (apiKeys.length === 0) {
      return []
    }

    try {
      const apiKey = apiKeys[0]
      const recentHistory = conversationHistory.slice(-5).map(h => 
        `${h.speaker === 'customer' ? '고객' : '나'}: ${h.text}`
      ).join('\n')

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              role: 'user',
              parts: [{
                text: `당신은 코웨이 영업 전문가입니다. 실시간 영업 상황에서 즉시 사용할 수 있는 최적의 응답 멘트를 제안해주세요.

**최근 대화:**
${recentHistory}

**고객의 최신 발언:**
"${speech}"

**요구사항:**
1. 고객의 발언에 즉시 대응할 수 있는 2가지 멘트 제안
2. 각 멘트는 실제로 바로 말할 수 있는 자연스러운 대화체
3. 고객의 감정과 니즈를 고려한 공감형 응답
4. 간결하고 명확하게 (각 2-3문장)

**출력 형식 (JSON):**
[
  {
    "approach": "접근 방식 (예: 공감형, 해결책 제시형)",
    "script": "실제 멘트 내용"
  }
]

반드시 JSON 형식으로만 응답하세요.`
              }]
            }],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 1000
            }
          })
        }
      )

      if (!response.ok) throw new Error('API 요청 실패')

      const data = await response.json()
      const generatedText = data.candidates[0].content.parts[0].text
      
      let jsonText = generatedText
      const jsonMatch = generatedText.match(/```json\s*([\s\S]*?)\s*```/)
      if (jsonMatch) {
        jsonText = jsonMatch[1]
      } else {
        const arrayMatch = generatedText.match(/\[[\s\S]*\]/)
        if (arrayMatch) {
          jsonText = arrayMatch[0]
        }
      }

      return JSON.parse(jsonText)
    } catch (error) {
      console.error('AI 생성 오류:', error)
      return []
    }
  }

  // 음성 인식 시작/중지
  const toggleListening = () => {
    if (!recognition) {
      alert('이 브라우저는 음성 인식을 지원하지 않습니다.')
      return
    }

    if (isListening) {
      recognition.stop()
    } else {
      try {
        recognition.start()
      } catch (error) {
        console.error('음성 인식 시작 오류:', error)
      }
    }
  }

  // 제안 멘트 사용
  const useSuggestion = (suggestion) => {
    addToHistory('agent', suggestion.script)
    // 클립보드에 복사
    navigator.clipboard.writeText(suggestion.script)
    alert('✅ 멘트가 클립보드에 복사되었습니다!')
  }

  // 대화 초기화
  const resetConversation = () => {
    if (confirm('대화 기록을 초기화하시겠습니까?')) {
      setConversationHistory([])
      setSuggestions([])
      setCustomerSpeech('')
    }
  }

  // 자동 스크롤
  useEffect(() => {
    suggestionsEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [suggestions])

  return (
    <div className="live-coach">
      <div className="coach-header">
        <h1>🎯 실시간 영업 코칭</h1>
        <p>고객과의 대화를 실시간으로 분석하여 최적의 멘트를 제안합니다</p>
      </div>

      <div className="coach-container">
        <div className="listening-panel">
          <div className="listening-status">
            {isListening ? (
              <>
                <div className="listening-animation">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
                <h3>🎤 고객의 말을 듣고 있습니다...</h3>
              </>
            ) : (
              <h3>⏸️ 대기 중</h3>
            )}
          </div>

          <div className="current-speech">
            <label>실시간 음성 인식:</label>
            <div className="speech-text">
              {customerSpeech || '고객이 말하면 여기에 표시됩니다...'}
            </div>
          </div>

          <div className="control-buttons">
            <button 
              onClick={toggleListening}
              className={`listen-btn ${isListening ? 'active' : ''}`}
            >
              {isListening ? '⏹️ 중지' : '🎤 듣기 시작'}
            </button>
            <button 
              onClick={resetConversation}
              className="reset-btn"
            >
              🔄 초기화
            </button>
          </div>
        </div>

        <div className="suggestions-panel">
          <div className="suggestions-header">
            <h3>💡 추천 멘트</h3>
            {isAnalyzing && <span className="analyzing">분석 중...</span>}
          </div>

          <div className="suggestions-list">
            {suggestions.length === 0 ? (
              <div className="empty-suggestions">
                <p>고객이 말하면 최적의 멘트를 제안합니다</p>
              </div>
            ) : (
              suggestions.map((suggestion, idx) => (
                <div key={idx} className={`suggestion-card ${suggestion.source}`}>
                  <div className="suggestion-header">
                    <span className="suggestion-badge">
                      {suggestion.source === 'ai' ? '🤖 AI 제안' : '💾 저장된 멘트'}
                    </span>
                    {suggestion.approach && (
                      <span className="suggestion-approach">{suggestion.approach}</span>
                    )}
                    {suggestion.title && (
                      <span className="suggestion-title">{suggestion.title}</span>
                    )}
                  </div>
                  <div className="suggestion-content">
                    {suggestion.script}
                  </div>
                  <button 
                    onClick={() => useSuggestion(suggestion)}
                    className="use-suggestion-btn"
                  >
                    📋 복사하기
                  </button>
                </div>
              ))
            )}
            <div ref={suggestionsEndRef} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default LiveCoach
