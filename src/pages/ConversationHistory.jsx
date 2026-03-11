import { useState, useEffect } from 'react'
import { db } from '../firebase/config'
import { collection, getDocs, deleteDoc, doc, query, orderBy, updateDoc } from 'firebase/firestore'
import { GeminiEngine } from '../data/geminiEngine'
import './ConversationHistory.css'

function ConversationHistory() {
  const [savedConversations, setSavedConversations] = useState([])
  const [selectedConversation, setSelectedConversation] = useState(null)
  const [showFeedback, setShowFeedback] = useState(false)
  const [aiFeedback, setAiFeedback] = useState(null)
  const [isLoadingFeedback, setIsLoadingFeedback] = useState(false)

  useEffect(() => {
    loadConversations()
  }, [])

  const loadConversations = async () => {
    try {
      const q = query(collection(db, 'conversations'), orderBy('timestamp', 'desc'))
      const querySnapshot = await getDocs(q)
      const conversations = []
      querySnapshot.forEach((doc) => {
        conversations.push({ id: doc.id, ...doc.data() })
      })
      setSavedConversations(conversations)
    } catch (error) {
      console.error('대화 불러오기 실패:', error)
    }
  }

  const deleteConversation = async (id) => {
    if (!confirm('이 대화를 삭제하시겠습니까?')) return
    
    try {
      await deleteDoc(doc(db, 'conversations', id))
      setSavedConversations(savedConversations.filter(conv => conv.id !== id))
      if (selectedConversation?.id === id) {
        setSelectedConversation(null)
        setAiFeedback(null)
      }
      alert('✅ 대화가 삭제되었습니다')
    } catch (error) {
      console.error('삭제 실패:', error)
      alert('❌ 삭제 실패: ' + error.message)
    }
  }

  const generateAIFeedback = async (conversation, forceRegenerate = false) => {
    setIsLoadingFeedback(true)
    setShowFeedback(true)
    
    // 이미 저장된 피드백이 있고 강제 재생성이 아니면 표시만
    if (conversation.aiFeedback && !forceRegenerate) {
      setAiFeedback(conversation.aiFeedback)
      setIsLoadingFeedback(false)
      return
    }
    
    try {
      const gemini = new GeminiEngine(1)
      
      // 대화 내용을 텍스트로 변환
      const conversationText = conversation.messages
        .map((msg, idx) => `[${idx + 1}번째 대화] ${msg.speaker === 'agent' ? '영업사원' : '고객'}: "${msg.text}"`)
        .join('\n\n')
      
      const feedbackPrompt = `당신은 코웨이 영업 전문 코치입니다. 아래 대화를 분석하고 **반드시 모든 섹션을 작성**해주세요.

시나리오: ${conversation.scenarioTitle}
대화 횟수: ${conversation.messages?.length || 0}회

=== 대화 내용 ===
${conversationText}

=== 필수 작성 형식 (모든 섹션 작성 필수!) ===

## 📊 종합 평가
공감도: 4/5점 - 고객 감정을 잘 이해했습니다
설득력: 3/5점 - 논리적이나 감성적 호소 부족
전문성: 4/5점 - 제품 지식이 풍부합니다
타이밍: 3/5점 - 클로징 타이밍 개선 필요
종합 점수: 70/100점

## ✅ 잘한 점
1. **[1번 대화] 첫 인사가 자연스러웠습니다**: "안녕하세요"라는 표현으로 부담 없이 시작
2. **[3번 대화] 고객 니즈 파악**: 질문을 통해 고객 상황 이해
3. **[5번 대화] 구체적 설명**: 제품 기능을 명확히 전달

## ⚠️ 개선이 필요한 점

### 1. [2번 대화] 너무 빠른 제품 설명
**문제점**: 고객이 아직 관심을 보이기 전에 제품 설명 시작
**개선 방법**: 먼저 고객의 불편함이나 니즈를 충분히 들어주기
**추천 스크립트**: "혹시 지금 사용하시는 제품에 불편한 점은 없으신가요?"

### 2. [4번 대화] 가격 질문에 방어적 반응
**문제점**: "비싸지 않습니다"라는 직접적 부정
**개선 방법**: 가치를 먼저 설명하고 가격 제시
**추천 스크립트**: "월 3만원으로 가족 건강을 지킬 수 있다면 어떠세요?"

### 3. [6번 대화] 클로징 시도 부족
**문제점**: 대화가 끝날 때까지 계약 제안 없음
**개선 방법**: 긍정적 신호 포착 시 바로 제안
**추천 스크립트**: "그럼 오늘 바로 시작해보시겠어요?"

## 💡 실전 적용 스크립트

### 상황 1: 가격 질문 받았을 때
❌ 당신이 한 말: "비싸지 않습니다"
✅ 이렇게 바꿔보세요: "하루 커피 한 잔 값으로 가족 건강을 지킬 수 있습니다"
📌 왜 더 좋은가: 가격을 가치로 전환하여 설득력 증가

### 상황 2: 고객이 망설일 때
❌ 당신이 한 말: "좋은 제품입니다"
✅ 이렇게 바꿔보세요: "이미 우리 동네 50가구가 사용 중이세요"
📌 왜 더 좋은가: 사회적 증거로 신뢰도 상승

### 상황 3: 대화 마무리 시
❌ 당신이 한 말: "생각해보세요"
✅ 이렇게 바꿔보세요: "오늘 신청하시면 특별 사은품을 드립니다"
📌 왜 더 좋은가: 즉시 행동 유도

## 🎯 다음 연습 시 집중할 3가지
1. **경청 먼저, 설명은 나중에**: 고객 말을 최소 3번 이상 들은 후 제품 설명
2. **가격은 가치로 전환**: "월 3만원" → "하루 1,000원으로 건강 지킴"
3. **긍정 신호 포착 훈련**: "좋네요", "괜찮은데" 나오면 즉시 클로징 시도

## 💬 코치의 한마디
전반적으로 제품 지식은 우수하나, 고객 감정 읽기와 타이밍 조절이 필요합니다. 다음엔 고객이 3번 긍정 반응 보이면 바로 계약 제안해보세요!

---

**중요**: 위 형식을 정확히 따라 모든 섹션을 작성하세요. 각 섹션마다 구체적인 대화 번호를 인용하고, 실제 사용 가능한 스크립트를 제공하세요.`

      const feedback = await gemini.generateResponse(feedbackPrompt)
      
      // 피드백이 너무 짧으면 에러 처리
      if (feedback.length < 200) {
        throw new Error('피드백이 너무 짧습니다. 다시 시도해주세요.')
      }
      
      // 피드백을 구조화된 객체로 파싱
      const parsedFeedback = parseFeedback(feedback)
      setAiFeedback(parsedFeedback)
      
      // Firebase에 피드백 저장
      try {
        const conversationRef = doc(db, 'conversations', conversation.id)
        await updateDoc(conversationRef, {
          aiFeedback: parsedFeedback,
          feedbackGeneratedAt: new Date()
        })
        
        // 로컬 상태도 업데이트
        setSavedConversations(savedConversations.map(conv => 
          conv.id === conversation.id 
            ? { ...conv, aiFeedback: parsedFeedback, feedbackGeneratedAt: new Date() }
            : conv
        ))
        
        // 선택된 대화도 업데이트
        setSelectedConversation({
          ...conversation,
          aiFeedback: parsedFeedback,
          feedbackGeneratedAt: new Date()
        })
        
        console.log('✅ AI 피드백이 저장되었습니다')
      } catch (saveError) {
        console.error('피드백 저장 실패:', saveError)
        // 저장 실패해도 피드백은 표시
      }
      
    } catch (error) {
      console.error('AI 피드백 생성 실패:', error)
      setAiFeedback({
        error: true,
        message: 'AI 피드백 생성에 실패했습니다. ' + error.message
      })
    } finally {
      setIsLoadingFeedback(false)
    }
  }

  // 피드백 텍스트를 구조화된 객체로 파싱
  const parseFeedback = (feedbackText) => {
    return {
      raw: feedbackText,
      formatted: feedbackText
    }
  }

  const formatDate = (timestamp) => {
    if (!timestamp) return '날짜 없음'
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
    return date.toLocaleString('ko-KR')
  }

  return (
    <div className="conversation-history">
      <div className="history-header">
        <h1>📚 저장된 대화 연습</h1>
        <p>과거 대화를 복습하고 AI 피드백을 받아보세요</p>
      </div>

      <div className="history-content">
        <div className="conversations-list">
          <h2>대화 목록 ({savedConversations.length}개)</h2>
          {savedConversations.length === 0 ? (
            <div className="empty-state">
              <p>📭 저장된 대화가 없습니다</p>
              <p className="empty-hint">롤플레잉 연습 후 대화를 저장해보세요</p>
            </div>
          ) : (
            <div className="conversation-cards">
              {savedConversations.map(conv => (
                <div 
                  key={conv.id} 
                  className={`conversation-card ${selectedConversation?.id === conv.id ? 'selected' : ''}`}
                  onClick={() => {
                    setSelectedConversation(conv)
                    // 저장된 피드백이 있으면 자동으로 표시
                    if (conv.aiFeedback) {
                      setAiFeedback(conv.aiFeedback)
                      setShowFeedback(true)
                    } else {
                      setAiFeedback(null)
                      setShowFeedback(false)
                    }
                  }}
                >
                  <div className="card-header">
                    <span className="card-icon">{conv.scenarioIcon || '🎤'}</span>
                    <h3>{conv.scenarioTitle}</h3>
                  </div>
                  <div className="card-info">
                    <span className="card-date">📅 {formatDate(conv.timestamp)}</span>
                    <span className="card-count">💬 {conv.messages?.length || 0}개 메시지</span>
                  </div>
                  <div className="card-badges">
                    {conv.audioUrl && (
                      <div className="card-badge audio-badge">🎙️ 녹음</div>
                    )}
                    {conv.aiFeedback && (
                      <div className="card-badge feedback-badge">🤖 AI 피드백</div>
                    )}
                  </div>
                  <button 
                    className="delete-btn-small"
                    onClick={(e) => {
                      e.stopPropagation()
                      deleteConversation(conv.id)
                    }}
                  >
                    🗑️
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {selectedConversation && (
          <div className="conversation-detail">
            <div className="detail-header">
              <h2>{selectedConversation.scenarioTitle}</h2>
              <div className="detail-actions">
                <button 
                  onClick={() => {
                    // 이미 피드백이 있으면 강제 재생성
                    const forceRegenerate = !!selectedConversation.aiFeedback
                    generateAIFeedback(selectedConversation, forceRegenerate)
                  }}
                  className="feedback-btn"
                  disabled={isLoadingFeedback}
                >
                  {isLoadingFeedback ? '⏳ 분석 중...' : 
                   selectedConversation.aiFeedback ? '🔄 피드백 다시 생성' : '🤖 AI 피드백 받기'}
                </button>
                <button 
                  onClick={() => deleteConversation(selectedConversation.id)}
                  className="delete-btn"
                >
                  🗑️ 삭제
                </button>
              </div>
            </div>

            {selectedConversation.audioUrl && (
              <div className="audio-player-section">
                <h3>🎙️ 녹음 파일</h3>
                <audio controls src={selectedConversation.audioUrl} className="audio-player">
                  Your browser does not support the audio element.
                </audio>
              </div>
            )}

            <div className="messages-section">
              <h3>💬 대화 내용</h3>
              <div className="messages-list">
                {selectedConversation.messages?.map((msg, index) => (
                  <div key={index} className={`message-item ${msg.speaker}`}>
                    <div className="message-label">
                      {msg.speaker === 'agent' ? '👤 영업사원' : '🙋 고객'}
                    </div>
                    <div className="message-text">{msg.text}</div>
                  </div>
                ))}
              </div>
            </div>

            {showFeedback && (
              <div className="ai-feedback-section">
                <h3>🤖 AI 전문 코치 피드백</h3>
                {isLoadingFeedback ? (
                  <div className="loading-feedback">
                    <div className="spinner"></div>
                    <p>AI 전문 코치가 대화를 분석하고 있습니다...</p>
                    <p className="loading-hint">구체적이고 실용적인 피드백을 준비 중입니다</p>
                  </div>
                ) : aiFeedback ? (
                  aiFeedback.error ? (
                    <div className="feedback-error">
                      <p>❌ {aiFeedback.message}</p>
                    </div>
                  ) : (
                    <div className="feedback-content-enhanced">
                      <div className="feedback-intro">
                        <p>💼 20년 경력 영업 코치의 전문 분석</p>
                        <p className="feedback-subtitle">실전에서 바로 적용 가능한 구체적 피드백</p>
                      </div>
                      <div className="feedback-body">
                        {aiFeedback.formatted.split('\n').map((line, idx) => {
                          // 제목 스타일링
                          if (line.startsWith('## ')) {
                            return <h3 key={idx} className="feedback-section-title">{line.replace('## ', '')}</h3>
                          }
                          // 소제목 스타일링
                          if (line.startsWith('### ')) {
                            return <h4 key={idx} className="feedback-subsection-title">{line.replace('### ', '')}</h4>
                          }
                          // 리스트 아이템
                          if (line.match(/^[\d]+\./)) {
                            return <div key={idx} className="feedback-list-item">{line}</div>
                          }
                          // 강조 표시
                          if (line.includes('**')) {
                            const formatted = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                            return <p key={idx} className="feedback-text" dangerouslySetInnerHTML={{ __html: formatted }} />
                          }
                          // 체크/엑스 마크
                          if (line.startsWith('✅') || line.startsWith('❌') || line.startsWith('📌')) {
                            return <div key={idx} className="feedback-highlight">{line}</div>
                          }
                          // 일반 텍스트
                          if (line.trim()) {
                            return <p key={idx} className="feedback-text">{line}</p>
                          }
                          return <br key={idx} />
                        })}
                      </div>
                      <div className="feedback-actions">
                        <button 
                          onClick={() => {
                            navigator.clipboard.writeText(aiFeedback.raw)
                            alert('✅ 피드백이 클립보드에 복사되었습니다!')
                          }}
                          className="copy-feedback-btn"
                        >
                          📋 피드백 복사하기
                        </button>
                      </div>
                    </div>
                  )
                ) : null}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default ConversationHistory
