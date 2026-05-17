import { useEffect, useState } from 'react';
import { emitWithAck } from '../socket';
import './Home.css';

export default function Home({ onCreated, onJoined }) {
  const [name, setName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('join');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('room');
    if (code) {
      setRoomCode(code.trim().toUpperCase().slice(0, 6));
      setActiveTab('join');
    }
  }, []);

  const createRoom = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await emitWithAck('room:create', { userName: name });
      if (res.success) {
        onCreated(res, name.trim() || 'Host');
      } else {
        setError(res.error || 'Failed to create room');
      }
    } catch {
      setError('Could not connect to server. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  const joinRoom = async (e) => {
    e.preventDefault();
    setError('');
    if (!roomCode.trim()) {
      setError('Please enter a room code');
      return;
    }
    setLoading(true);
    try {
      const res = await emitWithAck('room:join', {
        roomId: roomCode.trim().toUpperCase(),
        userName: name,
      });
      if (res.success) {
        onJoined(res, name.trim() || 'Player');
      } else {
        setError(res.error || 'Failed to join room');
      }
    } catch {
      setError('Could not connect to server. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <header className="app-header">
        <h1>Live Quiz</h1>
        <p>Join with a room code or host your own quiz</p>
      </header>

      <div className="home-tabs">
        <button
          type="button"
          className={`home-tab ${activeTab === 'join' ? 'active' : ''}`}
          onClick={() => setActiveTab('join')}
        >
          Join a room
        </button>
        <button
          type="button"
          className={`home-tab ${activeTab === 'create' ? 'active' : ''}`}
          onClick={() => setActiveTab('create')}
        >
          Host a room
        </button>
      </div>

      {error && <div className="error-banner home-error">{error}</div>}

      {activeTab === 'join' ? (
        <div className="card home-card join-card">
          <div className="join-steps">
            <h2>How to join a quiz room</h2>
            <ol>
              <li>Ask the host for the <strong>6-letter room code</strong></li>
              <li>Enter your name and the code below</li>
              <li>Click <strong>Join room</strong></li>
            </ol>
          </div>
          <form onSubmit={joinRoom}>
            <div className="form-group">
              <label htmlFor="join-name">Your name</label>
              <input
                id="join-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                maxLength={24}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="room-code">Room code (from host)</label>
              <input
                id="room-code"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                placeholder="e.g. ABC123"
                maxLength={6}
                className="room-code-input"
                required
                autoComplete="off"
              />
            </div>
            <button type="submit" className="btn btn-primary full-width" disabled={loading}>
              {loading ? 'Joining…' : 'Join room'}
            </button>
          </form>
        </div>
      ) : (
        <div className="card home-card">
          <h2>Create a quiz room</h2>
          <p className="card-desc">
            You become the host. Share the room code so others can join from
            the <strong>Join a room</strong> tab on this page.
          </p>
          <form onSubmit={createRoom}>
            <div className="form-group">
              <label htmlFor="create-name">Your name</label>
              <input
                id="create-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                maxLength={24}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary full-width" disabled={loading}>
              {loading ? 'Creating…' : 'Create room'}
            </button>
          </form>
        </div>
      )}
    </>
  );
}
