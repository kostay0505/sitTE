'use client';
import { useEffect, useCallback } from 'react';
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { getChatMessages, markChatRead, sendChatMessage } from '@/api/chat/methods';
import type { Message } from '@/api/chat/methods';
import { getSocket } from '@/lib/socket';
import { useAuthStore } from '@/stores/authStore';

export function useChat(chatId: string) {
  const isAuthorized = useAuthStore((s) => s.isAuthorized);
  const qc = useQueryClient();

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteQuery({
      queryKey: ['chatMessages', chatId],
      queryFn: ({ pageParam }) =>
        getChatMessages(chatId, pageParam as string | undefined),
      getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
      initialPageParam: undefined as string | undefined,
      enabled: !!isAuthorized && !!chatId,
    });

  const messages: Message[] = data?.pages.flatMap((p) => p.items) ?? [];

  // Socket for real-time INCOMING messages
  useEffect(() => {
    if (!isAuthorized || !chatId) return;
    let socket: ReturnType<typeof getSocket>;
    try {
      socket = getSocket();
    } catch (e) {
      console.warn('Socket init error:', e);
      return;
    }

    const onConnect = () => {
      socket.emit('joinChat', chatId);
      markChatRead(chatId).catch(() => {});
    };

    const addMsg = (msg: Message) => {
      qc.setQueryData(['chatMessages', chatId], (old: any) => {
        if (!old) return old;
        const pages = [...old.pages];
        if (pages.length > 0) {
          if (pages[0].items.find((m: Message) => m.id === msg.id)) return old;
          pages[0] = { ...pages[0], items: [...pages[0].items, msg] };
        }
        return { ...old, pages };
      });
    };

    if (socket.connected) onConnect();
    else socket.connect();

    socket.on('connect', onConnect);
    socket.on('newMessage', addMsg);

    return () => {
      socket.emit('leaveChat', chatId);
      socket.off('connect', onConnect);
      socket.off('newMessage', addMsg);
    };
  }, [isAuthorized, chatId, qc]);

  // Send via REST — reliable regardless of socket state
  const sendMessage = useCallback(
    async (body: string, imageUrl?: string) => {
      if (!isAuthorized) return;
      try {
        const msg = await sendChatMessage(chatId, body || null, imageUrl ?? null);
        qc.setQueryData(['chatMessages', chatId], (old: any) => {
          if (!old) return old;
          const pages = [...old.pages];
          if (pages.length > 0) {
            if (pages[0].items.find((m: Message) => m.id === msg.id)) return old;
            pages[0] = { ...pages[0], items: [...pages[0].items, msg] };
          }
          return { ...old, pages };
        });
      } catch (e) {
        console.error('sendMessage error:', e);
      }
    },
    [isAuthorized, chatId, qc],
  );

  return {
    messages,
    sendMessage,
    hasMore: !!hasNextPage,
    loadMore: fetchNextPage,
    isFetchingNextPage,
  };
}
