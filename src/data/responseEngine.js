// 대화 응답 엔진 - 자연스러운 대화 흐름 생성
import { priceSensitiveResponses } from './priceSensitiveResponses'
import { qualityFocusedResponses } from './qualityFocusedResponses'
import { comparisonResponses } from './comparisonResponses'
import { quickDecisionResponses } from './quickDecisionResponses'
import { healthFocusedResponses } from './healthFocusedResponses'
import { careToRentalResponses } from './careToRentalResponses'

export class ResponseEngine {
  constructor(customerType) {
    this.customerType = customerType
    this.conversationHistory = []
    this.mentionedTopics = new Set()
    this.responseCount = 0
    this.sentiment = 'neutral' // negative, neutral, positive, very_positive
    this.lastAgentMessage = ''
    this.lastCustomerMessage = ''
    this.concernsRaised = []
    this.questionsAsked = []
    
    // 고객 유형별 응답 데이터
    this.responses = {
      1: priceSensitiveResponses,
      2: qualityFocusedResponses,
      3: comparisonResponses,
      4: quickDecisionResponses,
      5: healthFocusedResponses,
      6: careToRentalResponses // 케어 후 렌탈 영업
    }[customerType]
  }

  // 메시지 분석 및 응답 생성
  generateResponse(agentMessage) {
    this.responseCount++
    this.lastAgentMessage = agentMessage
    this.conversationHistory.push({ role: 'agent', message: agentMessage })
    
    const analysis = this.analyzeMessage(agentMessage)
    const response = this.selectContextualResponse(analysis)
    
    this.lastCustomerMessage = response
    this.conversationHistory.push({ role: 'customer', message: response })
    this.updateSentiment(analysis)
    
    return response
  }

  // 메시지 분석 - 더 정교하게
  analyzeMessage(message) {
    const lower = message.toLowerCase()
    
    return {
      keywords: this.extractKeywords(lower),
      sentiment: this.detectSentiment(lower),
      intent: this.detectIntent(lower),
      topics: this.detectTopics(lower),
      length: message.length,
      hasQuestion: message.includes('?') || lower.includes('어떤') || lower.includes('얼마') || lower.includes('언제'),
      isPositive: this.isPositiveMessage(lower),
      isNegative: this.isNegativeMessage(lower),
      isGreeting: this.isGreeting(lower),
      isExplanation: this.isExplanation(lower),
      isPriceOffer: this.isPriceOffer(lower),
      isClosing: this.isClosingAttempt(lower),
      mentionsPreviousConcern: this.mentionsPreviousConcern(lower),
      answersQuestion: this.answersMyQuestion(lower)
    }
  }

  // 인사말 감지
  isGreeting(message) {
    const greetings = ['안녕', '반갑', '처음', '뵙', '만나', '방문']
    return greetings.some(g => message.includes(g))
  }

  // 설명 감지
  isExplanation(message) {
    return message.length > 50 && (
      message.includes('입니다') || 
      message.includes('있습니다') ||
      message.includes('드립니다') ||
      message.includes('해드리')
    )
  }

  // 가격 제안 감지
  isPriceOffer(message) {
    return (message.includes('원') || message.includes('만원') || message.includes('천원')) &&
           (message.includes('할인') || message.includes('이벤트') || message.includes('프로모션'))
  }

  // 클로징 시도 감지
  isClosingAttempt(message) {
    return message.includes('계약') || message.includes('신청') || 
           message.includes('진행') || message.includes('결정') ||
           (message.includes('어떠') && message.includes('세요'))
  }

  // 이전 우려사항 언급 확인
  mentionsPreviousConcern(message) {
    return this.concernsRaised.some(concern => message.includes(concern))
  }

  // 내 질문에 답변했는지 확인
  answersMyQuestion(message) {
    if (this.questionsAsked.length === 0) return false
    const lastQuestion = this.questionsAsked[this.questionsAsked.length - 1]
    return message.length > 20 // 충분히 긴 답변
  }

