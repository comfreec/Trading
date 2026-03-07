// 레벨업 시스템 & 난이도 조절

export const levels = [
  { level: 1, title: '신입 영업사원', minExp: 0, maxExp: 999, color: '#9E9E9E', icon: '🌱' },
  { level: 2, title: '영업사원', minExp: 1000, maxExp: 2499, color: '#795548', icon: '📝' },
  { level: 3, title: '주니어 영업', minExp: 2500, maxExp: 4999, color: '#607D8B', icon: '💼' },
  { level: 4, title: '영업 대리', minExp: 5000, maxExp: 7999, color: '#2196F3', icon: '📊' },
  { level: 5, title: '시니어 영업', minExp: 8000, maxExp: 11999, color: '#4CAF50', icon: '🎯' },
  { level: 6, title: '영업 과장', minExp: 12000, maxExp: 16999, color: '#FF9800', icon: '🏅' },
  { level: 7, title: '영업 차장', minExp: 17000, maxExp: 23999, color: '#FF5722', icon: '🔥' },
  { level: 8, title: '영업 부장', minExp: 24000, maxExp: 31999, color: '#9C27B0', icon: '💎' },
  { level: 9, title: '영업 이사', minExp: 32000, maxExp: 44999, color: '#E91E63', icon: '👔' },
  { level: 10, title: '영업 전문가', minExp: 45000, maxExp: 59999, color: '#FFD700', icon: '⭐' },
  { level: 11, title: '영업 마스터', minExp: 60000, maxExp: 79999, color: '#FFD700', icon: '🏆' },
  { level: 12, title: '영업의 신', minExp: 80000, maxExp: Infinity, color: '#FFD700', icon: '👑' }
]

export const badges = {
  // 기본 배지
  '대화 시작': { icon: '💬', description: '첫 대화 완성', rarity: 'common' },
  '공감 마스터': { icon: '❤️', description: '공감 능력 우수', rarity: 'common' },
  '전문가 입문': { icon: '📚', description: '전문성 향상', rarity: 'common' },
  
  // 중급 배지
  '빠른 설득': { icon: '⚡', description: '5분 안에 설득', rarity: 'uncommon' },
  '완벽한 제안': { icon: '🎁', description: '모든 혜택 언급', rarity: 'uncommon' },
  '가격 협상가': { icon: '💰', description: '가격 민감 고객 설득', rarity: 'uncommon' },
  '타이밍 마스터': { icon: '⏰', description: '완벽한 타이밍', rarity: 'uncommon' },
  
  // 고급 배지
  '설득의 달인': { icon: '🔍', description: '까다로운 고객 설득', rarity: 'rare' },
  '클로징 마스터': { icon: '🎯', description: '완벽한 클로징', rarity: 'rare' },
  '영업 전문가': { icon: '👑', description: '모든 고객 유형 정복', rarity: 'epic' },
  'S급 영업왕': { icon: '⭐', description: '완벽한 대화 달성', rarity: 'legendary' },
  
  // 특별 배지
  '100일 연속': { icon: '🔥', description: '100일 연속 연습', rarity: 'epic' },
  '1000번 대화': { icon: '💯', description: '1000번 대화 완료', rarity: 'epic' },
  '완벽주의자': { icon: '💎', description: '10번 연속 90점 이상', rarity: 'legendary' }
}

export class LevelSystem {
  constructor() {
    this.currentExp = this.loadExp()
    this.earnedBadges = this.loadBadges()
    this.stats = this.loadStats()
  }

  loadExp() {
    const saved = localStorage.getItem('totalExp')
    return saved ? parseInt(saved) : 0
  }

  saveExp() {
    localStorage.setItem('totalExp', this.currentExp.toString())
  }

  loadBadges() {
    const saved = localStorage.getItem('earnedBadges')
    return saved ? JSON.parse(saved) : []
  }

  saveBadges() {
    localStorage.setItem('earnedBadges', JSON.stringify(this.earnedBadges))
  }

  loadStats() {
    const saved = localStorage.getItem('userStats')
    return saved ? JSON.parse(saved) : {
      totalConversations: 0,
      totalMessages: 0,
      highestScore: 0,
      averageScore: 0,
      consecutiveDays: 0,
      lastPlayDate: null,
      perfectScores: 0,
      customerTypeStats: {}
    }
  }

  saveStats() {
    localStorage.setItem('userStats', JSON.stringify(this.stats))
  }

  getCurrentLevel() {
    for (let i = levels.length - 1; i >= 0; i--) {
      if (this.currentExp >= levels[i].minExp) {
        return levels[i]
      }
    }
    return levels[0]
  }

  getNextLevel() {
    const current = this.getCurrentLevel()
    const nextLevelIndex = levels.findIndex(l => l.level === current.level) + 1
    return nextLevelIndex < levels.length ? levels[nextLevelIndex] : null
  }

  getProgressToNextLevel() {
    const current = this.getCurrentLevel()
    const next = this.getNextLevel()
    
    if (!next) return 100
    
    const currentLevelExp = this.currentExp - current.minExp
    const expNeeded = next.minExp - current.minExp
    
    return Math.min(100, (currentLevelExp / expNeeded) * 100)
  }

