import { useState, useEffect } from 'react'
import { db } from '../firebase/config'
import { collection, addDoc, getDocs, query, orderBy, deleteDoc, doc, serverTimestamp } from 'firebase/firestore'
import './Community.css'

function Community() {
  const [posts, setPosts] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [newPost, setNewPost] = useState({ title: '', content: '', author: '' })
  const [loading, setLoading] = useState(true)

  // 게시글 불러오기
  useEffect(() => {
    loadPosts()
  }, [])

  const loadPosts = async () => {
    try {
      const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'))
      const querySnapshot = await getDocs(q)
      const postsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      setPosts(postsData)
      setLoading(false)
    } catch (error) {
      console.error('게시글 로딩 실패:', error)
      setLoading(false)
    }
  }

  // 게시글 작성
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!newPost.title || !newPost.content || !newPost.author) {
      alert('모든 필드를 입력해주세요')
      return
    }

    try {
      await addDoc(collection(db, 'posts'), {
        title: newPost.title,
        content: newPost.content,
        author: newPost.author,
        createdAt: serverTimestamp(),
        likes: 0
      })

      setNewPost({ title: '', content: '', author: '' })
      setShowForm(false)
      loadPosts()
      alert('게시글이 등록되었습니다!')
    } catch (error) {
      console.error('게시글 작성 실패:', error)
      alert('게시글 작성에 실패했습니다.')
    }
  }

  // 게시글 삭제
  const handleDelete = async (postId) => {
    if (!window.confirm('정말 삭제하시겠습니까?')) return

    try {
      await deleteDoc(doc(db, 'posts', postId))
      loadPosts()
      alert('게시글이 삭제되었습니다.')
    } catch (error) {
      console.error('삭제 실패:', error)
      alert('삭제에 실패했습니다.')
    }
  }

  // 날짜 포맷
  const formatDate = (timestamp) => {
    if (!timestamp) return '방금 전'
    const date = timestamp.toDate()
    const now = new Date()
    const diff = now - date
    
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)
    
    if (minutes < 1) return '방금 전'
    if (minutes < 60) return `${minutes}분 전`
    if (hours < 24) return `${hours}시간 전`
    if (days < 7) return `${days}일 전`
    
    return date.toLocaleDateString('ko-KR')
  }

  if (loading) {
    return (
      <div className="community">
        <div className="loading">게시글을 불러오는 중...</div>
      </div>
    )
  }

  return (
    <div className="community">
      <div className="community-header">
        <h1>👥 커뮤니티</h1>
        <p>영업 노하우와 경험을 공유하세요</p>
        <button className="write-btn" onClick={() => setShowForm(!showForm)}>
          {showForm ? '✕ 취소' : '✏️ 글쓰기'}
        </button>
      </div>

      {showForm && (
        <div className="post-form">
          <h2>새 게시글 작성</h2>
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="제목"
              value={newPost.title}
              onChange={(e) => setNewPost({...newPost, title: e.target.value})}
              className="form-input"
            />
            <textarea
              placeholder="내용을 입력하세요..."
              value={newPost.content}
              onChange={(e) => setNewPost({...newPost, content: e.target.value})}
              className="form-textarea"
              rows="8"
            />
            <input
              type="text"
              placeholder="작성자"
              value={newPost.author}
              onChange={(e) => setNewPost({...newPost, author: e.target.value})}
              className="form-input"
            />
            <button type="submit" className="submit-btn">게시하기</button>
          </form>
        </div>
      )}

      <div className="posts-container">
        {posts.length === 0 ? (
          <div className="no-posts">
            <p>아직 게시글이 없습니다.</p>
            <p>첫 번째 게시글을 작성해보세요!</p>
          </div>
        ) : (
          posts.map(post => (
            <div key={post.id} className="post-card">
              <div className="post-header">
                <h3>{post.title}</h3>
                <button 
                  className="delete-btn"
                  onClick={() => handleDelete(post.id)}
                >
                  🗑️
                </button>
              </div>
              <p className="post-content">{post.content}</p>
              <div className="post-footer">
                <span className="post-author">👤 {post.author}</span>
                <span className="post-date">🕐 {formatDate(post.createdAt)}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default Community
