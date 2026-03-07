// 대화 응답 엔진 - 자연스러운 대화 흐름 생성
import { priceSensitiveResponses } from './priceSensitiveResponses'
import { qualityFocusedResponses } from './qualityFocusedResponses'
import { comparisonResponses } from './comparisonResponses'
import { quickDecisionResponses } from './quickDecisionResponses'
import { healthFocusedResponses } from './healthFocusedResponses'

export class ResponseEngine {
  constructor(customerType) {
    this.customerType = customerType
    this.conversationHistory = []
    this.mentionedTopics = new Set()
    this.responseCount = 0
    this.sentiment = 'neutral' // negative, neutral, positive, very_positive
    
    // 고객 유형별 응답 데이터
    this.responses = {
      1: priceSensitiveResponses,
      2: qualityFocusedResponses,
      3: comparisonResponses,
      4: quickDecisionResponses,
      5: healthFocusedResponses
    }[customerType]
  }

  // 메시지 분석 및 응답 생성
  generateResponse(agentMessage) {
    this.responseCount++
    this.conversationHistory.push({ role: 'agent', message: agentMessage })
    
    const analysis = this.analyzeMessage(agentMessage)
    const response = this.selectResponse(analysis)
    
    this.conversationHistory.push({ role: 'customer', message: response })
    this.updateSentiment(analysis)
    
    return response
  }

  // 메시지 분석
  analyzeMessage(message) {
    const lower = message.toLowerCase()
    
    return {
      keywords: this.extractKeywords(lower),
      sentiment: this.detectSentiment(lower),
      intent: this.detectIntent(lower),
      topics: this.detectTopics(lower),
      length: message.length,
      hasQuestion: message.includes('?') || lower.includes('어떤') || lower.includes('얼마'),
      isPositive: this.isPositiveMessage(lower),
      isNegative: this.isNegativeMessage(lower)
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
    // 첫 응답
    if (this.responseCount === 1) {
      return this.getRandomResponse('greeting')
    }

    // 키워드 기반 응답
    if (analysis.keywords.length > 0) {
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
    }

    // 감정 기반 응답
    if (analysis.isPositive) {
      if (this.responses.positiveResponse) {
        return this.getRandomResponse('positiveResponse')
      }
      if (this.responses.positiveButHesitant) {
        return this.getRandomResponse('positiveButHesitant')
      }
      if (this.responses.positiveSignal) {
        return this.getRandomResponse('positiveSignal')
      }
    }

    if (analysis.isNegative) {
      if (this.responses.concernsRemain) {
        return this.getRandomResponse('concernsRemain')
      }
      if (this.responses.rejection) {
        return this.getRandomResponse('rejection')
      }
    }

    // 대화 진행 단계별 응답
    if (this.responseCount < 3) {
      return this.getEarlyStageResponse()
    } else if (this.responseCount < 6) {
      return this.getMidStageResponse()
    } else {
      return this.getLateStageResponse()
    }
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
