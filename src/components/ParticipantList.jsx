import './ParticipantList.css';

export default function ParticipantList({ participants, mySocketId, loading = false }) {
  return (
    <div className="participant-list">
      <h3 className="participant-heading">
        Players in room
        <span className="count">{participants.length}</span>
      </h3>

      {loading && participants.length === 0 && (
        <p className="empty">Loading players…</p>
      )}

      {!loading && participants.length === 0 && (
        <p className="empty">No players in the room yet</p>
      )}

      {participants.length > 0 && (
        <ul>
          {participants.map((p) => (
            <li key={p.id} className={p.id === mySocketId ? 'is-me' : ''}>
              <span className="avatar">{p.name.charAt(0).toUpperCase()}</span>
              <span className="name">
                {p.name}
                {p.isHost && <span className="badge">Host</span>}
                {p.id === mySocketId && <span className="badge me">You</span>}
              </span>
              {p.score > 0 && <span className="score">{p.score} pts</span>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
