import { useState } from 'react'
import './ClaimGuide.css'

function ClaimGuide() {
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [expandedId, setExpandedId] = useState(null)

  const categories = [
    { id: 'all', name: '전체', icon: '📋', color: '#667eea' },
    { id: 'product', name: '제품 불량', icon: '🔧', color: '#f093fb' },
    { id: 'service', name: '서비스 불만', icon: '😤', color: '#fa709a' },
    { id: 'contract', name: '계약 관련', icon: '📄', color: '#4facfe' },
    { id: 'refund', name: '환불/해지', icon: '💰', color: '#43e97b' },
    { id: 'installation', name: '설치 문제', icon: '🏠', color: '#ffa726' },
    { id: 'billing', name: '요금/청구', icon: '💳', color: '#9c27b0' },
    { id: 'delivery', name: '배송/물류', icon: '🚚', color: '#ff5722' },
    { id: 'communication', name: '소통 문제', icon: '📞', color: '#00bcd4' }
  ]

  const claims = [
    // 제품 불량 (8개)
    {
      id: 1,
      category: 'product',
      title: '공기청정기 소음이 너무 큽니다',
      situation: '고객이 제품 소음에 대해 불만 제기',
      response: `"불편을 드려 죄송합니다. 소음 문제는 몇 가지 원인이 있을 수 있습니다.

1단계: 즉시 사과
"고객님, 소음으로 불편을 드려 정말 죄송합니다."

2단계: 원인 파악
"혹시 어떤 모드로 사용 중이신가요? 자동 모드인가요, 강풍 모드인가요?"
"소음이 언제부터 발생했나요? 처음부터인가요, 아니면 최근에 심해졌나요?"

3단계: 즉시 해결 방안 제시
- 수면 모드 사용 안내 (25dB로 매우 조용함)
- 필터 청소 또는 교체 필요 여부 확인
- 제품 위치 변경 제안 (벽에서 10cm 이상 떨어뜨리기)

4단계: 방문 점검 약속
"그래도 소음이 계속되면 내일 바로 방문해서 점검해드리겠습니다. 필요시 제품 교체도 가능합니다."`,
      solution: '24시간 내 방문 점검, 필터 교체 또는 제품 교체',
      prevention: '설치 시 소음 테스트 및 수면 모드 사용법 충분히 안내',
      severity: 'medium'
    },
    {
      id: 2,
      category: 'product',
      title: '정수기 물맛이 이상합니다',
      situation: '물맛 변화로 인한 불만',
      response: `"물맛 문제는 건강과 직결되는 중요한 사항입니다. 즉시 확인하겠습니다.

1단계: 진심 어린 사과
"고객님, 물맛이 이상하다니 정말 죄송합니다. 바로 확인하겠습니다."

2단계: 상세 질문
"어떤 맛이 나나요? (쓴맛, 비린내, 플라스틱 냄새 등)"
"언제부터 그러셨나요?"
"필터 교체는 언제 하셨나요?"

3단계: 즉시 조치
- 필터 교체 시기 확인 (6개월 경과 시 즉시 교체)
- 물탱크 청소 필요 여부 확인
- 배관 문제 가능성 체크

4단계: 긴급 대응
"오늘 중으로 방문해서 필터 교체하고 전체 점검해드리겠습니다. 그 전까지는 생수 사용을 권장드립니다."`,
      solution: '당일 방문, 필터 즉시 교체, 전체 시스템 점검',
      prevention: '정기 관리 일정 준수, 필터 교체 알림 사전 발송',
      severity: 'high'
    },
    {
      id: 3,
      category: 'product',
      title: '비데 물이 안 나옵니다',
      situation: '비데 작동 불량',
      response: `"불편을 드려 죄송합니다. 비데는 위생과 관련된 제품이라 빠르게 해결하겠습니다.

1단계: 사과 및 공감
"고객님, 비데를 사용하지 못하시면 정말 불편하시겠어요. 죄송합니다."

2단계: 전화로 즉시 해결 시도
"지금 바로 확인해보겠습니다."
- 전원 확인
- 수압 조절 다이얼 확인
- 노즐 막힘 여부 확인
- 급수 밸브 개방 여부 확인

3단계: 전화로 해결 안 되면
"오늘 오후에 바로 방문하겠습니다. 혹시 급하시면 오전에도 가능합니다."

4단계: 보상 제안
"불편을 드린 점 죄송합니다. 이번 달 렌탈료 10% 할인해드리겠습니다."`,
      solution: '당일 방문 수리, 부품 교체, 렌탈료 할인',
      prevention: '설치 후 작동 테스트 철저히, 사용법 상세 안내',
      severity: 'high'
    },
    {
      id: 4,
      category: 'product',
      title: '제품에서 냄새가 납니다',
      situation: '제품 이상 냄새 발생',
      response: `"냄새 문제는 즉시 확인이 필요합니다.

1단계: 안전 확인
"고객님, 혹시 타는 냄새인가요? 그렇다면 즉시 전원을 꺼주세요."

2단계: 냄새 종류 파악
"어떤 냄새인가요? (플라스틱, 곰팡이, 타는 냄새 등)"
"언제부터 나기 시작했나요?"

3단계: 원인별 대응
- 새 제품 냄새: 1-2일 환기 후 사라짐 안내
- 곰팡이 냄새: 필터 교체 및 청소 필요
- 타는 냄새: 즉시 사용 중지, 긴급 방문

4단계: 즉시 조치
"오늘 중으로 방문해서 확인하고, 필요시 제품 교체해드리겠습니다."`,
      solution: '긴급 방문, 원인 파악 후 필터 교체 또는 제품 교체',
      prevention: '신제품 설치 시 환기 안내, 정기 청소 중요성 강조',
      severity: 'high'
    },
    {
      id: 5,
      category: 'product',
      title: '제품이 자주 고장납니다',
      situation: '반복적인 고장으로 불만',
      response: `"같은 문제가 반복되어 정말 죄송합니다.

1단계: 진심 어린 사과
"고객님, 여러 번 불편을 드려 정말 죄송합니다. 이번에는 확실하게 해결하겠습니다."

2단계: 이력 확인
"지금까지 몇 번 수리를 받으셨나요?"
"같은 문제인가요, 다른 문제인가요?"

3단계: 근본 해결 제안
"이렇게 반복되는 것은 제품 자체의 문제일 수 있습니다."
"새 제품으로 교체해드리겠습니다. 추가 비용은 전혀 없습니다."

4단계: 보상 및 신뢰 회복
"불편을 드린 점 사과의 의미로 다음 달 렌탈료 면제해드리겠습니다."
"앞으로는 이런 일이 없도록 최선을 다하겠습니다."`,
      solution: '신제품 교체, 렌탈료 1개월 면제, 정기 점검 강화',
      prevention: '초기 불량 발생 시 즉시 교체, 수리 이력 관리',
      severity: 'critical'
    },
    {
      id: 6,
      category: 'product',
      title: '매트리스에서 진드기가 나왔어요',
      situation: '매트리스 위생 문제',
      response: `"위생 문제로 불쾌하셨다니 정말 죄송합니다.

1단계: 즉각 사과
"고객님, 진드기 문제로 놀라셨겠습니다. 정말 죄송합니다."

2단계: 상황 파악
"언제 발견하셨나요?"
"마지막 케어 서비스는 언제 받으셨나요?"

3단계: 긴급 조치
"오늘 바로 방문해서 전문 살균 케어 서비스를 해드리겠습니다."
"UV 살균과 고온 스팀으로 완벽하게 처리하겠습니다."

4단계: 보상 및 예방
"이번 달 렌탈료 면제하고, 앞으로 2개월마다 무료 케어 서비스 제공하겠습니다."
"진드기 방지 커버도 무료로 제공해드리겠습니다."`,
      solution: '긴급 살균 케어, 렌탈료 면제, 정기 케어 강화',
      prevention: '정기 케어 주기 단축, 위생 관리 교육',
      severity: 'critical'
    },
    {
      id: 7,
      category: 'product',
      title: '안마의자가 너무 아파요',
      situation: '안마 강도 불만',
      response: `"안마의자가 불편하시다니 죄송합니다.

1단계: 사과 및 확인
"고객님, 어느 부위가 아프신가요?"
"어떤 모드로 사용하셨나요?"

2단계: 즉시 해결 방법 안내
"강도 조절을 가장 약하게 설정해보세요."
"처음에는 10분 정도만 짧게 사용하시고, 점차 시간을 늘려가세요."
"목/어깨만 집중 케어하는 부분 마사지 모드를 추천드립니다."

3단계: 방문 점검
"그래도 불편하시면 내일 방문해서 맞춤 설정해드리겠습니다."

4단계: 교체 옵션
"체형에 맞지 않는 것 같으면 다른 모델로 교체도 가능합니다."`,
      solution: '사용법 재교육, 맞춤 설정, 필요시 모델 교체',
      prevention: '설치 시 체형별 맞춤 설정, 시연 충분히',
      severity: 'medium'
    },
    {
      id: 8,
      category: 'product',
      title: '연수기 설치 후 물이 미끈거려요',
      situation: '연수 효과에 대한 오해',
      response: `"연수기 효과에 대해 설명이 부족했던 것 같습니다.

1단계: 이해와 설명
"고객님, 그건 정상입니다. 오히려 잘 작동하고 있다는 증거예요."

2단계: 상세 설명
"경수(센물)의 칼슘, 마그네슘이 제거되면서 물이 부드러워진 겁니다."
"비누 거품이 잘 나고, 피부가 촉촉해지는 효과가 있어요."
"미끈한 느낌은 2-3주 사용하시면 익숙해지십니다."

3단계: 장점 강조
"머리카락이 부드러워지고, 피부 트러블이 줄어듭니다."
"욕실 물때도 훨씬 덜 생깁니다."

4단계: 대안 제시
"그래도 불편하시면 연수 강도를 조절해드릴 수 있습니다."`,
      solution: '연수 효과 재교육, 적응 기간 안내, 강도 조절',
      prevention: '설치 전 연수 효과 충분히 설명, 체험 권장',
      severity: 'low'
    },
    // 서비스 불만 (6개)
    {
      id: 9,
      category: 'service',
      title: 'A/S 기사가 약속 시간에 안 왔습니다',
      situation: '방문 약속 불이행',
      response: `"약속을 지키지 못해 정말 죄송합니다.

1단계: 즉각 사과
"고객님, 약속 시간을 지키지 못해 정말 죄송합니다. 변명의 여지가 없습니다."

2단계: 상황 파악
"기사님께 즉시 연락해서 상황을 확인하겠습니다."
(기사 연락 후) "교통 체증으로 지연되고 있습니다. 30분 후 도착 예정입니다."

3단계: 대안 제시
"오늘 방문이 어려우시면 고객님이 편하신 시간으로 다시 예약해드리겠습니다."
"긴급하시면 다른 기사님을 즉시 보내드릴 수도 있습니다."

4단계: 보상
"불편을 드린 점 죄송합니다. 이번 방문 서비스 비용은 면제해드리겠습니다."`,
      solution: '즉시 재방문 약속, 서비스 비용 면제',
      prevention: '방문 전날 확인 연락, 출발 시 알림 문자',
      severity: 'high'
    },
    {
      id: 10,
      category: 'service',
      title: '기사님이 불친절했습니다',
      situation: '서비스 태도 불만',
      response: `"직원의 불친절로 불쾌하셨다니 정말 죄송합니다.

1단계: 진심 어린 사과
"고객님, 저희 직원이 불친절했다니 정말 죄송합니다. 회사를 대표해서 사과드립니다."

2단계: 상세 경위 청취
"어떤 상황이었는지 자세히 말씀해주시겠어요?"
"정확히 파악해서 재발 방지하겠습니다."

3단계: 즉시 조치 약속
"해당 직원에게 즉시 교육하고, 경고 조치하겠습니다."
"고객님께는 다른 담당자를 배정해드리겠습니다."

4단계: 보상 및 신뢰 회복
"불쾌하셨던 점 사과드리며, 다음 달 렌탈료 20% 할인해드리겠습니다."
"앞으로는 이런 일이 없도록 서비스 교육을 강화하겠습니다."`,
      solution: '담당자 교체, 렌탈료 할인, 직원 교육',
      prevention: '정기 서비스 교육, 고객 만족도 조사',
      severity: 'high'
    },
    {
      id: 11,
      category: 'service',
      title: '정기 관리를 안 해줍니다',
      situation: '정기 관리 누락',
      response: `"정기 관리를 놓쳐서 죄송합니다.

1단계: 사과 및 확인
"고객님, 정기 관리 일정을 놓쳐서 죄송합니다."
"마지막 관리가 언제였는지 확인하겠습니다."

2단계: 즉시 일정 조율
"이번 주 중으로 방문해서 관리해드리겠습니다."
"고객님 편하신 날짜와 시간을 말씀해주세요."

3단계: 보상
"관리가 늦어진 점 죄송합니다. 이번 관리 시 필터 추가로 하나 더 교체해드리겠습니다."

4단계: 재발 방지
"앞으로는 관리 일정 1주일 전에 미리 연락드리겠습니다."`,
      solution: '즉시 방문 관리, 필터 추가 제공, 알림 시스템 강화',
      prevention: '자동 알림 시스템, 관리 일정 사전 공지',
      severity: 'medium'
    },
    {
      id: 12,
      category: 'service',
      title: '기사님이 신발을 안 벗고 들어왔어요',
      situation: '방문 매너 불만',
      response: `"기본 매너를 지키지 못해 정말 죄송합니다.

1단계: 즉시 사과
"고객님, 신발을 벗지 않고 들어갔다니 정말 죄송합니다."

2단계: 상황 확인
"혹시 집안이 더러워졌나요?"
"청소가 필요하시면 즉시 해드리겠습니다."

3단계: 직원 교육 약속
"해당 기사에게 엄중히 경고하고 재교육하겠습니다."
"이런 일이 다시는 없도록 하겠습니다."

4단계: 보상
"불쾌하셨던 점 사과드리며, 전문 청소 서비스를 무료로 제공해드리겠습니다."`,
      solution: '청소 서비스 제공, 직원 교육, 담당자 교체',
      prevention: '방문 매너 교육 강화, 체크리스트 확인',
      severity: 'medium'
    },
    {
      id: 13,
      category: 'service',
      title: '관리 후 제품이 더 안 좋아졌어요',
      situation: '관리 후 제품 상태 악화',
      response: `"관리 후 오히려 문제가 생겼다니 정말 죄송합니다.

1단계: 즉시 사과
"고객님, 관리를 받으셨는데 더 안 좋아졌다니 저희 책임입니다."

2단계: 구체적 증상 파악
"어떤 점이 안 좋아졌나요?"
"관리 전에는 어땠나요?"

3단계: 긴급 재방문
"오늘 중으로 다시 방문해서 확인하고 바로 조치하겠습니다."
"필요하면 부품 교체나 제품 교체도 가능합니다."

4단계: 보상
"이번 달 렌탈료 전액 면제하고, 다음 3개월 관리 서비스 무료로 제공하겠습니다."`,
      solution: '긴급 재점검, 렌탈료 면제, 무료 관리 서비스',
      prevention: '관리 후 작동 테스트 철저히, 고객 확인 필수',
      severity: 'critical'
    },
    {
      id: 14,
      category: 'service',
      title: '전화를 해도 연결이 안 돼요',
      situation: '고객센터 연결 불량',
      response: `"연락이 어려우셨다니 정말 죄송합니다.

1단계: 사과
"고객님, 전화 연결이 안 되어 불편하셨죠. 죄송합니다."

2단계: 대안 제시
"지금 바로 제가 담당자로 배정되었습니다."
"앞으로는 이 번호로 직접 연락 주시면 바로 연결됩니다."
"카카오톡 채널로도 문의 가능합니다."

3단계: 즉시 처리
"지금 필요하신 서비스가 무엇인가요?"
"바로 처리해드리겠습니다."

4단계: 시스템 개선 약속
"고객센터 인력을 보강하고, 대기 시간을 줄이도록 하겠습니다."`,
      solution: '전담 담당자 배정, 다양한 연락 채널 안내',
      prevention: '고객센터 인력 확충, 콜백 시스템 도입',
      severity: 'medium'
    },

    // 계약 관련 (5개)
    {
      id: 15,
      category: 'contract',
      title: '계약 내용과 다릅니다',
      situation: '계약 조건 불일치',
      response: `"계약 내용과 다르다니 죄송합니다. 즉시 확인하겠습니다.

1단계: 계약서 확인
"고객님, 계약서를 함께 확인해보겠습니다."
"어떤 부분이 다른가요?"

2단계: 원인 파악
- 영업사원 설명 오류
- 계약서 작성 오류
- 프로모션 적용 누락

3단계: 즉시 시정
"고객님 말씀이 맞습니다. 계약서대로 즉시 수정하겠습니다."
"이번 달부터 정확한 금액으로 청구하겠습니다."

4단계: 보상
"잘못 청구된 금액은 전액 환불해드리고, 불편을 드린 점 사과드리며 1개월 렌탈료 면제해드리겠습니다."`,
      solution: '계약 조건 수정, 과다 청구 환불, 렌탈료 면제',
      prevention: '계약서 작성 시 고객과 함께 확인, 이중 체크',
      severity: 'critical'
    },
    {
      id: 16,
      category: 'contract',
      title: '약정 기간을 몰랐습니다',
      situation: '약정 기간 미인지',
      response: `"약정 기간 설명이 부족했던 점 죄송합니다.

1단계: 사과 및 확인
"고객님, 약정 기간 설명이 부족했다면 저희 잘못입니다."
"계약서에 3년 약정으로 되어 있습니다."

2단계: 상황 이해
"해지를 원하시는 특별한 사유가 있으신가요?"

3단계: 대안 제시
"지금 해지하시면 위약금이 발생합니다만, 몇 가지 대안이 있습니다."
- 제품 변경 (더 저렴한 모델로)
- 일시 정지 (최대 3개월)
- 타인 양도

4단계: 유연한 대응
"부득이한 사정이시라면 위약금을 최소화하는 방법을 찾아보겠습니다."`,
      solution: '대안 제시, 위약금 협의, 유연한 해결',
      prevention: '계약 시 약정 기간 명확히 설명, 서명 전 재확인',
      severity: 'medium'
    },
    {
      id: 17,
      category: 'contract',
      title: '영업사원이 거짓말을 했어요',
      situation: '영업 과정에서 허위 설명',
      response: `"영업 과정에서 잘못된 정보를 드렸다니 정말 죄송합니다.

1단계: 진심 어린 사과
"고객님, 잘못된 정보로 계약하셨다면 저희의 큰 잘못입니다."

2단계: 사실 확인
"어떤 내용을 들으셨나요?"
"실제로는 어떻게 다른가요?"

3단계: 해결 방안
"계약을 취소하시거나, 정확한 조건으로 재계약하실 수 있습니다."
"이미 납부하신 금액은 전액 환불해드립니다."

4단계: 재발 방지
"해당 영업사원은 즉시 교육하고, 영업 프로세스를 개선하겠습니다."
"고객님께는 특별 할인 혜택을 드리겠습니다."`,
      solution: '계약 취소 또는 재계약, 전액 환불, 특별 할인',
      prevention: '영업 교육 강화, 계약 내용 녹취 또는 문서화',
      severity: 'critical'
    },
    {
      id: 18,
      category: 'contract',
      title: '프로모션이 적용 안 됐어요',
      situation: '프로모션 혜택 누락',
      response: `"프로모션 적용이 누락되어 죄송합니다.

1단계: 사과 및 확인
"고객님, 프로모션 혜택을 못 받으셨다니 죄송합니다."
"어떤 프로모션이었나요?"

2단계: 즉시 적용
"지금 바로 프로모션을 적용해드리겠습니다."
"다음 달부터 할인된 금액으로 청구됩니다."

3단계: 소급 적용
"이미 납부하신 차액은 다음 달 렌탈료에서 차감해드리겠습니다."

4단계: 추가 혜택
"불편을 드린 점 사과드리며, 추가로 1개월 더 할인해드리겠습니다."`,
      solution: '프로모션 즉시 적용, 차액 환불, 추가 할인',
      prevention: '계약 시 프로모션 코드 확인, 시스템 자동 체크',
      severity: 'high'
    },
    {
      id: 19,
      category: 'contract',
      title: '계약서를 못 받았어요',
      situation: '계약서 미전달',
      response: `"계약서를 전달하지 못해 죄송합니다.

1단계: 사과
"고객님, 계약서를 못 받으셨다니 죄송합니다."

2단계: 즉시 발송
"지금 바로 이메일과 문자로 전자 계약서를 보내드리겠습니다."
"원본이 필요하시면 우편으로도 발송해드립니다."

3단계: 확인
"계약서 받으시면 내용 확인해주시고, 문의사항 있으시면 연락 주세요."

4단계: 시스템 개선
"앞으로는 계약 즉시 자동으로 발송되도록 시스템을 개선하겠습니다."`,
      solution: '즉시 전자/우편 발송, 수령 확인',
      prevention: '계약 시 즉시 발송, 수령 확인 시스템',
      severity: 'low'
    },

    // 환불/해지 (5개)
    {
      id: 20,
      category: 'refund',
      title: '환불 요청합니다',
      situation: '고객 환불 요청',
      response: `"환불을 원하시는군요. 사유를 여쭤봐도 될까요?

1단계: 사유 파악
"어떤 이유로 환불을 원하시나요?"
- 제품 불만족
- 경제적 사정
- 이사
- 타사 제품 구매

2단계: 환불 조건 안내
"7일 이내 설치 제품: 전액 환불 가능"
"7일 경과: 약정 기간에 따라 위약금 발생"

3단계: 대안 제시
"환불 대신 이런 방법은 어떠세요?"
- 제품 교체
- 렌탈료 할인
- 일시 정지

4단계: 환불 진행
"그래도 환불을 원하시면 절차를 안내해드리겠습니다."
"위약금 계산서와 환불 신청서를 보내드리겠습니다."`,
      solution: '환불 조건 확인, 대안 제시, 환불 절차 안내',
      prevention: '7일 체험 기간 적극 활용, 만족도 확인',
      severity: 'high'
    },
    {
      id: 21,
      category: 'refund',
      title: '위약금이 너무 비쌉니다',
      situation: '위약금 불만',
      response: `"위약금이 부담되시는군요. 설명드리겠습니다.

1단계: 위약금 산정 근거 설명
"위약금은 잔여 약정 기간의 렌탈료 50%입니다."
"현재 OO개월 남아서 OO만원입니다."

2단계: 공감 및 이해
"금액이 부담되실 수 있습니다. 이해합니다."

3단계: 감면 방안 검토
"특별한 사유가 있으시면 위약금 감면을 검토해보겠습니다."
- 경제적 어려움
- 건강 문제
- 불가피한 이사

4단계: 분할 납부 제안
"한 번에 부담되시면 3개월 분할 납부도 가능합니다."`,
      solution: '위약금 설명, 감면 검토, 분할 납부 제안',
      prevention: '계약 시 위약금 조항 명확히 설명',
      severity: 'medium'
    },
    {
      id: 22,
      category: 'refund',
      title: '해지했는데 제품 회수를 안 가요',
      situation: '제품 회수 지연',
      response: `"제품 회수가 지연되어 죄송합니다.

1단계: 사과
"고객님, 제품 회수가 늦어져 불편하시죠. 죄송합니다."

2단계: 즉시 일정 조율
"이번 주 중으로 회수 가능합니다."
"언제가 편하신가요?"

3단계: 보관료 면제
"회수가 늦어진 기간의 보관료는 청구하지 않겠습니다."

4단계: 신속 처리
"회수 후 환불금은 3일 이내 입금해드리겠습니다."`,
      solution: '즉시 회수 일정 확정, 보관료 면제, 신속 환불',
      prevention: '해지 즉시 회수 일정 확정, 자동 알림',
      severity: 'medium'
    },
    {
      id: 23,
      category: 'refund',
      title: '환불금이 아직 안 들어왔어요',
      situation: '환불 지연',
      response: `"환불이 지연되어 정말 죄송합니다.

1단계: 즉시 사과
"고객님, 환불이 늦어져 죄송합니다."

2단계: 상황 확인
"언제 해지 신청하셨나요?"
"제품 회수는 완료되었나요?"

3단계: 즉시 처리
"지금 바로 확인해서 오늘 중으로 입금 처리하겠습니다."
"입금 완료되면 문자로 알려드리겠습니다."

4단계: 보상
"지연된 기간에 대한 이자를 추가로 지급해드리겠습니다."`,
      solution: '즉시 환불 처리, 지연 이자 지급',
      prevention: '환불 자동화 시스템, 처리 기한 준수',
      severity: 'high'
    },
    {
      id: 24,
      category: 'refund',
      title: '이사 가는데 해지해야 하나요?',
      situation: '이사로 인한 해지 문의',
      response: `"이사 가시는군요. 해지하실 필요 없습니다.

1단계: 안심시키기
"고객님, 이사 가셔도 제품은 그대로 사용하실 수 있습니다."

2단계: 이전 서비스 안내
"무료로 제품 이전 서비스를 제공해드립니다."
"철거, 운반, 재설치 모두 무료입니다."

3단계: 일정 조율
"이사 날짜가 언제신가요?"
"그 날에 맞춰서 이전 서비스 예약해드리겠습니다."

4단계: 추가 안내
"새 집 주소와 연락처만 알려주시면 됩니다."
"이사 후에도 동일한 조건으로 계속 사용하실 수 있습니다."`,
      solution: '무료 이전 서비스 제공, 일정 조율',
      prevention: '이사 시 이전 서비스 사전 안내',
      severity: 'low'
    },

    // 설치 문제 (4개)
    {
      id: 25,
      category: 'installation',
      title: '설치 날짜를 변경하고 싶습니다',
      situation: '설치 일정 변경 요청',
      response: `"설치 날짜 변경이 필요하시군요.

1단계: 사유 확인
"무슨 일이 생기셨나요?"

2단계: 즉시 조율
"언제가 편하신가요?"
"이번 주 OO일, OO일 중에 가능하신가요?"

3단계: 확정 및 안내
"그럼 OO일 OO시로 변경하겠습니다."
"전날 다시 한번 확인 연락드리겠습니다."

4단계: 유연한 대응
"혹시 또 변경이 필요하시면 언제든 연락 주세요."`,
      solution: '즉시 일정 변경, 확인 연락',
      prevention: '설치 전날 확인 연락, 유연한 일정 관리',
      severity: 'low'
    },
    {
      id: 26,
      category: 'installation',
      title: '설치 후 집이 지저분합니다',
      situation: '설치 후 청소 불만',
      response: `"설치 후 청소가 미흡했다니 죄송합니다.

1단계: 즉시 사과
"고객님, 청소를 제대로 하지 못해 정말 죄송합니다."

2단계: 즉시 재방문
"오늘 중으로 다시 방문해서 깨끗하게 청소하겠습니다."

3단계: 보상
"불편을 드린 점 사과드리며, 전문 청소 서비스를 무료로 제공해드리겠습니다."

4단계: 재발 방지
"앞으로는 설치 후 청소 체크리스트를 철저히 확인하겠습니다."`,
      solution: '즉시 재방문 청소, 전문 청소 서비스 제공',
      prevention: '설치 후 청소 체크리스트, 고객 확인',
      severity: 'medium'
    },
    {
      id: 27,
      category: 'installation',
      title: '설치 위치가 마음에 안 들어요',
      situation: '설치 위치 불만',
      response: `"설치 위치가 마음에 안 드시는군요.

1단계: 이해
"고객님, 어느 위치가 더 좋으실 것 같으세요?"

2단계: 재설치 가능 여부 확인
"그 위치로 이동 가능합니다."
"배관 길이와 전원 위치를 확인해보겠습니다."

3단계: 즉시 조치
"가능하면 지금 바로 이동해드리겠습니다."
"추가 작업이 필요하면 내일 다시 방문하겠습니다."

4단계: 무료 제공
"설치 후 7일 이내는 위치 변경이 무료입니다."`,
      solution: '즉시 또는 재방문 위치 변경, 무료 제공',
      prevention: '설치 전 위치 충분히 상의, 시뮬레이션',
      severity: 'low'
    },
    {
      id: 28,
      category: 'installation',
      title: '설치 중에 벽에 구멍이 났어요',
      situation: '설치 중 시설 손상',
      response: `"설치 중 벽이 손상되었다니 정말 죄송합니다.

1단계: 즉각 사과
"고객님, 벽에 구멍이 났다니 정말 죄송합니다. 저희 책임입니다."

2단계: 사진 촬영 및 확인
"손상 부위 사진을 찍어서 기록하겠습니다."
"어느 정도 크기인가요?"

3단계: 즉시 보수
"전문 보수 업체를 불러서 완벽하게 복구해드리겠습니다."
"비용은 전액 저희가 부담합니다."

4단계: 보상
"불편을 드린 점 사과드리며, 이번 달 렌탈료 면제해드리겠습니다."`,
      solution: '전문 보수 서비스, 비용 전액 부담, 렌탈료 면제',
      prevention: '설치 전 시설 보호, 작업 중 주의 교육',
      severity: 'critical'
    },

    // 요금/청구 (4개)
    {
      id: 29,
      category: 'billing',
      title: '렌탈료가 갑자기 올랐어요',
      situation: '렌탈료 인상 불만',
      response: `"렌탈료 변동에 대해 설명이 부족했던 것 같습니다.

1단계: 사과 및 확인
"고객님, 렌탈료가 올라서 놀라셨죠. 확인해보겠습니다."

2단계: 원인 파악
- 프로모션 기간 종료
- 약정 기간 변경
- 청구 오류

3단계: 상세 설명
"처음 6개월은 프로모션 가격이었고, 이제 정상 가격으로 전환되었습니다."
"계약서 OO페이지에 명시되어 있습니다."

4단계: 대안 제시
"부담되시면 더 저렴한 모델로 변경하실 수 있습니다."
"또는 장기 약정으로 변경하시면 할인 가능합니다."`,
      solution: '요금 변동 설명, 대안 제시, 모델 변경 옵션',
      prevention: '계약 시 요금 변동 명확히 설명, 사전 안내',
      severity: 'medium'
    },
    {
      id: 30,
      category: 'billing',
      title: '이중으로 청구됐어요',
      situation: '중복 청구',
      response: `"이중 청구되었다니 정말 죄송합니다.

1단계: 즉시 사과
"고객님, 중복 청구로 불편을 드려 죄송합니다."

2단계: 확인
"청구 내역을 확인해보겠습니다."
"언제 얼마가 두 번 청구되었나요?"

3단계: 즉시 환불
"확인 결과 중복 청구가 맞습니다."
"오늘 중으로 환불 처리하겠습니다."

4단계: 보상
"불편을 드린 점 사과드리며, 다음 달 렌탈료 10% 할인해드리겠습니다."`,
      solution: '즉시 환불, 렌탈료 할인, 시스템 점검',
      prevention: '청구 시스템 이중 체크, 자동화 개선',
      severity: 'high'
    },
    {
      id: 31,
      category: 'billing',
      title: '자동이체가 안 됐어요',
      situation: '자동이체 실패',
      response: `"자동이체가 실패했군요. 확인해보겠습니다.

1단계: 상황 파악
"고객님, 계좌에 잔액은 충분하셨나요?"
"카드 유효기간이 만료되지는 않았나요?"

2단계: 원인 확인
- 잔액 부족
- 카드 만료
- 은행 시스템 오류

3단계: 재결제 안내
"원인을 확인했습니다. 다시 결제 진행하겠습니다."
"연체료는 부과하지 않겠습니다."

4단계: 결제 수단 변경
"필요하시면 다른 계좌나 카드로 변경 가능합니다."`,
      solution: '재결제 진행, 연체료 면제, 결제 수단 변경',
      prevention: '결제 전 잔액 확인 알림, 카드 만료 사전 안내',
      severity: 'medium'
    },
    {
      id: 32,
      category: 'billing',
      title: '청구서를 못 받았어요',
      situation: '청구서 미수령',
      response: `"청구서를 못 받으셨군요.

1단계: 사과
"고객님, 청구서가 전달되지 않아 불편하셨죠."

2단계: 즉시 재발송
"지금 바로 이메일과 문자로 청구서를 보내드리겠습니다."
"우편 청구서도 필요하시면 발송해드립니다."

3단계: 연락처 확인
"혹시 이메일이나 전화번호가 변경되셨나요?"
"최신 정보로 업데이트해드리겠습니다."

4단계: 자동 발송 설정
"앞으로는 매월 자동으로 청구서가 발송됩니다."`,
      solution: '즉시 청구서 재발송, 연락처 업데이트',
      prevention: '청구서 자동 발송 시스템, 수신 확인',
      severity: 'low'
    },

    // 배송/물류 (3개)
    {
      id: 33,
      category: 'delivery',
      title: '제품이 약속한 날짜에 안 왔어요',
      situation: '배송 지연',
      response: `"배송이 지연되어 정말 죄송합니다.

1단계: 즉시 사과
"고객님, 약속한 날짜에 제품이 도착하지 않아 죄송합니다."

2단계: 배송 상태 확인
"지금 바로 배송 상태를 확인하겠습니다."
"현재 OO 단계에 있습니다."

3단계: 새로운 일정 제시
"내일 오전에 반드시 배송하겠습니다."
"시간대를 지정해주시면 그 시간에 맞춰 배송하겠습니다."

4단계: 보상
"배송 지연에 대한 사과로 첫 달 렌탈료 20% 할인해드리겠습니다."`,
      solution: '긴급 배송, 시간 지정 배송, 렌탈료 할인',
      prevention: '배송 일정 여유 있게 설정, 실시간 추적',
      severity: 'high'
    },
    {
      id: 34,
      category: 'delivery',
      title: '배송 중 제품이 파손됐어요',
      situation: '배송 중 제품 손상',
      response: `"배송 중 제품이 파손되었다니 정말 죄송합니다.

1단계: 즉각 사과
"고객님, 새 제품이 파손되어 도착했다니 정말 죄송합니다."

2단계: 사진 확인
"파손 부위 사진을 보내주시겠어요?"
"정확히 확인해서 처리하겠습니다."

3단계: 즉시 교체
"오늘 중으로 새 제품을 다시 배송해드리겠습니다."
"파손된 제품은 회수해가겠습니다."

4단계: 보상
"불편을 드린 점 사과드리며, 첫 2개월 렌탈료 면제해드리겠습니다."`,
      solution: '즉시 신제품 재배송, 2개월 렌탈료 면제',
      prevention: '포장 강화, 배송 중 취급 주의 교육',
      severity: 'critical'
    },
    {
      id: 35,
      category: 'delivery',
      title: '다른 제품이 왔어요',
      situation: '오배송',
      response: `"잘못된 제품이 배송되었다니 정말 죄송합니다.

1단계: 즉시 사과
"고객님, 주문하신 제품과 다른 제품이 배송되어 죄송합니다."

2단계: 확인
"어떤 제품을 주문하셨고, 어떤 제품이 왔나요?"

3단계: 즉시 교환
"오늘 중으로 정확한 제품을 다시 배송해드리겠습니다."
"잘못 배송된 제품은 동시에 회수해가겠습니다."

4단계: 보상
"불편을 드린 점 사과드리며, 첫 달 렌탈료 전액 면제해드리겠습니다."`,
      solution: '즉시 정품 재배송, 렌탈료 면제',
      prevention: '출고 전 이중 확인, 바코드 스캔 시스템',
      severity: 'high'
    },

    // 소통 문제 (2개)
    {
      id: 36,
      category: 'communication',
      title: '문자/이메일을 너무 많이 보내요',
      situation: '과도한 마케팅 메시지',
      response: `"마케팅 메시지가 과도했다니 죄송합니다.

1단계: 사과
"고객님, 문자와 이메일이 너무 많아서 불편하셨죠. 죄송합니다."

2단계: 즉시 수신 거부 처리
"지금 바로 마케팅 수신 거부 처리해드리겠습니다."
"앞으로는 필수 안내만 받으시게 됩니다."

3단계: 선택 옵션 안내
"필요하신 정보만 선택적으로 받으실 수도 있습니다."
- 정기 관리 안내만
- 프로모션 정보만
- 청구서만

4단계: 확인
"수신 거부 처리 완료했습니다. 확인 문자 보내드렸습니다."`,
      solution: '즉시 수신 거부 처리, 선택적 수신 옵션',
      prevention: '마케팅 동의 명확히, 수신 빈도 조절',
      severity: 'low'
    },
    {
      id: 37,
      category: 'communication',
      title: '담당자가 자꾸 바뀌어요',
      situation: '담당자 잦은 변경',
      response: `"담당자가 자주 바뀌어 불편하셨죠. 죄송합니다.

1단계: 사과 및 이해
"고객님, 담당자가 계속 바뀌면 불편하시죠. 이해합니다."

2단계: 원인 설명
"조직 개편이나 담당 구역 조정으로 변경되었습니다."

3단계: 전담 배정
"이제부터는 OOO 담당자가 계속 관리해드립니다."
"담당자 직통 번호를 알려드리겠습니다."

4단계: 인수인계 철저
"이전 담당자로부터 고객님 정보를 상세히 인수인계 받았습니다."
"처음부터 다시 설명하실 필요 없습니다."`,
      solution: '전담 담당자 배정, 직통 번호 제공, 철저한 인수인계',
      prevention: '담당자 변경 최소화, 변경 시 사전 안내',
      severity: 'medium'
    }
  ]

  const filteredClaims = claims.filter(claim => {
    const matchCategory = selectedCategory === 'all' || claim.category === selectedCategory
    const matchSearch = claim.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       claim.situation.toLowerCase().includes(searchTerm.toLowerCase())
    return matchCategory && matchSearch
  })

  const getSeverityColor = (severity) => {
    switch(severity) {
      case 'critical': return '#f44336'
      case 'high': return '#ff9800'
      case 'medium': return '#ffc107'
      case 'low': return '#4caf50'
      default: return '#999'
    }
  }

  const getSeverityText = (severity) => {
    switch(severity) {
      case 'critical': return '긴급'
      case 'high': return '높음'
      case 'medium': return '보통'
      case 'low': return '낮음'
      default: return '-'
    }
  }

  return (
    <div className="claim-guide">
      <div className="claim-header">
        <h1>🛡️ 클레임 대응 매뉴얼</h1>
        <p>상황별 대응 화법과 해결 방안 - 총 {claims.length}개 사례</p>
      </div>

      <div className="search-section">
        <input
          type="text"
          placeholder="클레임 검색..."
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
            style={{ 
              borderColor: selectedCategory === cat.id ? cat.color : 'transparent',
              color: selectedCategory === cat.id ? cat.color : '#666'
            }}
            onClick={() => setSelectedCategory(cat.id)}
          >
            <span>{cat.icon}</span> {cat.name}
            <span className="count">
              ({claims.filter(c => cat.id === 'all' || c.category === cat.id).length})
            </span>
          </button>
        ))}
      </div>

      <div className="claims-grid">
        {filteredClaims.map(claim => (
          <div key={claim.id} className="claim-card">
            <div className="claim-card-header">
              <h3>{claim.title}</h3>
              <span 
                className="severity-badge"
                style={{ backgroundColor: getSeverityColor(claim.severity) }}
              >
                {getSeverityText(claim.severity)}
              </span>
            </div>
            
            <div className="claim-situation">
              <strong>📌 상황:</strong> {claim.situation}
            </div>

            <button 
              className="expand-btn"
              onClick={() => setExpandedId(expandedId === claim.id ? null : claim.id)}
            >
              {expandedId === claim.id ? '▲ 접기' : '▼ 대응 방법 보기'}
            </button>

            {expandedId === claim.id && (
              <div className="claim-details">
                <div className="detail-section">
                  <h4>💬 대응 화법</h4>
                  <pre className="response-text">{claim.response}</pre>
                </div>

                <div className="detail-section">
                  <h4>✅ 해결 방안</h4>
                  <p>{claim.solution}</p>
                </div>

                <div className="detail-section">
                  <h4>🛡️ 예방 방법</h4>
                  <p>{claim.prevention}</p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {filteredClaims.length === 0 && (
        <div className="no-results">
          <p>검색 결과가 없습니다.</p>
        </div>
      )}

      <div className="claim-tips">
        <h2>📚 클레임 대응 기본 원칙</h2>
        <div className="tips-grid">
          <div className="tip-card">
            <div className="tip-number">1</div>
            <h3>즉시 사과</h3>
            <p>변명하지 말고 먼저 진심으로 사과하세요</p>
          </div>
          <div className="tip-card">
            <div className="tip-number">2</div>
            <h3>경청</h3>
            <p>고객의 불만을 끝까지 들어주세요</p>
          </div>
          <div className="tip-card">
            <div className="tip-number">3</div>
            <h3>공감</h3>
            <p>고객의 입장에서 이해하고 공감하세요</p>
          </div>
          <div className="tip-card">
            <div className="tip-number">4</div>
            <h3>신속 대응</h3>
            <p>24시간 내 해결 방안을 제시하세요</p>
          </div>
          <div className="tip-card">
            <div className="tip-number">5</div>
            <h3>보상</h3>
            <p>적절한 보상으로 신뢰를 회복하세요</p>
          </div>
          <div className="tip-card">
            <div className="tip-number">6</div>
            <h3>재발 방지</h3>
            <p>같은 문제가 반복되지 않도록 조치하세요</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ClaimGuide
