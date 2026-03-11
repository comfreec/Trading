import React, { useState, useEffect } from 'react'
import { getAPIKeys } from '../data/geminiEngine'
import './MyScripts.css'

function MyScripts() {
  const [scripts, setScripts] = useState([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [showAIGenerator, setShowAIGenerator] = useState(false)
  const [editingScript, setEditingScript] = useState(null)
  const [formData, setFormData] = useState({
    title: '',
    category: '인사',
    situation: '',
    script: '',
    tags: ''
  })
  const [aiPrompt, setAiPrompt] = useState('')
  const [aiGenerating, setAiGenerating] = useState(false)
  const [generatedScripts, setGeneratedScripts] = useState([])
  const [isListening, setIsListening] = useState(false)
  const [recognition, setRecognition] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')

  const categories = [
    '인사',
    '니즈 파악',
    '제품 소개',
    '가격 설명',
    '반론 대응',
    '클로징',
    '감사 인사',
    '기타'
  ]

  // localStorage에서 스크립트 불러오기
  useEffect(() => {
    const savedScripts = localStorage.getItem('myScripts')
    if (savedScripts) {
      setScripts(JSON.parse(savedScripts))
    }

    // 음성 인식 초기화
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (SpeechRecognition) {
      const recognitionInstance = new SpeechRecognition()
      recognitionInstance.continuous = false
      recognitionInstance.interimResults = false // 최종 결과만 받기
      recognitionInstance.lang = 'ko-KR'

      recognitionInstance.onstart = () => {
        setIsListening(true)
      }

      recognitionInstance.onresult = (event) => {
        const transcript = event.results[0][0].transcript
        // 기존 텍스트에 추가 (공백으로 구분)
        setAiPrompt(prev => {
          if (prev.trim()) {
            return prev + ' ' + transcript
          }
          return transcript
        })
      }

      recognitionInstance.onerror = (event) => {
        console.error('음성 인식 오류:', event.error)
        setIsListening(false)
        if (event.error === 'not-allowed') {
          alert('마이크 권한이 필요합니다. 브라우저 설정에서 마이크 권한을 허용해주세요.')
        } else if (event.error === 'no-speech') {
          // 음성이 감지되지 않으면 조용히 종료
          console.log('음성이 감지되지 않았습니다.')
        }
      }

      recognitionInstance.onend = () => {
        setIsListening(false)
      }

      setRecognition(recognitionInstance)
    }
  }, [])

  // 스크립트 저장
  const saveScripts = (newScripts) => {
    localStorage.setItem('myScripts', JSON.stringify(newScripts))
    setScripts(newScripts)
  }

  // 폼 초기화
  const resetForm = () => {
    setFormData({
      title: '',
      category: '인사',
      situation: '',
      script: '',
      tags: ''
    })
    setEditingScript(null)
    setShowAddForm(false)
  }

  // 스크립트 추가/수정
  const handleSubmit = (e) => {
    e.preventDefault()
    
    const newScript = {
      id: editingScript ? editingScript.id : Date.now(),
      ...formData,
      tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
      createdAt: editingScript ? editingScript.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    if (editingScript) {
      // 수정
      const updatedScripts = scripts.map(s => s.id === editingScript.id ? newScript : s)
      saveScripts(updatedScripts)
    } else {
      // 추가
      saveScripts([...scripts, newScript])
    }

    resetForm()
  }

  // 스크립트 삭제
  const handleDelete = (id) => {
    if (confirm('이 멘트를 삭제하시겠습니까?')) {
      const updatedScripts = scripts.filter(s => s.id !== id)
      saveScripts(updatedScripts)
    }
  }

  // 스크립트 편집
  const handleEdit = (script) => {
    setFormData({
      title: script.title,
      category: script.category,
      situation: script.situation,
      script: script.script,
      tags: script.tags.join(', ')
    })
    setEditingScript(script)
    setShowAddForm(true)
  }

  // 스크립트 복사
  const handleCopy = (script) => {
    navigator.clipboard.writeText(script.script)
    alert('✅ 멘트가 클립보드에 복사되었습니다!')
  }

  // 카테고리별 필터링
  const [selectedCategory, setSelectedCategory] = useState('전체')
  
  // 검색 및 필터링
  const filteredScripts = scripts.filter(script => {
    // 카테고리 필터
    const categoryMatch = selectedCategory === '전체' || script.category === selectedCategory
    
    // 검색어 필터
    if (!searchQuery.trim()) {
      return categoryMatch
    }
    
    const query = searchQuery.toLowerCase()
    const titleMatch = script.title.toLowerCase().includes(query)
    const situationMatch = script.situation?.toLowerCase().includes(query)
    const scriptMatch = script.script.toLowerCase().includes(query)
    const tagsMatch = script.tags.some(tag => tag.toLowerCase().includes(query))
    
    return categoryMatch && (titleMatch || situationMatch || scriptMatch || tagsMatch)
  })

  // AI로 멘트 생성
  const generateWithAI = async () => {
    if (!aiPrompt.trim()) {
      alert('상황을 설명해주세요!')
      return
    }

    const apiKeys = getAPIKeys()
    if (apiKeys.length === 0) {
      alert('❌ Gemini API 키가 필요합니다.\n\n고객 시뮬레이터 또는 롤플레잉 페이지에서 API 키를 추가해주세요.')
      return
    }

    setAiGenerating(true)
    setGeneratedScripts([])

    try {
      const apiKey = apiKeys[0]
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              role: 'user',
              parts: [{
                text: `당신은 코웨이 영업 전문가입니다. 다음 상황에 맞는 효과적인 영업 멘트를 3가지 작성해주세요.

**상황:**
${aiPrompt}

**요구사항:**
1. 각 멘트는 실제로 사용할 수 있는 구체적이고 자연스러운 대화체로 작성
2. 고객의 니즈와 감정을 고려한 공감형 멘트
3. 코웨이 제품의 가치를 효과적으로 전달
4. 각 멘트는 2-4문장으로 구성
5. 서로 다른 접근 방식 제시 (예: 감성적 접근, 논리적 접근, 혜택 중심 접근)

**출력 형식 (JSON):**
[
  {
    "title": "멘트 제목",
    "category": "카테고리 (인사/니즈 파악/제품 소개/가격 설명/반론 대응/클로징/감사 인사/기타 중 하나)",
    "approach": "접근 방식 (예: 감성적 접근)",
    "script": "실제 멘트 내용",
    "tags": ["태그1", "태그2", "태그3"]
  }
]

반드시 JSON 형식으로만 응답하세요. 다른 설명은 포함하지 마세요.`
              }]
            }],
            generationConfig: {
              temperature: 0.8,
              topK: 40,
              topP: 0.95,
              maxOutputTokens: 2000
            }
          })
        }
      )

      if (!response.ok) {
        throw new Error('API 요청 실패')
      }

      const data = await response.json()
      const generatedText = data.candidates[0].content.parts[0].text
      
      // JSON 추출 (```json ... ``` 형식 처리)
      let jsonText = generatedText
      const jsonMatch = generatedText.match(/```json\s*([\s\S]*?)\s*```/)
      if (jsonMatch) {
        jsonText = jsonMatch[1]
      } else {
        // ``` 없이 [ 로 시작하는 경우
        const arrayMatch = generatedText.match(/\[[\s\S]*\]/)
        if (arrayMatch) {
          jsonText = arrayMatch[0]
        }
      }

      const generated = JSON.parse(jsonText)
      setGeneratedScripts(generated)
    } catch (error) {
      console.error('AI 생성 오류:', error)
      alert('❌ 멘트 생성 실패: ' + error.message)
    } finally {
      setAiGenerating(false)
    }
  }

  // AI 생성 멘트를 폼에 적용
  const useGeneratedScript = (generated) => {
    setFormData({
      title: generated.title,
      category: generated.category,
      situation: aiPrompt,
      script: generated.script,
      tags: generated.tags.join(', ')
    })
    setShowAIGenerator(false)
    setShowAddForm(true)
    setAiPrompt('')
    setGeneratedScripts([])
  }

  // AI 생성 멘트를 바로 저장
  const saveGeneratedScript = (generated) => {
    const newScript = {
      id: Date.now(),
      title: generated.title,
      category: generated.category,
      situation: aiPrompt,
      script: generated.script,
      tags: generated.tags,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    saveScripts([...scripts, newScript])
    alert('✅ 멘트가 저장되었습니다!')
  }

  // 음성 입력 토글
  const toggleVoiceInput = () => {
    if (!recognition) {
      alert('이 브라우저는 음성 인식을 지원하지 않습니다. Chrome 또는 Safari를 사용해주세요.')
      return
    }

    if (isListening) {
      recognition.stop()
    } else {
      try {
        recognition.start()
      } catch (error) {
        console.error('음성 인식 시작 오류:', error)
        if (error.message && error.message.includes('already started')) {
          // 이미 실행 중이면 중지 후 재시작
          recognition.stop()
          setTimeout(() => {
            try {
              recognition.start()
            } catch (e) {
              console.error('재시작 오류:', e)
            }
          }, 100)
        }
      }
    }
  }

  return (
    <div className="my-scripts">
      <div className="scripts-header">
        <h1>📝 나만의 영업 멘트</h1>
        <p>자주 사용하는 멘트를 저장하고 관리하세요</p>
      </div>

      <div className="scripts-actions">
        <button 
          onClick={() => {
            setShowAIGenerator(!showAIGenerator)
            setShowAddForm(false)
          }}
          className="ai-generate-btn"
        >
          {showAIGenerator ? '❌ 취소' : '🤖 AI 멘트 생성'}
        </button>
        <button 
          onClick={() => {
            setShowAddForm(!showAddForm)
            setShowAIGenerator(false)
          }}
          className="add-script-btn"
        >
          {showAddForm ? '❌ 취소' : '➕ 직접 작성'}
        </button>
      </div>

      {showAIGenerator && (
        <div className="ai-generator-container">
          <h2>🤖 AI 영업 멘트 생성</h2>
          <p className="ai-description">
            현재 판매 상황을 설명하면 AI가 최적의 영업 멘트를 제안합니다
          </p>
          
          <div className="ai-input-section">
            <label>상황 설명 *</label>
            <textarea
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              placeholder="예시:&#10;- 고객이 가격이 너무 비싸다고 말할 때&#10;- 첫 방문 고객에게 인사할 때&#10;- 경쟁사 제품과 비교를 요구할 때&#10;- 계약을 망설이는 고객을 설득할 때"
              rows="6"
              disabled={aiGenerating}
            />
            <div className="ai-button-group">
              <button 
                onClick={toggleVoiceInput}
                className={`voice-input-btn ${isListening ? 'listening' : ''}`}
                disabled={aiGenerating}
                title={isListening ? '음성 입력 중지' : '음성으로 입력'}
              >
                {isListening ? '🎤 듣는 중...' : '🎙️ 음성 입력'}
              </button>
              <button 
                onClick={generateWithAI}
                className="generate-btn"
                disabled={aiGenerating || !aiPrompt.trim()}
              >
                {aiGenerating ? '⏳ 생성 중...' : '✨ 멘트 생성하기'}
              </button>
            </div>
          </div>

          {generatedScripts.length > 0 && (
            <div className="generated-scripts">
              <h3>생성된 멘트 ({generatedScripts.length}개)</h3>
              {generatedScripts.map((gen, idx) => (
                <div key={idx} className="generated-script-card">
                  <div className="generated-header">
                    <h4>{gen.title}</h4>
                    <div className="generated-meta">
                      <span className="generated-category">{gen.category}</span>
                      <span className="generated-approach">{gen.approach}</span>
                    </div>
                  </div>
                  <div className="generated-content">
                    {gen.script}
                  </div>
                  <div className="generated-tags">
                    {gen.tags.map((tag, i) => (
                      <span key={i} className="tag">#{tag}</span>
                    ))}
                  </div>
                  <div className="generated-actions">
                    <button 
                      onClick={() => useGeneratedScript(gen)}
                      className="use-btn"
                    >
                      ✏️ 수정 후 저장
                    </button>
                    <button 
                      onClick={() => saveGeneratedScript(gen)}
                      className="save-direct-btn"
                    >
                      💾 바로 저장
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {showAddForm && (
        <div className="script-form-container">
          <h2>{editingScript ? '멘트 수정' : '새 멘트 추가'}</h2>
          <form onSubmit={handleSubmit} className="script-form">
            <div className="form-group">
              <label>제목 *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                placeholder="예: 첫 인사 멘트"
                required
              />
            </div>

            <div className="form-group">
              <label>카테고리 *</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
                required
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>상황 설명</label>
              <input
                type="text"
                value={formData.situation}
                onChange={(e) => setFormData({...formData, situation: e.target.value})}
                placeholder="예: 고객이 가격이 비싸다고 할 때"
              />
            </div>

            <div className="form-group">
              <label>멘트 내용 *</label>
              <textarea
                value={formData.script}
                onChange={(e) => setFormData({...formData, script: e.target.value})}
                placeholder="멘트 내용을 입력하세요..."
                rows="6"
                required
              />
            </div>

            <div className="form-group">
              <label>태그 (쉼표로 구분)</label>
              <input
                type="text"
                value={formData.tags}
                onChange={(e) => setFormData({...formData, tags: e.target.value})}
                placeholder="예: 가격, 할인, 프로모션"
              />
            </div>

            <div className="form-buttons">
              <button type="submit" className="submit-btn">
                {editingScript ? '✅ 수정 완료' : '✅ 저장'}
              </button>
              <button type="button" onClick={resetForm} className="cancel-btn">
                취소
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="search-section">
        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="제목, 내용, 태그로 검색..."
            className="search-input"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="clear-search-btn"
              title="검색 초기화"
            >
              ✕
            </button>
          )}
        </div>
        {searchQuery && (
          <div className="search-result-info">
            검색 결과: {filteredScripts.length}개
          </div>
        )}
      </div>

      <div className="scripts-filter">
        <button
          className={`filter-btn ${selectedCategory === '전체' ? 'active' : ''}`}
          onClick={() => setSelectedCategory('전체')}
        >
          전체 ({scripts.length})
        </button>
        {categories.map(cat => {
          const count = scripts.filter(s => s.category === cat).length
          return (
            <button
              key={cat}
              className={`filter-btn ${selectedCategory === cat ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat} ({count})
            </button>
          )
        })}
      </div>

      <div className="scripts-list">
        {filteredScripts.length === 0 ? (
          <div className="empty-state">
            <p>📝 저장된 멘트가 없습니다</p>
            <p>위의 "새 멘트 추가" 버튼을 눌러 첫 멘트를 작성해보세요!</p>
          </div>
        ) : (
          filteredScripts.map(script => (
            <div key={script.id} className="script-card">
              <div className="script-header">
                <div className="script-title-area">
                  <h3>{script.title}</h3>
                  <span className="script-category">{script.category}</span>
                </div>
                <div className="script-actions">
                  <button onClick={() => handleCopy(script)} className="copy-btn" title="복사">
                    📋
                  </button>
                  <button onClick={() => handleEdit(script)} className="edit-btn" title="수정">
                    ✏️
                  </button>
                  <button onClick={() => handleDelete(script.id)} className="delete-btn" title="삭제">
                    🗑️
                  </button>
                </div>
              </div>

              {script.situation && (
                <div className="script-situation">
                  <strong>상황:</strong> {script.situation}
                </div>
              )}

              <div className="script-content">
                {script.script}
              </div>

              {script.tags.length > 0 && (
                <div className="script-tags">
                  {script.tags.map((tag, idx) => (
                    <span key={idx} className="tag">#{tag}</span>
                  ))}
                </div>
              )}

              <div className="script-meta">
                <span>작성: {new Date(script.createdAt).toLocaleDateString()}</span>
                {script.updatedAt !== script.createdAt && (
                  <span>수정: {new Date(script.updatedAt).toLocaleDateString()}</span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default MyScripts
