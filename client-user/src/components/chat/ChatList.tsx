'use client';
import type { Chat } from '@/api/chat/methods';
import { toImageSrc } from '@/utils/toImageSrc';
import Link from 'next/link';
import { cn } from '@/utils/cn';

interface ChatListProps {
  chats: Chat[];
  currentUserId: string;
  onSelect?: (chatId: string) => void;
  selectedChatId?: string | null;
}

export function ChatList({ chats, currentUserId, onSelect, selectedChatId }: ChatListProps) {
  if (chats.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-gray-400">
        <svg
          className="w-16 h-16 mb-4 opacity-30"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
          />
        </svg>
        <p className="text-lg font-medium">Нет диалогов</p>
        <p className="text-sm mt-1">
          Начните общение с продавцом на странице товара
        </p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-100">
      {chats.map((chat) => {
        const isAdmin = !!chat.isAdminChat;
        const isBuyer = chat.buyerId === currentUserId;
        const unread = isBuyer ? chat.unreadBuyer : chat.unreadSeller;

        const otherName = isAdmin
          ? 'Touring Expert Support'
          : isBuyer
          ? chat.sellerFirstName || chat.sellerUsername || 'Продавец'
          : chat.buyerFirstName || chat.buyerUsername || 'Покупатель';

        const otherPhoto = isAdmin ? null : isBuyer ? chat.sellerPhoto : chat.buyerPhoto;

        const time = chat.lastMessageAt
          ? new Date(chat.lastMessageAt).toLocaleDateString('ru-RU', {
              day: 'numeric',
              month: 'short',
            })
          : '';

        const isSelected = selectedChatId === chat.id;

        const inner = (
          <>
            <div className="relative flex-shrink-0">
              {isAdmin ? (
                <div className="w-12 h-12 rounded-full bg-black flex items-center justify-center text-white font-bold text-xs text-center leading-tight px-1">
                  TE
                </div>
              ) : otherPhoto ? (
                <img
                  src={toImageSrc(otherPhoto)}
                  alt={otherName}
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-semibold text-lg">
                  {otherName[0]?.toUpperCase()}
                </div>
              )}
              {unread > 0 && (
                <span className="absolute -top-1 -right-1 bg-green-500 text-white text-xs rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                  {unread > 99 ? '99+' : unread}
                </span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className={`font-medium truncate ${isAdmin ? 'text-black' : 'text-gray-900'}`}>
                  {otherName}
                </p>
                <span className="text-xs text-gray-400 flex-shrink-0 ml-2">
                  {time}
                </span>
              </div>
              {isAdmin ? (
                <p className="text-xs text-gray-400 truncate">Служба поддержки</p>
              ) : (
                <p className="text-xs text-gray-500 truncate">
                  {chat.productName}
                </p>
              )}
              {chat.lastMessage && (
                <p className="text-sm text-gray-500 truncate mt-0.5">
                  {chat.lastMessage}
                </p>
              )}
            </div>
          </>
        );

        const className = cn(
          'flex items-center gap-3 px-4 py-3 transition-colors w-full text-left',
          isSelected ? 'bg-gray-100' : 'hover:bg-gray-50',
        );

        if (onSelect) {
          return (
            <button key={chat.id} onClick={() => onSelect(chat.id)} className={className}>
              {inner}
            </button>
          );
        }

        return (
          <Link key={chat.id} href={`/chats/${chat.id}`} className={className}>
            {inner}
          </Link>
        );
      })}
    </div>
  );
}
