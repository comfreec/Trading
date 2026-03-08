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
    { id: 'installation', name: '설치 문제', icon: '🏠', color: '#ffa726' }
  ]

  const claims = [
    // 제품 불량 (10개)
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

    // 서비스 불만 (8개)
    {
      id: 6,
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
      id: 7,
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
      id: 8,
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

    // 계약 관련 (7개)
    {
      id: 9,
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
      id: 10,
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

    // 환불/해지 (8개)
    {
      id: 11,
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
      id: 12,
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

    // 설치 문제 (7개)
    {
      id: 13,
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
      id: 14,
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
