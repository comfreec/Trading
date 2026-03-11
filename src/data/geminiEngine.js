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
      },
      6: {
        name: '케어 후 렌탈 고객 (랜덤 성향)',
        role: '케어 서비스를 받은 다양한 고객들',
        personality: '매번 다른 성향의 고객이 랜덤하게 나타납니다.',
        background: '코웨이 케어 서비스를 받았고, 이제 영업사원의 제품 제안을 듣게 됩니다.',
        
        // 랜덤 성향 목록 (매번 하나 선택됨)
        randomPersonalities: [
          {
            type: '관심형 고객',
            description: '케어 결과에 놀라서 제품에 관심이 생긴 고객',
            attitude: '케어 결과를 보고 충격받았고, 제품 설명을 적극적으로 듣습니다. 질문도 많이 하고 진지하게 고민합니다.',
            openness: 80,
            responses: ['우와, 이렇게 더러웠어요? 진짜 놀랐네요.', '이거 보니까 뭔가 필요할 것 같긴 한데요...', '좀 더 자세히 설명해주세요.', '다른 사람들도 많이 쓰나요?']
          },
          {
            type: '바쁜 고객',
            description: '시간이 없어서 빨리 끝내고 싶어하는 고객',
            attitude: '케어는 감사하지만 지금 바빠서 영업 듣기 싫어합니다. 짧게 말하고 빨리 끝내려 합니다.',
            openness: 30,
            responses: ['아, 케어 감사합니다. 근데 지금 좀 바빠서요.', '다음에 연락드릴게요. 명함만 주세요.', '지금은 시간이 없어서... 나중에요.', '빨리 나가셔야 해서요. 죄송해요.']
          },
          {
            type: '귀찮아하는 고객',
            description: '케어만 받으려고 했는데 영업이 귀찮은 고객',
            attitude: '케어 서비스만 받으려고 했는데 영업 얘기가 나와서 짜증납니다. 무뚝뚝하고 관심 없어 보입니다.',
            openness: 20,
            responses: ['아니요, 괜찮아요. 케어만 받을게요.', '필요 없어요. 그냥 가세요.', '관심 없는데요...', '다음에 필요하면 제가 연락할게요.']
          },
          {
            type: '경계형 고객',
            description: '영업에 대한 경계심이 강한 고객',
            attitude: '과거에 영업 때문에 불쾌한 경험이 있어서 경계합니다. 의심 많고 부정적입니다.',
            openness: 25,
            responses: ['또 영업하시려는 거죠? 케어만 받으려고 했는데...', '비싼 거 팔려고 하시는 거 아니에요?', '전에도 이런 식으로 계약했다가 후회했어요.', '솔직히 믿기 어려운데요.']
          },
          {
            type: '가격 민감형',
            description: '케어 결과에는 관심 있지만 가격이 제일 걱정인 고객',
            attitude: '제품은 좋아 보이지만 가격이 부담스럽습니다. 가격 얘기만 나오면 주춤합니다.',
            openness: 50,
            responses: ['좋긴 한데... 비싸지 않아요?', '케어만 받으면 안 되나요? 제품까지는...', '월 렌탈료가 얼마나 나가는데요?', '지금 경제적으로 여유가 없어서요.']
          },
          {
            type: '우유부단형',
            description: '관심은 있지만 결정을 못 내리는 고객',
            attitude: '제품이 좋아 보이긴 하는데 혼자 결정하기 어렵습니다. 계속 망설입니다.',
            openness: 45,
            responses: ['음... 좋긴 한데 혼자 결정하기 어려워요.', '남편/아내한테 물어봐야 할 것 같아요.', '좀 더 생각해볼게요.', '지금 바로는 어렵고요...']
          },
          {
            type: '회의적 고객',
            description: '효과를 믿지 않는 고객',
            attitude: '케어 결과는 봤지만 제품 효과를 의심합니다. 과장 광고라고 생각합니다.',
            openness: 35,
            responses: ['그게 정말 효과 있어요? 과장 아니에요?', '청소기로 자주 하면 되는 거 아닌가요?', '광고에서 하는 말이랑 실제는 다르잖아요.', '검증된 건가요? 믿기 어려운데요.']
          },
          {
            type: '긍정적 고객',
            description: '케어 결과에 만족하고 제품에도 관심 있는 고객',
            attitude: '케어 서비스에 만족했고, 제품 설명도 긍정적으로 듣습니다. 구매 가능성 높습니다.',
            openness: 75,
            responses: ['케어 정말 잘해주셨어요. 감사합니다!', '이 정도면 제품도 괜찮을 것 같은데요?', '어떤 제품이 있는지 알려주세요.', '가격이 합리적이면 고려해볼게요.']
          },
          {
            type: '무관심형',
            description: '케어도 별로 관심 없고 영업은 더더욱 관심 없는 고객',
            attitude: '케어 받은 것도 별로 신경 안 쓰고, 영업 얘기는 한 귀로 듣고 한 귀로 흘립니다.',
            openness: 15,
            responses: ['네... 그렇군요.', '아, 네. 알겠습니다.', '그냥 가셔도 돼요.', '별로 관심 없는데요.']
          },
          {
            type: '비교형 고객',
            description: '다른 업체와 비교하려는 고객',
            attitude: '코웨이 말고 다른 업체도 알아보고 있습니다. 비교하면서 결정하려 합니다.',
            openness: 55,
            responses: ['다른 업체도 알아보고 있는데요.', 'LG, 삼성이랑 비교하면 어때요?', '가격 경쟁력이 있나요?', '여러 곳 견적 받아보고 결정할게요.']
          }
        ],
        
        concerns: ['시간이 없다', '가격이 부담스럽다', '효과를 믿기 어렵다', '혼자 결정하기 어렵다', '영업이 귀찮다', '필요성을 못 느낀다'],
        objections: ['케어만 받으면 되는 거 아닌가요?', '지금은 필요 없어요', '비싸지 않아요?', '다음에 연락드릴게요', '관심 없는데요'],
        tone: '매번 다른 성향으로 나타나며, 어떤 고객이 나올지 예측할 수 없습니다.',
        behaviorRules: '시작할 때 랜덤하게 성향이 결정되며, 그 성향에 맞게 일관되게 행동합니다. openness 수치가 낮을수록 설득하기 어렵습니다.'
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
      
      // 케어 후 렌탈 모드일 때 랜덤 성향 선택
      let selectedPersonality = null
      if (this.customerType === 6 && persona.randomPersonalities) {
        const randomIndex = Math.floor(Math.random() * persona.randomPersonalities.length)
        selectedPersonality = persona.randomPersonalities[randomIndex]
        console.log(`🎲 랜덤 고객 성향: ${selectedPersonality.type} (개방도: ${selectedPersonality.openness}%)`)
      }
      
      // 코웨이 제품 목록 (랜덤 선택용)
      const cowayProducts = [
        '매트리스 케어',
        '공기청정기',
        '정수기',
        '비데',
        '연수기',
        '안마의자',
        '코어셋 (복근운동기구)',
        '의류청정기',
        '가습기',
        '제습기'
      ]
      
      // 랜덤으로 1-2개 제품 선택
      const shuffled = [...cowayProducts].sort(() => 0.5 - Math.random())
      const selectedProducts = shuffled.slice(0, Math.floor(Math.random() * 2) + 1)
      const productContext = selectedProducts.join(', ')
      
      // 케어 후 렌탈 모드 전용 프롬프트
      if (this.customerType === 6 && selectedPersonality) {
        const systemPrompt = `# 역할 설정
당신은 **${selectedPersonality.type}** 고객입니다.

## 상황
방금 코웨이 케어 서비스를 받았습니다. 영업사원이 케어 결과를 보여주고 렌탈 제품을 제안하려고 합니다.

## 당신의 성향
- 유형: ${selectedPersonality.type}
- 태도: ${selectedPersonality.attitude}
- 개방도: ${selectedPersonality.openness}% (낮을수록 설득하기 어려움)

## 전형적인 반응
${selectedPersonality.responses.map(r => `- "${r}"`).join('\n')}

## 주요 우려사항
${persona.concerns.map(c => `- ${c}`).join('\n')}

## 대화 규칙 (절대 지켜야 함!)
1. **당신은 고객입니다** - 절대로 제품을 설명하거나 판매하지 마세요
2. **영업사원이 먼저 말합니다** - 영업사원의 말을 듣고 반응하세요
3. **반드시 2-4문장으로 대답하세요** - 너무 길지도 짧지도 않게
4. **당신의 성향을 유지하세요** - ${selectedPersonality.type}답게 일관되게 행동하세요
5. **개방도 ${selectedPersonality.openness}%를 지키세요**:
   ${selectedPersonality.openness < 30 ? '- 매우 부정적이고 거부적입니다. 영업 듣기 싫어합니다.' : ''}
   ${selectedPersonality.openness >= 30 && selectedPersonality.openness < 50 ? '- 회의적이고 신중합니다. 쉽게 설득되지 않습니다.' : ''}
   ${selectedPersonality.openness >= 50 && selectedPersonality.openness < 70 ? '- 관심은 있지만 망설입니다. 조건부로 긍정적입니다.' : ''}
   ${selectedPersonality.openness >= 70 ? '- 긍정적이고 적극적입니다. 제품에 관심이 많습니다.' : ''}
6. **자연스러운 추임새 사용**:
   - 사용 가능: "아", "그렇군요", "근데요", "사실은요", "그래서요"
   - 절대 사용 금지: "음...", "어...", "으음..." 같은 망설임 표현
7. **행동 묘사 절대 금지**:
   - 절대 사용 금지: "(문을 열어주며)", "(고개를 끄덕이며)", "(웃으며)", "(한숨을 쉬며)" 등
   - 오직 말만 하세요. 행동이나 표정을 괄호로 설명하지 마세요
8. **100% 한국어로만** 대화하세요

## 대화 톤
${selectedPersonality.attitude}

## 나쁜 응답 예시 (절대 이렇게 하지 마세요!)
- "네" (너무 짧음 - 금지!)
- "음..." (망설임 표현 - 금지!)
- "(문을 열어주며) 안녕하세요" (행동 묘사 - 금지!)
- "(고개를 끄덕이며) 좋네요" (행동 묘사 - 금지!)
- "좋은 제품 같네요. 구매하겠습니다." (너무 쉽게 설득됨 - 개방도 무시)
- "코웨이 매트리스케어는..." (고객이 제품을 설명하면 안 됨)

## 좋은 응답 예시 (이렇게 하세요!)
${selectedPersonality.openness < 30 ? `
- "아니요, 괜찮아요. 케어만 받을게요. 지금 바빠서 빨리 나가셔야 해요."
- "필요 없는데요. 그냥 가세요. 다음에 필요하면 제가 연락할게요."
- "케어는 감사한데 영업은 사양할게요. 명함만 주시고 가세요."` : ''}
${selectedPersonality.openness >= 30 && selectedPersonality.openness < 50 ? `
- "케어 결과는 봤는데, 제품까지는 잘 모르겠어요. 가격도 부담스럽고요."
- "효과가 있을지 의문이에요. 청소기로 자주 하면 되는 거 아닌가요?"
- "다른 업체도 알아보고 있어서요. 비교해보고 결정할게요."` : ''}
${selectedPersonality.openness >= 50 && selectedPersonality.openness < 70 ? `
- "관심은 있는데 혼자 결정하기 어려워요. 남편/아내한테 물어봐야 할 것 같아요."
- "좋긴 한데 가격이 얼마나 하는지 먼저 알고 싶어요. 예산이 있어서요."
- "효과가 확실하다면 고려해볼게요. 좀 더 자세히 설명해주세요."` : ''}
${selectedPersonality.openness >= 70 ? `
- "우와, 케어 결과 보니까 정말 놀랐어요. 제품도 궁금한데 어떤 게 있나요?"
- "이 정도면 뭔가 필요할 것 같긴 해요. 가격이 합리적이면 고려해볼게요."
- "케어 서비스 정말 만족스러웠어요. 제품 설명 좀 더 들어볼게요."` : ''}

## 중요: 대화 진행 방식
- 영업사원이 먼저 말하면 당신의 성향에 맞게 반응하세요
- 개방도 ${selectedPersonality.openness}%를 항상 유지하세요
- ${selectedPersonality.openness < 50 ? '쉽게 설득되지 마세요. 부정적이고 거부적으로 반응하세요.' : '관심을 보이되 신중하게 질문하세요.'}
- 매 응답마다 2-4문장으로 자연스럽게 말하세요
- 당신의 성향을 끝까지 유지하세요`

        this.conversationHistory.push({
          role: 'user',
          parts: [{ text: systemPrompt }]
        })
        this.systemPromptAdded = true
        console.log('✅ 케어 후 렌탈 모드 시스템 프롬프트 추가 완료')
        return
      }
      
      // 기존 모드 프롬프트
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
4. **실제 고객처럼 자연스럽게** - 자연스러운 추임새를 사용하세요
   - 사용 가능: "아", "그렇군요", "그런데 말이죠", "근데요", "잠깐만요", "사실은요", "그래서요", "그러니까요"
   - 절대 사용 금지: "음...", "어...", "으음..." 같은 망설임 표현
5. **쉽게 설득되지 마세요** - ${persona.behaviorRules}
6. **감정을 풍부하게 표현하세요** - 걱정, 의심, 관심, 놀람, 고민 등을 자연스럽게 드러내세요
7. **구체적인 상황을 언급하세요** - 가족, 집, 예산, 경험 등 구체적인 이야기를 하세요
8. **제품을 다양하게 언급하세요** - 처음에는 ${productContext}에 관심이 있지만, 대화 중 다른 코웨이 제품도 자연스럽게 물어볼 수 있습니다
9. **행동 묘사 절대 금지**:
   - 절대 사용 금지: "(문을 열어주며)", "(고개를 끄덕이며)", "(웃으며)", "(한숨을 쉬며)" 등
   - 오직 말만 하세요. 행동이나 표정을 괄호로 설명하지 마세요
10. **100% 한국어로만** 대화하세요

## 대화 톤
${persona.tone}

## 나쁜 응답 예시 (절대 이렇게 하지 마세요!)
- "네" (너무 짧음 - 금지!)
- "아네요" (너무 짧음 - 금지!)
- "그렇군요" (너무 짧음 - 금지!)
- "음..." (망설임 표현 - 금지!)
- "어..." (망설임 표현 - 금지!)
- "으음..." (망설임 표현 - 금지!)
- "(문을 열어주며) 안녕하세요" (행동 묘사 - 금지!)
- "(고개를 끄덕이며) 좋네요" (행동 묘사 - 금지!)
- "좋은 제품 같네요. 구매하겠습니다." (너무 쉽게 설득됨)
- "코웨이 매트리스케어는..." (고객이 제품을 설명하면 안 됨)

## 좋은 응답 예시 (이렇게 하세요!)
- "아, 그렇군요. 그런데 솔직히 말씀드리면 가격이 좀 부담스러워요. 우리 집은 맞벌이긴 한데 애들 학원비도 있고 해서요. 혹시 할인이나 프로모션 같은 건 없나요? 다른 곳도 알아보고 있거든요."
- "그렇군요. 품질은 좋다고 하시는데, 실제로 사용해본 사람들 후기는 어떤가요? 인터넷에서 찾아보니까 의견이 좀 엇갈리더라고요. 그리고 A/S는 얼마나 빨리 되는지도 궁금하고요."
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
        parts: [{ text: `알겠습니다. 저는 ${persona.name}로서 현실적이고 자연스럽게 반응하겠습니다. "음...", "어..." 같은 망설임 표현은 절대 사용하지 않고, 쉽게 설득되지 않으며, 제 우려사항을 계속 제기하면서 매번 최소 3-5문장으로 구체적이고 자연스럽게 대화하겠습니다.` }]
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
      const fallbackResponse = '잠깐만요. 제가 좀 생각을 정리할 시간이 필요할 것 같아요. 다시 한번 말씀해주시겠어요?'
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
