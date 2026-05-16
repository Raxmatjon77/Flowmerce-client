import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import type { MessageDto } from '../types/support';

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000';

export function useChatSocket(conversationId: string, initialMessages: MessageDto[] = []) {
  const [messages, setMessages] = useState<MessageDto[]>(initialMessages);
  const [isConnected, setIsConnected] = useState(false);
  const [typingUsers, setTypingUsers] = useState<{ userId: string; role: string }[]>([]);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('flowmerce.customer.token');
    if (!token || !conversationId) return;

    const socket = io(`${API_BASE}/chat`, {
      auth: { token },
      transports: ['websocket'],
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setIsConnected(true);
      socket.emit('chat:join', { conversationId });
    });

    socket.on('disconnect', () => setIsConnected(false));

    socket.on('chat:new-message', (msg: MessageDto) => {
      setMessages((prev) => {
        if (prev.find((m) => m.id === msg.id)) return prev;
        return [...prev, msg];
      });
    });

    socket.on('chat:typing', (data: { userId: string; role: string }) => {
      setTypingUsers((prev) => {
        if (prev.find((u) => u.userId === data.userId)) return prev;
        return [...prev, data];
      });
      setTimeout(() => {
        setTypingUsers((prev) => prev.filter((u) => u.userId !== data.userId));
      }, 3000);
    });

    socket.on('chat:error', (err: { message: string }) => {
      console.error('Chat error:', err.message);
    });

    return () => {
      socket.disconnect();
    };
  }, [conversationId]);

  // Sync messages when REST data loads/reloads
  useEffect(() => {
    setMessages(initialMessages);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialMessages.length]);

  const sendMessage = useCallback(
    (content: string) => {
      if (!socketRef.current?.connected || !content.trim()) return;
      socketRef.current.emit('chat:send-message', { conversationId, content });
    },
    [conversationId],
  );

  const sendTyping = useCallback(() => {
    socketRef.current?.emit('chat:typing', { conversationId });
  }, [conversationId]);

  return { messages, sendMessage, sendTyping, isConnected, typingUsers };
}
