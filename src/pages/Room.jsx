import { useState } from 'react';
import { emitWithAck } from '../socket';
import ParticipantList from '../components/ParticipantList';
import './Room.css';

export default function Room({
  roomId,
  userName,
  isHost,
  roomState,
  mySocketId,
  onQuizStarted,
  onLeave,
}) {
  const [error, setError] = useState('');
  const [starting, setStarting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  const participants = roomState?.participants ?? [];
  const canStart = isHost && participants.length >= 1;
  const joinUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}${window.location.pathname}?room=${roomId}`
      : '';

  const startQuiz = async () => {
    setError('');
    setStarting(true);
    try {
      const res = await emitWithAck('quiz:start', {});
      if (res.success) {
        onQuizStarted();
      } else {
        setError(res.error || 'Could not start quiz');
      }
    } catch {
      setError('Connection error');
    } finally {
      setStarting(false);
    }
  };

  const copyCode = async () => {
    await navigator.clipboard.writeText(roomId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const copyJoinLink = async () => {
    await navigator.clipboard.writeText(joinUrl);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };

  return (
    <>
      <header className="app-header room-header">
        <div>
          <h1>Waiting room</h1>
          <p>{roomState?.quizTitle ?? 'General Knowledge'}</p>
        </div>
        <button type="button" className="btn btn-secondary leave-btn" onClick={onLeave}>
          Leave
        </button>
      </header>

      <div className="card room-card">
        <div className="room-code-block">
          <span className="room-code-label">Room code — share with players</span>
          <div className="room-code-row">
            <span className="room-code">{roomId}</span>
            <button type="button" className="btn btn-secondary copy-btn" onClick={copyCode}>
              {copied ? 'Copied!' : 'Copy code'}
            </button>
          </div>
        </div>

        {isHost && (
          <div className="join-instructions">
            <h3>How others join</h3>
            <ol>
              <li>Open this app in another browser tab or device</li>
              <li>Go to the <strong>Join a room</strong> tab on the home page</li>
              <li>Enter room code <strong>{roomId}</strong> and their name</li>
            </ol>
            <div className="join-link-row">
              <input
                type="text"
                readOnly
                value={joinUrl}
                className="join-link-input"
                aria-label="Join link"
              />
              <button type="button" className="btn btn-secondary copy-btn" onClick={copyJoinLink}>
                {linkCopied ? 'Copied!' : 'Copy link'}
              </button>
            </div>
          </div>
        )}

        {!isHost && (
          <p className="joined-as-guest">
            You joined room <strong>{roomId}</strong>. Waiting for the host to start…
          </p>
        )}

        {error && <div className="error-banner">{error}</div>}

        <ParticipantList
          participants={participants}
          mySocketId={mySocketId}
          loading={!roomState}
        />

        {isHost ? (
          <button
            type="button"
            className="btn btn-primary full-width start-btn"
            onClick={startQuiz}
            disabled={!canStart || starting}
          >
            {starting ? 'Starting…' : 'Start quiz'}
          </button>
        ) : (
          <p className="waiting-host">The host will start the quiz when everyone is ready.</p>
        )}
      </div>

      <p className="you-are">
        Playing as <strong>{userName}</strong>
        {isHost && <span className="host-badge">Host</span>}
      </p>
    </>
  );
}
