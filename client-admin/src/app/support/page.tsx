'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { usePageTitle } from '@/components/AuthWrapper';
import { api } from '@/api/api';

interface SupportChat {
  id: string;
  buyerId: string;
  unreadSeller: number;
  lastMessageAt: string;
  buyerFirstName?: string;
  buyerUsername?: string;
  buyerPhoto?: string;
  lastMessage?: string;
  productName?: string;
}

interface Message {
  id: string;
  chatId: string;
  senderId: string;
  body: string | null;
  imageUrl: string | null;
  isRead: boolean;
  createdAt: string;
}

export default function SupportPage() {
  const { setPageTitle } = usePageTitle();
  useEffect(() => { setPageTitle('Поддержка'); }, [setPageTitle]);

  const [chats, setChats] = useState<SupportChat[]>([]);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);
  const [loadingChats, setLoadingChats] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatPollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const msgPollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const selectedChat = chats.find((c) => c.id === selectedChatId) ?? null;

  const loadChats = useCallback(async () => {
    try {
      const r = await api.get('/chat/admin/all');
      setChats(r.data.items ?? []);
    } catch {
      // ignore polling errors
    } finally {
      setLoadingChats(false);
    }
  }, []);

  const loadMessages = useCallback(async (chatId: string) => {
    try {
      const r = await api.get(`/chat/admin/${chatId}/messages`);
      setMessages(r.data.items ?? []);
    } catch {
      // ignore polling errors
    }
  }, []);

  const markRead = useCallback(async (chatId: string) => {
    try {
      await api.patch(`/chat/admin/${chatId}/read`);
      setChats((prev) =>
        prev.map((c) => (c.id === chatId ? { ...c, unreadSeller: 0 } : c)),
      );
    } catch {
      // ignore
    }
  }, []);

  // Initial load + polling for chats list
  useEffect(() => {
    loadChats();
    chatPollRef.current = setInterval(loadChats, 5000);
    return () => {
      if (chatPollRef.current) clearInterval(chatPollRef.current);
    };
  }, [loadChats]);

  // Poll messages when chat selected
  useEffect(() => {
    if (msgPollRef.current) clearInterval(msgPollRef.current);
    if (!selectedChatId) {
      setMessages([]);
      return;
    }
    loadMessages(selectedChatId);
    markRead(selectedChatId);
    msgPollRef.current = setInterval(() => loadMessages(selectedChatId), 3000);
    return () => {
      if (msgPollRef.current) clearInterval(msgPollRef.current);
    };
  }, [selectedChatId, loadMessages, markRead]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!selectedChatId || !replyText.trim()) return;
    setSending(true);
    try {
      await api.post(`/chat/admin/${selectedChatId}/reply`, { body: replyText.trim() });
      setReplyText('');
      await loadMessages(selectedChatId);
      setChats((prev) =>
        prev.map((c) =>
          c.id === selectedChatId
            ? { ...c, lastMessageAt: new Date().toISOString(), lastMessage: replyText.trim() }
            : c,
        ),
      );
    } catch (e: any) {
      alert('Ошибка отправки: ' + (e?.response?.data?.message ?? e.message));
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleString('ru-RU', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getUserLabel = (chat: SupportChat) =>
    chat.buyerFirstName || chat.buyerUsername || chat.buyerId.slice(0, 8) + '...';

  return (
    <div style={{ display: 'flex', height: '100%', minHeight: 0 }}>
      {/* Left panel — chat list */}
      <div style={{
        width: '300px',
        flexShrink: 0,
        borderRight: '1px solid rgba(0,0,0,0.08)',
        display: 'flex',
        flexDirection: 'column',
        background: 'rgba(255,255,255,0.3)',
        borderRadius: '12px 0 0 12px',
      }}>
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid rgba(0,0,0,0.08)',
          fontWeight: 700,
          fontSize: '14px',
          color: '#1e293b',
          flexShrink: 0,
        }}>
          💬 Диалоги
          {chats.length > 0 && (
            <span style={{ marginLeft: '8px', fontSize: '12px', color: '#64748b', fontWeight: 400 }}>
              ({chats.length})
            </span>
          )}
        </div>

        {loadingChats ? (
          <div style={{ padding: '20px', color: '#94a3b8', fontSize: '13px' }}>Загрузка...</div>
        ) : chats.length === 0 ? (
          <div style={{ padding: '20px', color: '#94a3b8', fontSize: '13px' }}>Нет обращений в поддержку</div>
        ) : (
          <div style={{ overflowY: 'auto', flex: 1 }}>
            {chats.map((chat) => {
              const isSelected = chat.id === selectedChatId;
              return (
                <div
                  key={chat.id}
                  onClick={() => { setSelectedChatId(chat.id); setReplyText(''); }}
                  style={{
                    padding: '12px 16px',
                    cursor: 'pointer',
                    borderBottom: '1px solid rgba(0,0,0,0.06)',
                    background: isSelected ? 'rgba(99,102,241,0.12)' : 'transparent',
                    borderLeft: isSelected ? '3px solid #6366f1' : '3px solid transparent',
                    transition: 'background 0.1s',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{
                      fontWeight: 600, fontSize: '13px', color: '#1e293b',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '180px',
                    }}>
                      {getUserLabel(chat)}
                    </span>
                    {chat.unreadSeller > 0 && (
                      <span style={{
                        background: '#6366f1', color: '#fff', borderRadius: '999px',
                        fontSize: '11px', padding: '1px 7px', fontWeight: 700, flexShrink: 0,
                      }}>
                        {chat.unreadSeller > 99 ? '99+' : chat.unreadSeller}
                      </span>
                    )}
                  </div>
                  {chat.productName && (
                    <div style={{ fontSize: '11px', color: '#6366f1', marginTop: '1px', fontWeight: 500 }}>
                      {chat.productName}
                    </div>
                  )}
                  {chat.lastMessage && (
                    <div style={{
                      fontSize: '12px', color: '#64748b', marginTop: '2px',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                      {chat.lastMessage}
                    </div>
                  )}
                  <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>
                    {chat.lastMessageAt ? formatTime(chat.lastMessageAt) : ''}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Right panel — messages */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {!selectedChatId ? (
          <div style={{
            flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#94a3b8', fontSize: '14px',
          }}>
            Выберите диалог из списка слева
          </div>
        ) : (
          <>
            {/* Chat header */}
            <div style={{
              padding: '14px 20px',
              borderBottom: '1px solid rgba(0,0,0,0.08)',
              fontWeight: 600, fontSize: '14px', color: '#1e293b',
              background: 'rgba(255,255,255,0.4)',
              flexShrink: 0,
              display: 'flex', alignItems: 'center', gap: '8px',
            }}>
              <span>{selectedChat ? getUserLabel(selectedChat) : ''}</span>
              {selectedChat?.productName && (
                <span style={{ fontWeight: 400, fontSize: '12px', color: '#6366f1' }}>
                  — {selectedChat.productName}
                </span>
              )}
              <span style={{ fontWeight: 400, fontSize: '11px', color: '#94a3b8', marginLeft: 'auto' }}>
                {selectedChat?.buyerId}
              </span>
            </div>

            {/* Messages */}
            <div style={{
              flex: 1, overflowY: 'auto', padding: '16px 20px',
              display: 'flex', flexDirection: 'column', gap: '10px',
              background: 'rgba(248,250,252,0.5)',
            }}>
              {messages.length === 0 ? (
                <div style={{ color: '#94a3b8', fontSize: '13px', textAlign: 'center', marginTop: '40px' }}>
                  Нет сообщений
                </div>
              ) : (
                messages.map((msg) => {
                  const isAdmin = msg.senderId === 'admin-support';
                  return (
                    <div key={msg.id} style={{ display: 'flex', justifyContent: isAdmin ? 'flex-end' : 'flex-start' }}>
                      <div style={{
                        maxWidth: '65%',
                        background: isAdmin ? '#6366f1' : '#fff',
                        color: isAdmin ? '#fff' : '#1e293b',
                        borderRadius: isAdmin ? '16px 4px 16px 16px' : '4px 16px 16px 16px',
                        padding: '10px 14px',
                        fontSize: '14px',
                        boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
                        wordBreak: 'break-word',
                      }}>
                        {msg.imageUrl && (
                          <img src={msg.imageUrl} alt="img" style={{
                            maxWidth: '100%', borderRadius: '8px',
                            marginBottom: msg.body ? '8px' : 0, display: 'block',
                          }} />
                        )}
                        {msg.body && <div>{msg.body}</div>}
                        <div style={{ fontSize: '11px', marginTop: '4px', opacity: 0.7, textAlign: 'right' }}>
                          {formatTime(msg.createdAt)}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Reply input */}
            <div style={{
              padding: '12px 16px',
              borderTop: '1px solid rgba(0,0,0,0.08)',
              background: 'rgba(255,255,255,0.4)',
              display: 'flex', gap: '10px', alignItems: 'flex-end', flexShrink: 0,
            }}>
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Введите ответ... (Enter — отправить, Shift+Enter — перенос)"
                rows={2}
                style={{
                  flex: 1, resize: 'none',
                  border: '1px solid rgba(0,0,0,0.1)',
                  borderRadius: '8px', padding: '10px 12px',
                  fontSize: '14px', fontFamily: 'inherit',
                  outline: 'none', color: '#1e293b',
                  background: 'rgba(255,255,255,0.8)',
                }}
              />
              <button
                onClick={handleSend}
                disabled={sending || !replyText.trim()}
                style={{
                  background: sending || !replyText.trim() ? '#c7d2fe' : '#6366f1',
                  color: '#fff', border: 'none', borderRadius: '8px',
                  padding: '10px 20px', fontWeight: 600, fontSize: '14px',
                  cursor: sending || !replyText.trim() ? 'not-allowed' : 'pointer',
                  flexShrink: 0, transition: 'background 0.15s',
                }}
              >
                {sending ? '...' : 'Отправить'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
