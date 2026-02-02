import {
  Controller,
  Post,
  Get,
  Body,
  HttpCode,
  HttpStatus,
  Req,
  Res,
  Delete,
  UseGuards
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateTokenDto } from './dto/create-token.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { AdminLoginDto } from './dto/admin-login.dto';
import { TokenResponse } from './interfaces/token-response.interface';
import { AdminTokenResponse } from './interfaces/admin-token-response.interface';
import { Request, Response } from 'express';
import { RequestWithUser } from './interfaces/request-with-user.interface';
import { JwtAuth } from 'src/app/decorators/jwt-auth.decorator';
import {
  ConfirmEmailDto,
  RegisterDto,
  ResendEmailDto
} from './dto/user-register.dto';
import { LoginDto } from './dto/user-login.dto';
import { ForgotPasswordDto, ResetPasswordDto } from './dto/reset-password';
import { TelegramAuthDto } from './dto/telegram-auth.dto';
import { Throttle } from '@nestjs/throttler';
import { EmailThrottlerGuard } from '../../guards/email-throttler.guard';
import { CodeAttemptThrottlerGuard } from '../../guards/code-attempt-throttler.guard';
import { TelegramBot } from '../telegram/telegram.bot';
import { forwardRef, Inject } from '@nestjs/common';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly service: AuthService,
    @Inject(forwardRef(() => TelegramBot))
    private readonly telegramBot: TelegramBot
  ) {}

  private setAdminCookies(
    res: Response,
    tokenResponse: AdminTokenResponse
  ): void {
    res.cookie('admin_access_token', tokenResponse.accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: 2 * 60 * 60 * 1000, // 2 часа
      path: '/'
    });

    res.cookie('admin_refresh_token', tokenResponse.refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 дней
      path: '/api/auth/admin'
    });
  }

  private clearAdminCookies(res: Response): void {
    res.clearCookie('admin_access_token', { path: '/' });
    res.clearCookie('admin_refresh_token', { path: '/api/auth/admin' });
  }

  @Post('token/create')
  @HttpCode(HttpStatus.OK)
  async createToken(
    @Body() dto: CreateTokenDto,
    @Req() req: Request
  ): Promise<TokenResponse> {
    return this.service.createToken(dto, req);
  }

  @Post('token/refresh')
  @HttpCode(HttpStatus.OK)
  async refreshToken(
    @Body() dto: RefreshTokenDto,
    @Req() req: Request
  ): Promise<TokenResponse> {
    return this.service.refreshToken(dto, req);
  }

  @Delete('logout')
  @JwtAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(@Req() req: RequestWithUser): Promise<void> {
    await this.service.removeAllUserTokens(req.user.tgId);
  }

  @Post('admin/login')
  @HttpCode(HttpStatus.OK)
  async adminLogin(
    @Body() dto: AdminLoginDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response
  ): Promise<{ accountId: string; login: string; message: string }> {
    const tokenResponse = await this.service.adminLogin(dto, req);

    this.setAdminCookies(res, tokenResponse);

    return {
      accountId: tokenResponse.accountId,
      login: tokenResponse.login,
      message: 'Успешная авторизация'
    };
  }

  @Post('admin/refresh')
  @HttpCode(HttpStatus.OK)
  async adminRefreshToken(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response
  ): Promise<{ accountId: string; login: string; message: string }> {
    const refreshToken = req.cookies?.admin_refresh_token;

    if (!refreshToken) {
      throw new Error('Refresh token не найден в cookies');
    }

    const tokenResponse = await this.service.adminRefreshToken(
      { refreshToken },
      req
    );

    this.setAdminCookies(res, tokenResponse);

    return {
      accountId: tokenResponse.accountId,
      login: tokenResponse.login,
      message: 'Токены обновлены'
    };
  }

  @Post('admin/logout')
  @HttpCode(HttpStatus.OK)
  async adminLogout(
    @Res({ passthrough: true }) res: Response
  ): Promise<{ message: string }> {
    this.clearAdminCookies(res);
    return { message: 'Успешный выход' };
  }

  @Throttle({ default: { limit: 3, ttl: 60 * 60 * 1000 } })
  @UseGuards(EmailThrottlerGuard)
  @Post('register')
  async register(@Body() dto: RegisterDto) {
    return this.service.register(dto);
  }

  @Throttle({ default: { limit: 5, ttl: 60 * 60 * 1000 } })
  @UseGuards(CodeAttemptThrottlerGuard)
  @Post('confirm-email')
  async confirmEmail(@Body() dto: ConfirmEmailDto) {
    return this.service.confirmEmail(dto);
  }

  @Throttle({ default: { limit: 3, ttl: 60 * 60 * 1000 } })
  @UseGuards(EmailThrottlerGuard)
  @Post('confirm-email/resend')
  async resendConfirmEmail(@Body() dto: ResendEmailDto) {
    return this.service.resendEmailVerification(dto);
  }

  @Post('login')
  async login(@Body() dto: LoginDto, @Req() req: Request) {
    return this.service.login(dto, req);
  }

  @Throttle({ default: { limit: 3, ttl: 60 * 60 * 1000 } })
  @UseGuards(EmailThrottlerGuard)
  @Post('password/forgot')
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.service.sendPasswordResetCode(dto);
  }

  @Throttle({ default: { limit: 5, ttl: 60 * 60 * 1000 } })
  @UseGuards(CodeAttemptThrottlerGuard)
  @Post('password/reset')
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return this.service.resetPassword(dto);
  }

  @Post('telegram/auth')
  @JwtAuth()
  @HttpCode(HttpStatus.OK)
  async telegramAuth(
    @Body() dto: TelegramAuthDto,
    @Req() req: RequestWithUser
  ): Promise<TokenResponse> {
    return this.service.handleTelegramAuth(dto, req.user, req);
  }

  @Post('telegram/login')
  @HttpCode(HttpStatus.OK)
  async telegramLogin(
    @Body() dto: TelegramAuthDto,
    @Req() req: Request
  ): Promise<TokenResponse> {
    return this.service.loginWithTelegram(dto, req);
  }

  @Get('telegram/bot-username')
  @HttpCode(HttpStatus.OK)
  async getBotUsername(): Promise<{ username: string }> {
    return this.telegramBot.getBotInfo();
  }
}
