// AI 영업 코치 - 실시간 피드백 및 평가 시스템

export class SalesCoach {
  constructor() {
    this.evaluationCriteria = {
      empathy: { weight: 0.25, name: '공감도' },
      persuasion: { weight: 0.30, name: '설득력' },
      professionalism: { weight: 0.25, name: '전문성' },
      timing: { weight: 0.20, name: '타이밍' }
    }
  }

  // 실시간 응답 평가
  evaluateResponse(agentMessage, customerType, conversationContext) {
    const scores = {
      empathy: this.evaluateEmpathy(agentMessage),
      persuasion: this.evaluatePersuasion(agentMessage, customerType),
      professionalism: this.evaluateProfessionalism(agentMessage),
      timing: this.evaluateTiming(agentMessage, conversationContext)
    }

    const totalScore = Object.entries(scores).reduce((sum, [key, score]) => {
      return sum + (score * this.evaluationCriteria[key].weight)
    }, 0)

    return {
      scores,
      totalScore: Math.round(totalScore),
      feedback: this.generateInstantFeedback(scores, agentMessage, customerType),
      missedOpportunities: this.findMissedOpportunities(agentMessage, customerType, conversationContext),
      betterAlternatives: this.suggestBetterAlternatives(agentMessage, customerType, scores)
    }
  }

  // 공감도 평가
  evaluateEmpathy(message) {
    const empathyPhrases = [
      '이해합니다', '그러시군요', '맞습니다', '공감', '충분히',
      '당연히', '물론', '그렇죠', '말씀하신', '느끼시는'
    ]
    
    const questionPhrases = ['어떠세요', '궁금하신', '고민', '걱정']
    
    let score = 50
    
    empathyPhrases.forEach(phrase => {
      if (message.includes(phrase)) score += 10
    })
    
    questionPhrases.forEach(phrase => {
      if (message.includes(phrase)) score += 5
    })
    
    // 너무 짧으면 감점
    if (message.length < 10) score -= 20
    
    return Math.min(100, Math.max(0, score))
  }

  // 설득력 평가
  evaluatePersuasion(message, customerType) {
    let score = 50
    
    // 고객 유형별 핵심 키워드
    const keywordsByType = {
      1: ['할인', '프로모션', '경제적', '저렴', '혜택', '무료', '이벤트'],
      2: ['품질', '기술', '인증', '보증', '프리미엄', '최고', '우수'],
      3: ['차별점', '비교', '데이터', '실제', '증명', '객관적'],
      4: ['즉시', '바로', '빠르게', '간단', '쉽게', '오늘', '지금'],
      5: ['건강', '안전', '위생', '진드기', '알레르기', '효과', '개선']
    }
    
    const keywords = keywordsByType[customerType] || []
    keywords.forEach(keyword => {
      if (message.includes(keyword)) score += 8
    })
    
    // 구체적 숫자나 데이터
    if (/\d+%/.test(message) || /\d+원/.test(message) || /\d+배/.test(message)) {
      score += 15
    }
    
    // 혜택 제시
    if (message.includes('드리') || message.includes('제공') || message.includes('서비스')) {
      score += 10
    }
    
    return Math.min(100, Math.max(0, score))
  }

  // 전문성 평가
  evaluateProfessionalism(message) {
    let score = 50
    
    const professionalTerms = [
      '매트리스케어', '렌탈', '코웨이', '진드기', '살균',
      '필터', '관리', '점검', '서비스', 'AS', '보증'
    ]
    
    professionalTerms.forEach(term => {
      if (message.includes(term)) score += 5
    })
    
    // 존댓말 사용
    if (message.includes('습니다') || message.includes('세요') || message.includes('니다')) {
      score += 10
    }
    
    // 비속어나 부적절한 표현
    const inappropriate = ['그냥', '뭐', '막', '좀', '아무튼']
    inappropriate.forEach(word => {
      if (message.includes(word)) score -= 10
    })
    
    return Math.min(100, Math.max(0, score))
  }

