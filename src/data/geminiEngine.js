// Gemini 2.5 Flash를 사용한 자연스러운 대화 엔진

// API 키 관리 클래스
class APIKeyManager {
  constructor() {
    this.keys = this.loadKeys()
    this.currentIndex = 0
    this.failedKeys = new Set()
  }

  loadKeys() {
    // localStorage에서 저장된 키 불러오기
    const savedKeys = localStorage.getItem('gemini_api_keys')
    if (savedKeys) {
      try {
        return JSON.parse(savedKeys)
      } catch (e) {
        console.error('API 키 로드 실패:', e)
      }
    }
    
    // 환경변수에서 키 불러오기 (백업)
    const envKey = import.meta.env.VITE_GEMINI_API_KEY
    return envKey ? [envKey] : []
  }

  saveKeys(keys) {
    localStorage.setItem('gemini_api_keys', JSON.stringify(keys))
    this.keys = keys
    this.currentIndex = 0
    this.failedKeys.clear()
  }

  addKey(key) {
    if (!this.keys.includes(key)) {
      this.keys.push(key)
      this.saveKeys(this.keys)
      return true
    }
    return false
  }

  removeKey(key) {
    this.keys = this.keys.filter(k => k !== key)
    this.saveKeys(this.keys)
  }

  getKeys() {
    return [...this.keys]
  }

  getCurrentKey() {
    if (this.keys.length === 0) return null
    
    // 모든 키가 실패했으면 리셋
    if (this.failedKeys.size >= this.keys.length) {
      this.failedKeys.clear()
    }
    
    // 실패하지 않은 키 찾기
    let attempts = 0
    while (attempts < this.keys.length) {
      const key = this.keys[this.currentIndex]
      
      if (!this.failedKeys.has(key)) {
        return key
      }
      
      this.currentIndex = (this.currentIndex + 1) % this.keys.length
      attempts++
    }
    
    return null
  }

  rotateKey() {
    this.currentIndex = (this.currentIndex + 1) % this.keys.length
    return this.getCurrentKey()
  }

  markKeyAsFailed(key) {
    this.failedKeys.add(key)
    console.log(`API 키 실패 표시: ${key.substring(0, 10)}...`)
  }

  resetFailedKeys() {
    this.failedKeys.clear()
  }
}

const keyManager = new APIKeyManager()

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent'

export class GeminiEngine {
  constructor(customerType) {
    this.customerType = customerType
    this.conversationHistory = []
    this.sentiment = 'neutral'
    this.systemPromptAdded = false // 시스템 프롬프트 추가 여부 추적
    
    // 고객 유형별 페르소나
    this.personas = {
      1: {
        name: '가격 민감형 고객',
        personality: '가격과 할인에 매우 민감하고, 비용 대비 효과를 중시합니다. 다른 곳과 비교를 많이 하고, 추가 비용에 대해 걱정합니다.',
        concerns: ['가격이 너무 비싸지 않을까', '다른 곳이 더 저렴하지 않을까', '숨겨진 비용이 있지 않을까', '할인이나 프로모션은 없을까'],
        tone: '조심스럽고 계산적이며, 가격 관련 질문을 자주 합니다.'
      },
      2: {
        name: '품질 중시형 고객',
        personality: '제품의 품질과 브랜드 신뢰도를 최우선으로 고려합니다. 가격보다는 성능과 내구성이 중요하며, A/S와 보증을 중시합니다.',
        concerns: ['품질이 정말 좋은가', '오래 사용할 수 있는가', 'A/S는 잘 되는가', '브랜드를 믿을 수 있는가'],
        tone: '신중하고 꼼꼼하며, 품질과 성능에 대한 구체적인 질문을 합니다.'
      },
      3: {
        name: '비교 검토형 고객',
        personality: '여러 제품을 꼼꼼히 비교하고 신중하게 결정합니다. 데이터와 사실을 중시하며, 경쟁사와의 차이점을 알고 싶어합니다.',
        concerns: ['다른 제품과 어떻게 다른가', '객관적인 데이터가 있는가', '실제 사용자 후기는 어떤가', '왜 이 제품을 선택해야 하는가'],
        tone: '분석적이고 논리적이며, 비교와 증거를 요구합니다.'
      },
      4: {
        name: '빠른 결정형 고객',
        personality: '빠르게 결정하고 즉시 실행을 원합니다. 복잡한 설명보다는 핵심만 듣고 싶어하며, 절차가 간단하기를 바랍니다.',
        concerns: ['언제 시작할 수 있는가', '절차가 복잡하지 않은가', '빨리 진행할 수 있는가', '지금 바로 가능한가'],
        tone: '직설적이고 간결하며, 빠른 진행을 원합니다.'
      },
      5: {
        name: '건강 관심형 고객',
        personality: '건강과 위생에 관심이 많고 케어 서비스를 중시합니다. 가족의 건강을 걱정하며, 효과에 대한 구체적인 설명을 원합니다.',
        concerns: ['건강에 정말 도움이 되는가', '진드기나 알레르기 예방이 되는가', '가족에게 안전한가', '효과가 입증되었는가'],
        tone: '걱정스럽고 신중하며, 건강 효과에 대한 구체적인 질문을 합니다.'
      }
    }
  }

