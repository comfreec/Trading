import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

console.log('main.jsx 실행 시작')

try {
  const rootElement = document.getElementById('root')
  console.log('root 엘리먼트:', rootElement)
  
  if (!rootElement) {
    throw new Error('root 엘리먼트를 찾을 수 없습니다!')
  }

  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  )
  
  console.log('React 앱 렌더링 완료')
} catch (error) {
  console.error('앱 초기화 에러:', error)
  document.body.innerHTML = `
    <div style="padding: 20px; background: #f44336; color: white; font-family: monospace;">
      <h1>앱 로딩 에러</h1>
      <p>${error.message}</p>
      <pre>${error.stack}</pre>
    </div>
  `
}