  // 맥락을 고려한 응답 선택
  selectContextualResponse(analysis) {
    // 1. 첫 응답 - 인사
    if (this.responseCount === 1) {
      return this.getRandomResponse('greeting')
    }

    // 2. 인사에 대한 응답
    if (analysis.isGreeting && this.responseCount === 2) {
      const greetingResponses = [
        '네, 안녕하세요. 무슨 일로 오셨어요?',
        '반갑습니다. 오늘 어떤 도움이 필요하신가요?',
        '네, 처음 뵙겠습니다. 어떻게 오셨어요?'
      ]
      return greetingResponses[Math.floor(Math.random() * greetingResponses.length)]
    }

    // 3. 이전 우려사항을 다시 언급한 경우
    if (analysis.mentionsPreviousConcern) {
      return this.respondToPreviousConcern(analysis)
    }

    // 4. 내 질문에 답변한 경우
    if (analysis.answersQuestion && this.questionsAsked.length > 0) {
      this.questionsAsked.pop() // 질문 해결
      return this.respondToAnswer(analysis)
    }

    // 5. 가격 제안에 대한 반응
    if (analysis.isPriceOffer) {
      return this.respondToPriceOffer(analysis)
    }

    // 6. 클로징 시도에 대한 반응
    if (analysis.isClosing) {
      return this.respondToClosing(analysis)
    }

    // 7. 긴 설명에 대한 반응
    if (analysis.isExplanation) {
      return this.respondToExplanation(analysis)
    }

    // 8. 키워드 기반 응답
    if (analysis.keywords.length > 0) {
      return this.respondToKeyword(analysis)
    }

    // 9. 감정 기반 응답
    if (analysis.isPositive) {
      return this.respondPositively(analysis)
    }

    if (analysis.isNegative) {
      return this.respondNegatively(analysis)
    }

    // 10. 대화 단계별 기본 응답
    return this.getStageBasedResponse()
  }

  // 이전 우려사항에 대한 응답
  respondToPreviousConcern(analysis) {
    const responses = [
      '아, 그 부분 말씀하시는 거죠? 좀 더 자세히 설명해주시겠어요?',
      '네, 그 점이 궁금하셨군요. 이해했습니다.',
      '그 부분에 대해 다시 말씀해주셔서 감사합니다.'
    ]
    return responses[Math.floor(Math.random() * responses.length)]
  }

  // 답변에 대한 반응
  respondToAnswer(analysis) {
    if (analysis.isPositive) {
      const responses = [
        '아, 그렇군요! 그럼 이제 좀 더 구체적으로 얘기해볼까요?',
        '네, 이해했습니다. 그런데 한 가지 더 궁금한 게 있어요.',
        '좋네요. 그럼 다른 것도 여쭤봐도 될까요?'
      ]
      return responses[Math.floor(Math.random() * responses.length)]
    } else {
      const responses = [
        '음... 그렇다면 다른 방법은 없을까요?',
        '그렇군요. 근데 제 상황에는 어떨지 모르겠네요.',
        '이해는 되는데, 좀 더 생각해봐야 할 것 같아요.'
      ]
      return responses[Math.floor(Math.random() * responses.length)]
    }
  }

  // 가격 제안에 대한 반응
  respondToPriceOffer(analysis) {
    if (this.customerType === 1) { // 가격 민감형
      if (this.sentiment === 'negative' || this.sentiment === 'neutral') {
        this.sentiment = 'neutral'
        return this.getRandomResponse('priceReaction') || '음... 그 정도면 괜찮은 것 같기도 한데, 다른 곳과 비교해봐야 할 것 같아요.'
      } else {
        this.sentiment = 'positive'
        return this.getRandomResponse('priceAcceptance') || '오, 그 정도면 괜찮네요! 그런데 추가 비용은 없는 거죠?'
      }
    }
    
    return this.getRandomResponse('priceReaction') || '가격은 알겠는데, 품질은 어떤가요?'
  }

  // 클로징 시도에 대한 반응
  respondToClosing(analysis) {
    if (this.sentiment === 'very_positive') {
      return this.getRandomResponse('decisionMade') || '네, 좋아요. 그럼 어떻게 진행하면 되나요?'
    } else if (this.sentiment === 'positive') {
      return this.getRandomResponse('positiveButHesitant') || '음... 괜찮은 것 같긴 한데, 좀 더 생각해봐도 될까요?'
    } else {
      return this.getRandomResponse('concernsRemain') || '아직 확신이 안 서요. 좀 더 알아보고 싶어요.'
    }
  }

  // 설명에 대한 반응
  respondToExplanation(analysis) {
    const responses = [
      '아, 그렇군요. 이해했습니다. 그런데 한 가지 궁금한 게 있는데요...',
      '네, 설명 감사합니다. 그럼 실제로는 어떻게 되는 건가요?',
      '음... 말씀은 이해했는데, 제 경우에는 어떨지 모르겠네요.',
      '자세히 설명해주셔서 감사해요. 그런데 다른 분들은 어떻게 생각하시나요?'
    ]
    
    // 질문 추가
    if (Math.random() > 0.5) {
      const question = this.generateFollowUpQuestion(analysis)
      this.questionsAsked.push(question)
      return responses[Math.floor(Math.random() * responses.length)] + ' ' + question
    }
    
    return responses[Math.floor(Math.random() * responses.length)]
  }