  // 타이밍 평가
  evaluateTiming(message, context) {
    let score = 70
    
    const { responseCount, sentiment, mentionedTopics } = context
    
    // 초반에 가격 언급하면 감점
    if (responseCount < 3 && (message.includes('가격') || message.includes('할인'))) {
      score -= 20
    }
    
    // 긍정적 분위기에서 계약 유도는 좋음
    if (sentiment === 'positive' && responseCount > 4) {
      if (message.includes('계약') || message.includes('신청') || message.includes('진행')) {
        score += 20
      }
    }
    
    // 부정적 분위기에서 계약 유도는 나쁨
    if (sentiment === 'negative' && (message.includes('계약') || message.includes('신청'))) {
      score -= 30
    }
    
    return Math.min(100, Math.max(0, score))
  }

  // 즉시 피드백 생성
  generateInstantFeedback(scores, message, customerType) {
    const feedback = []
    
    if (scores.empathy < 50) {
      feedback.push('💡 고객의 말에 더 공감해보세요. "이해합니다", "그러시군요" 같은 표현을 사용해보세요.')
    } else if (scores.empathy > 80) {
      feedback.push('👍 훌륭한 공감 표현입니다!')
    }
    
    if (scores.persuasion < 50) {
      const typeAdvice = {
        1: '가격 혜택이나 프로모션을 구체적으로 언급해보세요.',
        2: '코웨이의 품질과 기술력을 강조해보세요.',
        3: '경쟁사와의 구체적인 차별점을 제시해보세요.',
        4: '빠른 진행과 간편함을 강조해보세요.',
        5: '건강 효과를 구체적으로 설명해보세요.'
      }
      feedback.push(`💡 ${typeAdvice[customerType]}`)
    } else if (scores.persuasion > 80) {
      feedback.push('👍 설득력 있는 제안입니다!')
    }
    
    if (scores.professionalism < 50) {
      feedback.push('💡 전문 용어를 사용하고 존댓말을 유지하세요.')
    }
    
    if (scores.timing < 50) {
      feedback.push('⚠️ 타이밍을 다시 생각해보세요. 고객의 상태를 먼저 파악하세요.')
    }
    
    return feedback
  }

  // 놓친 기회 찾기
  findMissedOpportunities(message, customerType, context) {
    const opportunities = []
    
    // 가격 민감형인데 혜택 언급 안함
    if (customerType === 1 && !message.includes('할인') && !message.includes('혜택') && context.responseCount > 2) {
      opportunities.push({
        type: 'benefit',
        message: '현재 진행 중인 프로모션이나 할인 혜택을 언급하지 않았습니다.',
        suggestion: '"지금 가입하시면 첫 3개월 50% 할인 혜택을 드립니다"'
      })
    }
    
    // 품질 중시형인데 인증이나 보증 언급 안함
    if (customerType === 2 && !message.includes('인증') && !message.includes('보증') && context.responseCount > 2) {
      opportunities.push({
        type: 'quality',
        message: '품질 인증이나 보증 서비스를 언급하지 않았습니다.',
        suggestion: '"코웨이는 국제 품질 인증을 받았고 5년 무상 보증을 제공합니다"'
      })
    }
    
    // 건강 관심형인데 구체적 효과 언급 안함
    if (customerType === 5 && !message.includes('진드기') && !message.includes('알레르기') && context.responseCount > 2) {
      opportunities.push({
        type: 'health',
        message: '건강 효과를 구체적으로 설명하지 않았습니다.',
        suggestion: '"매트리스케어로 진드기를 99.9% 제거하여 알레르기를 예방할 수 있습니다"'
      })
    }
    
    // 긍정적인데 클로징 시도 안함
    if (context.sentiment === 'positive' && context.responseCount > 5) {
      if (!message.includes('계약') && !message.includes('신청') && !message.includes('진행')) {
        opportunities.push({
          type: 'closing',
          message: '고객이 긍정적인 반응을 보이는데 계약 제안을 하지 않았습니다.',
          suggestion: '"그럼 오늘 바로 신청하시겠어요? 지금 신청하시면 이번 주 안에 설치 가능합니다"'
        })
      }
    }
    
    return opportunities
  }

