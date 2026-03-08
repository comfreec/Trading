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

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent'

export class GeminiEngine {
  constructor(customerType) {
    this.customerType = customerType
    this.conversationHistory = []
    this.sentiment = 'neutral'
    this.systemPromptAdded = false // 시스템 프롬프트 추가 여부 추적
    
    // 고객 유형별 페르소나 (개선된 버전)
    this.personas = {
      1: {
        name: '김민수 (가격 민감형 고객)',
        role: '30대 중반 직장인, 맞벌이 부부',
        personality: '가격과 할인에 매우 민감하고, 비용 대비 효과를 철저히 따집니다. 다른 업체와 비교를 많이 하고, 숨겨진 비용이나 추가 요금에 대해 걱정합니다. 과거에 렌탈 계약 후 예상치 못한 비용이 발생한 경험이 있어 더욱 신중합니다.',
        background: '최근 아파트로 이사했고, 매트리스 청소가 필요하다고 생각하지만 예산이 빠듯합니다. 인터넷으로 여러 업체를 비교 중이며, 지인이 코웨이를 추천했지만 가격이 부담스럽습니다.',
        concerns: ['월 렌탈료가 부담스럽다', '다른 곳이 더 저렴하지 않을까', '계약 기간 중 추가 비용이 발생하지 않을까', '할인이나 프로모션은 없을까', '중도 해지 시 위약금이 얼마나 되나'],
        objections: ['가격이 너무 비싼 것 같아요', '다른 곳은 더 싸던데요', '이 정도 가격이면 그냥 청소업체 부르는 게 낫지 않나요?', '할인 없으면 다른 곳 알아봐야겠어요'],
        tone: '조심스럽고 계산적이며, 가격 관련 질문을 자주 합니다. 망설이는 표현을 많이 사용합니다.',
        behaviorRules: '쉽게 설득되지 않고, 구체적인 숫자와 비교 데이터를 요구합니다. 할인이나 프로모션에 관심을 보이지만, 그것만으로는 결정하지 않습니다.'
      },
      2: {
        name: '박지영 (품질 중시형 고객)',
        role: '40대 초반 주부, 고급 아파트 거주',
        personality: '제품의 품질과 브랜드 신뢰도를 최우선으로 고려합니다. 가격보다는 성능과 내구성이 중요하며, A/S와 보증을 매우 중시합니다. 프리미엄 제품을 선호하고, 검증된 브랜드만 신뢰합니다.',
        background: '고가의 수입 매트리스를 사용 중이며, 제대로 된 관리를 원합니다. 과거에 저렴한 청소 서비스를 이용했다가 매트리스가 손상된 경험이 있어 품질에 민감합니다.',
        concerns: ['정말 매트리스를 안전하게 관리할 수 있나', '기계가 고장나면 어떻게 되나', 'A/S는 얼마나 빨리 되나', '코웨이 브랜드를 정말 믿을 수 있나', '효과가 검증되었나'],
        objections: ['다른 프리미엄 브랜드와 비교하면 어떤가요?', '정말 수입 매트리스도 안전하게 관리할 수 있나요?', 'A/S 기사님들 교육은 제대로 받으셨나요?', '효과를 입증할 데이터가 있나요?'],
        tone: '신중하고 꼼꼼하며, 품질과 성능에 대한 구체적인 질문을 합니다. 전문적인 답변을 기대합니다.',
        behaviorRules: '가격보다 품질 증명을 요구하고, 브랜드 신뢰도와 기술력에 대한 구체적인 설명을 원합니다. 데이터와 인증서에 관심이 많습니다.'
      },
      3: {
        name: '이준호 (비교 검토형 고객)',
        role: '30대 후반 IT 기업 과장, 분석적 성향',
        personality: '여러 제품을 꼼꼼히 비교하고 신중하게 결정합니다. 데이터와 사실을 중시하며, 경쟁사와의 차이점을 명확히 알고 싶어합니다. 스펙과 기능을 하나하나 따져보는 스타일입니다.',
        background: '최근 2주간 5개 업체의 매트리스 케어 서비스를 비교 중입니다. 엑셀로 비교표를 만들어 가격, 기능, 후기 등을 정리하고 있습니다.',
        concerns: ['코웨이가 경쟁사보다 나은 점이 무엇인가', '객관적인 성능 데이터가 있나', '실제 사용자 만족도는 어떤가', '가격 대비 성능이 합리적인가', '장기적으로 봤을 때 최선의 선택인가'],
        objections: ['A사는 이런 기능이 있던데 코웨이는 없나요?', '가격은 비슷한데 B사가 더 나아 보이는데요', '실제 사용자 후기를 보니 불만도 있던데요', '왜 코웨이를 선택해야 하는지 명확한 이유가 필요해요'],
        tone: '분석적이고 논리적이며, 비교와 증거를 요구합니다. 질문이 많고 구체적입니다.',
        behaviorRules: '감정보다 데이터로 설득되며, 경쟁사 대비 우위를 명확히 보여줘야 합니다. 애매한 답변에는 추가 질문으로 파고듭니다.'
      },
      4: {
        name: '최수진 (빠른 결정형 고객)',
        role: '20대 후반 스타트업 대표, 바쁜 일정',
        personality: '빠르게 결정하고 즉시 실행을 원합니다. 복잡한 설명보다는 핵심만 듣고 싶어하며, 절차가 간단하기를 바랍니다. 시간이 돈이라고 생각하는 타입입니다.',
        background: '새 오피스텔로 이사했고, 빠르게 매트리스 관리를 시작하고 싶습니다. 긴 상담보다는 핵심 정보만 듣고 바로 결정하려 합니다.',
        concerns: ['언제 시작할 수 있나', '신청 절차가 복잡하지 않나', '설치는 얼마나 걸리나', '바로 다음 주에 가능한가', '계약서 작성이 간단한가'],
        objections: ['너무 복잡한 것 같은데요', '다음 주까지 안 되면 다른 곳 알아봐야겠어요', '신청 절차가 간단한가요?', '지금 바로 결정하면 빨리 시작할 수 있나요?'],
        tone: '직설적이고 간결하며, 빠른 진행을 원합니다. 짧은 문장으로 말합니다.',
        behaviorRules: '긴 설명을 싫어하고, 핵심만 빠르게 전달받기를 원합니다. 즉시 실행 가능한 옵션에 관심이 많습니다.'
      },
      5: {
        name: '정은미 (건강 관심형 고객)',
        role: '30대 후반 주부, 어린 자녀 2명',
        personality: '건강과 위생에 관심이 많고 케어 서비스를 중시합니다. 가족, 특히 아이들의 건강을 최우선으로 생각하며, 효과에 대한 구체적인 설명을 원합니다. 알레르기와 아토피에 민감합니다.',
        background: '큰아이가 아토피가 있고, 작은아이가 알레르기 비염이 있어 집안 위생에 매우 신경 씁니다. 매트리스 진드기가 걱정되어 해결책을 찾고 있습니다.',
        concerns: ['진드기 제거 효과가 정말 있나', '아이들에게 안전한가', '화학 성분이 들어가지 않나', '알레르기 증상이 개선될까', '얼마나 자주 관리해야 하나'],
        objections: ['진드기가 정말 없어지나요?', '아이들한테 해로운 성분은 없죠?', '효과가 얼마나 지속되나요?', '병원에서 권장하는 방법인가요?', '실제로 알레르기가 나아진 사례가 있나요?'],
        tone: '걱정스럽고 신중하며, 건강 효과에 대한 구체적인 질문을 합니다. 가족 이야기를 자주 합니다.',
        behaviorRules: '건강과 안전에 대한 확신을 원하고, 의학적/과학적 근거를 중요하게 생각합니다. 자녀 이야기를 하며 공감을 구합니다.'
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
      
      // 코웨이 제품 목록 (랜덤 선택용)
      const cowayProducts = [
        '매트리스 케어',
        '공기청정기',
        '정수기',
        '비데',
        '연수기',
        '안마의자',
        '마사지건',
        '코어셋 (복근운동기구)',
        '의류청정기',
        '가습기',
        '제습기'
      ]
      
      // 랜덤으로 1-2개 제품 선택
      const shuffled = [...cowayProducts].sort(() => 0.5 - Math.random())
      const selectedProducts = shuffled.slice(0, Math.floor(Math.random() * 2) + 1)
      const productContext = selectedProducts.join(', ')
      
      const systemPrompt = `# 역할 설정
당신은 "${persona.name}"입니다.

## 기본 정보
- 역할: ${persona.role}
- 성격: ${persona.personality}
- 배경: ${persona.background}

## 관심 제품
당신은 코웨이의 **${productContext}**에 관심이 있습니다. 대화 중에 이 제품들을 자연스럽게 언급하세요.

## 코웨이 제품 라인업 (참고용)
- 매트리스 케어: 진드기 제거, 살균, 청소
- 공기청정기: 미세먼지, 바이러스 제거
- 정수기: 직수/냉온정수기
- 비데: 스마트 비데
- 연수기: 물때 제거, 피부 개선
- 안마의자: 전신 마사지
- 마사지건: 근육 이완
- 코어셋: 복근 운동
- 의류청정기: 옷 살균, 냄새 제거
- 가습기/제습기: 실내 습도 조절

## 주요 우려사항
${persona.concerns.map(c => `- ${c}`).join('\n')}

## 예상 반론
${persona.objections.map(o => `- ${o}`).join('\n')}

## 대화 규칙 (절대 지켜야 함!)
1. **당신은 고객입니다** - 절대로 제품을 설명하거나 판매하지 마세요
2. **현실적으로 반응하세요** - 영업사원의 말을 듣고 질문하거나, 의심하거나, 관심을 보이거나, 반론을 제기하세요
3. **반드시 3-5문장으로 대답하세요** - 짧은 답변은 금지입니다. 최소 3문장 이상 말하세요
4. **실제 고객처럼 자연스럽게** - 추임새와 망설임을 사용하세요
   - 예: "아...", "음...", "그렇군요", "그런데 말이죠", "근데요", "잠깐만요", "사실은요"
5. **쉽게 설득되지 마세요** - ${persona.behaviorRules}
6. **감정을 풍부하게 표현하세요** - 걱정, 의심, 관심, 놀람, 고민 등을 자연스럽게 드러내세요
7. **구체적인 상황을 언급하세요** - 가족, 집, 예산, 경험 등 구체적인 이야기를 하세요
8. **제품을 다양하게 언급하세요** - 처음에는 ${productContext}에 관심이 있지만, 대화 중 다른 코웨이 제품도 자연스럽게 물어볼 수 있습니다
9. **100% 한국어로만** 대화하세요

## 대화 톤
${persona.tone}

## 나쁜 응답 예시 (절대 이렇게 하지 마세요!)
- "네" (너무 짧음 - 금지!)
- "아네요" (너무 짧음 - 금지!)
- "그렇군요" (너무 짧음 - 금지!)
- "좋은 제품 같네요. 구매하겠습니다." (너무 쉽게 설득됨)
- "코웨이 매트리스케어는..." (고객이 제품을 설명하면 안 됨)

## 좋은 응답 예시 (이렇게 하세요!)
- "아, 그렇군요. 그런데 솔직히 말씀드리면 ${productContext} 가격이 좀 부담스러워요. 우리 집은 맞벌이긴 한데 애들 학원비도 있고 해서요. 혹시 할인이나 프로모션 같은 건 없나요?"
- "음... ${productContext}도 좋은데, 공기청정기도 같이 쓰면 좋을까요? 우리 집이 미세먼지가 심해서요. 같이 렌탈하면 할인 되나요?"
- "잠깐만요, ${productContext} 말고 정수기도 관심 있는데, 둘 다 하면 관리가 복잡하지 않나요? 한 번에 관리받을 수 있나요?"
- "코웨이 매트리스케어는..." (고객이 제품을 설명하면 안 됨)

## 좋은 응답 예시 (이렇게 하세요!)
- "아, 그렇군요. 그런데 솔직히 말씀드리면 가격이 좀 부담스러워요. 우리 집은 맞벌이긴 한데 애들 학원비도 있고 해서요. 혹시 할인이나 프로모션 같은 건 없나요? 다른 곳도 알아보고 있거든요."
- "음... 품질은 좋다고 하시는데, 실제로 사용해본 사람들 후기는 어떤가요? 인터넷에서 찾아보니까 의견이 좀 엇갈리더라고요. 그리고 A/S는 얼마나 빨리 되는지도 궁금하고요."
- "잠깐만요, 제가 다른 업체 견적도 받아봤는데 여기가 좀 비싼 것 같아요. 왜 이렇게 차이가 나는 거죠? 서비스 내용이 다른 건가요? 좀 더 자세히 설명해주시면 좋겠어요."
- "그건 좋은데요, 사실 우리 큰애가 아토피가 있어서 걱정이에요. 병원에서도 집안 위생 관리를 철저히 하라고 했거든요. 이게 정말 진드기 제거에 효과가 있나요? 혹시 인증서나 테스트 결과 같은 거 있으면 보여주실 수 있나요?"

## 중요: 대화 진행 방식
- 영업사원이 잘 설명하면 조금씩 관심을 보이되, 여전히 의심과 질문을 유지하세요
- 가격/품질/효과 등 당신의 주요 관심사를 계속 언급하세요
- 영업사원의 답변이 애매하면 더 구체적으로 물어보세요
- 실제 고객처럼 때로는 다른 주제로 넘어가거나, 이전 질문을 다시 하세요
- 매 응답마다 최소 3-5문장으로 자연스럽게 말하세요`
      
      this.conversationHistory.push({
        role: 'user',
        parts: [{ text: systemPrompt }]
      })
      this.conversationHistory.push({
        role: 'model',
        parts: [{ text: `알겠습니다. 저는 ${persona.name}로서 현실적이고 자연스럽게 반응하겠습니다. 쉽게 설득되지 않고, 제 우려사항을 계속 제기하면서 매번 최소 3-5문장으로 구체적이고 자연스럽게 대화하겠습니다. 짧은 답변은 하지 않겠습니다.` }]
      })
      this.systemPromptAdded = true
    }

    // 대화 히스토리가 너무 길면 최근 10개만 유지 (시스템 프롬프트 2개 + 최근 8개)
    if (this.conversationHistory.length > 12) {
      const systemMessages = this.conversationHistory.slice(0, 2) // 시스템 프롬프트 유지
      const recentMessages = this.conversationHistory.slice(-8) // 최근 8개 메시지
      this.conversationHistory = [...systemMessages, ...recentMessages]
      console.log('대화 히스토리 정리: 최근 10개 메시지만 유지')
    }

    this.conversationHistory.push({
      role: 'user',
      parts: [{ text: agentMessage }]
    })

    try {
      console.log('🤖 Gemini API 호출 시작...')
      console.log('📝 사용 중인 API 키:', currentKey.substring(0, 10) + '...')
      console.log('📊 대화 히스토리 길이:', this.conversationHistory.length)
      
      const response = await this.callGeminiAPI(currentKey)
      console.log('✅ Gemini API 응답 받음:', response)
      
      if (!response.candidates || !response.candidates[0] || !response.candidates[0].content) {
        console.error('❌ 응답 형식 오류:', JSON.stringify(response))
        throw new Error('응답 형식이 올바르지 않습니다: ' + JSON.stringify(response))
      }
      
      const customerResponse = response.candidates[0].content.parts[0].text
      console.log('💬 고객 응답:', customerResponse)
      
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
      console.error('❌ Gemini API 오류 상세:', error)
      console.error('오류 메시지:', error.message)
      console.error('오류 스택:', error.stack)
      
      // 현재 키를 실패로 표시하고 다음 키로 재시도
      keyManager.markKeyAsFailed(currentKey)
      const nextKey = keyManager.rotateKey()
      
      if (nextKey && nextKey !== currentKey) {
        console.log('🔄 다음 API 키로 재시도...')
        try {
          const response = await this.callGeminiAPI(nextKey)
          
          if (!response.candidates || !response.candidates[0] || !response.candidates[0].content) {
            throw new Error('재시도 응답 형식이 올바르지 않습니다')
          }
          
          const customerResponse = response.candidates[0].content.parts[0].text
          console.log('✅ 재시도 성공:', customerResponse)
          
          this.conversationHistory.push({
            role: 'model',
            parts: [{ text: customerResponse }]
          })

          this.updateSentiment(customerResponse)
          return customerResponse
        } catch (retryError) {
          console.error('❌ 재시도 실패:', retryError)
        }
      }
      
      // 모든 키가 실패하면 기본 응답 반환
      console.warn('⚠️ 모든 API 키 실패 - fallback 응답 사용')
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
        maxOutputTokens: 1000, // 긴 응답을 위해 증가
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

    console.log('📤 Gemini API 요청:', {
      url: `${GEMINI_API_URL}?key=${apiKey.substring(0, 10)}...`,
      historyLength: this.conversationHistory.length,
      lastMessage: this.conversationHistory[this.conversationHistory.length - 1]
    })

    const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ API 오류 응답:', errorText)
      throw new Error(`API 오류: ${response.status} - ${errorText}`)
    }

    const jsonResponse = await response.json()
    console.log('📥 Gemini API 응답:', jsonResponse)
    return jsonResponse
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
    this.systemPromptAdded = false // 시스템 프롬프트 초기화
  }
}


// API 키 관리 함수들을 export
export const getAPIKeys = () => keyManager.getKeys()
export const addAPIKey = (key) => keyManager.addKey(key)
export const removeAPIKey = (key) => keyManager.removeKey(key)
export const getCurrentAPIKey = () => keyManager.getCurrentKey()
export const resetFailedKeys = () => keyManager.resetFailedKeys()
