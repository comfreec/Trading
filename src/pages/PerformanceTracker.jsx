import React, { useState } from 'react'
import './PerformanceTracker.css'

function PerformanceTracker() {
  const [records, setRecords] = useState([
    { id: 1, date: '2026-03-01', type: '매트리스케어', customer: '김OO', amount: 50000, status: '완료' },
    { id: 2, date: '2026-03-02', type: '공기청정기', customer: '이OO', amount: 45000, status: '완료' },
    { id: 3, date: '2026-03-03', type: '정수기', customer: '박OO', amount: 38000, status: '완료' },
    { id: 4, date: '2026-03-05', type: '비데', customer: '최OO', amount: 32000, status: '완료' },
    { id: 5, date: '2026-03-06', type: '매트리스케어', customer: '정OO', amount: 50000, status: '진행중' }
  ])

  const [showAddForm, setShowAddForm] = useState(false)
  const [newRecord, setNewRecord] = useState({
    date: new Date().toISOString().split('T')[0],
    type: '매트리스케어',
    customer: '',
    amount: '',
    status: '완료'
  })

  const [goals, setGoals] = useState({
    daily: 100000,
    weekly: 500000,
    monthly: 2000000
  })

  const calculateStats = () => {
    const today = new Date().toISOString().split('T')[0]
    const thisWeekStart = new Date()
    thisWeekStart.setDate(thisWeekStart.getDate() - thisWeekStart.getDay())
    const thisMonth = new Date().getMonth()

    const dailyTotal = records
      .filter(r => r.date === today && r.status === '완료')
      .reduce((sum, r) => sum + r.amount, 0)

    const weeklyTotal = records
      .filter(r => {
        const recordDate = new Date(r.date)
        return recordDate >= thisWeekStart && r.status === '완료'
      })
      .reduce((sum, r) => sum + r.amount, 0)

    const monthlyTotal = records
      .filter(r => {
        const recordDate = new Date(r.date)
        return recordDate.getMonth() === thisMonth && r.status === '완료'
      })
      .reduce((sum, r) => sum + r.amount, 0)

    return { dailyTotal, weeklyTotal, monthlyTotal }
  }

  const stats = calculateStats()

  const handleAddRecord = () => {
    if (!newRecord.customer || !newRecord.amount) {
      alert('고객명과 금액을 입력해주세요')
      return
    }

    const record = {
      id: records.length + 1,
      ...newRecord,
      amount: parseInt(newRecord.amount)
    }

    setRecords([record, ...records])
    setNewRecord({
      date: new Date().toISOString().split('T')[0],
      type: '매트리스케어',
      customer: '',
      amount: '',
      status: '완료'
    })
    setShowAddForm(false)
  }

  const getProgressColor = (current, goal) => {
    const percentage = (current / goal) * 100
    if (percentage >= 100) return '#43e97b'
    if (percentage >= 70) return '#4facfe'
    if (percentage >= 40) return '#f093fb'
    return '#fa709a'
  }

  return (
    <div className="performance-tracker">
      <div className="tracker-header">
        <h1>📊 실적 추적 & 목표 관리</h1>
        <p>영업 성과를 기록하고 목표를 달성하세요</p>
      </div>

      <div className="stats-dashboard">
        <div className="stat-box">
          <h3>오늘</h3>
          <div className="stat-amount">₩{stats.dailyTotal.toLocaleString()}</div>
          <div className="stat-goal">목표: ₩{goals.daily.toLocaleString()}</div>
          <div className="progress-bar-container">
            <div 
              className="progress-bar-fill" 
              style={{ 
                width: `${Math.min((stats.dailyTotal / goals.daily) * 100, 100)}%`,
                background: getProgressColor(stats.dailyTotal, goals.daily)
              }}
            ></div>
          </div>
          <div className="stat-percentage">
            {Math.round((stats.dailyTotal / goals.daily) * 100)}% 달성
          </div>
        </div>

        <div className="stat-box">
          <h3>이번 주</h3>
          <div className="stat-amount">₩{stats.weeklyTotal.toLocaleString()}</div>
          <div className="stat-goal">목표: ₩{goals.weekly.toLocaleString()}</div>
          <div className="progress-bar-container">
            <div 
              className="progress-bar-fill" 
              style={{ 
                width: `${Math.min((stats.weeklyTotal / goals.weekly) * 100, 100)}%`,
                background: getProgressColor(stats.weeklyTotal, goals.weekly)
              }}
            ></div>
          </div>
          <div className="stat-percentage">
            {Math.round((stats.weeklyTotal / goals.weekly) * 100)}% 달성
          </div>
        </div>

        <div className="stat-box">
          <h3>이번 달</h3>
          <div className="stat-amount">₩{stats.monthlyTotal.toLocaleString()}</div>
          <div className="stat-goal">목표: ₩{goals.monthly.toLocaleString()}</div>
          <div className="progress-bar-container">
            <div 
              className="progress-bar-fill" 
              style={{ 
                width: `${Math.min((stats.monthlyTotal / goals.monthly) * 100, 100)}%`,
                background: getProgressColor(stats.monthlyTotal, goals.monthly)
              }}
            ></div>
          </div>
          <div className="stat-percentage">
            {Math.round((stats.monthlyTotal / goals.monthly) * 100)}% 달성
          </div>
        </div>
      </div>

      <div className="records-section">
        <div className="section-header">
          <h2>영업 기록</h2>
          <button onClick={() => setShowAddForm(!showAddForm)} className="add-btn">
            {showAddForm ? '취소' : '+ 기록 추가'}
          </button>
        </div>

        {showAddForm && (
          <div className="add-form">
            <div className="form-row">
              <div className="form-group">
                <label>날짜</label>
                <input
                  type="date"
                  value={newRecord.date}
                  onChange={(e) => setNewRecord({...newRecord, date: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>유형</label>
                <select
                  value={newRecord.type}
                  onChange={(e) => setNewRecord({...newRecord, type: e.target.value})}
                >
                  <option>매트리스케어</option>
                  <option>공기청정기</option>
                  <option>정수기</option>
                  <option>비데</option>
                  <option>연수기</option>
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>고객명</label>
                <input
                  type="text"
                  value={newRecord.customer}
                  onChange={(e) => setNewRecord({...newRecord, customer: e.target.value})}
                  placeholder="고객명 입력"
                />
              </div>
              <div className="form-group">
                <label>금액</label>
                <input
                  type="number"
                  value={newRecord.amount}
                  onChange={(e) => setNewRecord({...newRecord, amount: e.target.value})}
                  placeholder="금액 입력"
                />
              </div>
              <div className="form-group">
                <label>상태</label>
                <select
                  value={newRecord.status}
                  onChange={(e) => setNewRecord({...newRecord, status: e.target.value})}
                >
                  <option>완료</option>
                  <option>진행중</option>
                  <option>대기</option>
                </select>
              </div>
            </div>
            <button onClick={handleAddRecord} className="submit-btn">
              기록 저장
            </button>
          </div>
        )}

        <div className="records-table">
          <table>
            <thead>
              <tr>
                <th>날짜</th>
                <th>유형</th>
                <th>고객명</th>
                <th>금액</th>
                <th>상태</th>
              </tr>
            </thead>
            <tbody>
              {records.map(record => (
                <tr key={record.id}>
                  <td>{record.date}</td>
                  <td>{record.type}</td>
                  <td>{record.customer}</td>
                  <td>₩{record.amount.toLocaleString()}</td>
                  <td>
                    <span className={`status-badge ${record.status}`}>
                      {record.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default PerformanceTracker
