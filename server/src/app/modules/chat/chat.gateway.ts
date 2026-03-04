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
import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { ChatService } from './chat.service';

@WebSocketGateway({ cors: { origin: '*' }, namespace: 'chat' })
@Injectable()
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private userSockets = new Map<string, Set<string>>();

  constructor(
    @Inject(forwardRef(() => ChatService))
    private readonly chatService: ChatService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const token =
        client.handshake.auth?.token ||
        client.handshake.headers?.authorization?.split(' ')[1];
      if (!token) {
        client.disconnect();
        return;
      }
      const payload = this.jwtService.verify(token, {
        secret: this.configService.get<string>('USER_JWT_SECRET'),
      });
      (client as any).userId = payload.id;
      if (!this.userSockets.has(payload.id)) {
        this.userSockets.set(payload.id, new Set());
      }
      this.userSockets.get(payload.id)!.add(client.id);
    } catch {
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    const userId = (client as any).userId;
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
    if (!userId) return;
    try {
      const message = await this.chatService.sendMessage(
        data.chatId,
        userId,
        data.body ?? null,
        data.imageUrl ?? null,
      );
      return message;
    } catch (e) {
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
