'use client';
import { useEffect, useCallback } from 'react';
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { getChatMessages, markChatRead, sendChatMessage } from '@/api/chat/methods';
import type { Message } from '@/api/chat/methods';
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
      refetchInterval: 3000, // Poll every 3s — real-time fallback since WebSocket unavailable
      refetchIntervalInBackground: false,
    });

  // Server returns DESC (newest first per page). Flatten all pages then reverse for display.
  const messages: Message[] = (data?.pages.flatMap((p) => p.items) ?? []).slice().reverse();

  // Mark chat as read when opened / when new messages arrive
  useEffect(() => {
    if (!isAuthorized || !chatId) return;
    markChatRead(chatId).catch(() => {});
    qc.invalidateQueries({ queryKey: ['chatList'] });
  }, [isAuthorized, chatId, messages.length, qc]);

  // Send via REST, then force immediate refetch
  const sendMessage = useCallback(
    async (body: string, imageUrl?: string) => {
      if (!isAuthorized) return;
      try {
        await sendChatMessage(chatId, body || null, imageUrl ?? null);
        await qc.invalidateQueries({ queryKey: ['chatMessages', chatId] });
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
