import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req } from '@nestjs/common';
import { JwtAuth } from '../../decorators/jwt-auth.decorator';
import { AdminJwtAuth } from '../../decorators/admin-jwt-auth.decorator';
import { ChatService } from './chat.service';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post()
  @JwtAuth()
  getOrCreate(@Req() req: any, @Body('productId') productId: string) {
    return this.chatService.getOrCreateChat(productId, req.user.tgId);
  }

  @Get()
  @JwtAuth()
  getChatList(@Req() req: any, @Query('cursor') cursor?: string) {
    return this.chatService.getChatList(req.user.tgId, cursor);
  }

  // ── Admin routes (must be before :chatId to avoid conflicts) ────────────────

  @Get('admin/all')
  @AdminJwtAuth()
  getAllChats() {
    return this.chatService.getAllChats();
  }

  @Get('admin/:chatId/messages')
  @AdminJwtAuth()
  getMessagesAdmin(@Param('chatId') chatId: string) {
    return this.chatService.getMessagesAdmin(chatId);
  }

  @Patch('admin/:chatId/read')
  @AdminJwtAuth()
  markReadAdmin(@Param('chatId') chatId: string) {
    return this.chatService.markReadAdmin(chatId);
  }

  @Post('admin/:chatId/reply')
  @AdminJwtAuth()
  replyAdmin(@Param('chatId') chatId: string, @Body('body') body: string) {
    return this.chatService.replyAdmin(chatId, body);
  }

  // ── User routes ─────────────────────────────────────────────────────────────

  @Post(':chatId/messages')
  @JwtAuth()
  sendMessage(
    @Req() req: any,
    @Param('chatId') chatId: string,
    @Body() body: { body?: string; imageUrl?: string },
  ) {
    return this.chatService.sendMessage(
      chatId,
      req.user.tgId,
      body.body ?? null,
      body.imageUrl ?? null,
    );
  }

  @Get(':chatId/messages')
  @JwtAuth()
  getMessages(@Req() req: any, @Param('chatId') chatId: string, @Query('cursor') cursor?: string) {
    return this.chatService.getMessages(chatId, req.user.tgId, cursor);
  }

  @Delete(':chatId/messages/:messageId')
  @JwtAuth()
  deleteMessage(
    @Req() req: any,
    @Param('chatId') chatId: string,
    @Param('messageId') messageId: string,
  ) {
    return this.chatService.deleteMessage(chatId, req.user.tgId, messageId);
  }

  @Get(':chatId')
  @JwtAuth()
  getChat(@Req() req: any, @Param('chatId') chatId: string) {
    return this.chatService.getChatForUser(chatId, req.user.tgId);
  }

  @Patch(':chatId/read')
  @JwtAuth()
  markRead(@Req() req: any, @Param('chatId') chatId: string) {
    return this.chatService.markRead(chatId, req.user.tgId);
  }
}
