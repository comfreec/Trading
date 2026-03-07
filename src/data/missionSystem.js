// 미션 & 목표 시스템

export const missions = {
  beginner: [
    {
      id: 'b1',
      title: '첫 대화 완성하기',
      description: '고객과 5번 이상 대화를 나누세요',
      difficulty: 'easy',
      target: { messageCount: 5 },
      reward: { exp: 100, badge: '대화 시작' },
      icon: '💬'
    },
    {
      id: 'b2',
      title: '공감 표현 사용하기',
      description: '공감 점수 70점 이상 달성',
      difficulty: 'easy',
      target: { empathyScore: 70 },
      reward: { exp: 150, badge: '공감 마스터' },
      icon: '❤️'
    },
    {
      id: 'b3',
      title: '전문 용어 사용하기',
      description: '전문성 점수 70점 이상 달성',
      difficulty: 'easy',
      target: { professionalismScore: 70 },
      reward: { exp: 150, badge: '전문가 입문' },
      icon: '📚'
    }
  ],
  
  intermediate: [
    {
      id: 'i1',
      title: '5분 안에 관심 유도하기',
      description: '5번의 대화 안에 고객을 긍정적으로 만드세요',
      difficulty: 'medium',
      target: { messageCount: 5, sentiment: 'positive' },
      reward: { exp: 300, badge: '빠른 설득' },
      icon: '⚡'
    },
    {
      id: 'i2',
      title: '3가지 혜택 모두 언급하기',
      description: '가격, 품질, 서비스 혜택을 모두 언급하세요',
      difficulty: 'medium',
      target: { mentionedTopics: ['price', 'quality', 'service'] },
      reward: { exp: 250, badge: '완벽한 제안' },
      icon: '🎁'
    },
    {
      id: 'i3',
      title: '가격 민감 고객 설득하기',
      description: '가격 민감형 고객과 대화에서 80점 이상 달성',
      difficulty: 'medium',
      target: { customerType: 1, averageScore: 80 },
      reward: { exp: 350, badge: '가격 협상가' },
      icon: '💰'
    },
    {
      id: 'i4',
      title: '완벽한 타이밍',
      description: '타이밍 점수 85점 이상 달성',
      difficulty: 'medium',
      target: { timingScore: 85 },
      reward: { exp: 300, badge: '타이밍 마스터' },
      icon: '⏰'
    }
  ],
  
  advanced: [
    {
      id: 'a1',
      title: '까다로운 고객 설득하기',
      description: '비교 검토형 고객과 대화에서 85점 이상 달성',
      difficulty: 'hard',
      target: { customerType: 3, averageScore: 85 },
      reward: { exp: 500, badge: '설득의 달인' },
      icon: '🔍'
    },
    {
      id: 'a2',
      title: '완벽한 클로징',
      description: '계약 제안까지 성공하고 90점 이상 달성',
      difficulty: 'hard',
      target: { hasClosing: true, averageScore: 90 },
      reward: { exp: 600, badge: '클로징 마스터' },
      icon: '🎯'
    },
    {
      id: 'a3',
      title: '모든 고객 유형 정복',
      description: '5가지 고객 유형 모두에서 80점 이상 달성',
      difficulty: 'hard',
      target: { allCustomerTypes: true, averageScore: 80 },
      reward: { exp: 800, badge: '영업 전문가' },
      icon: '👑'
    },
    {
      id: 'a4',
      title: '완벽한 대화',
      description: '모든 평가 항목에서 90점 이상 달성',
      difficulty: 'hard',
      target: { 
        empathyScore: 90,
        persuasionScore: 90,
        professionalismScore: 90,
        timingScore: 90
      },
      reward: { exp: 1000, badge: 'S급 영업왕' },
      icon: '⭐'
    }
  ],
  
  daily: [
    {
      id: 'd1',
      title: '오늘의 연습',
      description: '오늘 3번의 대화 완료하기',
      difficulty: 'daily',
      target: { dailyConversations: 3 },
      reward: { exp: 100 },
      icon: '📅',
      resetDaily: true
    },
    {
      id: 'd2',
      title: '고득점 달성',
      description: '오늘 한 번이라도 85점 이상 달성',
      difficulty: 'daily',
      target: { dailyHighScore: 85 },
      reward: { exp: 150 },
      icon: '🏆',
      resetDaily: true
    }
  ]
}

export class MissionTracker {
  constructor() {
    this.completedMissions = this.loadCompletedMissions()
    this.currentProgress = {}
    this.dailyStats = this.loadDailyStats()
  }

  loadCompletedMissions() {
    const saved = localStorage.getItem('completedMissions')
    return saved ? JSON.parse(saved) : []
  }

  saveCompletedMissions() {
    localStorage.setItem('completedMissions', JSON.stringify(this.completedMissions))
  }

