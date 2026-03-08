import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'

// Firebase 설정 - Trading 프로젝트
const firebaseConfig = {
  apiKey: "AIzaSyBWLcxcC5zne2IejXzdn2Ohzw8pzBltjP0",
  authDomain: "trading-47a90.firebaseapp.com",
  projectId: "trading-47a90",
  storageBucket: "trading-47a90.firebasestorage.app",
  messagingSenderId: "279010366458",
  appId: "1:279010366458:web:266d3273b137252ebc4a43",
  measurementId: "G-WPK4H25T9P"
}

// Firebase 초기화
const app = initializeApp(firebaseConfig)

// Firestore 데이터베이스
export const db = getFirestore(app)

// Firebase 인증
export const auth = getAuth(app)

export default app