  // 더 나은 대안 제시
  suggestBetterAlternatives(message, customerType, scores) {
    const alternatives = []
    
    // 점수가 낮은 부분에 대한 개선안
    if (scores.empathy < 60) {
      alternatives.push({
        category: '공감 표현 추가',
        original: message,
        improved: `네, 말씀하신 부분 충분히 이해합니다. ${message}`
      })
    }
    
    if (scores.persuasion < 60) {
      const typeEnhancement = {
        1: '현재 특별 할인 이벤트로 월 2만원대에 이용 가능합니다. ',
        2: '코웨이는 30년 전통의 1위 브랜드로 품질을 보증합니다. ',
        3: '타사 대비 2배 강력한 흡입력과 99.9% 살균 효과가 있습니다. ',
        4: '지금 신청하시면 내일 바로 설치 가능합니다. ',
        5: '매트리스케어로 진드기 99.9% 제거, 아토피 개선 효과가 있습니다. '
      }
      alternatives.push({
        category: '설득력 강화',
        original: message,
        improved: typeEnhancement[customerType] + message
      })
    }
    
    return alternatives
  }

  // 대화 종료 후 상세 분석
  generateDetailedReport(conversationHistory, evaluations, customerType) {
    const avgScores = this.calculateAverageScores(evaluations)
    const strengths = this.identifyStrengths(avgScores, conversationHistory)
    const improvements = this.identifyImprovements(avgScores, conversationHistory, customerType)
    const recommendedScripts = this.recommendScripts(customerType, avgScores)
    
    return {
      summary: {
        totalMessages: conversationHistory.filter(m => m.role === 'agent').length,
        averageScore: Math.round(avgScores.total),
        grade: this.calculateGrade(avgScores.total),
        duration: conversationHistory.length
      },
      detailedScores: avgScores,
      strengths,
      improvements,
      recommendedScripts,
      conversationFlow: this.analyzeConversationFlow(conversationHistory),
      keyMoments: this.identifyKeyMoments(conversationHistory, evaluations)
    }
  }

  calculateAverageScores(evaluations) {
    if (evaluations.length === 0) return { empathy: 0, persuasion: 0, professionalism: 0, timing: 0, total: 0 }
    
    const sums = evaluations.reduce((acc, evaluation) => {
      acc.empathy += evaluation.scores.empathy
      acc.persuasion += evaluation.scores.persuasion
      acc.professionalism += evaluation.scores.professionalism
      acc.timing += evaluation.scores.timing
      acc.total += evaluation.totalScore
      return acc
    }, { empathy: 0, persuasion: 0, professionalism: 0, timing: 0, total: 0 })
    
    const count = evaluations.length
    return {
      empathy: Math.round(sums.empathy / count),
      persuasion: Math.round(sums.persuasion / count),
      professionalism: Math.round(sums.professionalism / count),
      timing: Math.round(sums.timing / count),
      total: Math.round(sums.total / count)
    }
  }

  calculateGrade(score) {
    if (score >= 90) return { grade: 'S', label: '전문가', color: '#FFD700' }
    if (score >= 80) return { grade: 'A', label: '고급', color: '#4CAF50' }
    if (score >= 70) return { grade: 'B', label: '중급', color: '#2196F3' }
    if (score >= 60) return { grade: 'C', label: '초급', color: '#FF9800' }
    return { grade: 'D', label: '연습 필요', color: '#F44336' }
  }

  identifyStrengths(avgScores, conversationHistory) {
    const strengths = []
    
    if (avgScores.empathy >= 75) {
      strengths.push('고객의 말을 잘 경청하고 공감하는 능력이 뛰어납니다.')
    }
    if (avgScores.persuasion >= 75) {
      strengths.push('설득력 있는 제안으로 고객의 관심을 끌어냅니다.')
    }
    if (avgScores.professionalism >= 75) {
      strengths.push('전문적이고 신뢰감 있는 태도를 유지합니다.')
    }
    if (avgScores.timing >= 75) {
      strengths.push('적절한 타이밍에 제안하는 감각이 좋습니다.')
    }
    
    return strengths.length > 0 ? strengths : ['꾸준히 연습하면 실력이 향상될 것입니다.']
  }

