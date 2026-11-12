import { io } from 'socket.io-client';

const rawSocketUrl = import.meta.env.VITE_SOCKET_URL !== undefined
  ? import.meta.env.VITE_SOCKET_URL
  : (import.meta.env.PROD ? '/' : 'http://localhost:5000');

const SOCKET_SERVER_URL = rawSocketUrl.replace(/\/+$/, '');

let socket = null;

export const initSocketClient = (role = 'Student', userId = null, department = null) => {
  if (!socket) {
    socket = io(SOCKET_SERVER_URL, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });

    socket.on('connect', () => {
      console.log('[Socket.IO Client] Connected to real-time notification gateway:', socket.id);
      socket.emit('join', { role, userId, department });
    });

    socket.on('disconnect', () => {
      console.log('[Socket.IO Client] Disconnected from server');
    });
  } else {
    socket.emit('join', { role, userId, department });
  }

  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export default {
  initSocketClient,
  getSocket,
  disconnectSocket,
};
