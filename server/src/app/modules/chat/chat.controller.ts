import { Body, Controller, Get, Param, Patch, Post, Query, Req } from '@nestjs/common';
import { JwtAuth } from '../../decorators/jwt-auth.decorator';
import { ChatService } from './chat.service';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post()
  @JwtAuth()
  getOrCreate(@Req() req: any, @Body('productId') productId: string) {
    return this.chatService.getOrCreateChat(productId, req.user.id);
  }

  @Get()
  @JwtAuth()
  getChatList(@Req() req: any, @Query('cursor') cursor?: string) {
    return this.chatService.getChatList(req.user.id, cursor);
  }

  @Get(':chatId/messages')
  @JwtAuth()
  getMessages(@Req() req: any, @Param('chatId') chatId: string, @Query('cursor') cursor?: string) {
    return this.chatService.getMessages(chatId, req.user.id, cursor);
  }

  @Patch(':chatId/read')
  @JwtAuth()
  markRead(@Req() req: any, @Param('chatId') chatId: string) {
    return this.chatService.markRead(chatId, req.user.id);
  }
}
