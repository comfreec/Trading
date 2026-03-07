import React, { useState } from 'react'
import './CustomerSimulator.css'

function CustomerSimulator() {
  // 음성 인식 초기화
  React.useEffect(() => {
    // 브라우저 호환성 체크
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    
    if (!SpeechRecognition) {
      console.log('Speech Recognition not supported')
      return
    }

    try {
      const recognitionInstance = new SpeechRecognition()
      
      recognitionInstance.continuous = false
      recognitionInstance.interimResults = true // 중간 결과도 표시
      recognitionInstance.lang = 'ko-KR'
      recognitionInstance.maxAlternatives = 1
      
      recognitionInstance.onstart = () => {
        console.log('🎤 음성 인식 시작됨')
        setIsListening(true)
      }
      
      recognitionInstance.onresult = (event) => {
        console.log('📝 음성 인식 결과:', event)
        
        // 최종 결과 또는 중간 결과 가져오기
        let transcript = ''
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript
        }
        
        console.log('인식된 텍스트:', transcript)
        setUserInput(transcript)
        
        // 최종 결과면 자동으로 중지
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
            // 사용자가 중단한 경우
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
      }
      
      setRecognition(recognitionInstance)
      console.log('✅ 음성 인식 초기화 완료')
    } catch (error) {
      console.error('❌ 음성 인식 초기화 실패:', error)
    }
  }, [])

  const customerTypes = [
    {
      id: 1,
      name: '가격 민감형 고객',
      icon: '💰',
      description: '가격과 할인에 민감하고 비용 대비 효과를 중시',
      personality: '가격이 제일 중요해요. 다른 곳보다 저렴한가요?',
      tips: ['가격보다 장기적 가치 강조', '렌탈의 경제성 설명', '프로모션 정보 제공']
    },
    {
      id: 2,
      name: '품질 중시형 고객',
      icon: '⭐',
      description: '제품의 품질과 브랜드 신뢰도를 최우선으로 고려',
      personality: '품질이 정말 좋은가요? 오래 사용할 수 있나요?',
      tips: ['코웨이 브랜드 신뢰도 강조', '기술력과 품질 인증 설명', 'A/S 시스템 안내']
    },
    {
      id: 3,
      name: '비교 검토형 고객',
      icon: '🔍',
      description: '여러 제품을 꼼꼼히 비교하고 신중하게 결정',
      personality: '다른 제품들과 비교해보고 싶어요. 차이점이 뭔가요?',
      tips: ['경쟁사 대비 차별점 명확히', '객관적 데이터 제시', '체험 기회 제공']
    },
    {
      id: 4,
      name: '빠른 결정형 고객',
      icon: '⚡',
      description: '빠르게 결정하고 즉시 실행을 원함',
      personality: '좋으면 바로 할게요. 언제 설치 가능한가요?',
      tips: ['핵심 혜택만 간결하게', '즉시 진행 가능 강조', '빠른 프로세스 안내']
    },
    {
      id: 5,
      name: '건강 관심형 고객',
      icon: '🏥',
      description: '건강과 위생에 관심이 많고 케어 서비스 중시',
      personality: '매트리스 청소가 건강에 얼마나 중요한가요?',
      tips: ['건강 효과 구체적 설명', '진드기/알레르기 예방 강조', '정기 케어의 중요성']
    }
  ]

  const [selectedCustomer, setSelectedCustomer] = useState(null)
  const [conversation, setConversation] = useState([])
  const [userInput, setUserInput] = useState('')
  const [showTips, setShowTips] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [recognition, setRecognition] = useState(null)

  const startSimulation = (customer) => {
    setSelectedCustomer(customer)
    setConversation([
      { speaker: 'customer', text: `안녕하세요. ${customer.personality}` }
    ])
    setConversationState({
      stage: 'initial',
      mentionedTopics: [],
      responseCount: 0
    })
    setShowTips(false)
  }

  const [conversationState, setConversationState] = useState({
    stage: 'initial', // initial, interested, considering, objecting, closing
    mentionedTopics: [],
    responseCount: 0
  })

  const handleSendMessage = () => {
    if (!userInput.trim()) return

    const newConversation = [
      ...conversation,
      { speaker: 'agent', text: userInput }
    ]

    // AI 응답 시뮬레이션
    const response = getCustomerResponse(selectedCustomer.id, userInput, conversationState)
    newConversation.push({ speaker: 'customer', text: response.text })

    setConversation(newConversation)
    setConversationState(response.newState)
    setUserInput('')
  }

  const getCustomerResponse = (customerId, agentMessage, state) => {
    const lowerMessage = agentMessage.toLowerCase()
    const newState = { ...state, responseCount: state.responseCount + 1 }
    
    // 키워드 감지
    const keywords = {
      price: ['가격', '할인', '비용', '저렴', '비싸', '돈', '원'],
      quality: ['품질', '좋', '성능', '효과', '기술'],
      rental: ['렌탈', '월', '계약', '기간'],
      service: ['서비스', 'as', '관리', '케어', '점검'],
      health: ['건강', '진드기', '알레르기', '아토피', '청결'],
      brand: ['코웨이', '브랜드', '회사', '믿'],
      comparison: ['다른', '비교', '경쟁', '타사'],
      benefit: ['혜택', '프로모션', '이벤트', '특가']
    }

    // 어떤 키워드가 언급되었는지 확인
    let mentionedKeyword = null
    for (const [key, words] of Object.entries(keywords)) {
      if (words.some(word => lowerMessage.includes(word))) {
        mentionedKeyword = key
        if (!newState.mentionedTopics.includes(key)) {
          newState.mentionedTopics.push(key)
        }
        break
      }
    }

    // 고객 유형별 응답 생성
    let responseText = ''
    
    if (customerId === 1) { // 가격 민감형
      responseText = getPriceSensitiveResponse(lowerMessage, mentionedKeyword, newState)
    } else if (customerId === 2) { // 품질 중시형
      responseText = getQualityFocusedResponse(lowerMessage, mentionedKeyword, newState)
    } else if (customerId === 3) { // 비교 검토형
      responseText = getComparisonResponse(lowerMessage, mentionedKeyword, newState)
    } else if (customerId === 4) { // 빠른 결정형
      responseText = getQuickDecisionResponse(lowerMessage, mentionedKeyword, newState)
    } else if (customerId === 5) { // 건강 관심형
      responseText = getHealthFocusedResponse(lowerMessage, mentionedKeyword, newState)
    }

    return { text: responseText, newState }
  }

  const getPriceSensitiveResponse = (message, keyword, state) => {
    const responses = {
      initial: [
        '안녕하세요. 솔직히 가격이 제일 걱정이에요. 얼마나 하나요?',
        '다른 곳이랑 비교해보고 있는데, 가격이 어떻게 되나요?',
        '좋아 보이긴 한데... 비싸면 부담스러울 것 같아요.'
      ],
      price: [
        '음... 생각보다 비싸네요. 할인은 안 되나요?',
        '다른 곳은 이것보다 2-3만원 저렴하던데요?',
        '이 가격이면 좀 부담스러운데... 더 저렴한 옵션은 없나요?',
        '한 달에 그 정도면... 1년이면 꽤 되는데요.'
      ],
      rental: [
        '렌탈이 정말 경제적인가요? 그냥 사는 게 낫지 않을까요?',
        '계약 기간이 길면 중간에 해지하면 위약금 많이 나오죠?',
        '월 렌탈료 외에 숨겨진 비용은 없나요?'
      ],
      benefit: [
        '프로모션이 지금이 제일 좋은 건가요? 다음 달엔 더 좋을 수도 있잖아요.',
        '혜택이 괜찮네요. 그런데 이것도 나중에 가격에 다 포함되는 거 아닌가요?',
        '첫 달 할인 좋은데, 그 다음부터는 비싸지는 거 아니에요?'
      ],
      service: [
        'A/S 비용 따로 안 나온다고 하셨는데, 정말 무료인가요?',
        '관리 서비스 좋긴 한데, 그만큼 렌탈료가 비싼 거 아닌가요?'
      ],
      considering: [
        '가격 대비 가치가 있을지 모르겠어요. 좀 더 설명해주세요.',
        '음... 고민되네요. 다른 사람들은 얼마에 하던가요?',
        '할인 더 받을 수 있는 방법은 없을까요?'
      ],
      positive: [
        '그렇게 말씀하시니 좀 나아 보이긴 하네요. 그래도 비싼 건 비싸잖아요?',
        '설명은 이해가 되는데... 그래도 가격이 걸리네요.',
        '장기적으로 보면 그럴 수도 있겠네요. 근데 지금 당장은 부담이에요.'
      ]
    }

    if (state.responseCount === 0) {
      return responses.initial[Math.floor(Math.random() * responses.initial.length)]
    }

    if (keyword === 'price' && responses.price) {
      return responses.price[Math.floor(Math.random() * responses.price.length)]
    }
    if (keyword === 'rental' && responses.rental) {
      return responses.rental[Math.floor(Math.random() * responses.rental.length)]
    }
    if (keyword === 'benefit' && responses.benefit) {
      return responses.benefit[Math.floor(Math.random() * responses.benefit.length)]
    }
    if (keyword === 'service' && responses.service) {
      return responses.service[Math.floor(Math.random() * responses.service.length)]
    }

    // 긍정적인 단어가 있으면
    if (message.includes('경제적') || message.includes('저렴') || message.includes('혜택') || message.includes('무료')) {
      return responses.positive[Math.floor(Math.random() * responses.positive.length)]
    }

    return responses.considering[Math.floor(Math.random() * responses.considering.length)]
  }

  const getQualityFocusedResponse = (message, keyword, state) => {
    const responses = {
      initial: [
        '안녕하세요. 품질이 정말 중요한데, 코웨이 제품 성능이 어떤가요?',
        '오래 사용할 건데, 내구성이나 품질은 믿을 만한가요?',
        '좋은 제품을 쓰고 싶어서요. 다른 브랜드랑 비교하면 어떤가요?'
      ],
      quality: [
        '구체적으로 어떤 기술이 들어가 있나요?',
        '품질 인증이나 테스트 결과 같은 게 있나요?',
        '실제 사용해보신 분들 만족도는 어떤가요?'
      ],
      brand: [
        '코웨이가 오래된 회사긴 한데, 최신 기술도 잘 따라가나요?',
        '브랜드는 믿을 만한데, 이 제품 자체의 성능은 검증됐나요?',
        '코웨이면 A/S망이 좋다고 들었는데, 정말 그런가요?'
      ],
      service: [
        'A/S 받을 때 정말 빨리 오나요? 기다리는 거 싫거든요.',
        '정기 관리할 때 꼼꼼하게 해주시나요?',
        '고장 나면 수리인가요, 교체인가요? 품질 유지가 중요해서요.'
      ],
      comparison: [
        '다른 프리미엄 브랜드랑 비교하면 어떤 차이가 있나요?',
        '가격이 비싼 만큼 성능 차이가 확실한가요?',
        '경쟁사 제품도 좋다던데, 왜 코웨이를 선택해야 하죠?'
      ],
      considering: [
        '설명은 좋은데, 실제로 써보면 어떨지 궁금하네요.',
        '품질이 좋다는 건 알겠는데, 증명할 수 있나요?',
        '장기간 사용해도 성능이 유지되나요?'
      ],
      positive: [
        '그 정도면 괜찮아 보이네요. 다른 기능도 설명해주세요.',
        '기술력은 인정할 만하네요. 실제 사용 후기는 어떤가요?',
        '품질은 확실히 좋아 보이네요. 가격은 어떻게 되나요?'
      ]
    }

    if (state.responseCount === 0) {
      return responses.initial[Math.floor(Math.random() * responses.initial.length)]
    }

    if (keyword === 'quality' && responses.quality) {
      return responses.quality[Math.floor(Math.random() * responses.quality.length)]
    }
    if (keyword === 'brand' && responses.brand) {
      return responses.brand[Math.floor(Math.random() * responses.brand.length)]
    }
    if (keyword === 'service' && responses.service) {
      return responses.service[Math.floor(Math.random() * responses.service.length)]
    }
    if (keyword === 'comparison' && responses.comparison) {
      return responses.comparison[Math.floor(Math.random() * responses.comparison.length)]
    }

    if (message.includes('좋') || message.includes('우수') || message.includes('최고') || message.includes('검증')) {
      return responses.positive[Math.floor(Math.random() * responses.positive.length)]
    }

    return responses.considering[Math.floor(Math.random() * responses.considering.length)]
  }

  const getComparisonResponse = (message, keyword, state) => {
    const responses = {
      initial: [
        '안녕하세요. 여러 제품 비교 중인데, 차이점을 알려주세요.',
        '다른 브랜드도 보고 있어서요. 코웨이만의 장점이 뭔가요?',
        '꼼꼼히 따져보고 싶은데, 상세 스펙 알 수 있을까요?'
      ],
      comparison: [
        'A사 제품은 이런 기능이 있던데, 코웨이는 어떤가요?',
        '가격 대비 성능을 따지면 어느 게 나을까요?',
        '각 브랜드별 장단점을 객관적으로 비교해주실 수 있나요?'
      ],
      quality: [
        '성능 테스트 결과나 비교 자료 같은 거 있나요?',
        '실제 수치로 비교하면 어떤 차이가 있나요?',
        '품질 인증이나 수상 경력 같은 게 있나요?'
      ],
      price: [
        '가격은 다른 곳보다 비싼데, 그만한 가치가 있나요?',
        '비슷한 가격대 제품들과 비교하면 어떤가요?',
        '가격 차이만큼 성능 차이도 확실한가요?'
      ],
      service: [
        'A/S 네트워크는 다른 회사랑 비교하면 어떤가요?',
        '사후 관리 서비스가 경쟁사보다 나은 점이 뭔가요?'
      ],
      considering: [
        '여러 가지 보고 있어서 결정이 쉽지 않네요.',
        '각각 장단점이 있어서 고민이에요.',
        '좀 더 비교해보고 결정하고 싶어요.'
      ],
      positive: [
        '설명 들으니 코웨이가 괜찮아 보이긴 하네요.',
        '차별점은 이해했어요. 다른 것도 비교해볼게요.',
        '장점은 알겠는데, 단점은 없나요?'
      ]
    }

    if (state.responseCount === 0) {
      return responses.initial[Math.floor(Math.random() * responses.initial.length)]
    }

    if (keyword === 'comparison' && responses.comparison) {
      return responses.comparison[Math.floor(Math.random() * responses.comparison.length)]
    }
    if (keyword === 'quality' && responses.quality) {
      return responses.quality[Math.floor(Math.random() * responses.quality.length)]
    }
    if (keyword === 'price' && responses.price) {
      return responses.price[Math.floor(Math.random() * responses.price.length)]
    }
    if (keyword === 'service' && responses.service) {
      return responses.service[Math.floor(Math.random() * responses.service.length)]
    }

    if (message.includes('차별') || message.includes('장점') || message.includes('우수')) {
      return responses.positive[Math.floor(Math.random() * responses.positive.length)]
    }

    return responses.considering[Math.floor(Math.random() * responses.considering.length)]
  }

  const getQuickDecisionResponse = (message, keyword, state) => {
    const responses = {
      initial: [
        '안녕하세요. 괜찮으면 바로 진행하고 싶은데, 어떤가요?',
        '빨리 결정하고 싶어요. 핵심만 간단히 설명해주세요.',
        '좋으면 오늘 바로 할 수 있나요?'
      ],
      positive: [
        '좋네요! 언제 설치 가능한가요?',
        '마음에 들어요. 바로 진행하면 되나요?',
        '괜찮은 것 같아요. 다음 단계가 뭔가요?',
        '오케이, 그럼 어떻게 하면 되죠?'
      ],
      price: [
        '가격 괜찮네요. 지금 신청하면 언제 받을 수 있어요?',
        '이 가격이면 할 만하네요. 바로 계약 가능한가요?',
        '프로모션 기간이 언제까지예요? 오늘 해야 하나요?'
      ],
      service: [
        '설치는 빠르게 되나요? 기다리는 거 싫어서요.',
        'A/S 신청하면 바로 오시나요?',
        '관리 서비스 일정은 제가 정할 수 있나요?'
      ],
      process: [
        '절차가 복잡한가요? 간단했으면 좋겠어요.',
        '서류 작업 많이 필요한가요?',
        '오늘 신청하면 언제부터 사용할 수 있어요?'
      ],
      considering: [
        '음... 그 부분만 확인하면 바로 결정할게요.',
        '다른 건 다 좋은데, 그것만 확인하고 싶어요.',
        '거의 마음 정했어요. 마지막으로 확인할 게 있어요.'
      ]
    }

    if (state.responseCount === 0) {
      return responses.initial[Math.floor(Math.random() * responses.initial.length)]
    }

    // 긍정적 반응
    if (message.includes('좋') || message.includes('괜찮') || message.includes('마음') || message.includes('결정')) {
      return responses.positive[Math.floor(Math.random() * responses.positive.length)]
    }

    if (keyword === 'price' && responses.price) {
      return responses.price[Math.floor(Math.random() * responses.price.length)]
    }
    if (keyword === 'service' && responses.service) {
      return responses.service[Math.floor(Math.random() * responses.service.length)]
    }
    if (message.includes('절차') || message.includes('방법') || message.includes('어떻게')) {
      return responses.process[Math.floor(Math.random() * responses.process.length)]
    }

    return responses.considering[Math.floor(Math.random() * responses.considering.length)]
  }

  const getHealthFocusedResponse = (message, keyword, state) => {
    const responses = {
      initial: [
        '안녕하세요. 가족 건강 때문에 알아보고 있어요.',
        '아이가 알레르기가 있어서 걱정인데, 도움이 될까요?',
        '집안 공기나 물 때문에 건강이 걱정돼요.'
      ],
      health: [
        '진짜 건강에 도움이 되나요? 체감할 수 있을까요?',
        '알레르기나 아토피에 효과가 있나요?',
        '얼마나 사용해야 효과를 볼 수 있나요?',
        '의학적으로 검증된 건가요?'
      ],
      quality: [
        '살균이나 제균 효과가 정말 99.9%인가요?',
        '유해 물질 제거는 확실한가요?',
        '필터 성능이 떨어지면 건강에 안 좋을 텐데, 관리가 중요하겠네요.'
      ],
      service: [
        '정기 관리 안 받으면 오히려 건강에 안 좋을 수도 있잖아요?',
        '필터 교체 시기를 놓치면 어떻게 되나요?',
        '위생 관리는 어떻게 하시나요?'
      ],
      price: [
        '건강을 위한 거니까 가격은 크게 상관없어요.',
        '효과가 확실하다면 투자할 가치가 있죠.',
        '가족 건강이 우선이니까요. 성능이 중요해요.'
      ],
      considering: [
        '실제 사용자들 건강 개선 사례가 있나요?',
        '우리 집 상황에 맞는 제품인지 확인하고 싶어요.',
        '전문가 의견이나 추천이 있나요?'
      ],
      positive: [
        '건강에 좋다니 안심이 되네요. 더 자세히 알려주세요.',
        '효과가 있다면 꼭 해야겠어요.',
        '가족 건강을 위해서라면 해야죠. 언제 시작할 수 있나요?'
      ]
    }

    if (state.responseCount === 0) {
      return responses.initial[Math.floor(Math.random() * responses.initial.length)]
    }

    if (keyword === 'health' && responses.health) {
      return responses.health[Math.floor(Math.random() * responses.health.length)]
    }
    if (keyword === 'quality' && responses.quality) {
      return responses.quality[Math.floor(Math.random() * responses.quality.length)]
    }
    if (keyword === 'service' && responses.service) {
      return responses.service[Math.floor(Math.random() * responses.service.length)]
    }
    if (keyword === 'price' && responses.price) {
      return responses.price[Math.floor(Math.random() * responses.price.length)]
    }

    if (message.includes('효과') || message.includes('개선') || message.includes('도움')) {
      return responses.positive[Math.floor(Math.random() * responses.positive.length)]
    }

    return responses.considering[Math.floor(Math.random() * responses.considering.length)]
  }

  const resetSimulation = () => {
    setSelectedCustomer(null)
    setConversation([])
    setConversationState({
      stage: 'initial',
      mentionedTopics: [],
      responseCount: 0
    })
    setUserInput('')
    setShowTips(false)
    if (isListening && recognition) {
      recognition.stop()
      setIsListening(false)
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
      
      alert(`${browserInfo}\n\n권장 브라우저:\n- Android: Chrome\n- iOS: Safari (14.5 이상)`)
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
      try {
        setUserInput('')
        recognition.start()
        console.log('✅ recognition.start() 호출 완료')
      } catch (error) {
        console.error('❌ Start recognition error:', error)
        setIsListening(false)
        
        if (error.message && error.message.includes('already started')) {
          alert('음성 인식이 이미 실행 중입니다.\n\n잠시 후 다시 시도해주세요.')
        } else {
          alert(`음성 인식 시작 오류\n\n페이지를 새로고침하고 다시 시도해주세요.\n\n오류: ${error.message}`)
        }
      }
    }
  }

  return (
    <div className="simulator">
      <div className="simulator-header">
        <h1>🎭 고객 시나리오 시뮬레이터</h1>
        <p>다양한 고객 유형과 실전 대화를 연습하세요</p>
      </div>

      {!selectedCustomer ? (
        <div className="customer-selection">
          <h2>고객 유형을 선택하세요</h2>
          <div className="customer-grid">
            {customerTypes.map(customer => (
              <div key={customer.id} className="customer-card" onClick={() => startSimulation(customer)}>
                <div className="customer-icon">{customer.icon}</div>
                <h3>{customer.name}</h3>
                <p>{customer.description}</p>
              </div>
            ))}
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
              <button onClick={() => setShowTips(!showTips)} className="tips-btn">
                💡 {showTips ? '팁 숨기기' : '팁 보기'}
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

          <div className="conversation-area">
            {conversation.map((msg, index) => (
              <div key={index} className={`message ${msg.speaker}`}>
                <div className="message-bubble">
                  {msg.text}
                </div>
              </div>
            ))}
          </div>

          <div className="input-area">
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
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder={isListening ? "듣고 있습니다..." : "고객에게 할 말을 입력하거나 음성으로 말하세요..."}
              disabled={isListening}
            />
            <button onClick={handleSendMessage} className="send-btn" disabled={isListening}>
              전송
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default CustomerSimulator
