import React, { useState } from 'react'
import './Community.css'

function Community() {
  const [activeTab, setActiveTab] = useState('posts')
  const [showPostForm, setShowPostForm] = useState(false)
  const [newPost, setNewPost] = useState({ title: '', content: '', category: '노하우' })

  const [posts, setPosts] = useState([
    {
      id: 1,
      category: '노하우',
      title: '가격 협상 시 절대 하지 말아야 할 3가지',
      author: '김영업',
      date: '2026-03-07',
      likes: 45,
      comments: 12,
      content: '1. 먼저 가격을 깎아주지 마세요. 2. 경쟁사를 비난하지 마세요. 3. 제품 가치를 낮추지 마세요...'
    },
    {
      id: 2,
      category: '성공사례',
      title: '한 달에 20건 계약한 비결',
      author: '이성공',
      date: '2026-03-06',
      likes: 89,
      comments: 23,
      content: '매트리스 케어 후 바로 렌탈 제안하는 타이밍이 중요합니다. 고객이 서비스에 만족했을 때...'
    },
    {
      id: 3,
      category: '질문',
      title: '거절당한 고객 재방문 타이밍은?',
      author: '박초보',
      date: '2026-03-05',
      likes: 23,
      comments: 15,
      content: '지난주에 거절당한 고객이 있는데, 언제쯤 다시 연락하는 게 좋을까요?'
    },
    {
      id: 4,
      category: '노하우',
      title: '신규 고객 발굴 루트 공유',
      author: '최베테랑',
      date: '2026-03-04',
      likes: 67,
      comments: 19,
      content: '아파트 단지 게시판 활용법과 지역 맘카페 마케팅 방법을 공유합니다...'
    }
  ])

  const [bestSellers, setBestSellers] = useState([
    { rank: 1, name: '김영업', sales: 2500000, badge: '🏆' },
    { rank: 2, name: '이성공', sales: 2300000, badge: '🥈' },
    { rank: 3, name: '박달성', sales: 2100000, badge: '🥉' },
    { rank: 4, name: '최베테랑', sales: 1900000, badge: '⭐' },
    { rank: 5, name: '정프로', sales: 1800000, badge: '⭐' }
  ])

  const handleAddPost = () => {
    if (!newPost.title || !newPost.content) {
      alert('제목과 내용을 입력해주세요')
      return
    }

    const post = {
      id: posts.length + 1,
      ...newPost,
      author: '나',
      date: new Date().toISOString().split('T')[0],
      likes: 0,
      comments: 0
    }

    setPosts([post, ...posts])
    setNewPost({ title: '', content: '', category: '노하우' })
    setShowPostForm(false)
  }

  const handleLike = (postId) => {
    setPosts(posts.map(post => 
      post.id === postId ? { ...post, likes: post.likes + 1 } : post
    ))
  }

  return (
    <div className="community">
      <div className="community-header">
        <h1>👥 커뮤니티</h1>
        <p>동료들과 노하우를 공유하고 함께 성장하세요</p>
      </div>

      <div className="community-tabs">
        <button 
          className={`tab ${activeTab === 'posts' ? 'active' : ''}`}
          onClick={() => setActiveTab('posts')}
        >
          📝 게시판
        </button>
        <button 
          className={`tab ${activeTab === 'ranking' ? 'active' : ''}`}
          onClick={() => setActiveTab('ranking')}
        >
          🏆 이달의 랭킹
        </button>
      </div>

      {activeTab === 'posts' ? (
        <div className="posts-section">
          <div className="posts-header">
            <h2>게시글</h2>
            <button onClick={() => setShowPostForm(!showPostForm)} className="write-btn">
              {showPostForm ? '취소' : '✏️ 글쓰기'}
            </button>
          </div>

          {showPostForm && (
            <div className="post-form">
              <select
                value={newPost.category}
                onChange={(e) => setNewPost({...newPost, category: e.target.value})}
                className="category-select"
              >
                <option>노하우</option>
                <option>성공사례</option>
                <option>질문</option>
                <option>자유</option>
              </select>
              <input
                type="text"
                placeholder="제목을 입력하세요"
                value={newPost.title}
                onChange={(e) => setNewPost({...newPost, title: e.target.value})}
                className="title-input"
              />
              <textarea
                placeholder="내용을 입력하세요"
                value={newPost.content}
                onChange={(e) => setNewPost({...newPost, content: e.target.value})}
                className="content-textarea"
                rows="6"
              />
              <button onClick={handleAddPost} className="submit-post-btn">
                게시글 등록
              </button>
            </div>
          )}

          <div className="posts-list">
            {posts.map(post => (
              <div key={post.id} className="post-card">
                <div className="post-category-badge">{post.category}</div>
                <h3 className="post-title">{post.title}</h3>
                <p className="post-content">{post.content}</p>
                <div className="post-meta">
                  <span className="post-author">👤 {post.author}</span>
                  <span className="post-date">📅 {post.date}</span>
                </div>
                <div className="post-actions">
                  <button onClick={() => handleLike(post.id)} className="like-btn">
                    ❤️ {post.likes}
                  </button>
                  <button className="comment-btn">
                    💬 {post.comments}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="ranking-section">
          <h2>🏆 이달의 베스트 영업사원</h2>
          <p className="ranking-subtitle">2026년 3월 실적 기준</p>
          
          <div className="ranking-list">
            {bestSellers.map(seller => (
              <div key={seller.rank} className={`ranking-card rank-${seller.rank}`}>
                <div className="rank-badge">{seller.badge}</div>
                <div className="rank-number">#{seller.rank}</div>
                <div className="seller-info">
                  <h3>{seller.name}</h3>
                  <p className="sales-amount">₩{seller.sales.toLocaleString()}</p>
                </div>
                {seller.rank <= 3 && (
                  <div className="achievement-badge">
                    {seller.rank === 1 ? '👑 최고 영업왕' : 
                     seller.rank === 2 ? '🌟 우수 영업' : 
                     '💪 실력자'}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="ranking-info">
            <h3>💡 랭킹 혜택</h3>
            <ul>
              <li>🥇 1위: 특별 보너스 + 해외 연수 기회</li>
              <li>🥈 2위: 특별 보너스 + 상품권</li>
              <li>🥉 3위: 특별 보너스</li>
              <li>⭐ 4-10위: 우수 영업 인증서</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}

export default Community
