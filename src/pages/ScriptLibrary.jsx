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
      category: 'product',
      title: '매트리스 케어 서비스 설명',
      situation: '서비스 내용 설명 시',
      script: '저희 매트리스 케어는 3단계로 진행됩니다. 1단계 UV 살균으로 99.9% 세균 제거, 2단계 강력 흡입으로 진드기와 먼지 제거, 3단계 탈취로 쾌적한 환경을 만들어드립니다.',
      tips: '단계별로 명확하게 설명하고 수치를 활용하세요',
      rating: 4.7
    },
    {
      id: 4,
      category: 'product',
      title: '렌탈 제품 소개',
      situation: '렌탈 상품 제안 시',
      script: '고객님, 매트리스 케어가 건강에 중요하시다면 공기청정기나 정수기도 관심 있으실 것 같아요. 코웨이 제품은 렌탈로 부담 없이 시작하실 수 있고, 정기적인 관리까지 포함되어 있습니다.',
      tips: '현재 서비스와 자연스럽게 연결하세요',
      rating: 4.6
    },
    {
      id: 5,
      category: 'objection',
      title: '가격 부담 대응',
      situation: '"너무 비싼 것 같아요"',
      script: '가격이 부담되실 수 있죠. 하지만 렌탈은 초기 비용 없이 월 3만원대로 시작하실 수 있고, 고장 시 무상 A/S, 정기 관리까지 포함이에요. 10년 사용 시 구매보다 훨씬 경제적입니다.',
      tips: '장기적 관점의 경제성을 강조하세요',
      rating: 4.8
    },
    {
      id: 6,
      category: 'objection',
      title: '필요성 의문 대응',
      situation: '"지금 쓰는 게 있어서..."',
      script: '그렇군요. 혹시 지금 사용하시는 제품이 몇 년 되셨나요? 보통 5년 이상 되면 필터 효율이 50% 이하로 떨어져요. 무상 체험 기간도 있으니 한번 비교해보시는 건 어떠세요?',
      tips: '기존 제품의 한계를 부드럽게 지적하고 체험 기회 제공',
      rating: 4.7
    },
    {
      id: 7,
      category: 'objection',
      title: '타사 비교 대응',
      situation: '"다른 회사 제품이 더 싸던데요"',
      script: '가격만 보면 그럴 수 있어요. 하지만 코웨이는 40년 전통의 기술력과 전국 A/S 네트워크가 차별점입니다. 실제 사용 고객 만족도가 95%이고, 정기 관리 서비스까지 포함이에요.',
      tips: '가격 경쟁보다 가치와 신뢰도로 승부하세요',
      rating: 4.9
    },
    {
      id: 8,
      category: 'closing',
      title: '긍정 신호 포착 클로징',
      situation: '고객이 관심을 보일 때',
      script: '좋아 보이시죠? 지금 신청하시면 이번 달 프로모션으로 첫 3개월 50% 할인 혜택을 드립니다. 설치는 이번 주 중 가능하고요. 바로 진행해드릴까요?',
      tips: '망설임 없이 자신감 있게 제안하세요',
      rating: 4.8
    },
    {
      id: 9,
      category: 'closing',
      title: '부드러운 클로징',
      situation: '고객이 망설일 때',
      script: '충분히 고민하실 수 있어요. 그런데 프로모션이 이번 주까지라서요. 일단 신청하시고 7일 무료 체험 후 결정하시는 건 어떠세요? 마음에 안 드시면 위약금 없이 취소 가능합니다.',
      tips: '부담을 줄이고 체험 기회를 강조하세요',
      rating: 4.7
    },
    {
      id: 10,
      category: 'success',
      title: '알레르기 개선 사례',
      situation: '건강 효과 강조 시',
      script: '지난달에 비슷한 고민을 하시던 고객님이 계셨어요. 아이가 아토피가 심했는데, 공기청정기 설치 후 3개월 만에 증상이 70% 개선됐다고 너무 감사하다고 하시더라고요.',
      tips: '구체적인 수치와 실제 사례로 신뢰도를 높이세요',
      rating: 5.0
    },
    {
      id: 11,
      category: 'success',
      title: '경제성 만족 사례',
      situation: '가격 고민 고객에게',
      script: '처음엔 가격 때문에 고민하시던 분이 계셨는데요, 렌탈로 시작하신 후 "고장 걱정 없고 관리까지 해주니 오히려 저렴하다"며 정수기까지 추가하셨어요.',
      tips: '비슷한 고민을 했던 고객의 만족 사례 공유',
      rating: 4.8
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
        <p>상황별 효과적인 멘트와 성공 사례를 확인하세요</p>
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
