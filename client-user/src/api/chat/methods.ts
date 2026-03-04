import { api } from '@/api/api';

export interface Chat {
  id: string;
  productId: string;
  buyerId: string;
  sellerId: string;
  unreadBuyer: number;
  unreadSeller: number;
  lastMessageAt: string;
  createdAt: string;
  productName?: string;
  productPreview?: string;
  buyerFirstName?: string;
  buyerUsername?: string;
  buyerPhoto?: string;
  sellerFirstName?: string;
  sellerUsername?: string;
  sellerPhoto?: string;
  lastMessage?: string;
}

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  body: string | null;
  imageUrl: string | null;
  isRead: boolean;
  createdAt: string;
}

export interface PaginatedResult<T> {
  items: T[];
  nextCursor: string | null;
}

export async function getOrCreateChat(productId: string): Promise<Chat> {
  const { data } = await api.post<Chat>('/chat', { productId });
  return data;
}

export async function getChatList(cursor?: string): Promise<PaginatedResult<Chat>> {
  const { data } = await api.get<PaginatedResult<Chat>>('/chat', {
    params: cursor ? { cursor } : {},
  });
  return data;
}

export async function getChatById(chatId: string): Promise<Chat> {
  const { data } = await api.get<Chat>(`/chat/${chatId}`);
  return data;
}

export async function getChatMessages(
  chatId: string,
  cursor?: string,
): Promise<PaginatedResult<Message>> {
  const { data } = await api.get<PaginatedResult<Message>>(
    `/chat/${chatId}/messages`,
    { params: cursor ? { cursor } : {} },
  );
  return data;
}

export async function markChatRead(chatId: string): Promise<void> {
  await api.patch(`/chat/${chatId}/read`);
}

export async function sendChatMessage(
  chatId: string,
  body: string | null,
  imageUrl?: string | null,
): Promise<Message> {
  const { data } = await api.post<Message>(`/chat/${chatId}/messages`, {
    body,
    imageUrl: imageUrl ?? null,
  });
  return data;
}
