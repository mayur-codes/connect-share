import { WS_BASE_URL } from './config';
import { getToken } from './apiClient';

export interface SocketHandle {
  socket: WebSocket;
  send: (data: any) => void;
  close: () => void;
}

function connect(path: string, onMessage: (msg: any) => void, onOpen?: () => void): SocketHandle {
  const token = getToken();
  const url = `${WS_BASE_URL}${path}${path.includes('?') ? '&' : '?'}token=${encodeURIComponent(token ?? '')}`;
  const socket = new WebSocket(url);
  socket.onopen = () => onOpen?.();
  socket.onmessage = (e) => {
    try { onMessage(JSON.parse(e.data)); }
    catch { onMessage(e.data); }
  };
  return {
    socket,
    send: (data: any) => {
      if (socket.readyState === WebSocket.OPEN) {
        socket.send(typeof data === 'string' ? data : JSON.stringify(data));
      }
    },
    close: () => { try { socket.close(); } catch {/* */} },
  };
}

export function connectChat(chatId: string, onMessage: (msg: any) => void, onOpen?: () => void) {
  return connect(`/ws/chat/${chatId}/`, onMessage, onOpen);
}

export function connectNotifications(onMessage: (msg: any) => void) {
  return connect('/ws/notify/', onMessage);
}

export function connectSidebar(onMessage: (msg: any) => void) {
  return connect('/ws/sidebar/', onMessage);
}
