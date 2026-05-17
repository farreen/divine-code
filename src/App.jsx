import { useEffect, useState } from 'react';
import { socket } from './socket';
import Home from './pages/Home';
import Room from './pages/Room';
import Quiz from './pages/Quiz';
import './App.css';

export default function App() {
  const [screen, setScreen] = useState('home');
  const [userName, setUserName] = useState('');
  const [roomId, setRoomId] = useState('');
  const [isHost, setIsHost] = useState(false);
  const [roomState, setRoomState] = useState(null);
  const [questionData, setQuestionData] = useState(null);
  const [questionEnd, setQuestionEnd] = useState(null);
  const [leaderboard, setLeaderboard] = useState(null);
  const [mySocketId, setMySocketId] = useState(null);
  const [answered, setAnswered] = useState(false);
  const [answerFeedback, setAnswerFeedback] = useState(null);

  useEffect(() => {
    socket.connect();
    setMySocketId(socket.id);

    const onConnect = () => setMySocketId(socket.id);
    socket.on('connect', onConnect);

    socket.on('room:update', (data) => {
      setRoomState(data);
      setRoomId(data.roomId);
      setIsHost(data.hostId === socket.id);

      if (data.phase === 'lobby') {
        setScreen('room');
        setQuestionData(null);
        setQuestionEnd(null);
        setLeaderboard(null);
      }
    });

    socket.on('quiz:question', (data) => {
      setScreen('quiz');
      setQuestionData(data);
      setQuestionEnd(null);
      setLeaderboard(null);
      setAnswered(false);
      setAnswerFeedback(null);
    });

    socket.on('quiz:question-end', (data) => {
      setQuestionEnd(data);
    });

    socket.on('quiz:finished', (data) => {
      setLeaderboard(data.leaderboard);
      setQuestionData(null);
      setQuestionEnd(null);
    });

    socket.on('quiz:player-answered', () => { });

    return () => {
      socket.off('connect', onConnect);
      socket.disconnect();
    };
  }, []);

  const applyRoomPayload = (payload, name, asHost) => {
    setUserName(name);
    setRoomId(payload.roomId);
    setRoomState(payload);
    setIsHost(asHost ?? payload.hostId === socket.id);
    setScreen('room');
    setQuestionData(null);
    setQuestionEnd(null);
    setLeaderboard(null);
  };

  const handleCreated = (payload, name) => {
    applyRoomPayload(payload, name, true);
  };

  const handleJoined = (payload, name) => {
    applyRoomPayload(payload, name, false);
  };

  const goHome = () => {
    if (socket.connected) {
      socket.disconnect();
      socket.connect();
    }
    setScreen('home');
    setRoomId('');
    setRoomState(null);
    setIsHost(false);
    setQuestionData(null);
    setQuestionEnd(null);
    setLeaderboard(null);
  };

  const submitAnswer = async (index) => {
    if (answered) return;
    try {
      const res = await new Promise((resolve, reject) => {
        socket.timeout(5000).emit('quiz:answer', { answerIndex: index }, (err, r) => {
          if (err) reject(err);
          else resolve(r);
        });
      });
      if (res.success) {
        setAnswered(true);
        setAnswerFeedback(res.isCorrect ? 'correct' : 'wrong');
      }
    } catch {
      /* ignore timeout */
    }
  };

  if (screen === 'home') {
    return (
      <div className="app-shell">
        <Home onCreated={handleCreated} onJoined={handleJoined} />
      </div>
    );
  }

  if (screen === 'quiz' || questionData || questionEnd || leaderboard) {
    return (
      <div className="app-shell">
        <Quiz
          roomId={roomId}
          userName={userName}
          questionData={questionData}
          questionEnd={questionEnd}
          leaderboard={leaderboard}
          answered={answered}
          answerFeedback={answerFeedback}
          onSubmitAnswer={submitAnswer}
          participants={roomState?.participants ?? []}
          mySocketId={mySocketId}
        />
      </div>
    );
  }

  return (
    <div className="app-shell">
      <Room
        roomId={roomId}
        userName={userName}
        isHost={isHost}
        roomState={roomState}
        mySocketId={mySocketId}
        onQuizStarted={() => setScreen('quiz')}
        onLeave={goHome}
      />
    </div>
  );
}
