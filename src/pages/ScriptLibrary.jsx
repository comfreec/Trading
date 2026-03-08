import React, { useState } from 'react'
import './ScriptLibrary.css'

function ScriptLibrary() {
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')

  const categories = [
    { id: 'all', name: '전체', icon: '📚' },
    { id: 'opening', name: '오프닝 멘트', icon: '👋' },
    { id: 'product', name: '제품 설명', icon: '🛏️' },
    { id: 'objection', name: '거절 대응', icon: '🛡️' },
    { id: 'closing', name: '클로징', icon: '🎯' },
    { id: 'success', name: '성공 사례', icon: '⭐' }
  ]

  const scripts = [
    // 오프닝 멘트 (15개)
    {
      id: 1,
      category: 'opening',
      title: '첫 방문 인사',
      situation: '고객 댁 첫 방문 시',
      script: '안녕하세요! 코웨이 홈케어닥터 [이름]입니다. 오늘 매트리스 케어 서비스로 방문했습니다. 혹시 매트리스 사용하신 지 얼마나 되셨나요?',
      tips: '밝고 친근한 톤으로 시작하되, 전문가다운 신뢰감을 주세요',
      rating: 4.8
    },
    {
      id: 2,
      category: 'opening',
      title: '서비스 시작 멘트',
      situation: '케어 서비스 시작 전',
      script: '지금부터 매트리스 상태를 점검해드리겠습니다. 보통 3-5년 사용하신 매트리스에는 진드기가 평균 200만 마리 정도 서식하고 있어요. 오늘 깨끗하게 케어해드리겠습니다.',
      tips: '구체적인 수치로 필요성을 인식시키세요',
      rating: 4.9
    },
    {
      id: 3,
      category: 'opening',
      title: '전화 상담 시작',
      situation: '전화로 첫 상담 시',
      script: '안녕하세요, 코웨이입니다. 고객님 댁 근처에서 무료 매트리스 케어 서비스를 진행하고 있어서 연락드렸어요. 혹시 5분 정도 시간 괜찮으실까요?',
      tips: '무료 서비스를 먼저 언급해 거부감을 낮추세요',
      rating: 4.6
    },
    {
      id: 4,
      category: 'opening',
      title: '재방문 인사',
      situation: '기존 고객 재방문 시',
      script: '안녕하세요! 오랜만입니다. 지난번 설치해드린 제품 잘 사용하고 계시죠? 오늘은 정기 점검 겸 새로운 프로모션 안내차 방문했습니다.',
      tips: '기존 관계를 활용해 자연스럽게 추가 제안으로 연결하세요',
      rating: 4.7
    },
    {
      id: 5,
      category: 'opening',
      title: '추천 방문 인사',
      situation: '지인 추천으로 방문 시',
      script: '안녕하세요! [추천인] 고객님 소개로 방문했습니다. 저희 서비스에 너무 만족하셔서 꼭 소개해주고 싶다고 하시더라고요. 오늘 시간 괜찮으실까요?',
      tips: '추천인을 먼저 언급해 신뢰도를 높이세요',
      rating: 4.9
    },
    {
      id: 6,
      category: 'opening',
      title: '아파트 단지 방문',
      situation: '아파트 단지 방문 영업 시',
      script: '안녕하세요! 이번 주 이 단지에서 무료 수질 검사 및 매트리스 케어 이벤트를 진행하고 있습니다. 10분 정도 시간 내주시면 무료로 점검해드릴게요.',
      tips: '단지 전체 이벤트임을 강조해 특별함을 어필하세요',
      rating: 4.5
    },
    {
      id: 7,
      category: 'opening',
      title: '온라인 문의 후 방문',
      situation: '온라인 상담 후 방문 시',
      script: '안녕하세요! 어제 홈페이지에서 상담 신청하신 고객님이시죠? 공기청정기 문의하셨다고 해서 제품 샘플이랑 카탈로그 가지고 왔습니다.',
      tips: '고객이 먼저 관심을 보인 점을 상기시켜 주세요',
      rating: 4.8
    },
    {
      id: 8,
      category: 'opening',
      title: '계절 맞춤 인사',
      situation: '환절기/계절 변화 시',
      script: '안녕하세요! 요즘 미세먼지가 심해지는 계절이라 공기청정기 문의가 정말 많아요. 마침 이 지역 방문 일정이 있어서 들렀습니다. 혹시 집안 공기 질 때문에 고민하신 적 있으세요?',
      tips: '계절 이슈를 활용해 자연스럽게 니즈를 환기시키세요',
      rating: 4.7
    },
    {
      id: 9,
      category: 'opening',
      title: '신혼부부 타겟',
      situation: '신혼집 방문 시',
      script: '안녕하세요! 새로 이사 오신 거 축하드립니다. 신혼집에는 공기청정기랑 정수기가 필수인데, 요즘 렌탈로 부담 없이 시작하시는 분들이 많으세요. 잠깐 설명 들어보시겠어요?',
      tips: '신혼부부의 새 출발을 축하하며 필수품임을 강조하세요',
      rating: 4.6
    },
    {
      id: 10,
      category: 'opening',
      title: '육아 가정 타겟',
      situation: '어린 자녀가 있는 가정',
      script: '안녕하세요! 아이가 어리시네요. 요즘 아이들 알레르기나 아토피 때문에 공기청정기 찾으시는 부모님들이 정말 많으세요. 혹시 관심 있으신가요?',
      tips: '아이 건강을 최우선으로 하는 부모 마음을 건드리세요',
      rating: 4.9
    },
    {
      id: 11,
      category: 'opening',
      title: '시니어 타겟',
      situation: '중장년층 고객 방문 시',
      script: '안녕하세요! 요즘 건강 관리 잘 하고 계시죠? 나이 드시면 면역력이 약해져서 집안 위생이 더 중요한데, 매트리스 케어 한 번 받아보시는 건 어떠세요?',
      tips: '건강과 위생을 연결해 필요성을 강조하세요',
      rating: 4.7
    },
    {
      id: 12,
      category: 'opening',
      title: '반려동물 가정',
      situation: '반려동물이 있는 가정',
      script: '안녕하세요! 강아지 키우시는군요. 반려동물 있으면 털이랑 냄새 때문에 공기청정기 필수더라고요. 저희 제품은 펫 전용 필터도 있어서 효과가 정말 좋아요.',
      tips: '반려동물로 인한 구체적인 불편함을 언급하세요',
      rating: 4.8
    },
    {
      id: 13,
      category: 'opening',
      title: '이사 후 방문',
      situation: '최근 이사한 가정',
      script: '안녕하세요! 이사 오신 지 얼마 안 되셨죠? 새 집은 새집증후군 때문에 공기청정기가 꼭 필요해요. 무료 공기질 측정 서비스 해드릴까요?',
      tips: '새집증후군 이슈로 즉각적인 필요성을 만드세요',
      rating: 4.9
    },
    {
      id: 14,
      category: 'opening',
      title: '명절 전 방문',
      situation: '명절 시즌 전',
      script: '안녕하세요! 곧 명절이라 손님 많이 오시죠? 손님 오시기 전에 매트리스 케어랑 공기청정 한 번 해두시면 정말 좋아요. 지금 예약하시면 명절 전에 가능합니다.',
      tips: '명절 손님 맞이 준비와 연결하세요',
      rating: 4.6
    },
    {
      id: 15,
      category: 'opening',
      title: '건강검진 시즌',
      situation: '건강검진 시즌',
      script: '안녕하세요! 요즘 건강검진 시즌이라 폐 건강 신경 쓰시는 분들 많으시죠? 집안 공기가 폐 건강에 직접적인 영향을 주거든요. 무료 측정 한번 해보시겠어요?',
      tips: '건강검진과 연결해 경각심을 높이세요',
      rating: 4.7
    },

    // 제품 설명 (15개)
    {
      id: 16,
      category: 'product',
      title: '매트리스 케어 서비스 설명',
      situation: '서비스 내용 설명 시',
      script: '저희 매트리스 케어는 3단계로 진행됩니다. 1단계 UV 살균으로 99.9% 세균 제거, 2단계 강력 흡입으로 진드기와 먼지 제거, 3단계 탈취로 쾌적한 환경을 만들어드립니다.',
      tips: '단계별로 명확하게 설명하고 수치를 활용하세요',
      rating: 4.7
    },
    {
      id: 17,
      category: 'product',
      title: '공기청정기 핵심 기능',
      situation: '공기청정기 설명 시',
      script: '이 제품은 0.3마이크로미터 초미세먼지까지 99.9% 제거합니다. 4단계 필터 시스템으로 미세먼지, 바이러스, 냄새까지 한 번에 해결하고, 30평대 아파트 기준 20분이면 전체 공기를 정화해요.',
      tips: '구체적인 수치와 시간으로 성능을 입증하세요',
      rating: 4.8
    },
    {
      id: 18,
      category: 'product',
      title: '정수기 차별점',
      situation: '정수기 제품 설명 시',
      script: '코웨이 정수기는 직수형이라 물탱크가 없어서 세균 번식 걱정이 없어요. 4단계 필터로 중금속, 녹물, 염소까지 완벽 제거하고, 냉온수 온도도 4단계로 조절 가능합니다.',
      tips: '직수형의 위생적 장점을 강조하세요',
      rating: 4.9
    },
    {
      id: 19,
      category: 'product',
      title: '비데 제품 설명',
      situation: '비데 제품 소개 시',
      script: '코웨이 비데는 노즐 자동 세척 기능이 있어서 항상 청결하게 유지됩니다. 수압과 온도를 세밀하게 조절할 수 있고, 특히 여성 전용 모드와 어린이 모드가 따로 있어서 가족 모두 사용하기 좋아요.',
      tips: '가족 구성원별 맞춤 기능을 설명하세요',
      rating: 4.6
    },
    {
      id: 20,
      category: 'product',
      title: '렌탈 시스템 설명',
      situation: '렌탈 제도 설명 시',
      script: '렌탈은 초기 비용 없이 월 3만원대부터 시작 가능하고, 고장 시 무상 수리, 정기 필터 교체, 연 2회 전문가 방문 관리까지 모두 포함이에요. 구매보다 훨씬 경제적이고 편리합니다.',
      tips: '렌탈의 경제성과 편리성을 동시에 강조하세요',
      rating: 4.8
    },
    {
      id: 21,
      category: 'product',
      title: 'IoT 스마트 기능',
      situation: '스마트 기능 설명 시',
      script: '요즘 제품은 스마트폰 앱으로 원격 제어가 가능해요. 외출 중에도 공기질 확인하고 전원 켜고 끌 수 있고, 필터 교체 시기도 자동으로 알림이 와서 관리가 정말 편합니다.',
      tips: 'IoT 기능의 편리성을 구체적으로 설명하세요',
      rating: 4.7
    },
    {
      id: 22,
      category: 'product',
      title: '에너지 효율',
      situation: '전기료 걱정하는 고객에게',
      script: '전기료 걱정하시는 분들 많은데, 이 제품은 1등급 에너지 효율이라 24시간 켜놔도 한 달 전기료가 3천원 정도밖에 안 나와요. 오히려 에어컨 덜 쓰게 돼서 전기료가 절약됩니다.',
      tips: '구체적인 전기료 수치로 안심시키세요',
      rating: 4.8
    },
    {
      id: 23,
      category: 'product',
      title: '필터 시스템 상세',
      situation: '필터 성능 질문 시',
      script: '필터는 4단계로 구성돼 있어요. 1단계 프리필터로 큰 먼지, 2단계 헤파필터로 초미세먼지, 3단계 활성탄 필터로 냄새와 가스, 4단계 항균필터로 세균까지 제거합니다.',
      tips: '각 필터의 역할을 단계별로 명확히 설명하세요',
      rating: 4.7
    },
    {
      id: 24,
      category: 'product',
      title: '소음 수준',
      situation: '소음 걱정하는 고객에게',
      script: '소음은 수면 모드에서 25dB로 도서관보다 조용해요. 낮에는 40dB 정도인데 이건 조용한 사무실 수준이라 전혀 신경 안 쓰입니다. 밤에 켜놔도 수면에 방해 안 돼요.',
      tips: '데시벨 수치를 일상적인 소리와 비교해 설명하세요',
      rating: 4.6
    },
    {
      id: 25,
      category: 'product',
      title: '디자인 및 크기',
      situation: '공간 배치 고민 시',
      script: '디자인이 심플해서 어떤 인테리어에도 잘 어울려요. 크기는 가로 30cm, 세로 60cm 정도로 거실 한쪽 구석에 두시면 되고, 바퀴가 달려있어서 이동도 편합니다.',
      tips: '실제 배치 이미지를 상상할 수 있게 도와주세요',
      rating: 4.5
    },
    {
      id: 26,
      category: 'product',
      title: 'A/S 시스템',
      situation: 'A/S 문의 시',
      script: '코웨이는 전국 200개 서비스센터가 있어서 A/S가 정말 빨라요. 전화 한 통이면 다음날 바로 방문하고, 렌탈 고객은 모든 수리비가 무료입니다. 40년 동안 쌓인 노하우가 있어요.',
      tips: '전국 네트워크와 신속성을 강조하세요',
      rating: 4.9
    },
    {
      id: 27,
      category: 'product',
      title: '인증 및 수상',
      situation: '제품 신뢰도 질문 시',
      script: '이 제품은 한국공기청정협회 인증을 받았고, 작년에 소비자만족도 1위를 수상했어요. 또 영국 알레르기 협회 인증도 받아서 알레르기 환자분들이 특히 많이 찾으세요.',
      tips: '공신력 있는 인증과 수상 내역을 언급하세요',
      rating: 4.8
    },
    {
      id: 28,
      category: 'product',
      title: '사용 편의성',
      situation: '조작 방법 질문 시',
      script: '조작은 정말 간단해요. 버튼 3개만 있고, 자동 모드로 켜두시면 알아서 공기질 감지해서 세기를 조절합니다. 어르신들도 쉽게 사용하실 수 있어요.',
      tips: '간단한 조작법으로 사용 부담을 낮추세요',
      rating: 4.6
    },
    {
      id: 29,
      category: 'product',
      title: '필터 교체 주기',
      situation: '유지비 질문 시',
      script: '필터는 6개월에 한 번 교체하는데, 렌탈이면 무료로 교체해드려요. 직접 구매하셔도 필터 가격이 3만원 정도라 부담 없고, 교체도 5분이면 끝나서 간단합니다.',
      tips: '렌탈 시 무료 교체를 강조하세요',
      rating: 4.7
    },
    {
      id: 30,
      category: 'product',
      title: '제품 라인업 비교',
      situation: '여러 모델 비교 시',
      script: '기본형은 20평대용이고, 프리미엄은 40평대용이에요. 기능은 거의 같은데 적용 면적이 다릅니다. 고객님 댁이 30평이시면 프리미엄을 추천드려요. 가격 차이는 월 1만원 정도입니다.',
      tips: '고객 상황에 맞는 모델을 명확히 추천하세요',
      rating: 4.8
    },

    // 거절 대응 (15개)
    {
      id: 31,
      category: 'objection',
      title: '가격 부담 대응',
      situation: '"너무 비싼 것 같아요"',
      script: '가격이 부담되실 수 있죠. 하지만 렌탈은 초기 비용 없이 월 3만원대로 시작하실 수 있고, 고장 시 무상 A/S, 정기 관리까지 포함이에요. 10년 사용 시 구매보다 훨씬 경제적입니다.',
      tips: '장기적 관점의 경제성을 강조하세요',
      rating: 4.8
    },
    {
      id: 32,
      category: 'objection',
      title: '필요성 의문 대응',
      situation: '"지금 쓰는 게 있어서..."',
      script: '그렇군요. 혹시 지금 사용하시는 제품이 몇 년 되셨나요? 보통 5년 이상 되면 필터 효율이 50% 이하로 떨어져요. 무상 체험 기간도 있으니 한번 비교해보시는 건 어떠세요?',
      tips: '기존 제품의 한계를 부드럽게 지적하고 체험 기회 제공',
      rating: 4.7
    },
    {
      id: 33,
      category: 'objection',
      title: '타사 비교 대응',
      situation: '"다른 회사 제품이 더 싸던데요"',
      script: '가격만 보면 그럴 수 있어요. 하지만 코웨이는 40년 전통의 기술력과 전국 A/S 네트워크가 차별점입니다. 실제 사용 고객 만족도가 95%이고, 정기 관리 서비스까지 포함이에요.',
      tips: '가격 경쟁보다 가치와 신뢰도로 승부하세요',
      rating: 4.9
    },
    {
      id: 34,
      category: 'objection',
      title: '생각해보겠다는 고객',
      situation: '"좀 더 생각해볼게요"',
      script: '충분히 고민하실 수 있어요. 그런데 이번 프로모션이 이번 주까지라서요. 일단 예약만 해두시고 7일 체험 후 결정하시는 건 어떠세요? 마음에 안 드시면 위약금 없이 취소 가능합니다.',
      tips: '프로모션 마감과 무료 체험으로 결정을 유도하세요',
      rating: 4.8
    },
    {
      id: 35,
      category: 'objection',
      title: '배우자 상의 필요',
      situation: '"남편/아내랑 상의해봐야 해요"',
      script: '당연히 상의하셔야죠. 그럼 제가 간단한 자료 남겨드릴게요. 그리고 부부가 함께 상담받으시면 추가 할인도 있어요. 언제 두 분 다 계실 때 다시 방문해도 될까요?',
      tips: '배우자 동석 상담을 제안해 재방문 기회를 만드세요',
      rating: 4.7
    },
    {
      id: 36,
      category: 'objection',
      title: '경제적 여유 없음',
      situation: '"지금 형편이 안 돼요"',
      script: '요즘 경제가 어려우시죠. 그래서 렌탈이 좋은 거예요. 한 번에 큰돈 들어가는 게 아니라 월 3만원씩만 내시면 되고, 커피 한 잔 값으로 가족 건강 지킬 수 있어요.',
      tips: '소액 월납으로 부담을 낮추고 가치를 강조하세요',
      rating: 4.6
    },
    {
      id: 37,
      category: 'objection',
      title: '이사 계획 있음',
      situation: '"곧 이사 갈 것 같아서..."',
      script: '이사 가셔도 전혀 문제없어요. 저희가 무료로 이전 설치해드리고, 주소 변경만 하시면 돼요. 오히려 새 집에서 처음부터 깨끗한 공기로 시작하시는 게 좋지 않을까요?',
      tips: '이사 시 무료 이전 서비스를 강조하세요',
      rating: 4.8
    },
    {
      id: 38,
      category: 'objection',
      title: '효과 의심',
      situation: '"정말 효과 있나요?"',
      script: '의심하실 수 있어요. 그래서 7일 무료 체험을 드리는 거예요. 직접 사용해보시고 공기질 측정기로 전후 비교도 해드려요. 효과 없으면 그냥 반납하시면 됩니다. 자신 있으니까 이렇게 하는 거예요.',
      tips: '무료 체험과 측정 서비스로 의심을 해소하세요',
      rating: 4.9
    },
    {
      id: 39,
      category: 'objection',
      title: '공간 부족',
      situation: '"집이 좁아서 놓을 데가 없어요"',
      script: '요즘 제품은 정말 슬림해요. 가로 30cm면 충분하고, 벽에 붙여서 세워두시면 돼요. 제가 직접 가서 배치 가능한 곳 찾아드릴게요. 생각보다 공간 많이 안 차지합니다.',
      tips: '실제 크기를 구체적으로 설명하고 방문 배치 제안',
      rating: 4.6
    },
    {
      id: 40,
      category: 'objection',
      title: '소음 걱정',
      situation: '"소음이 시끄럽지 않나요?"',
      script: '예전 제품은 좀 시끄러웠는데, 요즘은 정말 조용해요. 수면 모드는 25dB로 도서관보다 조용하고, 밤에 켜놔도 전혀 안 들려요. 체험 기간에 직접 확인해보세요.',
      tips: '데시벨 수치와 체험 기회로 안심시키세요',
      rating: 4.7
    },
    {
      id: 41,
      category: 'objection',
      title: '전기료 걱정',
      situation: '"전기료 많이 나오지 않나요?"',
      script: '1등급 제품이라 24시간 켜놔도 한 달에 3천원 정도예요. 하루 100원꼴이죠. 오히려 공기청정기 쓰면 환기를 덜 해도 돼서 냉난방비가 절약됩니다.',
      tips: '하루 단위로 환산해 부담을 낮추세요',
      rating: 4.8
    },
    {
      id: 42,
      category: 'objection',
      title: '관리 번거로움',
      situation: '"관리하기 귀찮을 것 같아요"',
      script: '렌탈이면 관리 걱정 전혀 없어요. 6개월마다 저희가 방문해서 필터 교체하고 청소까지 다 해드려요. 고객님은 그냥 쓰시기만 하면 됩니다. 이게 렌탈의 가장 큰 장점이에요.',
      tips: '렌탈의 관리 서비스를 강조하세요',
      rating: 4.9
    },
    {
      id: 43,
      category: 'objection',
      title: '약정 기간 부담',
      situation: '"3년 약정이 부담돼요"',
      script: '3년이 길게 느껴지실 수 있는데, 제품 수명이 10년 이상이라 3년은 짧은 거예요. 그리고 중도 해지해도 위약금이 생각보다 적어요. 1년 쓰시면 거의 없다고 보시면 됩니다.',
      tips: '제품 수명과 비교해 약정 기간이 합리적임을 설명',
      rating: 4.6
    },
    {
      id: 44,
      category: 'objection',
      title: '온라인이 더 싸다',
      situation: '"인터넷으로 사는 게 더 싸던데요"',
      script: '온라인은 초기 가격은 싸 보이지만, A/S비, 필터 교체비, 출장비 다 따로예요. 저희는 그게 다 포함이고, 문제 생기면 바로 달려가요. 장기적으로 보면 저희가 훨씬 경제적입니다.',
      tips: '숨은 비용을 설명하고 토탈 서비스 가치 강조',
      rating: 4.8
    },
    {
      id: 45,
      category: 'objection',
      title: '지인 추천 제품',
      situation: '"지인이 다른 제품 추천했어요"',
      script: '지인 추천도 중요하죠. 그런데 그분 댁 환경이랑 고객님 댁이 다를 수 있어요. 평수, 가족 구성, 사용 목적에 따라 맞는 제품이 달라요. 제가 고객님 댁에 딱 맞는 걸 추천해드릴게요.',
      tips: '개인별 맞춤 추천의 중요성을 강조하세요',
      rating: 4.7
    },

    // 클로징 (10개)
    {
      id: 46,
      category: 'closing',
      title: '긍정 신호 포착 클로징',
      situation: '고객이 관심을 보일 때',
      script: '좋아 보이시죠? 지금 신청하시면 이번 달 프로모션으로 첫 3개월 50% 할인 혜택을 드립니다. 설치는 이번 주 중 가능하고요. 바로 진행해드릴까요?',
      tips: '망설임 없이 자신감 있게 제안하세요',
      rating: 4.8
    },
    {
      id: 47,
      category: 'closing',
      title: '부드러운 클로징',
      situation: '고객이 망설일 때',
      script: '충분히 고민하실 수 있어요. 그런데 프로모션이 이번 주까지라서요. 일단 신청하시고 7일 무료 체험 후 결정하시는 건 어떠세요? 마음에 안 드시면 위약금 없이 취소 가능합니다.',
      tips: '부담을 줄이고 체험 기회를 강조하세요',
      rating: 4.7
    },
    {
      id: 48,
      category: 'closing',
      title: '긴급성 클로징',
      situation: '프로모션 마감 임박',
      script: '사실 오늘이 프로모션 마지막 날이에요. 내일부터는 정가로 돌아가서 월 1만원 더 내셔야 해요. 지금 결정하시면 1년에 12만원 절약하시는 거예요. 어떻게 하시겠어요?',
      tips: '구체적인 절약 금액으로 즉시 결정 유도',
      rating: 4.9
    },
    {
      id: 49,
      category: 'closing',
      title: '선택지 제시 클로징',
      situation: '두 가지 옵션 제시',
      script: '기본형이랑 프리미엄 중에 어떤 게 더 마음에 드세요? 기본형은 월 3만원, 프리미엄은 월 4만원인데 성능이 확실히 좋아요. 고객님 댁 평수 생각하면 프리미엄 추천드려요.',
      tips: '"할까 말까"가 아닌 "어떤 걸 할까"로 유도',
      rating: 4.8
    },
    {
      id: 50,
      category: 'closing',
      title: '가족 건강 클로징',
      situation: '자녀가 있는 가정',
      script: '아이 건강이 제일 중요하시잖아요. 요즘 미세먼지 때문에 아이들 호흡기 질환이 정말 많아요. 하루 빨리 시작하실수록 아이한테 좋아요. 이번 주에 설치해드릴까요?',
      tips: '자녀 건강을 최우선 가치로 어필',
      rating: 4.9
    },
    {
      id: 51,
      category: 'closing',
      title: '투자 관점 클로징',
      situation: '경제적 고민 고객',
      script: '이건 소비가 아니라 건강 투자예요. 병원비 한 번만 나가도 몇십만원인데, 월 3만원으로 가족 건강 지킬 수 있어요. 10년 쓰면 하루에 100원도 안 되는 거예요.',
      tips: '건강 투자 관점으로 가치를 재정의',
      rating: 4.8
    },
    {
      id: 52,
      category: 'closing',
      title: '후회 방지 클로징',
      situation: '망설이는 고객',
      script: '나중에 "그때 할 걸" 하고 후회하시는 분들 정말 많아요. 특히 아이가 아프고 나서 그때 했어야 했다고 하시는데, 그땐 이미 늦었죠. 지금 결정하시는 게 현명한 선택이에요.',
      tips: '후회 시나리오로 지금 결정의 중요성 강조',
      rating: 4.7
    },
    {
      id: 53,
      category: 'closing',
      title: '추가 혜택 클로징',
      situation: '거의 결정한 고객',
      script: '좋은 결정하셨어요! 그리고 오늘 계약하시면 사은품으로 필터 1개 더 드리고, 친구 추천하시면 추가 할인도 있어요. 신청서 작성해드릴게요.',
      tips: '결정 후 추가 혜택으로 만족도 높이기',
      rating: 4.8
    },
    {
      id: 54,
      category: 'closing',
      title: '이웃 사례 클로징',
      situation: '같은 단지 고객',
      script: '사실 이 아파트에서만 이번 달에 벌써 5가구가 신청하셨어요. 다들 만족하셔서 입소문이 나고 있어요. 고객님도 이웃분들처럼 시작해보시는 거 어때요?',
      tips: '이웃 사례로 사회적 증거 제시',
      rating: 4.9
    },
    {
      id: 55,
      category: 'closing',
      title: '감사 클로징',
      situation: '계약 체결 후',
      script: '현명한 선택하셨어요! 정말 감사합니다. 설치 날짜 잡고 연락드릴게요. 궁금한 거 있으시면 언제든 전화 주세요. 제 명함 드릴게요. 앞으로 잘 부탁드립니다!',
      tips: '감사 인사와 함께 지속적 관계 약속',
      rating: 4.8
    },

    // 성공 사례 (10개)
    {
      id: 56,
      category: 'success',
      title: '알레르기 개선 사례',
      situation: '건강 효과 강조 시',
      script: '지난달에 비슷한 고민을 하시던 고객님이 계셨어요. 아이가 아토피가 심했는데, 공기청정기 설치 후 3개월 만에 증상이 70% 개선됐다고 너무 감사하다고 하시더라고요.',
      tips: '구체적인 수치와 실제 사례로 신뢰도를 높이세요',
      rating: 5.0
    },
    {
      id: 57,
      category: 'success',
      title: '경제성 만족 사례',
      situation: '가격 고민 고객에게',
      script: '처음엔 가격 때문에 고민하시던 분이 계셨는데요, 렌탈로 시작하신 후 "고장 걱정 없고 관리까지 해주니 오히려 저렴하다"며 정수기까지 추가하셨어요.',
      tips: '비슷한 고민을 했던 고객의 만족 사례 공유',
      rating: 4.8
    },
    {
      id: 58,
      category: 'success',
      title: '노인 건강 개선',
      situation: '시니어 고객 대상',
      script: '70대 어르신 댁에 설치해드렸는데, 만성 기침이 한 달 만에 사라졌대요. 병원 다니시던 것도 안 가게 됐다고 정말 좋아하셨어요. 나이 드시면 공기질이 더 중요하거든요.',
      tips: '연령대별 맞춤 사례 활용',
      rating: 4.9
    },
    {
      id: 59,
      category: 'success',
      title: '신혼부부 만족 사례',
      situation: '신혼부부 대상',
      script: '신혼집에 처음 설치해드린 부부가 있었는데, 1년 후에 아기 낳고 "공기청정기 있어서 너무 안심된다"며 비데랑 정수기까지 추가하셨어요. 아기 키우는 집은 필수예요.',
      tips: '라이프스타일 변화에 따른 만족도 강조',
      rating: 4.8
    },
    {
      id: 60,
      category: 'success',
      title: '반려동물 가정 사례',
      situation: '반려동물 키우는 고객',
      script: '강아지 3마리 키우시는 분이 털이랑 냄새 때문에 고민이셨는데, 공기청정기 설치 후 집에 손님 초대할 수 있게 됐다고 하시더라고요. 펫 필터가 정말 효과적이에요.',
      tips: '특수 상황 고객의 극적인 변화 사례',
      rating: 4.9
    },
    {
      id: 61,
      category: 'success',
      title: '천식 환자 사례',
      situation: '호흡기 질환 고객',
      script: '천식 있으신 분이 매일 흡입기 쓰셨는데, 공기청정기 쓰신 후 흡입기 사용 횟수가 절반으로 줄었대요. 의사 선생님도 공기질 관리 잘하고 있다고 칭찬하셨다고 해요.',
      tips: '의학적 효과를 전문가 의견과 함께 제시',
      rating: 5.0
    },
    {
      id: 62,
      category: 'success',
      title: '수면 질 개선',
      situation: '수면 문제 고객',
      script: '불면증으로 고생하시던 분이 공기청정기 켜고 주무시니까 수면의 질이 확 좋아졌대요. 공기가 깨끗하니까 코막힘도 없어지고 숙면을 취하신대요.',
      tips: '예상 못한 부가 효과 사례로 가치 확장',
      rating: 4.7
    },
    {
      id: 63,
      category: 'success',
      title: '새집증후군 해결',
      situation: '신축 아파트 입주',
      script: '새 아파트 입주하신 분이 두통이 심하셨는데, 공기청정기 24시간 돌리시니까 2주 만에 증상이 사라졌어요. 포름알데히드 수치도 측정해보니 정상으로 돌아왔고요.',
      tips: '측정 데이터로 객관적 효과 입증',
      rating: 4.9
    },
    {
      id: 64,
      category: 'success',
      title: '전기료 절감 사례',
      situation: '전기료 걱정 고객',
      script: '전기료 걱정하시던 분이 실제로 써보니까 한 달에 3천원밖에 안 나왔대요. 오히려 환기를 덜 해도 돼서 에어컨 사용이 줄어서 전체 전기료는 오히려 줄었다고 하시더라고요.',
      tips: '우려했던 부분이 오히려 장점이 된 사례',
      rating: 4.8
    },
    {
      id: 65,
      category: 'success',
      title: '이웃 추천 연쇄 효과',
      situation: '추천 시스템 설명',
      script: '한 분이 너무 만족하셔서 같은 층 이웃 3가구를 소개해주셨어요. 다들 설치하시고 "왜 진작 안 했을까" 하시면서 또 다른 분들 소개해주셨어요. 좋은 건 입소문이 나는 법이죠.',
      tips: '연쇄 추천 사례로 제품 신뢰도 극대화',
      rating: 5.0
    }
  ]

  const filteredScripts = scripts.filter(script => {
    const matchCategory = selectedCategory === 'all' || script.category === selectedCategory
    const matchSearch = script.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       script.script.toLowerCase().includes(searchTerm.toLowerCase())
    return matchCategory && matchSearch
  })

  return (
    <div className="script-library">
      <div className="library-header">
        <h1>📝 영업 스크립트 라이브러리</h1>
        <p>상황별 효과적인 멘트와 성공 사례 - 총 {scripts.length}개 스크립트</p>
      </div>

      <div className="search-section">
        <input
          type="text"
          placeholder="스크립트 검색..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>

      <div className="category-tabs">
        {categories.map(cat => (
          <button
            key={cat.id}
            className={`category-tab ${selectedCategory === cat.id ? 'active' : ''}`}
            onClick={() => setSelectedCategory(cat.id)}
          >
            <span>{cat.icon}</span> {cat.name}
            <span className="count">
              ({scripts.filter(s => cat.id === 'all' || s.category === cat.id).length})
            </span>
          </button>
        ))}
      </div>

      <div className="scripts-grid">
        {filteredScripts.map(script => (
          <div key={script.id} className="script-card">
            <div className="script-header">
              <h3>{script.title}</h3>
              <div className="rating">
                ⭐ {script.rating}
              </div>
            </div>
            <div className="script-situation">
              <strong>상황:</strong> {script.situation}
            </div>
            <div className="script-content">
              <strong>스크립트:</strong>
              <p>"{script.script}"</p>
            </div>
            <div className="script-tips">
              <strong>💡 팁:</strong> {script.tips}
            </div>
          </div>
        ))}
      </div>

      {filteredScripts.length === 0 && (
        <div className="no-results">
          <p>검색 결과가 없습니다.</p>
        </div>
      )}
    </div>
  )
}

export default ScriptLibrary
