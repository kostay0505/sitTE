'use client';

import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, X } from 'lucide-react';
import { useChat } from '@/hooks/useChat';
import { useChatList } from '@/hooks/useChatList';
import { ChatWindow } from './ChatWindow';
import { MessageInput } from './MessageInput';
import { toImageSrc } from '@/utils/toImageSrc';
import { getTokens } from '@/api/auth/tokenStorage';
import { extractTgIdFromToken } from '@/utils/tokenUtils';
import type { Chat } from '@/api/chat/methods';

interface ChatWidgetProps {
  isOpen: boolean;
  onClose: () => void;
  initialChatId?: string | null;
}

function useCurrentUserId() {
  if (typeof window === 'undefined') return '';
  const tokens = getTokens();
  return tokens?.accessToken ? (extractTgIdFromToken(tokens.accessToken) ?? '') : '';
}

/* ── Список чатов внутри виджета ── */
function WidgetChatList({
  currentUserId,
  onSelect,
}: {
  currentUserId: string;
  onSelect: (chat: Chat) => void;
}) {
  const { chats, isLoading } = useChatList();

  if (isLoading) {
    return (
      <div className='flex items-center justify-center h-full'>
        <div className='w-6 h-6 border-2 border-gray-300 border-t-black rounded-full animate-spin' />
      </div>
    );
  }

  if (chats.length === 0) {
    return (
      <div className='flex flex-col items-center justify-center h-full text-gray-400 text-sm px-4 text-center gap-2'>
        <span className='text-3xl'>💬</span>
        <p className='font-medium text-gray-600'>Нет диалогов</p>
        <p>Начните общение с продавцом на странице товара</p>
      </div>
    );
  }

  return (
    <div className='overflow-y-auto h-full divide-y divide-gray-100'>
      {chats.map(chat => {
        const isBuyer = chat.buyerId === currentUserId;
        const unread = isBuyer ? chat.unreadBuyer : chat.unreadSeller;
        const name = isBuyer
          ? chat.sellerFirstName || chat.sellerUsername || 'Продавец'
          : chat.buyerFirstName || chat.buyerUsername || 'Покупатель';
        const photo = isBuyer ? chat.sellerPhoto : chat.buyerPhoto;
        const time = chat.lastMessageAt
          ? new Date(chat.lastMessageAt).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })
          : '';

        return (
          <button
            key={chat.id}
            onClick={() => onSelect(chat)}
            className='w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left'
          >
            <div className='relative shrink-0'>
              {photo ? (
                <img src={toImageSrc(photo)} alt={name} className='w-11 h-11 rounded-full object-cover' />
              ) : (
                <div className='w-11 h-11 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-semibold'>
                  {name[0]?.toUpperCase()}
                </div>
              )}
              {unread > 0 && (
                <span className='absolute -top-1 -right-1 bg-black text-white text-[10px] rounded-full min-w-[16px] h-4 flex items-center justify-center px-1'>
                  {unread > 99 ? '99+' : unread}
                </span>
              )}
            </div>
            <div className='flex-1 min-w-0'>
              <div className='flex items-center justify-between'>
                <span className='font-medium text-sm text-gray-900 truncate'>{name}</span>
                <span className='text-xs text-gray-400 ml-2 shrink-0'>{time}</span>
              </div>
              {chat.productName && (
                <p className='text-xs text-gray-400 truncate'>{chat.productName}</p>
              )}
              {chat.lastMessage && (
                <p className='text-sm text-gray-500 truncate'>{chat.lastMessage}</p>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}

/* ── Чат-окно внутри виджета ── */
function WidgetChatView({ chatId, currentUserId }: { chatId: string; currentUserId: string }) {
  const { messages, sendMessage, deleteMessage, isSending, hasMore, loadMore, isFetchingNextPage } = useChat(chatId);
  const bottomRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const lastId = messages[messages.length - 1]?.id;
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [lastId]);

  const handleScroll = () => {
    const el = containerRef.current;
    if (!el) return;
    if (el.scrollTop < 100 && hasMore && !isFetchingNextPage) loadMore();
  };

  return (
    <div className='flex flex-col h-full'>
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className='flex-1 overflow-y-auto p-3 bg-gray-50 flex flex-col gap-2'
      >
        {messages.length === 0 && !isSending && (
          <div className='flex items-center justify-center h-full text-gray-400 text-sm'>
            Начните диалог
          </div>
        )}
        {messages.map(msg => {
          const isMine = msg.senderId === currentUserId;
          return (
            <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm ${
                  isMine ? 'bg-black text-white rounded-br-sm' : 'bg-white text-gray-900 rounded-bl-sm shadow-sm'
                }`}
              >
                {msg.imageUrl && (
                  <img
                    src={toImageSrc(msg.imageUrl)}
                    alt=''
                    className='rounded-lg max-w-full mb-1'
                  />
                )}
                {msg.body && <p className='whitespace-pre-wrap break-words'>{msg.body}</p>}
                <p className={`text-[10px] mt-1 ${isMine ? 'text-white/60' : 'text-gray-400'} text-right`}>
                  {new Date(msg.createdAt).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          );
        })}
        {isSending && (
          <div className='flex justify-end'>
            <div className='bg-black/70 text-white rounded-2xl rounded-br-sm px-4 py-2 flex gap-1 items-center'>
              {[0, 150, 300].map(d => (
                <div key={d} className='w-1.5 h-1.5 bg-white rounded-full animate-bounce' style={{ animationDelay: `${d}ms` }} />
              ))}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>
      <MessageInput onSend={sendMessage} disabled={isSending} />
    </div>
  );
}

/* ── Основной виджет ── */
export function ChatWidget({ isOpen, onClose, initialChatId }: ChatWidgetProps) {
  const currentUserId = useCurrentUserId();
  const [view, setView] = useState<'list' | 'chat'>('list');
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [activeChatName, setActiveChatName] = useState('');

  // При открытии с конкретным chatId — сразу переходим в чат
  useEffect(() => {
    if (isOpen && initialChatId) {
      setActiveChatId(initialChatId);
      setView('chat');
    } else if (!isOpen) {
      // сброс при закрытии
      setView('list');
      setActiveChatId(null);
      setActiveChatName('');
    }
  }, [isOpen, initialChatId]);

  const handleSelectChat = (chat: Chat) => {
    const isBuyer = chat.buyerId === currentUserId;
    const name = isBuyer
      ? chat.sellerFirstName || chat.sellerUsername || 'Продавец'
      : chat.buyerFirstName || chat.buyerUsername || 'Покупатель';
    setActiveChatId(chat.id);
    setActiveChatName(name);
    setView('chat');
  };

  const handleBack = () => {
    setView('list');
    setActiveChatId(null);
    setActiveChatName('');
  };

  if (!isOpen) return null;

  const title = view === 'list' ? 'Сообщения' : activeChatName || 'Чат';

  return (
    <div className='fixed bottom-4 right-4 z-50 w-[360px] h-[520px] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-200'>
      {/* Header */}
      <div className='flex items-center gap-2 px-3 py-3 bg-black text-white shrink-0'>
        {view === 'chat' && (
          <button onClick={handleBack} className='p-1 hover:opacity-70 transition shrink-0'>
            <ArrowLeft className='w-5 h-5' />
          </button>
        )}
        <span className='flex-1 font-semibold text-sm truncate'>{title}</span>
        <button onClick={onClose} className='p-1 hover:opacity-70 transition shrink-0'>
          <X className='w-5 h-5' />
        </button>
      </div>

      {/* Body */}
      <div className='flex-1 overflow-hidden'>
        {view === 'list' ? (
          <WidgetChatList currentUserId={currentUserId} onSelect={handleSelectChat} />
        ) : activeChatId ? (
          <WidgetChatView chatId={activeChatId} currentUserId={currentUserId} />
        ) : null}
      </div>
    </div>
  );
}
