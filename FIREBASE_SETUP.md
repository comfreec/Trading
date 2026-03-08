# Firebase 설정 가이드

## 1. Firebase Console에서 설정 가져오기

1. https://console.firebase.google.com/ 접속
2. "Trading" 프로젝트 선택
3. 프로젝트 설정 (⚙️ 아이콘) 클릭
4. "일반" 탭에서 "내 앱" 섹션으로 스크롤
5. 웹 앱이 없다면 "앱 추가" → "웹" 선택
6. 앱 닉네임 입력 (예: "코웨이 영업 마스터")
7. Firebase SDK 구성 코드 복사

## 2. src/firebase/config.js 파일 수정

복사한 설정을 `src/firebase/config.js` 파일에 붙여넣기:

```javascript
const firebaseConfig = {
  apiKey: "여기에_API_KEY",
  authDomain: "trading-xxxxx.firebaseapp.com",
  projectId: "trading-xxxxx",
  storageBucket: "trading-xxxxx.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:xxxxx"
}
```

## 3. Firestore Database 설정

1. Firebase Console에서 "Firestore Database" 메뉴 클릭
2. "데이터베이스 만들기" 클릭
3. 보안 규칙 선택:
   - 테스트 모드로 시작 (개발용)
   - 또는 프로덕션 모드 (보안 규칙 직접 설정)
4. 위치 선택: asia-northeast3 (서울) 권장
5. "사용 설정" 클릭

## 4. Firestore 보안 규칙 설정

Firebase Console → Firestore Database → 규칙 탭:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // 게시글 컬렉션
    match /posts/{postId} {
      // 모든 사용자가 읽기 가능
      allow read: if true;
      // 모든 사용자가 쓰기 가능 (개발용)
      allow write: if true;
    }
  }
}
```

## 5. 환경 변수 설정 (선택사항)

보안을 위해 `.env` 파일 사용:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

그리고 `config.js`에서:

```javascript
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
}
```

## 6. 테스트

1. `npm run dev` 실행
2. 커뮤니티 페이지 접속
3. 게시글 작성 테스트
4. Firebase Console에서 Firestore에 데이터 확인

## 데이터 구조

### posts 컬렉션
```
posts/
  └── {postId}/
      ├── title: string
      ├── content: string
      ├── author: string
      ├── createdAt: timestamp
      └── likes: number
```

## 문제 해결

### CORS 에러
- Firebase Console에서 도메인 승인 필요
- Authentication → Settings → Authorized domains

### 권한 에러
- Firestore 보안 규칙 확인
- 테스트 모드로 변경 후 재시도

### 연결 실패
- Firebase 설정 정보 재확인
- 인터넷 연결 확인
- Firebase 프로젝트 활성화 상태 확인
