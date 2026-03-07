import React, { useState } from 'react'
import './ProductQuiz.css'

function ProductQuiz() {
  const [currentQuiz, setCurrentQuiz] = useState(0)
  const [score, setScore] = useState(0)
  const [showResult, setShowResult] = useState(false)
  const [selectedAnswer, setSelectedAnswer] = useState(null)
  const [answeredQuestions, setAnsweredQuestions] = useState([])

  const quizzes = [
    {
      id: 1,
      category: '매트리스 케어',
      question: '일반 가정의 매트리스에 서식하는 평균 진드기 수는?',
      options: ['약 10만 마리', '약 100만 마리', '약 200만 마리', '약 500만 마리'],
      correct: 2,
      explanation: '3-5년 사용한 매트리스에는 평균 200만 마리의 진드기가 서식합니다. 정기적인 케어가 필수입니다.'
    },
    {
      id: 2,
      category: '매트리스 케어',
      question: '매트리스 케어 서비스의 UV 살균 효과는?',
      options: ['90% 세균 제거', '95% 세균 제거', '99% 세균 제거', '99.9% 세균 제거'],
      correct: 3,
      explanation: 'UV 살균은 99.9%의 세균을 제거하여 위생적인 수면 환경을 만들어줍니다.'
    },
    {
      id: 3,
      category: '렌탈 상품',
      question: '코웨이 렌탈의 가장 큰 장점은?',
      options: ['저렴한 가격', '초기 비용 부담 없음', '다양한 색상', '빠른 배송'],
      correct: 1,
      explanation: '렌탈의 핵심 장점은 초기 비용 부담 없이 시작할 수 있고, 정기 관리와 무상 A/S가 포함된다는 점입니다.'
    },
    {
      id: 4,
      category: '렌탈 상품',
      question: '코웨이 공기청정기의 필터 교체 주기는?',
      options: ['3개월', '6개월', '1년', '2년'],
      correct: 2,
      explanation: '공기청정기 필터는 보통 1년마다 교체하며, 렌탈 시 무상으로 제공됩니다.'
    },
    {
      id: 5,
      category: '영업 지식',
      question: '고객이 "비싸다"고 할 때 가장 적절한 대응은?',
      options: [
        '가격을 즉시 할인해준다',
        '장기적 경제성과 가치를 설명한다',
        '다른 저렴한 제품을 추천한다',
        '고객을 포기한다'
      ],
      correct: 1,
      explanation: '가격 대비 가치, 장기적 경제성, 포함된 서비스를 설명하여 투자 가치를 인식시키는 것이 중요합니다.'
    },
    {
      id: 6,
      category: '영업 지식',
      question: '클로징의 적절한 타이밍은?',
      options: [
        '첫 만남에서 바로',
        '고객이 긍정적 신호를 보일 때',
        '한 시간 이상 설명 후',
        '고객이 먼저 요청할 때까지'
      ],
      correct: 1,
      explanation: '고객이 관심을 보이거나 긍정적 반응을 보일 때가 클로징의 최적 타이밍입니다.'
    },
    {
      id: 7,
      category: '제품 지식',
      question: '코웨이 정수기의 핵심 기술은?',
      options: ['역삼투압 방식', '이온수 생성', '자외선 살균', '나노 필터'],
      correct: 0,
      explanation: '코웨이 정수기는 역삼투압(RO) 방식으로 미세한 불순물까지 제거합니다.'
    },
    {
      id: 8,
      category: '제품 지식',
      question: '비데 렌탈 시 정기 관리 주기는?',
      options: ['1개월', '3개월', '6개월', '1년'],
      correct: 2,
      explanation: '비데는 6개월마다 정기 관리를 받으며, 렌탈 시 무상으로 제공됩니다.'
    },
    {
      id: 9,
      category: '고객 응대',
      question: '고객이 타사 제품과 비교할 때 올바른 대응은?',
      options: [
        '타사 제품을 비난한다',
        '가격만 강조한다',
        '코웨이의 차별화된 가치를 설명한다',
        '무조건 저렴하게 해준다'
      ],
      correct: 2,
      explanation: '타사를 비난하지 않고, 코웨이만의 기술력, 신뢰도, 서비스 품질을 강조해야 합니다.'
    },
    {
      id: 10,
      category: '고객 응대',
      question: '고객이 "생각해보겠다"고 할 때 가장 좋은 대응은?',
      options: [
        '바로 포기한다',
        '프로모션 기한과 체험 기회를 제안한다',
        '계속 설득한다',
        '가격을 대폭 할인한다'
      ],
      correct: 1,
      explanation: '부담을 줄이면서 프로모션 기한, 무료 체험 등 결정을 돕는 요소를 제시하는 것이 효과적입니다.'
    }
  ]

  const handleAnswer = (answerIndex) => {
    setSelectedAnswer(answerIndex)
    
    const isCorrect = answerIndex === quizzes[currentQuiz].correct
    if (isCorrect) {
      setScore(score + 1)
    }

    setAnsweredQuestions([...answeredQuestions, {
      question: quizzes[currentQuiz].question,
      correct: isCorrect,
      userAnswer: quizzes[currentQuiz].options[answerIndex],
      correctAnswer: quizzes[currentQuiz].options[quizzes[currentQuiz].correct]
    }])

    setTimeout(() => {
      if (currentQuiz < quizzes.length - 1) {
        setCurrentQuiz(currentQuiz + 1)
        setSelectedAnswer(null)
      } else {
        setShowResult(true)
      }
    }, 2000)
  }

  const resetQuiz = () => {
    setCurrentQuiz(0)
    setScore(0)
    setShowResult(false)
    setSelectedAnswer(null)
    setAnsweredQuestions([])
  }

  const getScoreMessage = () => {
    const percentage = (score / quizzes.length) * 100
    if (percentage >= 90) return { emoji: '🏆', message: '완벽합니다! 영업 마스터!', color: '#ffd700' }
    if (percentage >= 70) return { emoji: '🎉', message: '훌륭해요! 실력이 뛰어나네요!', color: '#4facfe' }
    if (percentage >= 50) return { emoji: '👍', message: '좋아요! 조금만 더 공부하면 완벽!', color: '#43e97b' }
    return { emoji: '💪', message: '화이팅! 더 열심히 공부해봐요!', color: '#fa709a' }
  }

  if (showResult) {
    const result = getScoreMessage()
    return (
      <div className="quiz-result">
        <div className="result-card">
          <div className="result-emoji" style={{ color: result.color }}>{result.emoji}</div>
          <h1>퀴즈 완료!</h1>
          <div className="result-score">
            <span className="score-number">{score}</span>
            <span className="score-total">/ {quizzes.length}</span>
          </div>
          <p className="result-message">{result.message}</p>
          <div className="result-percentage">
            정답률: {Math.round((score / quizzes.length) * 100)}%
          </div>

          <div className="answer-review">
            <h3>📋 답안 리뷰</h3>
            {answeredQuestions.map((q, index) => (
              <div key={index} className={`review-item ${q.correct ? 'correct' : 'wrong'}`}>
                <div className="review-header">
                  <span className="review-icon">{q.correct ? '✓' : '✗'}</span>
                  <span className="review-number">문제 {index + 1}</span>
                </div>
                <p className="review-question">{q.question}</p>
                {!q.correct && (
                  <div className="review-answers">
                    <p className="user-answer">내 답: {q.userAnswer}</p>
                    <p className="correct-answer">정답: {q.correctAnswer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>

          <button onClick={resetQuiz} className="retry-btn">
            🔄 다시 도전하기
          </button>
        </div>
      </div>
    )
  }

  const quiz = quizzes[currentQuiz]
  const progress = ((currentQuiz + 1) / quizzes.length) * 100

  return (
    <div className="product-quiz">
      <div className="quiz-header">
        <h1>🧠 제품 지식 퀴즈</h1>
        <p>영업 실력을 테스트하고 향상시키세요</p>
      </div>

      <div className="quiz-container">
        <div className="quiz-progress">
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progress}%` }}></div>
          </div>
          <div className="progress-text">
            문제 {currentQuiz + 1} / {quizzes.length}
          </div>
        </div>

        <div className="quiz-card">
          <div className="quiz-category">{quiz.category}</div>
          <h2 className="quiz-question">{quiz.question}</h2>

          <div className="quiz-options">
            {quiz.options.map((option, index) => (
              <button
                key={index}
                className={`quiz-option ${
                  selectedAnswer === index
                    ? index === quiz.correct
                      ? 'correct'
                      : 'wrong'
                    : ''
                } ${selectedAnswer !== null && index === quiz.correct ? 'correct' : ''}`}
                onClick={() => handleAnswer(index)}
                disabled={selectedAnswer !== null}
              >
                <span className="option-number">{index + 1}</span>
                <span className="option-text">{option}</span>
              </button>
            ))}
          </div>

          {selectedAnswer !== null && (
            <div className="quiz-explanation">
              <strong>💡 설명:</strong>
              <p>{quiz.explanation}</p>
            </div>
          )}
        </div>

        <div className="quiz-score">
          현재 점수: {score} / {currentQuiz + (selectedAnswer !== null ? 1 : 0)}
        </div>
      </div>
    </div>
  )
}

export default ProductQuiz
