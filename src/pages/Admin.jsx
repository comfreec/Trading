import { useState, useEffect } from 'react'
import { db } from '../firebase/config'
import { collection, getDocs, deleteDoc, doc, query, orderBy } from 'firebase/firestore'
import './Admin.css'

function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  // 관리자 비밀번호 (localStorage에 저장)
  const getAdminPassword = () => {
    return localStorage.getItem('adminPassword') || '0070'
  }

  const setAdminPassword = (pwd) => {
    localStorage.setItem('adminPassword', pwd)
  }

  // 게시글 불러오기
  const loadPosts = async () => {
    setLoading(true)
    try {
      const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'))
      const querySnapshot = await getDocs(q)
      const postsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      setPosts(postsData)
    } catch (error) {
      console.error('게시글 로딩 실패:', error)
      alert('게시글을 불러오는데 실패했습니다.')
    }
    setLoading(false)
  }

  // 로그인
  const handleLogin = (e) => {
    e.preventDefault()
    if (password === getAdminPassword()) {
      setIsAuthenticated(true)
      loadPosts()
    } else {
      alert('비밀번호가 틀렸습니다.')
      setPassword('')
    }
  }

  // 비밀번호 변경
  const handleChangePassword = (e) => {
    e.preventDefault()
    
    if (!newPassword || !confirmPassword) {
      alert('모든 필드를 입력해주세요.')
      return
    }

    if (newPassword !== confirmPassword) {
      alert('새 비밀번호가 일치하지 않습니다.')
      return
    }

    if (newPassword.length < 4) {
      alert('비밀번호는 최소 4자 이상이어야 합니다.')
      return
    }

    setAdminPassword(newPassword)
    alert('비밀번호가 변경되었습니다.')
    setShowPasswordModal(false)
    setNewPassword('')
    setConfirmPassword('')
  }

  // 게시글 삭제
  const handleDelete = async (postId, postTitle) => {
    if (!window.confirm(`"${postTitle}" 게시글을 삭제하시겠습니까?`)) return

    try {
      await deleteDoc(doc(db, 'posts', postId))
      alert('게시글이 삭제되었습니다.')
      loadPosts()
    } catch (error) {
      console.error('삭제 실패:', error)
      alert('삭제에 실패했습니다.')
    }
  }

  // 전체 삭제
  const handleDeleteAll = async () => {
    if (!window.confirm('정말로 모든 게시글을 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다!')) return
    if (!window.confirm('한 번 더 확인합니다. 정말 모든 게시글을 삭제하시겠습니까?')) return

    setLoading(true)
    try {
      const deletePromises = posts.map(post => deleteDoc(doc(db, 'posts', post.id)))
      await Promise.all(deletePromises)
      alert(`${posts.length}개의 게시글이 모두 삭제되었습니다.`)
      setPosts([])
    } catch (error) {
      console.error('전체 삭제 실패:', error)
      alert('일부 게시글 삭제에 실패했습니다.')
    }
    setLoading(false)
  }

  // 로그아웃
  const handleLogout = () => {
    setIsAuthenticated(false)
    setPassword('')
    setPosts([])
  }

  // 날짜 포맷
  const formatDate = (timestamp) => {
    if (!timestamp) return '날짜 없음'
    const date = timestamp.toDate()
    return date.toLocaleString('ko-KR')
  }

  // 로그인 화면
  if (!isAuthenticated) {
    return (
      <div className="admin-login">
        <div className="login-card">
          <h1>🔐 관리자 로그인</h1>
          <p>관리자 비밀번호를 입력하세요</p>
          <form onSubmit={handleLogin}>
            <input
              type="password"
              placeholder="비밀번호"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="login-input"
              autoFocus
            />
            <button type="submit" className="login-btn">로그인</button>
          </form>
          <p className="login-hint">기본 비밀번호: 0070</p>
        </div>
      </div>
    )
  }

  // 관리자 페이지
  return (
    <div className="admin-page">
      <div className="admin-header">
        <h1>🛡️ 관리자 페이지</h1>
        <div className="admin-actions">
          <button onClick={loadPosts} className="refresh-btn" disabled={loading}>
            🔄 새로고침
          </button>
          <button onClick={() => setShowPasswordModal(true)} className="password-btn">
            🔑 비밀번호 변경
          </button>
          <button onClick={handleDeleteAll} className="delete-all-btn" disabled={loading || posts.length === 0}>
            🗑️ 전체 삭제
          </button>
          <button onClick={handleLogout} className="logout-btn">
            🚪 로그아웃
          </button>
        </div>
      </div>

      {/* 비밀번호 변경 모달 */}
      {showPasswordModal && (
        <div className="modal-overlay" onClick={() => setShowPasswordModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>🔑 비밀번호 변경</h2>
            <form onSubmit={handleChangePassword}>
              <input
                type="password"
                placeholder="새 비밀번호 (최소 4자)"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="modal-input"
                autoFocus
              />
              <input
                type="password"
                placeholder="새 비밀번호 확인"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="modal-input"
              />
              <div className="modal-buttons">
                <button type="submit" className="modal-submit-btn">변경</button>
                <button type="button" onClick={() => setShowPasswordModal(false)} className="modal-cancel-btn">
                  취소
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="admin-stats">
        <div className="stat-box">
          <h3>총 게시글</h3>
          <p className="stat-number">{posts.length}개</p>
        </div>
      </div>

      {loading ? (
        <div className="admin-loading">게시글을 불러오는 중...</div>
      ) : posts.length === 0 ? (
        <div className="admin-empty">
          <p>게시글이 없습니다.</p>
        </div>
      ) : (
        <div className="admin-posts">
          <table className="posts-table">
            <thead>
              <tr>
                <th>번호</th>
                <th>제목</th>
                <th>작성자</th>
                <th>작성일</th>
                <th>관리</th>
              </tr>
            </thead>
            <tbody>
              {posts.map((post, index) => (
                <tr key={post.id}>
                  <td>{posts.length - index}</td>
                  <td className="post-title-cell">
                    <div className="post-title">{post.title}</div>
                    <div className="post-preview">{post.content.substring(0, 50)}...</div>
                  </td>
                  <td>{post.author}</td>
                  <td className="date-cell">{formatDate(post.createdAt)}</td>
                  <td>
                    <button
                      onClick={() => handleDelete(post.id, post.title)}
                      className="delete-btn-small"
                    >
                      삭제
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default Admin