  addExp(amount, reason = '') {
    const oldLevel = this.getCurrentLevel()
    this.currentExp += amount
    this.saveExp()
    
    const newLevel = this.getCurrentLevel()
    const leveledUp = newLevel.level > oldLevel.level
    
    return {
      expGained: amount,
      totalExp: this.currentExp,
      leveledUp,
      newLevel: leveledUp ? newLevel : null,
      reason
    }
  }

  earnBadge(badgeName) {
    if (!this.earnedBadges.includes(badgeName)) {
      this.earnedBadges.push(badgeName)
      this.saveBadges()
      return true
    }
    return false
  }

  updateStats(conversationData) {
    this.stats.totalConversations++
    this.stats.totalMessages += conversationData.messageCount || 0
    
    if (conversationData.averageScore > this.stats.highestScore) {
      this.stats.highestScore = conversationData.averageScore
    }
    
    // 평균 점수 업데이트
    const totalScore = (this.stats.averageScore * (this.stats.totalConversations - 1)) + conversationData.averageScore
    this.stats.averageScore = Math.round(totalScore / this.stats.totalConversations)
    
    // 완벽한 점수 카운트
    if (conversationData.averageScore >= 90) {
      this.stats.perfectScores++
    }
    
    // 고객 유형별 통계
    const customerType = conversationData.customerType
    if (!this.stats.customerTypeStats[customerType]) {
      this.stats.customerTypeStats[customerType] = {
        count: 0,
        totalScore: 0,
        averageScore: 0,
        highestScore: 0
      }
    }
    
    const typeStats = this.stats.customerTypeStats[customerType]
    typeStats.count++
    typeStats.totalScore += conversationData.averageScore
    typeStats.averageScore = Math.round(typeStats.totalScore / typeStats.count)
    if (conversationData.averageScore > typeStats.highestScore) {
      typeStats.highestScore = conversationData.averageScore
    }
    
    // 연속 일수 체크
    this.updateConsecutiveDays()
    
    this.saveStats()
    
    // 특별 배지 체크
    this.checkSpecialBadges()
  }

  updateConsecutiveDays() {
    const today = new Date().toDateString()
    const lastPlay = this.stats.lastPlayDate
    
    if (lastPlay === today) {
      // 오늘 이미 플레이함
      return
    }
    
    if (lastPlay) {
      const lastDate = new Date(lastPlay)
      const todayDate = new Date(today)
      const diffTime = todayDate - lastDate
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
      
      if (diffDays === 1) {
        // 연속
        this.stats.consecutiveDays++
      } else if (diffDays > 1) {
        // 끊김
        this.stats.consecutiveDays = 1
      }
    } else {
      this.stats.consecutiveDays = 1
    }
    
    this.stats.lastPlayDate = today
  }

  checkSpecialBadges() {
    // 100일 연속
    if (this.stats.consecutiveDays >= 100) {
      this.earnBadge('100일 연속')
    }
    
    // 1000번 대화
    if (this.stats.totalConversations >= 1000) {
      this.earnBadge('1000번 대화')
    }
    
    // 완벽주의자 (10번 연속 90점 이상은 별도 추적 필요)
    if (this.stats.perfectScores >= 10) {
      this.earnBadge('완벽주의자')
    }
  }

  getCustomerDifficulty(customerType, userLevel) {
    // 사용자 레벨에 따라 고객 난이도 조절
    const baseDifficulty = {
      1: 'easy',      // 가격 민감형
      2: 'medium',    // 품질 중시형
      3: 'hard',      // 비교 검토형
      4: 'easy',      // 빠른 결정형
      5: 'medium'     // 건강 관심형
    }
    
    const difficulty = baseDifficulty[customerType]
    
    // 레벨이 높으면 더 까다롭게
    if (userLevel >= 7) {
      return difficulty === 'easy' ? 'medium' : difficulty === 'medium' ? 'hard' : 'expert'
    } else if (userLevel >= 4) {
      return difficulty === 'easy' ? 'medium' : difficulty
    }
    
    return difficulty
  }

  getRecommendedCustomerType() {
    // 통계 기반으로 연습이 필요한 고객 유형 추천
    const typeStats = this.stats.customerTypeStats
    
    let lowestType = 1
    let lowestScore = 100
    
    for (let type = 1; type <= 5; type++) {
      if (!typeStats[type] || typeStats[type].averageScore < lowestScore) {
        lowestScore = typeStats[type]?.averageScore || 0
        lowestType = type
      }
    }
    
    return lowestType
  }

  getRankingPosition() {
    // 전체 사용자 중 순위 (실제로는 서버 필요, 여기서는 시뮬레이션)
    const totalUsers = 10000 // 가상의 전체 사용자 수
    const percentile = Math.max(1, Math.min(100, 100 - (this.currentExp / 1000)))
    const position = Math.floor((percentile / 100) * totalUsers)
    
    return {
      position,
      totalUsers,
      percentile: Math.round(100 - percentile)
    }
  }

  getAchievementSummary() {
    return {
      level: this.getCurrentLevel(),
      exp: this.currentExp,
      badges: this.earnedBadges.length,
      totalBadges: Object.keys(badges).length,
      stats: this.stats,
      ranking: this.getRankingPosition()
    }
  }
}
