import { io } from 'socket.io-client';

const rawSocketUrl = import.meta.env.VITE_SOCKET_URL !== undefined
  ? import.meta.env.VITE_SOCKET_URL
  : (import.meta.env.PROD ? '/' : 'http://localhost:5000');

const SOCKET_SERVER_URL = rawSocketUrl.replace(/\/+$/, '');

let socket = null;

export const initSocketClient = (role = 'Student', userId = null, department = null) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('edufeedback_jwt_token') : null;

  if (!token) {
    // Unauthenticated clients cannot establish a WebSocket connection
    disconnectSocket();
    return null;
  }

  // Account switching safeguard: If a connection exists under a different token, terminate it immediately
  if (socket && socket.auth?.token !== token) {
    disconnectSocket();
  }

  if (!socket) {
    socket = io(SOCKET_SERVER_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });

    socket.on('connect', () => {
      console.log('[Socket.IO Client] Connected to real-time notification gateway:', socket.id);
      socket.emit('join', { role, userId, department });
    });

    socket.on('connect_error', (err) => {
      console.warn('[Socket.IO Client Connection Error]:', err.message);
      // Disconnect immediately on authentication failure to prevent retry loops with invalid/expired tokens
      if (err.message.includes('Authentication failed') || err.message.includes('Token has expired')) {
        disconnectSocket();
      }
    });

    socket.on('disconnect', (reason) => {
      console.log('[Socket.IO Client] Disconnected from server:', reason);
    });
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