  loadDailyStats() {
    const saved = localStorage.getItem('dailyStats')
    const stats = saved ? JSON.parse(saved) : { date: new Date().toDateString(), conversations: 0, highScore: 0 }
    
    // 날짜가 바뀌면 리셋
    if (stats.date !== new Date().toDateString()) {
      stats.date = new Date().toDateString()
      stats.conversations = 0
      stats.highScore = 0
      this.saveDailyStats(stats)
    }
    
    return stats
  }

  saveDailyStats(stats) {
    localStorage.setItem('dailyStats', JSON.stringify(stats))
  }

  updateDailyStats(score) {
    this.dailyStats.conversations++
    if (score > this.dailyStats.highScore) {
      this.dailyStats.highScore = score
    }
    this.saveDailyStats(this.dailyStats)
  }

  checkMissions(conversationData) {
    const newlyCompleted = []
    
    // 모든 미션 카테고리 확인
    Object.values(missions).flat().forEach(mission => {
      if (this.completedMissions.includes(mission.id)) return
      
      if (this.isMissionCompleted(mission, conversationData)) {
        this.completedMissions.push(mission.id)
        newlyCompleted.push(mission)
      }
    })
    
    if (newlyCompleted.length > 0) {
      this.saveCompletedMissions()
    }
    
    return newlyCompleted
  }

  isMissionCompleted(mission, data) {
    const { target } = mission
    
    // 메시지 수 확인
    if (target.messageCount && data.messageCount < target.messageCount) {
      return false
    }
    
    // 감정 상태 확인
    if (target.sentiment && data.sentiment !== target.sentiment) {
      return false
    }
    
    // 언급된 주제 확인
    if (target.mentionedTopics) {
      const hasAllTopics = target.mentionedTopics.every(topic => 
        data.mentionedTopics.includes(topic)
      )
      if (!hasAllTopics) return false
    }
    
    // 고객 유형 확인
    if (target.customerType && data.customerType !== target.customerType) {
      return false
    }
    
    // 평균 점수 확인
    if (target.averageScore && data.averageScore < target.averageScore) {
      return false
    }
    
    // 개별 점수 확인
    if (target.empathyScore && data.empathyScore < target.empathyScore) {
      return false
    }
    if (target.persuasionScore && data.persuasionScore < target.persuasionScore) {
      return false
    }
    if (target.professionalismScore && data.professionalismScore < target.professionalismScore) {
      return false
    }
    if (target.timingScore && data.timingScore < target.timingScore) {
      return false
    }
    
    // 클로징 시도 확인
    if (target.hasClosing && !data.hasClosing) {
      return false
    }
    
    // 모든 고객 유형 정복 확인
    if (target.allCustomerTypes) {
      const customerProgress = this.getCustomerTypeProgress()
      const allCompleted = [1, 2, 3, 4, 5].every(type => 
        customerProgress[type] && customerProgress[type] >= target.averageScore
      )
      if (!allCompleted) return false
    }
    
    // 일일 미션 확인
    if (target.dailyConversations && this.dailyStats.conversations < target.dailyConversations) {
      return false
    }
    if (target.dailyHighScore && this.dailyStats.highScore < target.dailyHighScore) {
      return false
    }
    
    return true
  }

  getCustomerTypeProgress() {
    const saved = localStorage.getItem('customerTypeProgress')
    return saved ? JSON.parse(saved) : {}
  }

  updateCustomerTypeProgress(customerType, score) {
    const progress = this.getCustomerTypeProgress()
    if (!progress[customerType] || score > progress[customerType]) {
      progress[customerType] = score
      localStorage.setItem('customerTypeProgress', JSON.stringify(progress))
    }
  }

  getAvailableMissions() {
    const level = this.getCurrentLevel()
    
    let available = []
    
    if (level >= 1) available = available.concat(missions.beginner)
    if (level >= 3) available = available.concat(missions.intermediate)
    if (level >= 7) available = available.concat(missions.advanced)
    available = available.concat(missions.daily)
    
    return available.filter(m => !this.completedMissions.includes(m.id))
  }

  getCurrentLevel() {
    const totalExp = this.getTotalExp()
    return Math.floor(totalExp / 1000) + 1
  }

  getTotalExp() {
    const saved = localStorage.getItem('totalExp')
    return saved ? parseInt(saved) : 0
  }

  addExp(amount) {
    const current = this.getTotalExp()
    const newTotal = current + amount
    localStorage.setItem('totalExp', newTotal.toString())
    return newTotal
  }

  getMissionProgress(mission, currentData) {
    const { target } = mission
    const progress = {}
    
    if (target.messageCount) {
      progress.messageCount = {
        current: currentData.messageCount || 0,
        target: target.messageCount,
        percentage: Math.min(100, ((currentData.messageCount || 0) / target.messageCount) * 100)
      }
    }
    
    if (target.averageScore) {
      progress.averageScore = {
        current: currentData.averageScore || 0,
        target: target.averageScore,
        percentage: Math.min(100, ((currentData.averageScore || 0) / target.averageScore) * 100)
      }
    }
    
    return progress
  }
}