  // 후속 질문 생성
  generateFollowUpQuestion(analysis) {
    const questions = {
      price: ['다른 옵션은 없나요?', '할부도 되나요?', '추가 비용은 얼마나 되나요?'],
      quality: ['실제 사용해보신 분들 후기는 어때요?', 'AS는 어떻게 되나요?', '보증 기간은 얼마나 되나요?'],
      service: ['관리는 얼마나 자주 해야 하나요?', '문제 생기면 바로 와주시나요?', '서비스 비용은 따로 있나요?'],
      health: ['정말 효과가 있나요?', '얼마나 사용해야 효과를 볼 수 있나요?', '부작용은 없나요?']
    }
    
    for (const [topic, qs] of Object.entries(questions)) {
      if (analysis.topics.includes(topic)) {
        return qs[Math.floor(Math.random() * qs.length)]
      }
    }
    
    return '그래서 제가 얻을 수 있는 혜택이 정확히 뭔가요?'
  }

  // 키워드 기반 응답
  respondToKeyword(analysis) {
    const keyword = analysis.keywords[0]
    const categoryMap = {
      price: ['priceReaction', 'priceComparison', 'priceAcceptance'],
      quality: ['qualityInquiry', 'performanceCheck', 'durability'],
      rental: ['rentalConcern', 'rental'],
      service: ['serviceCost', 'serviceQuality', 'serviceComparison'],
      health: ['healthConcerns', 'allergyRelated', 'sanitationEffects'],
      comparison: ['detailedComparison', 'specComparison'],
      benefit: ['promotionResponse', 'benefit'],
      installation: ['processInquiry', 'urgency'],
      decision: ['decisionMade', 'finalConfirmation']
    }

    const categories = categoryMap[keyword] || []
    for (const category of categories) {
      if (this.responses[category]) {
        return this.getRandomResponse(category)
      }
    }
    
    return this.getDefaultResponse()
  }

  // 긍정적 응답
  respondPositively(analysis) {
    if (this.responses.positiveResponse) {
      return this.getRandomResponse('positiveResponse')
    }
    return '그렇군요, 좋네요! 그럼 다음 단계는 뭔가요?'
  }

  // 부정적 응답
  respondNegatively(analysis) {
    if (this.responses.concernsRemain) {
      return this.getRandomResponse('concernsRemain')
    }
    return '음... 아직 잘 모르겠어요. 좀 더 설명해주실 수 있나요?'
  }

  // 대화 단계별 응답
  getStageBasedResponse() {
    if (this.responseCount < 3) {
      return this.getEarlyStageResponse()
    } else if (this.responseCount < 6) {
      return this.getMidStageResponse()
    } else {
      return this.getLateStageResponse()
    }
  }

  // 키워드 추출
  extractKeywords(message) {
    const keywordGroups = {
      price: ['가격', '할인', '비용', '저렴', '비싸', '돈', '원', '만원', '천원', '싸', '비용'],
      quality: ['품질', '좋', '성능', '효과', '기술', '우수', '최고', '프리미엄'],
      rental: ['렌탈', '월', '계약', '기간', '약정', '해지', '위약금'],
      service: ['서비스', 'as', '관리', '케어', '점검', '수리', '교체'],
      health: ['건강', '진드기', '알레르기', '아토피', '청결', '위생', '살균'],
      brand: ['코웨이', '브랜드', '회사', '믿', '신뢰', '유명'],
      comparison: ['다른', '비교', '경쟁', '타사', 'lg', '삼성', '차이'],
      benefit: ['혜택', '프로모션', '이벤트', '특가', '사은품', '할인'],
      installation: ['설치', '배송', '방문', '언제', '빨리', '급'],
      decision: ['결정', '계약', '신청', '진행', '할게', '좋아']
    }

    const found = []
    for (const [category, keywords] of Object.entries(keywordGroups)) {
      if (keywords.some(kw => message.includes(kw))) {
        found.push(category)
        this.mentionedTopics.add(category)
      }
    }
    return found
  }

  // 감정 분석
  detectSentiment(message) {
    const positive = ['좋', '괜찮', '마음', '만족', '훌륭', '완벽', '최고', '감사']
    const negative = ['싫', '안', '못', '어렵', '부담', '비싸', '문제', '걱정']
    
    const posCount = positive.filter(w => message.includes(w)).length
    const negCount = negative.filter(w => message.includes(w)).length
    
    if (posCount > negCount) return 'positive'
    if (negCount > posCount) return 'negative'
    return 'neutral'
  }

