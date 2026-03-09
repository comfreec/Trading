import { useState, useEffect } from 'react'
import { db } from '../firebase/config'
import { collection, addDoc, getDocs, deleteDoc, doc, query, orderBy } from 'firebase/firestore'
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

  const generateAIFeedback = async (conversation) => {
    setIsLoadingFeedback(true)
    setShowFeedback(true)
    
    try {
      const gemini = new GeminiEngine(1)
      
      // 대화 내용을 텍스트로 변환
      const conversationText = conversation.messages
        .map(msg => `${msg.speaker === 'agent' ? '영업사원' : '고객'}: ${msg.text}`)
        .join('\n')
      
      const feedbackPrompt = `다음은 코웨이 영업사원의 실제 대화 연습 내용입니다. 전문적인 영업 코치 관점에서 상세한 피드백을 제공해주세요.

시나리오: ${conversation.scenarioTitle}

대화 내용:
${conversationText}

다음 형식으로 피드백을 작성해주세요:

1. 전체 평가 (5점 만점)
- 공감도: X/5점
- 설득력: X/5점
- 전문성: X/5점
- 타이밍: X/5점

2. 잘한 점 (3-5개)
- 구체적으로 어떤 부분이 좋았는지

3. 개선할 점 (3-5개)
- 문제점과 개선 방법을 구체적으로

4. 추천 스크립트 (2-3개)
- 더 효과적인 대안 표현

5. 종합 의견
- 전반적인 평가와 다음 연습 방향`

      const feedback = await gemini.generateResponse(feedbackPrompt)
      setAiFeedback(feedback)
    } catch (error) {
      console.error('AI 피드백 생성 실패:', error)
      setAiFeedback('AI 피드백 생성에 실패했습니다. API 키를 확인해주세요.')
    } finally {
      setIsLoadingFeedback(false)
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
                    setAiFeedback(null)
                    setShowFeedback(false)
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
                  {conv.audioUrl && (
                    <div className="card-audio-badge">🎙️ 녹음 있음</div>
                  )}
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
                  onClick={() => generateAIFeedback(selectedConversation)}
                  className="feedback-btn"
                  disabled={isLoadingFeedback}
                >
                  {isLoadingFeedback ? '⏳ 분석 중...' : '🤖 AI 피드백 받기'}
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
                <h3>🤖 AI 피드백</h3>
                {isLoadingFeedback ? (
                  <div className="loading-feedback">
                    <div className="spinner"></div>
                    <p>AI가 대화를 분석하고 있습니다...</p>
                  </div>
                ) : aiFeedback ? (
                  <div className="feedback-content">
                    <pre>{aiFeedback}</pre>
                  </div>
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
