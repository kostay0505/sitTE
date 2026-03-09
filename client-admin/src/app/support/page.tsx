'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

const API_BASE = 'https://api.touringexpertsale.ru/api';

function getToken(): string {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem('adminToken') || '';
}

interface SupportChat {
  id: string;
  buyerId: string;
  unreadSeller: number;
  lastMessageAt: string;
  buyerFirstName?: string;
  buyerUsername?: string;
  buyerPhoto?: string;
  lastMessage?: string;
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

async function apiFetch(path: string, options?: RequestInit) {
  const token = getToken();
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...(options?.headers ?? {}),
    },
  });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json();
}

export default function SupportPage() {
  const [chats, setChats] = useState<SupportChat[]>([]);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);
  const [loadingChats, setLoadingChats] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatPollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const msgPollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const selectedChat = chats.find((c) => c.id === selectedChatId) ?? null;

  const loadChats = useCallback(async () => {
    try {
      const data = await apiFetch('/chat/admin/all');
      setChats(data.items ?? []);
      setError(null);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoadingChats(false);
    }
  }, []);

  const loadMessages = useCallback(async (chatId: string) => {
    try {
      const data = await apiFetch(`/chat/admin/${chatId}/messages`);
      setMessages(data.items ?? []);
    } catch {
      // ignore polling errors
    }
  }, []);

  // Mark chat read when selected
  const markRead = useCallback(async (chatId: string) => {
    try {
      await apiFetch(`/chat/admin/${chatId}/read`, { method: 'PATCH' });
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

  const handleSelectChat = (chatId: string) => {
    setSelectedChatId(chatId);
    setReplyText('');
  };

  const handleSend = async () => {
    if (!selectedChatId || !replyText.trim()) return;
    setSending(true);
    try {
      await apiFetch(`/chat/admin/${selectedChatId}/reply`, {
        method: 'POST',
        body: JSON.stringify({ body: replyText.trim() }),
      });
      setReplyText('');
      await loadMessages(selectedChatId);
      await loadChats();
    } catch (e: any) {
      alert('Ошибка отправки: ' + e.message);
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
      <div
        style={{
          width: '300px',
          flexShrink: 0,
          borderRight: '1px solid #e2e8f0',
          display: 'flex',
          flexDirection: 'column',
          background: '#f8fafc',
        }}
      >
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid #e2e8f0',
            fontWeight: 700,
            fontSize: '15px',
            color: '#1e293b',
          }}
        >
          💬 Поддержка
          {chats.length > 0 && (
            <span
              style={{
                marginLeft: '8px',
                fontSize: '12px',
                color: '#64748b',
                fontWeight: 400,
              }}
            >
              ({chats.length})
            </span>
          )}
        </div>

        {error && (
          <div style={{ padding: '12px', color: '#ef4444', fontSize: '13px' }}>
            Ошибка: {error}
          </div>
        )}

        {loadingChats ? (
          <div style={{ padding: '20px', color: '#94a3b8', fontSize: '13px' }}>
            Загрузка...
          </div>
        ) : chats.length === 0 ? (
          <div style={{ padding: '20px', color: '#94a3b8', fontSize: '13px' }}>
            Нет обращений в поддержку
          </div>
        ) : (
          <div style={{ overflowY: 'auto', flex: 1 }}>
            {chats.map((chat) => {
              const isSelected = chat.id === selectedChatId;
              return (
                <div
                  key={chat.id}
                  onClick={() => handleSelectChat(chat.id)}
                  style={{
                    padding: '12px 16px',
                    cursor: 'pointer',
                    borderBottom: '1px solid #e2e8f0',
                    background: isSelected ? '#e0e7ff' : 'transparent',
                    borderLeft: isSelected ? '3px solid #6366f1' : '3px solid transparent',
                    transition: 'background 0.1s',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <span
                      style={{
                        fontWeight: 600,
                        fontSize: '14px',
                        color: '#1e293b',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        maxWidth: '180px',
                      }}
                    >
                      {getUserLabel(chat)}
                    </span>
                    {chat.unreadSeller > 0 && (
                      <span
                        style={{
                          background: '#6366f1',
                          color: '#fff',
                          borderRadius: '999px',
                          fontSize: '11px',
                          padding: '1px 7px',
                          fontWeight: 700,
                          flexShrink: 0,
                        }}
                      >
                        {chat.unreadSeller > 99 ? '99+' : chat.unreadSeller}
                      </span>
                    )}
                  </div>
                  {chat.lastMessage && (
                    <div
                      style={{
                        fontSize: '12px',
                        color: '#64748b',
                        marginTop: '2px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
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
          <div
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#94a3b8',
              fontSize: '15px',
            }}
          >
            Выберите диалог из списка слева
          </div>
        ) : (
          <>
            {/* Chat header */}
            <div
              style={{
                padding: '14px 20px',
                borderBottom: '1px solid #e2e8f0',
                fontWeight: 600,
                fontSize: '15px',
                color: '#1e293b',
                background: '#fff',
                flexShrink: 0,
              }}
            >
              {selectedChat ? getUserLabel(selectedChat) : ''}
              <span style={{ fontWeight: 400, fontSize: '12px', color: '#94a3b8', marginLeft: '8px' }}>
                {selectedChat?.buyerId}
              </span>
            </div>

            {/* Messages */}
            <div
              style={{
                flex: 1,
                overflowY: 'auto',
                padding: '16px 20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                background: '#f8fafc',
              }}
            >
              {messages.length === 0 ? (
                <div style={{ color: '#94a3b8', fontSize: '13px', textAlign: 'center', marginTop: '40px' }}>
                  Нет сообщений
                </div>
              ) : (
                messages.map((msg) => {
                  const isAdmin = msg.senderId === 'admin-support';
                  return (
                    <div
                      key={msg.id}
                      style={{
                        display: 'flex',
                        justifyContent: isAdmin ? 'flex-end' : 'flex-start',
                      }}
                    >
                      <div
                        style={{
                          maxWidth: '65%',
                          background: isAdmin ? '#6366f1' : '#fff',
                          color: isAdmin ? '#fff' : '#1e293b',
                          borderRadius: isAdmin ? '16px 4px 16px 16px' : '4px 16px 16px 16px',
                          padding: '10px 14px',
                          fontSize: '14px',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                          wordBreak: 'break-word',
                        }}
                      >
                        {msg.imageUrl && (
                          <img
                            src={msg.imageUrl}
                            alt="img"
                            style={{
                              maxWidth: '100%',
                              borderRadius: '8px',
                              marginBottom: msg.body ? '8px' : 0,
                              display: 'block',
                            }}
                          />
                        )}
                        {msg.body && <div>{msg.body}</div>}
                        <div
                          style={{
                            fontSize: '11px',
                            marginTop: '4px',
                            opacity: 0.7,
                            textAlign: 'right',
                          }}
                        >
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
            <div
              style={{
                padding: '12px 16px',
                borderTop: '1px solid #e2e8f0',
                background: '#fff',
                display: 'flex',
                gap: '10px',
                alignItems: 'flex-end',
                flexShrink: 0,
              }}
            >
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Введите ответ... (Enter — отправить, Shift+Enter — перенос)"
                rows={2}
                style={{
                  flex: 1,
                  resize: 'none',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  padding: '10px 12px',
                  fontSize: '14px',
                  fontFamily: 'inherit',
                  outline: 'none',
                  color: '#1e293b',
                }}
              />
              <button
                onClick={handleSend}
                disabled={sending || !replyText.trim()}
                style={{
                  background: sending || !replyText.trim() ? '#c7d2fe' : '#6366f1',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '10px 20px',
                  fontWeight: 600,
                  fontSize: '14px',
                  cursor: sending || !replyText.trim() ? 'not-allowed' : 'pointer',
                  flexShrink: 0,
                  transition: 'background 0.15s',
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