  // 의도 파악
  detectIntent(message) {
    if (message.includes('얼마') || message.includes('가격')) return 'price_inquiry'
    if (message.includes('어떤') || message.includes('뭐') || message.includes('무엇')) return 'information_request'
    if (message.includes('할게') || message.includes('결정') || message.includes('계약')) return 'decision'
    if (message.includes('비교') || message.includes('다른')) return 'comparison'
    if (message.includes('언제') || message.includes('설치')) return 'timeline_inquiry'
    if (message.includes('건강') || message.includes('효과')) return 'health_inquiry'
    return 'general'
  }

  // 주제 감지
  detectTopics(message) {
    const topics = []
    if (message.includes('가격') || message.includes('할인')) topics.push('price')
    if (message.includes('품질') || message.includes('성능')) topics.push('quality')
    if (message.includes('렌탈') || message.includes('계약')) topics.push('rental')
    if (message.includes('건강') || message.includes('진드기')) topics.push('health')
    if (message.includes('설치') || message.includes('배송')) topics.push('installation')
    return topics
  }

  // 긍정적 메시지 판단
  isPositiveMessage(message) {
    const positiveWords = [
      '좋', '괜찮', '마음에', '만족', '훌륭', '완벽', '최고', '감사',
      '그렇군', '이해', '알겠', '동의', '확인', '오케이', 'ok'
    ]
    return positiveWords.some(word => message.includes(word))
  }

  // 부정적 메시지 판단
  isNegativeMessage(message) {
    const negativeWords = [
      '싫', '안돼', '못', '어렵', '부담', '비싸', '문제', '걱정',
      '아니', '글쎄', '음', '그런데', '하지만', '근데'
    ]
    return negativeWords.some(word => message.includes(word))
  }

  // 응답 선택
  selectResponse(analysis) {
    // 이 함수는 이제 selectContextualResponse로 대체됨
    return this.selectContextualResponse(analysis)
  }

  // 초기 단계 응답
  getEarlyStageResponse() {
    const categories = ['greeting', 'initial', 'priceReaction', 'qualityInquiry', 'healthConcerns']
    for (const cat of categories) {
      if (this.responses[cat]) {
        return this.getRandomResponse(cat)
      }
    }
    return this.getDefaultResponse()
  }

  // 중간 단계 응답
  getMidStageResponse() {
    const categories = ['comparing', 'considering', 'concernsRemain', 'additionalQuestions']
    for (const cat of categories) {
      if (this.responses[cat]) {
        return this.getRandomResponse(cat)
      }
    }
    return this.getDefaultResponse()
  }

  // 후기 단계 응답
  getLateStageResponse() {
    if (this.sentiment === 'positive' || this.sentiment === 'very_positive') {
      const categories = ['positiveResponse', 'decisionMade', 'finalConfirmation']
      for (const cat of categories) {
        if (this.responses[cat]) {
          return this.getRandomResponse(cat)
        }
      }
    }
    
    const categories = ['finalCheck', 'decisionFactors', 'renegotiation']
    for (const cat of categories) {
      if (this.responses[cat]) {
        return this.getRandomResponse(cat)
      }
    }
    return this.getDefaultResponse()
  }

  // 랜덤 응답 선택
  getRandomResponse(category) {
    const responses = this.responses[category]
    if (!responses || responses.length === 0) {
      return this.getDefaultResponse()
    }
    return responses[Math.floor(Math.random() * responses.length)]
  }

  // 기본 응답
  getDefaultResponse() {
    const defaults = [
      '그렇군요. 좀 더 설명해주시겠어요?',
      '음... 이해는 되는데, 다른 것도 궁금해요.',
      '그 부분은 알겠어요. 그런데요...',
      '네, 그렇다면 다른 건 어떤가요?',
      '좀 더 자세히 알려주실 수 있나요?'
    ]
    return defaults[Math.floor(Math.random() * defaults.length)]
  }

  // 감정 상태 업데이트
  updateSentiment(analysis) {
    if (analysis.isPositive) {
      if (this.sentiment === 'positive') {
        this.sentiment = 'very_positive'
      } else if (this.sentiment === 'neutral') {
        this.sentiment = 'positive'
      }
    } else if (analysis.isNegative) {
      if (this.sentiment === 'positive') {
        this.sentiment = 'neutral'
      } else if (this.sentiment === 'neutral') {
        this.sentiment = 'negative'
      }
    }
  }

  // 대화 리셋
  reset() {
    this.conversationHistory = []
    this.mentionedTopics.clear()
    this.responseCount = 0
    this.sentiment = 'neutral'
  }
}
