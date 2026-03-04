'use client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getChatList } from '@/api/chat/methods';
import { useEffect } from 'react';
import { getSocket } from '@/lib/socket';
import { useAuthStore } from '@/stores/authStore';

export const CHAT_LIST_KEY = ['chatList'];

export function useChatList() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: CHAT_LIST_KEY,
    queryFn: () => getChatList(),
  });
  const qc = useQueryClient();
  const isAuthorized = useAuthStore((s) => s.isAuthorized);

  useEffect(() => {
    if (!isAuthorized) return;
    const socket = getSocket();
    const handleUpdate = () => {
      qc.invalidateQueries({ queryKey: CHAT_LIST_KEY });
    };
    socket.on('newMessage', handleUpdate);
    socket.on('unreadUpdate', handleUpdate);
    return () => {
      socket.off('newMessage', handleUpdate);
      socket.off('unreadUpdate', handleUpdate);
    };
  }, [isAuthorized, qc]);

  return { chats: data?.items ?? [], isLoading, error, refetch };
}
