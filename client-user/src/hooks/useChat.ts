'use client';
import { useEffect, useCallback } from 'react';
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { getChatMessages, markChatRead } from '@/api/chat/methods';
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

  useEffect(() => {
    if (!isAuthorized || !chatId) return;
    const socket = getSocket();

    const onConnect = () => {
      socket.emit('joinChat', chatId);
      markChatRead(chatId).catch(() => {});
    };

    const onNewMessage = (msg: Message) => {
      qc.setQueryData(
        ['chatMessages', chatId],
        (old: any) => {
          if (!old) return old;
          const pages = [...old.pages];
          if (pages.length > 0) {
            pages[0] = { ...pages[0], items: [...pages[0].items, msg] };
          }
          return { ...old, pages };
        },
      );
      markChatRead(chatId).catch(() => {});
    };

    if (socket.connected) {
      onConnect();
    } else {
      socket.connect();
    }

    socket.on('connect', onConnect);
    socket.on('newMessage', onNewMessage);

    return () => {
      socket.emit('leaveChat', chatId);
      socket.off('connect', onConnect);
      socket.off('newMessage', onNewMessage);
    };
  }, [isAuthorized, chatId, qc]);

  const sendMessage = useCallback(
    (body: string, imageUrl?: string) => {
      if (!isAuthorized) return;
      const socket = getSocket();
      socket.emit('sendMessage', { chatId, body, imageUrl });
    },
    [isAuthorized, chatId],
  );

  return {
    messages,
    sendMessage,
    hasMore: !!hasNextPage,
    loadMore: fetchNextPage,
    isFetchingNextPage,
  };
}
