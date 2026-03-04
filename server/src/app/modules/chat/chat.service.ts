import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { ChatRepository } from './chat.repository';
import { ChatGateway } from './chat.gateway';
import { forwardRef, Inject } from '@nestjs/common';
import { sql } from 'drizzle-orm';

@Injectable()
export class ChatService {
  constructor(
    private readonly chatRepository: ChatRepository,
    @Inject(forwardRef(() => ChatGateway))
    private readonly chatGateway: ChatGateway,
    @Inject('DATABASE') private db: any,
  ) {}

  async getOrCreateChat(productId: string, buyerId: string) {
    const result = await this.db.execute(
      sql`SELECT userId FROM Products WHERE id = ${productId} AND isDeleted = false LIMIT 1`,
    );
    const rows = result[0] as any[];
    if (!rows[0]) throw new NotFoundException('Product not found');
    const sellerId = rows[0].userId;
    if (sellerId === buyerId) throw new ForbiddenException('Cannot chat with yourself');
    return this.chatRepository.findOrCreateChat(productId, buyerId, sellerId);
  }

  async getChatList(userId: string, cursor?: string) {
    return this.chatRepository.getChatsForUser(userId, cursor);
  }

  async getChatForUser(chatId: string, userId: string) {
    const chat = await this.chatRepository.getChatById(chatId);
    if (!chat) throw new NotFoundException('Chat not found');
    if (chat.buyerId !== userId && chat.sellerId !== userId) throw new ForbiddenException('Access denied');
    return chat;
  }

  async getMessages(chatId: string, userId: string, cursor?: string) {
    const chat = await this.chatRepository.getChatById(chatId);
    if (!chat) throw new NotFoundException('Chat not found');
    if (chat.buyerId !== userId && chat.sellerId !== userId) throw new ForbiddenException('Access denied');
    return this.chatRepository.getMessages(chatId, cursor);
  }

  async sendMessage(chatId: string, senderId: string, body: string | null, imageUrl: string | null) {
    const chat = await this.chatRepository.getChatById(chatId);
    if (!chat) throw new NotFoundException('Chat not found');
    if (chat.buyerId !== senderId && chat.sellerId !== senderId) throw new ForbiddenException('Access denied');

    const message = await this.chatRepository.createMessage(chatId, senderId, body, imageUrl, chat.sellerId, chat.buyerId);
    this.chatGateway.emitNewMessage(chatId, message);

    const msgCount = await this.chatRepository.getMessageCount(chatId);
    if (msgCount === 1 && senderId === chat.buyerId) {
      this.notifySellerTelegram(chat, message).catch(() => {});
    }

    return message;
  }

  async markRead(chatId: string, userId: string) {
    const chat = await this.chatRepository.getChatById(chatId);
    if (!chat) throw new NotFoundException('Chat not found');
    if (chat.buyerId !== userId && chat.sellerId !== userId) throw new ForbiddenException('Access denied');
    await this.chatRepository.markRead(chatId, userId, chat);
    this.chatGateway.emitUnreadUpdate(userId, chatId, 0);
    return { ok: true };
  }

  private async notifySellerTelegram(chat: any, message: any) {
    try {
      const { Bot } = await import('grammy');
      const token = process.env.TELEGRAM_BOT_TOKEN;
      if (!token || !chat.sellerTgId) return;
      const bot = new Bot(token);
      const name = chat.buyerFirstName || chat.buyerUsername || 'Buyer';
      const body = message.body || '[image]';
      await bot.api.sendMessage(chat.sellerTgId, `New message on "${chat.productName}"\nFrom: ${name}\n\n${body}`);
    } catch {
      // ignore
    }
  }
}
