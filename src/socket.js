import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001';

export const socket = io(SOCKET_URL, {
  autoConnect: false,
  transports: ['websocket'],
});

export function emitWithAck(event, payload) {
  return new Promise((resolve, reject) => {
    socket.timeout(10000).emit(event, payload, (err, response) => {
      if (err) reject(err);
      else resolve(response);
    });
  });
}
