import { useSyncedTimer } from '../hooks/useSyncedTimer';
import ParticipantList from '../components/ParticipantList';
import './Quiz.css';

const OPTION_LABELS = ['A', 'B', 'C', 'D'];

export default function Quiz({
  roomId,
  userName,
  questionData,
  questionEnd,
  leaderboard,
  answered,
  answerFeedback,
  onSubmitAnswer,
  participants,
  mySocketId,
}) {
  const remaining = useSyncedTimer(
    questionData?.endsAt,
    questionData?.serverNow
  );

  if (leaderboard) {
    return (
      <div className="quiz-finished">
        <header className="app-header">
          <h1>Quiz complete!</h1>
          <p>Room {roomId}</p>
        </header>
        <div className="card">
          <h2 className="leaderboard-title">Final standings</h2>
          <ol className="leaderboard">
            {leaderboard.map((p, i) => (
              <li key={p.id} className={p.name === userName ? 'is-me' : ''}>
                <span className="rank">#{i + 1}</span>
                <span className="lb-name">{p.name}</span>
                <span className="lb-score">{p.score} pts</span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    );
  }

  if (questionEnd) {
    const { correctIndex, results, index, total } = questionEnd;
    return (
      <div className="quiz-results">
        <header className="quiz-header">
          <span className="question-progress">
            Question {index + 1} / {total}
          </span>
        </header>
        <div className="card results-card">
          <h2 className="results-title">Time&apos;s up!</h2>
          <p className="correct-answer">
            Correct answer: <strong>{OPTION_LABELS[correctIndex]}</strong>
          </p>
          <ul className="results-list">
            {results.map((r) => (
              <li key={r.id} className={r.name === userName ? 'is-me' : ''}>
                <span>{r.name}</span>
                <span className={`result-icon ${r.correct ? 'correct' : 'wrong'}`}>
                  {r.answer === null ? '—' : r.correct ? '✓' : '✗'}
                </span>
                <span className="result-score">{r.score} pts</span>
              </li>
            ))}
          </ul>
          <p className="next-hint">Next question coming up…</p>
        </div>
      </div>
    );
  }

  if (!questionData) {
    return (
      <div className="quiz-loading">
        <p>Loading question…</p>
      </div>
    );
  }

  const { question, index, total, endsAt } = questionData;
  const timerPercent = endsAt
    ? Math.max(0, ((remaining / question.timeLimit) * 100))
    : 0;
  const timerUrgent = remaining <= 3;

  return (
    <div className="quiz-active">
      <header className="quiz-header">
        <span className="question-progress">
          Q{index + 1}/{total}
        </span>
        <span className="room-pill">{roomId}</span>
      </header>

      <div className={`timer-ring ${timerUrgent ? 'urgent' : ''}`}>
        <svg viewBox="0 0 100 100">
          <circle className="timer-bg" cx="50" cy="50" r="45" />
          <circle
            className="timer-fill"
            cx="50"
            cy="50"
            r="45"
            style={{
              strokeDashoffset: 283 - (283 * timerPercent) / 100,
            }}
          />
        </svg>
        <span className="timer-value">{remaining}</span>
      </div>

      <div className="card question-card">
        <h2 className="question-text">{question.text}</h2>
        <div className="options-grid">
          {question.options.map((opt, i) => (
            <button
              key={i}
              type="button"
              className={`option-btn ${answered ? 'answered' : ''} ${
                answered && answerFeedback === 'correct' ? 'picked-correct' : ''
              } ${answered && answerFeedback === 'wrong' ? 'picked-wrong' : ''}`}
              onClick={() => onSubmitAnswer(i)}
              disabled={answered || remaining === 0}
            >
              <span className="option-label">{OPTION_LABELS[i]}</span>
              <span className="option-text">{opt}</span>
            </button>
          ))}
        </div>
        {answered && (
          <p className={`answer-status ${answerFeedback}`}>
            {answerFeedback === 'correct' ? 'Correct!' : 'Wrong — better luck next time'}
          </p>
        )}
      </div>

      <aside className="quiz-sidebar card">
        <ParticipantList participants={participants} mySocketId={mySocketId} />
      </aside>
    </div>
  );
}