  identifyImprovements(avgScores, conversationHistory, customerType) {
    const improvements = []
    
    if (avgScores.empathy < 70) {
      improvements.push({
        area: '공감 능력',
        issue: '고객의 감정에 충분히 공감하지 못하고 있습니다.',
        action: '고객의 말을 먼저 인정하고 이해한다는 표현을 사용하세요.',
        example: '"말씀하신 부분 충분히 이해합니다. 많은 분들이 같은 고민을 하시더라고요."'
      })
    }
    
    if (avgScores.persuasion < 70) {
      improvements.push({
        area: '설득력',
        issue: '고객 유형에 맞는 핵심 메시지 전달이 부족합니다.',
        action: this.getPersuasionAdvice(customerType),
        example: this.getPersuasionExample(customerType)
      })
    }
    
    if (avgScores.professionalism < 70) {
      improvements.push({
        area: '전문성',
        issue: '전문 용어 사용과 체계적인 설명이 부족합니다.',
        action: '제품 지식을 더 공부하고 전문 용어를 자연스럽게 사용하세요.',
        example: '"매트리스케어 서비스는 UV 살균과 진공 흡입을 통해 진드기를 99.9% 제거합니다."'
      })
    }
    
    if (avgScores.timing < 70) {
      improvements.push({
        area: '타이밍',
        issue: '제안 타이밍이 적절하지 않습니다.',
        action: '고객의 반응을 보고 긍정적일 때 계약을 제안하세요.',
        example: '"관심 있으시다니 다행이네요. 그럼 오늘 바로 신청하시겠어요?"'
      })
    }
    
    return improvements
  }

  getPersuasionAdvice(customerType) {
    const advice = {
      1: '가격 혜택과 경제성을 구체적인 숫자로 제시하세요.',
      2: '코웨이의 품질과 기술력, 인증을 강조하세요.',
      3: '경쟁사와의 명확한 차별점을 데이터로 보여주세요.',
      4: '빠른 진행과 간편한 절차를 강조하세요.',
      5: '건강 효과를 구체적인 사례로 설명하세요.'
    }
    return advice[customerType] || '고객의 니즈에 맞는 메시지를 전달하세요.'
  }

  getPersuasionExample(customerType) {
    const examples = {
      1: '"지금 가입하시면 월 19,900원에 이용 가능하고, 첫 3개월은 50% 할인됩니다."',
      2: '"코웨이는 30년 전통의 1위 브랜드로, 국제 품질 인증과 5년 무상 보증을 제공합니다."',
      3: '"타사 제품 대비 흡입력이 2배 강하고, 살균 효과는 99.9%로 업계 최고 수준입니다."',
      4: '"신청하시면 24시간 내 설치 가능하고, 절차는 5분이면 끝납니다."',
      5: '"매트리스케어로 진드기 99.9% 제거되어 아토피가 70% 개선된 사례가 있습니다."'
    }
    return examples[customerType] || '"고객님께 딱 맞는 솔루션입니다."'
  }

  recommendScripts(customerType, avgScores) {
    const scripts = []
    
    if (avgScores.persuasion < 70) {
      scripts.push({
        title: `${this.getCustomerTypeName(customerType)} 맞춤 스크립트`,
        category: '설득 화법',
        priority: 'high'
      })
    }
    
    if (avgScores.empathy < 70) {
      scripts.push({
        title: '공감 대화법',
        category: '커뮤니케이션',
        priority: 'high'
      })
    }
    
    scripts.push({
      title: '클로징 기법',
      category: '계약 체결',
      priority: 'medium'
    })
    
    return scripts
  }

  getCustomerTypeName(type) {
    const names = {
      1: '가격 민감형',
      2: '품질 중시형',
      3: '비교 검토형',
      4: '빠른 결정형',
      5: '건강 관심형'
    }
    return names[type] || '일반'
  }

  analyzeConversationFlow(conversationHistory) {
    const agentMessages = conversationHistory.filter(m => m.role === 'agent')
    
    return {
      opening: agentMessages.length > 0 ? '적절' : '부족',
      development: agentMessages.length > 3 ? '충분' : '부족',
      closing: agentMessages.some(m => m.message.includes('계약') || m.message.includes('신청')) ? '시도함' : '시도 안함'
    }
  }

  identifyKeyMoments(conversationHistory, evaluations) {
    const moments = []
    
    evaluations.forEach((evaluation, index) => {
      if (evaluation.totalScore >= 85) {
        moments.push({
          type: 'success',
          message: conversationHistory[index * 2]?.message || '',
          score: evaluation.totalScore,
          comment: '훌륭한 응답입니다!'
        })
      } else if (evaluation.totalScore < 50) {
        moments.push({
          type: 'improvement',
          message: conversationHistory[index * 2]?.message || '',
          score: evaluation.totalScore,
          comment: '이 부분은 개선이 필요합니다.'
        })
      }
    })
    
    return moments.slice(0, 5) // 상위 5개만
  }
}