  async generateResponse(agentMessage) {
    const currentKey = keyManager.getCurrentKey()
    
    if (!currentKey) {
      console.error('사용 가능한 Gemini API 키가 없습니다.')
      return '죄송합니다. AI 응답 서비스를 사용할 수 없습니다. API 키를 추가해주세요.'
    }

    // 첫 메시지일 때만 시스템 프롬프트 추가
    if (!this.systemPromptAdded) {
      const persona = this.personas[this.customerType]
      const systemPrompt = `당신은 코웨이 렌탈 제품에 관심이 있을 수도 있는 ${persona.name}입니다. ${persona.personality} 

중요한 규칙:
- 당신은 고객입니다. 절대로 제품을 설명하거나 판매하지 마세요
- 영업사원의 말을 듣고 질문하거나 의심하거나 관심을 보이세요
- 2-3문장으로 자연스럽게 대답하세요 (너무 짧지 않게)
- 실제 고객처럼 자연스러운 추임새를 사용하세요 (아, 그렇군요 / 음... / 그런데요 / 근데 말이죠)
- 100% 한국어로만 대화하세요

나쁜 예: "아네요", "네", "그래요" (너무 짧음)
좋은 예: "아, 그렇군요. 그런데 가격이 좀 부담스러운데 할인 같은 건 없나요?", "음... 품질은 좋다고 하는데 실제로 사용해본 사람들 후기는 어떤가요?"`
      
      this.conversationHistory.push({
        role: 'user',
        parts: [{ text: systemPrompt }]
      })
      this.conversationHistory.push({
        role: 'model',
        parts: [{ text: '네, 알겠습니다. 실제 고객처럼 자연스럽게 2-3문장으로 반응하겠습니다.' }]
      })
      this.systemPromptAdded = true
    }

    this.conversationHistory.push({
      role: 'user',
      parts: [{ text: agentMessage }]
    })

    try {
      const response = await this.callGeminiAPI(currentKey)
      const customerResponse = response.candidates[0].content.parts[0].text
      
      this.conversationHistory.push({
        role: 'model',
        parts: [{ text: customerResponse }]
      })

      // 감정 분석
      this.updateSentiment(customerResponse)

      // 성공하면 다음 키로 로테이션
      keyManager.rotateKey()

      return customerResponse
    } catch (error) {
      console.error('Gemini API 오류:', error)
      
      // 현재 키를 실패로 표시하고 다음 키로 재시도
      keyManager.markKeyAsFailed(currentKey)
      const nextKey = keyManager.rotateKey()
      
      if (nextKey && nextKey !== currentKey) {
        console.log('다음 API 키로 재시도...')
        try {
          const response = await this.callGeminiAPI(nextKey)
          const customerResponse = response.candidates[0].content.parts[0].text
          
          this.conversationHistory.push({
            role: 'model',
            parts: [{ text: customerResponse }]
          })

          this.updateSentiment(customerResponse)
          return customerResponse
        } catch (retryError) {
          console.error('재시도 실패:', retryError)
        }
      }
      
      // 모든 키가 실패하면 기본 응답 반환
      const fallbackResponse = '음... 잠깐만요. 제가 좀 생각을 정리할 시간이 필요할 것 같아요. 다시 한번 말씀해주시겠어요?'
      this.conversationHistory.push({
        role: 'model',
        parts: [{ text: fallbackResponse }]
      })
      return fallbackResponse
    }
  }

  async callGeminiAPI(apiKey) {
    const requestBody = {
      contents: this.conversationHistory,
      generationConfig: {
        temperature: 0.9,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 150,
        stopSequences: []
      },
      safetySettings: [
        {
          category: 'HARM_CATEGORY_HARASSMENT',
          threshold: 'BLOCK_NONE'
        },
        {
          category: 'HARM_CATEGORY_HATE_SPEECH',
          threshold: 'BLOCK_NONE'
        },
        {
          category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
          threshold: 'BLOCK_NONE'
        },
        {
          category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
          threshold: 'BLOCK_NONE'
        }
      ]
    }

    const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`API 오류: ${response.status} - ${errorText}`)
    }

    return await response.json()
  }

  updateSentiment(response) {
    const lower = response.toLowerCase()
    
    // 긍정적 표현
    const positiveWords = ['좋', '괜찮', '마음', '관심', '해볼', '그럼', '네', '알겠']
    const positiveCount = positiveWords.filter(w => lower.includes(w)).length
    
    // 부정적 표현
    const negativeWords = ['비싸', '부담', '어렵', '글쎄', '아니', '안', '못', '걱정']
    const negativeCount = negativeWords.filter(w => lower.includes(w)).length
    
    if (positiveCount > negativeCount + 1) {
      this.sentiment = this.sentiment === 'positive' ? 'very_positive' : 'positive'
    } else if (negativeCount > positiveCount + 1) {
      this.sentiment = this.sentiment === 'neutral' ? 'negative' : 'neutral'
    } else if (positiveCount > 0) {
      this.sentiment = 'neutral'
    }
  }

  reset() {
    this.conversationHistory = []
    this.sentiment = 'neutral'
  }
}


// API 키 관리 함수들을 export
export const getAPIKeys = () => keyManager.getKeys()
export const addAPIKey = (key) => keyManager.addKey(key)
export const removeAPIKey = (key) => keyManager.removeKey(key)
export const getCurrentAPIKey = () => keyManager.getCurrentKey()
export const resetFailedKeys = () => keyManager.resetFailedKeys()
