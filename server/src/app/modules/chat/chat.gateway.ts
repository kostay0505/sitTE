import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { ChatService } from './chat.service';

@WebSocketGateway({ cors: { origin: '*' }, namespace: 'chat' })
@Injectable()
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger('ChatGateway');
  private userSockets = new Map<string, Set<string>>();

  constructor(
    @Inject(forwardRef(() => ChatService))
    private readonly chatService: ChatService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async handleConnection(client: Socket) {
    this.logger.log(`Client connecting: ${client.id}, ns: ${client.nsp.name}`);
    try {
      const token =
        client.handshake.auth?.token ||
        client.handshake.headers?.authorization?.split(' ')[1];
      if (!token) {
        this.logger.warn(`No token from ${client.id}, disconnecting`);
        client.disconnect();
        return;
      }
      const payload = this.jwtService.verify(token, {
        secret: this.configService.get<string>('USER_JWT_SECRET'),
      });
      const userId = payload.sub as string;
      if (!userId) {
        this.logger.warn(`No userId in payload from ${client.id}`);
        client.disconnect();
        return;
      }
      (client as any).userId = userId;
      if (!this.userSockets.has(userId)) this.userSockets.set(userId, new Set());
      this.userSockets.get(userId)!.add(client.id);
      this.logger.log(`Authenticated: ${userId}, socket: ${client.id}`);
    } catch (e) {
      this.logger.error(`Auth failed for ${client.id}: ${(e as Error).message}`);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    const userId = (client as any).userId;
    this.logger.log(`Disconnected: ${client.id}, userId: ${userId}`);
    if (userId) {
      const sockets = this.userSockets.get(userId);
      if (sockets) {
        sockets.delete(client.id);
        if (sockets.size === 0) this.userSockets.delete(userId);
      }
    }
  }

  @SubscribeMessage('joinChat')
  handleJoinChat(@ConnectedSocket() client: Socket, @MessageBody() chatId: string) {
    this.logger.log(`joinChat: ${chatId} by ${(client as any).userId}`);
    client.join('chat:' + chatId);
    return { ok: true };
  }

  @SubscribeMessage('leaveChat')
  handleLeaveChat(@ConnectedSocket() client: Socket, @MessageBody() chatId: string) {
    client.leave('chat:' + chatId);
    return { ok: true };
  }

  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { chatId: string; body?: string; imageUrl?: string },
  ) {
    const userId = (client as any).userId;
    this.logger.log(`sendMessage from ${userId}: chatId=${data.chatId} body=${data.body}`);
    if (!userId) return { error: 'Not authenticated' };
    try {
      const message = await this.chatService.sendMessage(
        data.chatId,
        userId,
        data.body ?? null,
        data.imageUrl ?? null,
      );
      this.logger.log(`Message saved: ${message?.id}`);
      return message;
    } catch (e) {
      this.logger.error(`sendMessage error: ${(e as Error).message}`);
      return { error: (e as Error).message };
    }
  }

  @SubscribeMessage('markRead')
  async handleMarkRead(@ConnectedSocket() client: Socket, @MessageBody() chatId: string) {
    const userId = (client as any).userId;
    if (!userId) return;
    await this.chatService.markRead(chatId, userId);
    return { ok: true };
  }

  emitNewMessage(chatId: string, message: any) {
    this.server.to('chat:' + chatId).emit('newMessage', message);
  }

  emitUnreadUpdate(userId: string, chatId: string, count: number) {
    const sockets = this.userSockets.get(userId);
    if (sockets) {
      sockets.forEach((socketId) => {
        this.server.to(socketId).emit('unreadUpdate', { chatId, count });
      });
    }
  }
}
