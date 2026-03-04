import { io, Socket } from 'socket.io-client';
import { getTokens } from '@/api/auth/tokenStorage';

let socket: Socket | null = null;

export function getSocket(): Socket {
  const tokens = getTokens();
  const token = tokens?.accessToken ?? '';

  if (!socket || !socket.connected) {
    socket = io(process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') ?? '', {
      path: '/socket.io',
      auth: { token },
      transports: ['websocket', 'polling'],
      autoConnect: true,
    });
  }
  return socket;
}

export function disconnectSocket() {
  socket?.disconnect();
  socket = null;
}
