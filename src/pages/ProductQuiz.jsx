import { useState, useEffect } from 'react'
import './ProductQuiz.css'

function ProductQuiz() {
  const [currentQuiz, setCurrentQuiz] = useState(0)
  const [score, setScore] = useState(0)
  const [showResult, setShowResult] = useState(false)
  const [selectedAnswer, setSelectedAnswer] = useState(null)
  const [answeredQuestions, setAnsweredQuestions] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('random')
  const [quizSet, setQuizSet] = useState([])
  const [showCategorySelect, setShowCategorySelect] = useState(true)

  const categories = [
    { id: 'random', name: '랜덤 (전체)', icon: '🎲', color: '#667eea' },
    { id: 'mattress', name: '매트리스 케어', icon: '🛏️', color: '#f093fb' },
    { id: 'airpurifier', name: '공기청정기', icon: '💨', color: '#4facfe' },
    { id: 'waterpurifier', name: '정수기', icon: '💧', color: '#43e97b' },
    { id: 'bidet', name: '비데', icon: '🚽', color: '#fa709a' },
    { id: 'softener', name: '연수기', icon: '🚿', color: '#fee140' },
    { id: 'massagechair', name: '안마의자', icon: '💺', color: '#30cfd0' },
    { id: 'rental', name: '렌탈 시스템', icon: '📋', color: '#a8edea' },
    { id: 'sales', name: '영업 기법', icon: '💼', color: '#ffecd2' },
    { id: 'customer', name: '고객 응대', icon: '🤝', color: '#ff9a9e' }
  ]

  const allQuizzes = [
    // 매트리스 케어 (15개)
    {
      id: 1,
      category: 'mattress',
      question: '일반 가정의 매트리스에 서식하는 평균 진드기 수는?',
      options: ['약 10만 마리', '약 100만 마리', '약 200만 마리', '약 500만 마리'],
      correct: 2,
      explanation: '3-5년 사용한 매트리스에는 평균 200만 마리의 진드기가 서식합니다. 정기적인 케어가 필수입니다.'
    },
    {
      id: 2,
      category: 'mattress',
      question: '매트리스 케어 서비스의 UV 살균 효과는?',
      options: ['90% 세균 제거', '95% 세균 제거', '99% 세균 제거', '99.9% 세균 제거'],
      correct: 3,
      explanation: 'UV 살균은 99.9%의 세균을 제거하여 위생적인 수면 환경을 만들어줍니다.'
    },
    {
      id: 3,
      category: 'mattress',
      question: '매트리스 케어는 몇 단계로 진행되나요?',
      options: ['2단계', '3단계', '4단계', '5단계'],
      correct: 1,
      explanation: 'UV 살균, 강력 흡입, 탈취의 3단계로 진행됩니다.'
    },
    {
      id: 4,
      category: 'mattress',
      question: '매트리스 케어 권장 주기는?',
      options: ['1개월', '3개월', '6개월', '1년'],
      correct: 2,
      explanation: '6개월마다 정기적으로 케어받는 것이 가장 효과적입니다.'
    },
    {
      id: 5,
      category: 'mattress',
      question: '3년 된 매트리스 무게의 몇 %가 진드기 사체인가요?',
      options: ['5%', '10%', '15%', '20%'],
      correct: 1,
      explanation: '3년 된 매트리스는 무게의 약 10%가 진드기 사체와 배설물입니다.'
    },
    {
      id: 6,
      category: 'mattress',
      question: '매트리스 케어로 제거할 수 있는 것은?',
      options: ['진드기만', '먼지만', '진드기, 먼지, 세균, 냄새', '냄새만'],
      correct: 2,
      explanation: '진드기, 먼지, 세균, 냄새를 모두 제거할 수 있습니다.'
    },
    {
      id: 7,
      category: 'mattress',
      question: '매트리스에 가장 많이 서식하는 진드기 종류는?',
      options: ['집먼지 진드기', '옴 진드기', '털 진드기', '꽃가루 진드기'],
      correct: 0,
      explanation: '집먼지 진드기가 가장 흔하며, 알레르기의 주요 원인입니다.'
    },
    {
      id: 8,
      category: 'mattress',
      question: '매트리스 케어 1회 소요 시간은?',
      options: ['10분', '20분', '30분', '1시간'],
      correct: 2,
      explanation: '퀸 사이즈 기준 약 30분 정도 소요됩니다.'
    },
    {
      id: 9,
      category: 'mattress',
      question: '매트리스 케어가 특히 필요한 고객은?',
      options: ['혼자 사는 사람', '알레르기 환자', '젊은 사람', '운동선수'],
      correct: 1,
      explanation: '알레르기, 아토피, 천식 환자에게 특히 필요합니다.'
    },
    {
      id: 10,
      category: 'mattress',
      question: '매트리스 케어 후 즉시 사용 가능한가요?',
      options: ['즉시 가능', '1시간 후', '3시간 후', '다음날'],
      correct: 0,
      explanation: '케어 후 바로 사용 가능하며, 화학약품을 사용하지 않아 안전합니다.'
    },
    {
      id: 11,
      category: 'mattress',
      question: '매트리스 케어 시 이불도 함께 케어 가능한가요?',
      options: ['불가능', '추가 비용 필요', '무료로 가능', '계절에 따라 다름'],
      correct: 1,
      explanation: '이불, 베개 등도 추가 비용으로 케어 가능합니다.'
    },
    {
      id: 12,
      category: 'mattress',
      question: '매트리스 케어의 가장 큰 효과는?',
      options: ['매트리스 수명 연장', '알레르기 증상 완화', '수면의 질 향상', '모두 해당'],
      correct: 3,
      explanation: '수명 연장, 알레르기 완화, 수면 질 향상 모두 가능합니다.'
    },
    {
      id: 13,
      category: 'mattress',
      question: '매트리스 케어 시 사용하는 UV 파장은?',
      options: ['UV-A', 'UV-B', 'UV-C', '적외선'],
      correct: 2,
      explanation: 'UV-C는 살균력이 가장 강한 자외선입니다.'
    },
    {
      id: 14,
      category: 'mattress',
      question: '매트리스 케어 후 고객 만족도는?',
      options: ['70%', '80%', '90%', '95% 이상'],
      correct: 3,
      explanation: '고객 만족도가 95% 이상으로 매우 높습니다.'
    },
    {
      id: 15,
      category: 'mattress',
      question: '매트리스 케어를 하지 않으면 발생할 수 있는 문제는?',
      options: ['알레르기', '피부 질환', '호흡기 질환', '모두 해당'],
      correct: 3,
      explanation: '진드기로 인한 알레르기, 피부 질환, 호흡기 질환이 모두 발생할 수 있습니다.'
    },

    // 공기청정기 (20개)
    {
      id: 16,
      category: 'airpurifier',
      question: '코웨이 공기청정기가 제거할 수 있는 미세먼지 크기는?',
      options: ['1.0 마이크로미터', '0.5 마이크로미터', '0.3 마이크로미터', '0.1 마이크로미터'],
      correct: 2,
      explanation: '0.3 마이크로미터 초미세먼지까지 99.9% 제거 가능합니다.'
    },
    {
      id: 17,
      category: 'airpurifier',
      question: '공기청정기 필터는 몇 단계로 구성되나요?',
      options: ['2단계', '3단계', '4단계', '5단계'],
      correct: 2,
      explanation: '프리필터, 헤파필터, 활성탄 필터, 항균필터 4단계입니다.'
    },
    {
      id: 18,
      category: 'airpurifier',
      question: '헤파필터의 미세먼지 제거율은?',
      options: ['95%', '97%', '99%', '99.97%'],
      correct: 3,
      explanation: '헤파필터는 99.97%의 초미세먼지를 제거합니다.'
    },
    {
      id: 19,
      category: 'airpurifier',
      question: '공기청정기 필터 교체 주기는?',
      options: ['3개월', '6개월', '1년', '2년'],
      correct: 2,
      explanation: '필터는 1년마다 교체하며, 렌탈 시 무상 제공됩니다.'
    },
    {
      id: 20,
      category: 'airpurifier',
      question: '30평대 아파트 전체 공기 정화 소요 시간은?',
      options: ['10분', '20분', '30분', '1시간'],
      correct: 1,
      explanation: '30평대 기준 약 20분이면 전체 공기를 정화할 수 있습니다.'
    },
    {
      id: 21,
      category: 'airpurifier',
      question: '공기청정기 수면 모드 소음은?',
      options: ['15dB', '25dB', '35dB', '45dB'],
      correct: 1,
      explanation: '수면 모드는 25dB로 도서관보다 조용합니다.'
    },
    {
      id: 22,
      category: 'airpurifier',
      question: '공기청정기 24시간 가동 시 월 전기료는?',
      options: ['1천원', '3천원', '5천원', '1만원'],
      correct: 1,
      explanation: '1등급 에너지 효율로 24시간 가동해도 월 3천원 정도입니다.'
    },
    {
      id: 23,
      category: 'airpurifier',
      question: '활성탄 필터의 주요 기능은?',
      options: ['미세먼지 제거', '냄새 제거', '세균 제거', '습도 조절'],
      correct: 1,
      explanation: '활성탄 필터는 냄새와 유해 가스를 제거합니다.'
    },
    {
      id: 24,
      category: 'airpurifier',
      question: '공기청정기 IoT 기능으로 할 수 있는 것은?',
      options: ['원격 제어만', '공기질 확인만', '필터 교체 알림만', '모두 가능'],
      correct: 3,
      explanation: '원격 제어, 공기질 확인, 필터 교체 알림 모두 가능합니다.'
    },
    {
      id: 25,
      category: 'airpurifier',
      question: '공기청정기가 제거할 수 있는 것은?',
      options: ['미세먼지만', '바이러스만', '냄새만', '미세먼지, 바이러스, 냄새 모두'],
      correct: 3,
      explanation: '미세먼지, 바이러스, 세균, 냄새를 모두 제거할 수 있습니다.'
    },
    {
      id: 26,
      category: 'airpurifier',
      question: '공기청정기 자동 모드의 작동 원리는?',
      options: ['시간에 따라', '공기질 센서로 감지', '수동 조절', '랜덤'],
      correct: 1,
      explanation: '공기질 센서가 실시간으로 감지하여 자동으로 풍량을 조절합니다.'
    },
    {
      id: 27,
      category: 'airpurifier',
      question: '공기청정기 사용이 특히 필요한 계절은?',
      options: ['봄', '여름', '가을', '사계절 모두'],
      correct: 3,
      explanation: '봄 황사, 여름 에어컨 먼지, 가을 환절기, 겨울 난방 먼지로 사계절 필요합니다.'
    },
    {
      id: 28,
      category: 'airpurifier',
      question: '펫 전용 필터의 특징은?',
      options: ['털 제거 강화', '냄새 제거 강화', '세균 제거 강화', '털과 냄새 모두 강화'],
      correct: 3,
      explanation: '반려동물 털과 냄새를 동시에 강력하게 제거합니다.'
    },
    {
      id: 29,
      category: 'airpurifier',
      question: '공기청정기 프리필터의 역할은?',
      options: ['초미세먼지 제거', '큰 먼지 제거', '냄새 제거', '세균 제거'],
      correct: 1,
      explanation: '프리필터는 큰 먼지와 털을 1차로 걸러냅니다.'
    },
    {
      id: 30,
      category: 'airpurifier',
      question: '공기청정기 설치 최적 위치는?',
      options: ['창문 옆', '벽 모서리', '방 중앙', '현관 근처'],
      correct: 1,
      explanation: '벽 모서리에 설치하면 공기 순환이 가장 효율적입니다.'
    },
    {
      id: 31,
      category: 'airpurifier',
      question: '공기청정기 사용 시 창문은?',
      options: ['항상 열어둔다', '항상 닫는다', '1시간마다 환기', '상관없다'],
      correct: 1,
      explanation: '창문을 닫고 사용해야 효과가 극대화됩니다.'
    },
    {
      id: 32,
      category: 'airpurifier',
      question: '공기청정기 청소 주기는?',
      options: ['매일', '1주일', '1개월', '6개월'],
      correct: 2,
      explanation: '외부는 1개월마다, 프리필터는 2주마다 청소하는 것이 좋습니다.'
    },
    {
      id: 33,
      category: 'airpurifier',
      question: '공기청정기 효과를 가장 빨리 느낄 수 있는 증상은?',
      options: ['두통', '알레르기', '피로', '불면증'],
      correct: 1,
      explanation: '알레르기 증상이 가장 빨리 개선됩니다.'
    },
    {
      id: 34,
      category: 'airpurifier',
      question: '공기청정기 권장 사용 시간은?',
      options: ['외출 시만', '잠잘 때만', '24시간', '미세먼지 나쁠 때만'],
      correct: 2,
      explanation: '24시간 가동하는 것이 가장 효과적입니다.'
    },
    {
      id: 35,
      category: 'airpurifier',
      question: '공기청정기 인증 마크 중 가장 중요한 것은?',
      options: ['디자인 상', '에너지 효율', '한국공기청정협회 인증', 'CE 마크'],
      correct: 2,
      explanation: '한국공기청정협회 인증이 성능을 보증합니다.'
    },

    // 정수기 (20개)
    {
      id: 36,
      category: 'waterpurifier',
      question: '코웨이 정수기의 핵심 기술은?',
      options: ['역삼투압(RO)', '이온수 생성', '자외선 살균', '나노 필터'],
      correct: 0,
      explanation: '역삼투압(RO) 방식으로 미세한 불순물까지 제거합니다.'
    },
    {
      id: 37,
      category: 'waterpurifier',
      question: '직수형 정수기의 가장 큰 장점은?',
      options: ['빠른 속도', '세균 번식 방지', '저렴한 가격', '큰 용량'],
      correct: 1,
      explanation: '물탱크가 없어 세균 번식 걱정이 없습니다.'
    },
    {
      id: 38,
      category: 'waterpurifier',
      question: '정수기 필터는 몇 단계로 구성되나요?',
      options: ['2단계', '3단계', '4단계', '5단계'],
      correct: 2,
      explanation: '4단계 필터로 중금속, 녹물, 염소를 제거합니다.'
    },
    {
      id: 39,
      category: 'waterpurifier',
      question: '정수기 필터 교체 주기는?',
      options: ['3개월', '6개월', '1년', '2년'],
      correct: 1,
      explanation: '6개월마다 필터를 교체하며, 렌탈 시 무상입니다.'
    },
    {
      id: 40,
      category: 'waterpurifier',
      question: '정수기 냉온수 온도 단계는?',
      options: ['2단계', '3단계', '4단계', '5단계'],
      correct: 2,
      explanation: '냉수, 정수, 온수, 열수 4단계로 조절 가능합니다.'
    },
    {
      id: 41,
      category: 'waterpurifier',
      question: '정수기가 제거할 수 있는 것은?',
      options: ['중금속만', '염소만', '녹물만', '중금속, 염소, 녹물 모두'],
      correct: 3,
      explanation: '중금속, 염소, 녹물, 세균을 모두 제거합니다.'
    },
    {
      id: 42,
      category: 'waterpurifier',
      question: '정수기 정기 관리 주기는?',
      options: ['1개월', '3개월', '6개월', '1년'],
      correct: 2,
      explanation: '6개월마다 전문가가 방문하여 관리합니다.'
    },
    {
      id: 43,
      category: 'waterpurifier',
      question: '정수기 하루 권장 물 섭취량은?',
      options: ['1리터', '1.5리터', '2리터', '3리터'],
      correct: 2,
      explanation: '성인 기준 하루 2리터가 권장량입니다.'
    },
    {
      id: 44,
      category: 'waterpurifier',
      question: '정수기 물과 생수의 차이는?',
      options: ['생수가 더 깨끗', '정수기 물이 더 깨끗', '차이 없음', '상황에 따라 다름'],
      correct: 1,
      explanation: '정수기는 실시간 정수로 생수보다 신선하고 깨끗합니다.'
    },
    {
      id: 45,
      category: 'waterpurifier',
      question: '정수기 IoT 기능으로 확인할 수 있는 것은?',
      options: ['물 사용량', '필터 상태', '온도 설정', '모두 가능'],
      correct: 3,
      explanation: '물 사용량, 필터 상태, 온도 설정을 모두 확인 가능합니다.'
    },
    {
      id: 46,
      category: 'waterpurifier',
      question: '정수기 설치 최적 위치는?',
      options: ['싱크대 위', '싱크대 옆', '거실', '어디든 상관없음'],
      correct: 1,
      explanation: '싱크대 옆이 사용과 관리에 가장 편리합니다.'
    },
    {
      id: 47,
      category: 'waterpurifier',
      question: '정수기 물로 요리하면?',
      options: ['맛이 없다', '영양소 파괴', '맛이 더 좋다', '차이 없다'],
      correct: 2,
      explanation: '불순물이 없어 음식 본연의 맛이 살아납니다.'
    },
    {
      id: 48,
      category: 'waterpurifier',
      question: '정수기 렌탈 vs 구매, 3년 기준 더 경제적인 것은?',
      options: ['렌탈', '구매', '비슷함', '상황에 따라'],
      correct: 0,
      explanation: '렌탈은 관리비, 필터비, A/S비가 포함되어 더 경제적입니다.'
    },
    {
      id: 49,
      category: 'waterpurifier',
      question: '정수기 물의 TDS(총용존고형물) 수치는?',
      options: ['0-10ppm', '10-30ppm', '30-50ppm', '50-100ppm'],
      correct: 0,
      explanation: 'RO 정수기는 TDS 0-10ppm으로 매우 깨끗합니다.'
    },
    {
      id: 50,
      category: 'waterpurifier',
      question: '정수기 사용 시 생수 구매 대비 연간 절약 금액은?',
      options: ['10만원', '30만원', '50만원', '100만원'],
      correct: 2,
      explanation: '4인 가족 기준 연간 약 50만원 절약됩니다.'
    },
    {
      id: 51,
      category: 'waterpurifier',
      question: '정수기 열수 온도는?',
      options: ['70도', '80도', '90도', '100도'],
      correct: 2,
      explanation: '열수는 약 90도로 차나 커피를 바로 만들 수 있습니다.'
    },
    {
      id: 52,
      category: 'waterpurifier',
      question: '정수기 냉수 온도는?',
      options: ['2-5도', '5-8도', '8-10도', '10-15도'],
      correct: 1,
      explanation: '냉수는 5-8도로 시원하게 유지됩니다.'
    },
    {
      id: 53,
      category: 'waterpurifier',
      question: '정수기 필터 중 가장 중요한 것은?',
      options: ['프리필터', 'RO 멤브레인', '활성탄 필터', '후처리 필터'],
      correct: 1,
      explanation: 'RO 멤브레인이 미세 불순물을 제거하는 핵심입니다.'
    },
    {
      id: 54,
      category: 'waterpurifier',
      question: '정수기 물 맛이 이상할 때 원인은?',
      options: ['필터 교체 시기', '물탱크 오염', '배관 문제', '모두 가능'],
      correct: 3,
      explanation: '필터, 물탱크, 배관 모두 원인이 될 수 있어 점검이 필요합니다.'
    },
    {
      id: 55,
      category: 'waterpurifier',
      question: '정수기 고객 만족도는?',
      options: ['80%', '85%', '90%', '95% 이상'],
      correct: 3,
      explanation: '정수기는 고객 만족도가 95% 이상으로 매우 높습니다.'
    },

    // 비데 (15개)
    {
      id: 56,
      category: 'bidet',
      question: '비데 노즐 자동 세척 주기는?',
      options: ['사용 전', '사용 후', '사용 전후', '1일 1회'],
      correct: 2,
      explanation: '사용 전후 자동으로 노즐을 세척하여 위생적입니다.'
    },
    {
      id: 57,
      category: 'bidet',
      question: '비데 수압 조절 단계는?',
      options: ['3단계', '5단계', '7단계', '10단계'],
      correct: 1,
      explanation: '5단계로 세밀하게 수압을 조절할 수 있습니다.'
    },
    {
      id: 58,
      category: 'bidet',
      question: '비데 온도 조절 단계는?',
      options: ['3단계', '4단계', '5단계', '6단계'],
      correct: 1,
      explanation: '4단계로 온도를 조절할 수 있습니다.'
    },
    {
      id: 59,
      category: 'bidet',
      question: '비데 사용이 특히 좋은 질환은?',
      options: ['치질', '변비', '피부 질환', '모두 해당'],
      correct: 3,
      explanation: '치질, 변비, 피부 질환 모두에 도움이 됩니다.'
    },
    {
      id: 60,
      category: 'bidet',
      question: '비데 여성 전용 모드의 특징은?',
      options: ['수압 약함', '온도 높음', '부드러운 세정', '시간 짧음'],
      correct: 2,
      explanation: '여성 청결을 위한 부드러운 세정 모드입니다.'
    },
    {
      id: 61,
      category: 'bidet',
      question: '비데 어린이 모드의 특징은?',
      options: ['수압 약함', '온도 낮음', '시간 짧음', '수압 약하고 온도 적정'],
      correct: 3,
      explanation: '어린이에게 적합한 약한 수압과 적정 온도로 설정됩니다.'
    },
    {
      id: 62,
      category: 'bidet',
      question: '비데 정기 관리 주기는?',
      options: ['3개월', '6개월', '1년', '2년'],
      correct: 1,
      explanation: '6개월마다 전문가가 방문하여 관리합니다.'
    },
    {
      id: 63,
      category: 'bidet',
      question: '비데 사용 시 화장지 사용량은?',
      options: ['변화 없음', '30% 감소', '50% 감소', '80% 감소'],
      correct: 3,
      explanation: '비데 사용 시 화장지 사용량이 약 80% 감소합니다.'
    },
    {
      id: 64,
      category: 'bidet',
      question: '비데 설치 소요 시간은?',
      options: ['10분', '30분', '1시간', '2시간'],
      correct: 1,
      explanation: '전문가가 약 30분이면 설치를 완료합니다.'
    },
    {
      id: 65,
      category: 'bidet',
      question: '비데 월 전기료는?',
      options: ['500원', '1천원', '2천원', '5천원'],
      correct: 1,
      explanation: '월 전기료는 약 1천원 정도로 매우 저렴합니다.'
    },
    {
      id: 66,
      category: 'bidet',
      question: '비데 건조 기능의 온도는?',
      options: ['30도', '40도', '50도', '60도'],
      correct: 1,
      explanation: '약 40도의 따뜻한 바람으로 건조합니다.'
    },
    {
      id: 67,
      category: 'bidet',
      question: '비데 사용 후 피부 개선 효과는?',
      options: ['없음', '약간 있음', '보통', '매우 좋음'],
      correct: 3,
      explanation: '물 세정으로 피부 자극이 줄어 피부 개선 효과가 큽니다.'
    },
    {
      id: 68,
      category: 'bidet',
      question: '비데 노즐 재질은?',
      options: ['플라스틱', '스테인리스', '항균 플라스틱', '세라믹'],
      correct: 2,
      explanation: '항균 처리된 플라스틱으로 위생적입니다.'
    },
    {
      id: 69,
      category: 'bidet',
      question: '비데 리모컨 방수 기능은?',
      options: ['없음', '생활 방수', '완전 방수', '모델마다 다름'],
      correct: 1,
      explanation: '생활 방수 기능으로 화장실에서 안전하게 사용 가능합니다.'
    },
    {
      id: 70,
      category: 'bidet',
      question: '비데 고객 만족도는?',
      options: ['70%', '80%', '90%', '95% 이상'],
      correct: 3,
      explanation: '비데는 고객 만족도가 95% 이상으로 매우 높습니다.'
    },

    // 연수기 (10개)
    {
      id: 71,
      category: 'softener',
      question: '연수기가 제거하는 주요 성분은?',
      options: ['염소', '칼슘과 마그네슘', '중금속', '세균'],
      correct: 1,
      explanation: '칼슘과 마그네슘을 제거하여 물을 부드럽게 만듭니다.'
    },
    {
      id: 72,
      category: 'softener',
      question: '연수기 사용 후 가장 먼저 느끼는 효과는?',
      options: ['피부 개선', '머리카락 부드러움', '물때 감소', '모두 동시에'],
      correct: 3,
      explanation: '피부, 머리카락, 물때 모두 즉시 개선됩니다.'
    },
    {
      id: 73,
      category: 'softener',
      question: '연수기 필터 교체 주기는?',
      options: ['3개월', '6개월', '1년', '2년'],
      correct: 2,
      explanation: '6개월마다 필터를 교체합니다.'
    },
    {
      id: 74,
      category: 'softener',
      question: '연수기 사용 시 샴푸 사용량은?',
      options: ['증가', '변화 없음', '30% 감소', '50% 감소'],
      correct: 3,
      explanation: '거품이 잘 나서 샴푸 사용량이 약 50% 감소합니다.'
    },
    {
      id: 75,
      category: 'softener',
      question: '연수기가 특히 필요한 지역은?',
      options: ['서울', '경기', '강원', '경수 지역 모두'],
      correct: 3,
      explanation: '경수(센물) 지역에서 특히 효과가 큽니다.'
    },
    {
      id: 76,
      category: 'softener',
      question: '연수기 사용 후 욕실 청소 횟수는?',
      options: ['증가', '변화 없음', '30% 감소', '50% 감소'],
      correct: 3,
      explanation: '물때가 안 생겨서 청소 횟수가 약 50% 감소합니다.'
    },
    {
      id: 77,
      category: 'softener',
      question: '연수기 설치 위치는?',
      options: ['싱크대', '화장실 입구', '보일러실', '어디든 가능'],
      correct: 2,
      explanation: '보일러실 메인 배관에 설치하여 집 전체에 연수를 공급합니다.'
    },
    {
      id: 78,
      category: 'softener',
      question: '연수기 사용 시 피부 개선 효과는?',
      options: ['1주일', '2주일', '1개월', '즉시'],
      correct: 3,
      explanation: '사용 즉시 피부 당김이 없어지는 것을 느낄 수 있습니다.'
    },
    {
      id: 79,
      category: 'softener',
      question: '연수기 월 유지비는?',
      options: ['없음', '1천원', '3천원', '5천원'],
      correct: 0,
      explanation: '전기를 사용하지 않아 유지비가 거의 없습니다.'
    },
    {
      id: 80,
      category: 'softener',
      question: '연수기 고객 만족도는?',
      options: ['70%', '80%', '90%', '95% 이상'],
      correct: 3,
      explanation: '연수기는 효과가 즉시 나타나 만족도가 매우 높습니다.'
    },

    // 안마의자 (10개)
    {
      id: 81,
      category: 'massagechair',
      question: '안마의자 하루 권장 사용 시간은?',
      options: ['10분', '15분', '30분', '1시간'],
      correct: 1,
      explanation: '하루 15분 정도가 가장 효과적입니다.'
    },
    {
      id: 82,
      category: 'massagechair',
      question: '안마의자가 마사지할 수 있는 부위는?',
      options: ['목, 어깨만', '허리만', '다리만', '전신'],
      correct: 3,
      explanation: '목, 어깨, 허리, 다리 등 전신 마사지가 가능합니다.'
    },
    {
      id: 83,
      category: 'massagechair',
      question: '안마의자 마사지 강도 조절은?',
      options: ['3단계', '5단계', '7단계', '10단계'],
      correct: 1,
      explanation: '5단계로 세밀하게 강도를 조절할 수 있습니다.'
    },
    {
      id: 84,
      category: 'massagechair',
      question: '안마의자 사용이 특히 좋은 증상은?',
      options: ['목 디스크', '허리 통증', '다리 부종', '모두 해당'],
      correct: 3,
      explanation: '목, 허리, 다리 통증 모두에 효과적입니다.'
    },
    {
      id: 85,
      category: 'massagechair',
      question: '안마의자 월 전기료는?',
      options: ['1천원', '3천원', '5천원', '1만원'],
      correct: 1,
      explanation: '하루 15분 사용 시 월 전기료는 약 1천원입니다.'
    },
    {
      id: 86,
      category: 'massagechair',
      question: '안마의자 vs 마사지샵, 1년 기준 경제성은?',
      options: ['마사지샵', '안마의자', '비슷함', '상황에 따라'],
      correct: 1,
      explanation: '마사지샵 월 10만원 vs 안마의자 렌탈 월 5만원으로 안마의자가 경제적입니다.'
    },
    {
      id: 87,
      category: 'massagechair',
      question: '안마의자 자동 프로그램 개수는?',
      options: ['3개', '5개', '10개', '15개'],
      correct: 2,
      explanation: '약 10개의 자동 프로그램이 있어 다양하게 선택 가능합니다.'
    },
    {
      id: 88,
      category: 'massagechair',
      question: '안마의자 사용 금지 대상은?',
      options: ['임산부', '골다공증 환자', '심장 질환자', '모두 해당'],
      correct: 3,
      explanation: '임산부, 골다공증, 심장 질환자는 사용 전 의사와 상담이 필요합니다.'
    },
    {
      id: 89,
      category: 'massagechair',
      question: '안마의자 정기 관리 주기는?',
      options: ['3개월', '6개월', '1년', '2년'],
      correct: 2,
      explanation: '1년마다 전문가가 방문하여 점검합니다.'
    },
    {
      id: 90,
      category: 'massagechair',
      question: '안마의자 고객 만족도는?',
      options: ['70%', '80%', '90%', '95% 이상'],
      correct: 2,
      explanation: '안마의자는 고객 만족도가 90% 이상입니다.'
    },

    // 렌탈 시스템 (15개)
    {
      id: 91,
      category: 'rental',
      question: '코웨이 렌탈의 가장 큰 장점은?',
      options: ['저렴한 가격', '초기 비용 부담 없음', '다양한 색상', '빠른 배송'],
      correct: 1,
      explanation: '초기 비용 부담 없이 시작할 수 있고, 정기 관리와 무상 A/S가 포함됩니다.'
    },
    {
      id: 92,
      category: 'rental',
      question: '렌탈 약정 기간은?',
      options: ['1년', '2년', '3년', '5년'],
      correct: 2,
      explanation: '일반적으로 3년 약정이며, 재계약 시 혜택이 있습니다.'
    },
    {
      id: 93,
      category: 'rental',
      question: '렌탈 시 포함되는 서비스는?',
      options: ['필터 교체만', 'A/S만', '정기 관리만', '모두 포함'],
      correct: 3,
      explanation: '필터 교체, A/S, 정기 관리가 모두 무상으로 포함됩니다.'
    },
    {
      id: 94,
      category: 'rental',
      question: '렌탈 정기 관리 주기는?',
      options: ['1개월', '3개월', '6개월', '1년'],
      correct: 2,
      explanation: '6개월마다 전문가가 방문하여 관리합니다.'
    },
    {
      id: 95,
      category: 'rental',
      question: '렌탈 vs 구매, 5년 기준 더 경제적인 것은?',
      options: ['렌탈', '구매', '비슷함', '제품마다 다름'],
      correct: 0,
      explanation: '관리비, 필터비, A/S비를 포함하면 렌탈이 더 경제적입니다.'
    },
    {
      id: 96,
      category: 'rental',
      question: '렌탈 중도 해지 시 위약금은?',
      options: ['없음', '잔여 개월 × 50%', '잔여 개월 × 70%', '전액'],
      correct: 1,
      explanation: '잔여 개월의 약 50% 정도가 위약금으로 부과됩니다.'
    },
    {
      id: 97,
      category: 'rental',
      question: '렌탈 재계약 시 혜택은?',
      options: ['없음', '할인만', '최신 모델 교체', '할인과 최신 모델 교체'],
      correct: 3,
      explanation: '재계약 시 할인과 최신 모델로 무상 교체 혜택이 있습니다.'
    },
    {
      id: 98,
      category: 'rental',
      question: '렌탈 이사 시 이전 설치 비용은?',
      options: ['무료', '5만원', '10만원', '거리에 따라'],
      correct: 0,
      explanation: '이사 시 이전 설치는 무료로 제공됩니다.'
    },
    {
      id: 99,
      category: 'rental',
      question: '렌탈 A/S 출장비는?',
      options: ['무료', '1만원', '3만원', '5만원'],
      correct: 0,
      explanation: '렌탈 고객은 A/S 출장비가 무료입니다.'
    },
    {
      id: 100,
      category: 'rental',
      question: '렌탈 결제 방법은?',
      options: ['카드만', '계좌이체만', '현금만', '모두 가능'],
      correct: 3,
      explanation: '카드, 계좌이체, 현금 모두 가능합니다.'
    },
    {
      id: 101,
      category: 'rental',
      question: '렌탈 신청 후 설치까지 소요 기간은?',
      options: ['당일', '1-3일', '1주일', '2주일'],
      correct: 1,
      explanation: '신청 후 1-3일 내에 설치가 가능합니다.'
    },
    {
      id: 102,
      category: 'rental',
      question: '렌탈 제품 소유권은?',
      options: ['고객', '코웨이', '공동 소유', '약정 후 고객'],
      correct: 1,
      explanation: '렌탈 제품의 소유권은 코웨이에 있습니다.'
    },
    {
      id: 103,
      category: 'rental',
      question: '렌탈 약정 만료 후 선택은?',
      options: ['반납만', '재계약만', '구매만', '모두 가능'],
      correct: 3,
      explanation: '반납, 재계약, 구매 모두 선택 가능합니다.'
    },
    {
      id: 104,
      category: 'rental',
      question: '렌탈 고객 만족도는?',
      options: ['70%', '80%', '90%', '95% 이상'],
      correct: 3,
      explanation: '렌탈 시스템은 고객 만족도가 95% 이상으로 매우 높습니다.'
    },
    {
      id: 105,
      category: 'rental',
      question: '렌탈 패키지 할인율은?',
      options: ['5%', '10%', '15%', '20%'],
      correct: 3,
      explanation: '2개 이상 제품 신청 시 최대 20% 할인됩니다.'
    },

    // 영업 기법 (20개)
    {
      id: 106,
      category: 'sales',
      question: '고객이 "비싸다"고 할 때 가장 적절한 대응은?',
      options: ['가격 즉시 할인', '장기적 경제성 설명', '저렴한 제품 추천', '고객 포기'],
      correct: 1,
      explanation: '가격 대비 가치, 장기적 경제성, 포함된 서비스를 설명하여 투자 가치를 인식시킵니다.'
    },
    {
      id: 107,
      category: 'sales',
      question: '클로징의 적절한 타이밍은?',
      options: ['첫 만남 즉시', '긍정 신호 포착 시', '1시간 설명 후', '고객 요청 시'],
      correct: 1,
      explanation: '고객이 관심을 보이거나 긍정적 반응을 보일 때가 최적 타이밍입니다.'
    },
    {
      id: 108,
      category: 'sales',
      question: '첫 방문 시 가장 중요한 것은?',
      options: ['제품 설명', '신뢰 구축', '가격 제시', '계약 체결'],
      correct: 1,
      explanation: '첫 방문에서는 신뢰 구축이 가장 중요합니다.'
    },
    {
      id: 109,
      category: 'sales',
      question: '고객의 니즈를 파악하는 가장 좋은 방법은?',
      options: ['일방적 설명', '질문하기', '자료 보여주기', '가격 제시'],
      correct: 1,
      explanation: '질문을 통해 고객의 상황과 니즈를 파악하는 것이 중요합니다.'
    },
    {
      id: 110,
      category: 'sales',
      question: '거절 대응의 핵심은?',
      options: ['포기', '강력 설득', '공감 후 해결책 제시', '가격 할인'],
      correct: 2,
      explanation: '고객의 우려에 공감하고 구체적인 해결책을 제시해야 합니다.'
    },
    {
      id: 111,
      category: 'sales',
      question: '제품 설명 시 가장 효과적인 방법은?',
      options: ['기술 용어 사용', '고객 혜택 중심', '경쟁사 비난', '가격 강조'],
      correct: 1,
      explanation: '기술보다는 고객이 얻을 수 있는 혜택을 중심으로 설명해야 합니다.'
    },
    {
      id: 112,
      category: 'sales',
      question: '프로모션 활용의 적절한 시점은?',
      options: ['첫 만남', '관심 표현 후', '거절 시', '계약 직전'],
      correct: 3,
      explanation: '계약 직전에 프로모션을 제시하면 결정을 유도할 수 있습니다.'
    },
    {
      id: 113,
      category: 'sales',
      question: '성공적인 영업의 핵심은?',
      options: ['제품 지식', '고객 이해', '가격 경쟁력', '모두 중요'],
      correct: 3,
      explanation: '제품 지식, 고객 이해, 가격 경쟁력 모두 중요합니다.'
    },
    {
      id: 114,
      category: 'sales',
      question: '고객 추천을 받는 가장 좋은 시점은?',
      options: ['첫 방문', '계약 직후', '만족 확인 후', '약정 만료 시'],
      correct: 2,
      explanation: '고객이 제품에 만족한 후 추천을 요청하는 것이 효과적입니다.'
    },
    {
      id: 115,
      category: 'sales',
      question: '영업 실패의 가장 큰 원인은?',
      options: ['제품 지식 부족', '경청 부족', '가격 문제', '타이밍 실패'],
      correct: 1,
      explanation: '고객의 말을 경청하지 않고 일방적으로 설명하는 것이 가장 큰 실패 원인입니다.'
    },
    {
      id: 116,
      category: 'sales',
      question: '재방문 약속을 받는 방법은?',
      options: ['강요', '구체적 날짜 제안', '고객 결정 대기', '전화 약속'],
      correct: 1,
      explanation: '구체적인 날짜와 시간을 제안하여 재방문 약속을 받아야 합니다.'
    },
    {
      id: 117,
      category: 'sales',
      question: '고객 이의 제기 시 올바른 태도는?',
      options: ['반박', '무시', '공감과 이해', '주제 전환'],
      correct: 2,
      explanation: '고객의 이의를 공감하고 이해한 후 해결책을 제시해야 합니다.'
    },
    {
      id: 118,
      category: 'sales',
      question: '영업 목표 달성의 핵심은?',
      options: ['운', '노력', '전략', '노력과 전략'],
      correct: 3,
      explanation: '꾸준한 노력과 효과적인 전략이 함께 필요합니다.'
    },
    {
      id: 119,
      category: 'sales',
      question: '신규 고객 vs 기존 고객 관리, 더 중요한 것은?',
      options: ['신규 고객', '기존 고객', '둘 다 중요', '상황에 따라'],
      correct: 2,
      explanation: '신규 고객 확보와 기존 고객 관리 모두 중요합니다.'
    },
    {
      id: 120,
      category: 'sales',
      question: '영업 스크립트 사용의 올바른 방법은?',
      options: ['그대로 암기', '상황에 맞게 변형', '사용 안 함', '처음만 사용'],
      correct: 1,
      explanation: '스크립트를 기본으로 하되 상황에 맞게 유연하게 변형해야 합니다.'
    },
    {
      id: 121,
      category: 'sales',
      question: '영업 성공률을 높이는 방법은?',
      options: ['많은 방문', '질 높은 상담', '가격 할인', '방문과 상담 질 모두'],
      correct: 3,
      explanation: '많은 방문과 질 높은 상담이 함께 필요합니다.'
    },
    {
      id: 122,
      category: 'sales',
      question: '고객 불만 처리의 핵심은?',
      options: ['변명', '책임 회피', '신속한 해결', '무시'],
      correct: 2,
      explanation: '고객 불만을 신속하고 성실하게 해결하는 것이 중요합니다.'
    },
    {
      id: 123,
      category: 'sales',
      question: '영업 교육의 중요성은?',
      options: ['불필요', '선택', '필수', '경력자만'],
      correct: 2,
      explanation: '지속적인 교육과 학습이 영업 성공의 필수 요소입니다.'
    },
    {
      id: 124,
      category: 'sales',
      question: '영업 데이터 관리의 중요성은?',
      options: ['불필요', '선택', '중요', '매우 중요'],
      correct: 3,
      explanation: '고객 데이터 관리는 체계적인 영업 활동의 기반입니다.'
    },
    {
      id: 125,
      category: 'sales',
      question: '영업 목표 설정 시 고려사항은?',
      options: ['현실성만', '도전성만', '측정 가능성만', '모두 고려'],
      correct: 3,
      explanation: '현실적이면서도 도전적이고 측정 가능한 목표를 설정해야 합니다.'
    },

    // 고객 응대 (20개)
    {
      id: 126,
      category: 'customer',
      question: '고객이 타사 제품과 비교할 때 올바른 대응은?',
      options: ['타사 비난', '가격만 강조', '차별화된 가치 설명', '무조건 할인'],
      correct: 2,
      explanation: '타사를 비난하지 않고 코웨이만의 기술력, 신뢰도, 서비스를 강조합니다.'
    },
    {
      id: 127,
      category: 'customer',
      question: '고객이 "생각해보겠다"고 할 때 가장 좋은 대응은?',
      options: ['바로 포기', '프로모션과 체험 제안', '계속 설득', '대폭 할인'],
      correct: 1,
      explanation: '부담을 줄이면서 프로모션 기한, 무료 체험 등을 제시합니다.'
    },
    {
      id: 128,
      category: 'customer',
      question: '고객 불만 접수 시 첫 대응은?',
      options: ['변명', '사과와 경청', '책임 회피', '상급자 연결'],
      correct: 1,
      explanation: '먼저 진심으로 사과하고 고객의 불만을 경청해야 합니다.'
    },
    {
      id: 129,
      category: 'customer',
      question: '고객이 화가 났을 때 올바른 태도는?',
      options: ['맞대응', '무시', '침착하게 경청', '회피'],
      correct: 2,
      explanation: '침착하게 고객의 말을 경청하고 공감을 표현해야 합니다.'
    },
    {
      id: 130,
      category: 'customer',
      question: '고객 응대의 기본 원칙은?',
      options: ['빠른 처리', '친절', '정확성', '모두 중요'],
      correct: 3,
      explanation: '빠른 처리, 친절, 정확성 모두 중요합니다.'
    },
    {
      id: 131,
      category: 'customer',
      question: '고객 질문에 답을 모를 때는?',
      options: ['추측해서 답변', '모른다고 솔직히', '확인 후 답변', '주제 전환'],
      correct: 2,
      explanation: '모르는 것은 솔직히 인정하고 확인 후 정확히 답변해야 합니다.'
    },
    {
      id: 132,
      category: 'customer',
      question: '고객과의 약속에서 가장 중요한 것은?',
      options: ['많은 약속', '큰 약속', '지킬 수 있는 약속', '빠른 약속'],
      correct: 2,
      explanation: '반드시 지킬 수 있는 약속만 해야 신뢰를 얻을 수 있습니다.'
    },
    {
      id: 133,
      category: 'customer',
      question: '고객 정보 관리에서 가장 중요한 것은?',
      options: ['많은 정보', '정확한 정보', '개인정보 보호', '정확성과 보호 모두'],
      correct: 3,
      explanation: '정확한 정보 관리와 개인정보 보호가 모두 중요합니다.'
    },
    {
      id: 134,
      category: 'customer',
      question: '고객 만족도를 높이는 가장 좋은 방법은?',
      options: ['가격 할인', '사은품 제공', '기대 이상 서비스', '빠른 처리'],
      correct: 2,
      explanation: '고객의 기대를 넘어서는 서비스를 제공하는 것이 핵심입니다.'
    },
    {
      id: 135,
      category: 'customer',
      question: '고객 컴플레인 처리 후 해야 할 일은?',
      options: ['끝', '재발 방지 대책', '보고만', '대책과 확인'],
      correct: 3,
      explanation: '재발 방지 대책을 수립하고 고객에게 확인해야 합니다.'
    },
    {
      id: 136,
      category: 'customer',
      question: '고객과의 첫 인사에서 중요한 것은?',
      options: ['큰 목소리', '밝은 표정', '정확한 발음', '모두 중요'],
      correct: 3,
      explanation: '밝은 표정, 적절한 목소리, 정확한 발음 모두 중요합니다.'
    },
    {
      id: 137,
      category: 'customer',
      question: '고객 응대 시 피해야 할 말투는?',
      options: ['존댓말', '반말', '전문 용어', '반말과 전문 용어'],
      correct: 3,
      explanation: '반말과 어려운 전문 용어는 피해야 합니다.'
    },
    {
      id: 138,
      category: 'customer',
      question: '고객 니즈 파악의 핵심은?',
      options: ['추측', '질문', '관찰', '질문과 관찰'],
      correct: 3,
      explanation: '적절한 질문과 세심한 관찰이 함께 필요합니다.'
    },
    {
      id: 139,
      category: 'customer',
      question: '고객 응대 중 전화가 올 때는?',
      options: ['바로 받는다', '고객에게 양해 구함', '무시', '나중에 받음'],
      correct: 1,
      explanation: '고객에게 양해를 구하고 짧게 통화하거나 나중에 받습니다.'
    },
    {
      id: 140,
      category: 'customer',
      question: '고객 방문 약속 시간에 늦을 때는?',
      options: ['그냥 간다', '미리 연락', '나중에 사과', '무시'],
      correct: 1,
      explanation: '반드시 미리 연락하여 양해를 구해야 합니다.'
    },
    {
      id: 141,
      category: 'customer',
      question: '고객 응대 후 피드백 받는 방법은?',
      options: ['불필요', '만족도 조사', '전화 확인', '조사와 확인 모두'],
      correct: 3,
      explanation: '만족도 조사와 전화 확인을 통해 피드백을 받아야 합니다.'
    },
    {
      id: 142,
      category: 'customer',
      question: '고객 응대의 최종 목표는?',
      options: ['계약', '만족', '재구매', '만족과 재구매'],
      correct: 3,
      explanation: '고객 만족을 통한 재구매와 추천이 최종 목표입니다.'
    },
    {
      id: 143,
      category: 'customer',
      question: '고객 응대 시 가장 중요한 자세는?',
      options: ['자신감', '겸손', '전문성', '모두 중요'],
      correct: 3,
      explanation: '자신감, 겸손, 전문성이 모두 필요합니다.'
    },
    {
      id: 144,
      category: 'customer',
      question: '고객 이탈 방지의 핵심은?',
      options: ['가격 할인', '지속적 관리', '사은품', '관리와 소통'],
      correct: 3,
      explanation: '지속적인 관리와 소통이 고객 이탈을 방지합니다.'
    },
    {
      id: 145,
      category: 'customer',
      question: '고객 응대 교육의 중요성은?',
      options: ['불필요', '선택', '중요', '매우 중요'],
      correct: 3,
      explanation: '지속적인 고객 응대 교육이 서비스 품질의 핵심입니다.'
    }
  ]

  // 카테고리별 문제 필터링 및 랜덤 선택
  const selectQuizzes = (category, count = 20) => {
    let filtered = category === 'random' 
      ? [...allQuizzes]
      : allQuizzes.filter(q => q.category === category)
    
    // 랜덤 셔플
    const shuffled = filtered.sort(() => Math.random() - 0.5)
    return shuffled.slice(0, Math.min(count, shuffled.length))
  }

  const startQuiz = (category) => {
    setSelectedCategory(category)
    setQuizSet(selectQuizzes(category, 20))
    setShowCategorySelect(false)
    setCurrentQuiz(0)
    setScore(0)
    setShowResult(false)
    setSelectedAnswer(null)
    setAnsweredQuestions([])
  }

  const handleAnswer = (answerIndex) => {
    setSelectedAnswer(answerIndex)
    
    const isCorrect = answerIndex === quizSet[currentQuiz].correct
    if (isCorrect) {
      setScore(score + 1)
    }

    setAnsweredQuestions([...answeredQuestions, {
      question: quizSet[currentQuiz].question,
      correct: isCorrect,
      userAnswer: quizSet[currentQuiz].options[answerIndex],
      correctAnswer: quizSet[currentQuiz].options[quizSet[currentQuiz].correct]
    }])

    setTimeout(() => {
      if (currentQuiz < quizSet.length - 1) {
        setCurrentQuiz(currentQuiz + 1)
        setSelectedAnswer(null)
      } else {
        setShowResult(true)
      }
    }, 2000)
  }

  const resetQuiz = () => {
    setShowCategorySelect(true)
    setCurrentQuiz(0)
    setScore(0)
    setShowResult(false)
    setSelectedAnswer(null)
    setAnsweredQuestions([])
    setQuizSet([])
  }

  const getScoreMessage = () => {
    const percentage = (score / quizSet.length) * 100
    if (percentage >= 90) return { emoji: '🏆', message: '완벽합니다! 영업 마스터!', color: '#ffd700' }
    if (percentage >= 70) return { emoji: '🎉', message: '훌륭해요! 실력이 뛰어나네요!', color: '#4facfe' }
    if (percentage >= 50) return { emoji: '👍', message: '좋아요! 조금만 더 공부하면 완벽!', color: '#43e97b' }
    return { emoji: '💪', message: '화이팅! 더 열심히 공부해봐요!', color: '#fa709a' }
  }

  // 카테고리 선택 화면
  if (showCategorySelect) {
    return (
      <div className="product-quiz">
        <div className="quiz-header">
          <h1>🧠 제품 지식 퀴즈</h1>
          <p>카테고리를 선택하세요 (총 {allQuizzes.length}개 문제)</p>
        </div>

        <div className="category-selection">
          {categories.map(cat => {
            const count = cat.id === 'random' 
              ? allQuizzes.length 
              : allQuizzes.filter(q => q.category === cat.id).length
            
            return (
              <button
                key={cat.id}
                className="category-card"
                style={{ borderColor: cat.color }}
                onClick={() => startQuiz(cat.id)}
              >
                <div className="category-icon" style={{ color: cat.color }}>
                  {cat.icon}
                </div>
                <h3>{cat.name}</h3>
                <p className="category-count">{count}개 문제</p>
                <div className="category-badge" style={{ backgroundColor: cat.color }}>
                  시작하기
                </div>
              </button>
            )
          })}
        </div>
      </div>
    )
  }

  // 결과 화면
  if (showResult) {
    const result = getScoreMessage()
    const categoryInfo = categories.find(c => c.id === selectedCategory)
    
    return (
      <div className="quiz-result">
        <div className="result-card">
          <div className="result-emoji" style={{ color: result.color }}>{result.emoji}</div>
          <h1>퀴즈 완료!</h1>
          <div className="result-category" style={{ color: categoryInfo.color }}>
            {categoryInfo.icon} {categoryInfo.name}
          </div>
          <div className="result-score">
            <span className="score-number">{score}</span>
            <span className="score-total">/ {quizSet.length}</span>
          </div>
          <p className="result-message">{result.message}</p>
          <div className="result-percentage">
            정답률: {Math.round((score / quizSet.length) * 100)}%
          </div>

          <div className="answer-review">
            <h3>📋 답안 리뷰</h3>
            {answeredQuestions.map((q, index) => (
              <div key={index} className={`review-item ${q.correct ? 'correct' : 'wrong'}`}>
                <div className="review-header">
                  <span className="review-icon">{q.correct ? '✓' : '✗'}</span>
                  <span className="review-number">문제 {index + 1}</span>
                </div>
                <p className="review-question">{q.question}</p>
                {!q.correct && (
                  <div className="review-answers">
                    <p className="user-answer">내 답: {q.userAnswer}</p>
                    <p className="correct-answer">정답: {q.correctAnswer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>

          <button onClick={resetQuiz} className="retry-btn">
            🔄 다른 카테고리 도전하기
          </button>
        </div>
      </div>
    )
  }

  // 퀴즈 진행 화면
  const quiz = quizSet[currentQuiz]
  const progress = ((currentQuiz + 1) / quizSet.length) * 100
  const categoryInfo = categories.find(c => c.id === selectedCategory)

  return (
    <div className="product-quiz">
      <div className="quiz-header">
        <h1>🧠 제품 지식 퀴즈</h1>
        <p style={{ color: categoryInfo.color }}>
          {categoryInfo.icon} {categoryInfo.name}
        </p>
      </div>

      <div className="quiz-container">
        <div className="quiz-progress">
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${progress}%`, backgroundColor: categoryInfo.color }}
            ></div>
          </div>
          <div className="progress-text">
            문제 {currentQuiz + 1} / {quizSet.length}
          </div>
        </div>

        <div className="quiz-card">
          <div className="quiz-category" style={{ backgroundColor: categoryInfo.color }}>
            {categoryInfo.icon} {categoryInfo.name}
          </div>
          <h2 className="quiz-question">{quiz.question}</h2>

          <div className="quiz-options">
            {quiz.options.map((option, index) => (
              <button
                key={index}
                className={`quiz-option ${
                  selectedAnswer === index
                    ? index === quiz.correct
                      ? 'correct'
                      : 'wrong'
                    : ''
                } ${selectedAnswer !== null && index === quiz.correct ? 'correct' : ''}`}
                onClick={() => handleAnswer(index)}
                disabled={selectedAnswer !== null}
              >
                <span className="option-number">{index + 1}</span>
                <span className="option-text">{option}</span>
              </button>
            ))}
          </div>

          {selectedAnswer !== null && (
            <div className="quiz-explanation">
              <strong>💡 설명:</strong>
              <p>{quiz.explanation}</p>
            </div>
          )}
        </div>

        <div className="quiz-score">
          현재 점수: {score} / {currentQuiz + (selectedAnswer !== null ? 1 : 0)}
        </div>
      </div>
    </div>
  )
}

export default ProductQuiz
