import {
  Injectable,
  UnauthorizedException,
  Logger,
  Inject,
  ConflictException,
  NotFoundException,
  BadRequestException
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AdminJwtService } from './services/admin-jwt.service';
import { UserService } from '../user/user.service';
import { type User } from '../user/schemas/users';
import * as crypto from 'crypto';
import { CreateTokenDto } from './dto/create-token.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { AdminLoginDto } from './dto/admin-login.dto';
import { AdminRefreshTokenDto } from './dto/admin-refresh-token.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { AdminJwtPayload } from './interfaces/admin-jwt-payload.interface';
import { TokenResponse } from './interfaces/token-response.interface';
import { AdminTokenResponse } from './interfaces/admin-token-response.interface';
import { Request } from 'express';
import { AccountService } from '../account/account.service';
import { AccountTokenService } from '../account-token/account-token.service';
import { RefreshTokenService } from '../refresh-token/refresh-token.service';
import { type Account } from '../account/schemas/accounts';
import {
  ConfirmEmailDto,
  RegisterDto,
  ResendEmailDto
} from './dto/user-register.dto';
import { LoginDto } from './dto/user-login.dto';
import { ForgotPasswordDto, ResetPasswordDto } from './dto/reset-password';
import { MailService } from '../../services/mail/mail.service';
import { TelegramAuthDto } from './dto/telegram-auth.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly botToken: string;
  private readonly refreshTokenExpiresIn = 30 * 24 * 60 * 60 * 1000; // 30 дней в миллисекундах

  constructor(
    @Inject('DATABASE') private readonly db: any,
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly adminJwtService: AdminJwtService,
    private readonly accountService: AccountService,
    private readonly accountTokenService: AccountTokenService,
    private readonly refreshTokenService: RefreshTokenService,
    private readonly mailService: MailService
  ) {
    if (!process.env.TELEGRAM_BOT_TOKEN) {
      throw new Error('Auth service env is empty. Please set in ENV');
    }
    this.botToken = process.env.TELEGRAM_BOT_TOKEN;
  }

  // Проверка данных инициализации Telegram
  private validateTelegramInitData(initDataRaw: string): boolean {
    try {
      const initData = new URLSearchParams(initDataRaw);
      const dataCheckString = Object.entries(
        Object.fromEntries(initData.entries())
      )
        .filter(([key]) => key !== 'hash')
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([key, value]) => `${key}=${value}`)
        .join('\n');

      const secretKey = crypto
        .createHmac('sha256', 'WebAppData')
        .update(this.botToken)
        .digest();
      const hash = crypto
        .createHmac('sha256', secretKey)
        .update(dataCheckString)
        .digest('hex');

      return hash === initData.get('hash');
    } catch (error) {
      this.logger.error(
        `Error validating Telegram init data: ${error.message}`
      );
      return false;
    }
  }

  // Извлечение идентификатора пользователя из данных инициализации
  private extractUserIdFromInitData(initDataRaw: string): string | null {
    try {
      const initData = new URLSearchParams(initDataRaw);
      const user = JSON.parse(initData.get('user') || '{}');
      return user?.id?.toString() || null;
    } catch (error) {
      this.logger.error(
        `Error extracting user ID from init data: ${error.message}`
      );
      return null;
    }
  }

  // Создание токенов для пользователя
  async createToken(
    dto: CreateTokenDto,
    req?: Request
  ): Promise<TokenResponse> {
    if (!this.validateTelegramInitData(dto.initDataRaw)) {
      throw new UnauthorizedException(
        'Невалидные данные инициализации Telegram'
      );
    }

    const tgId = this.extractUserIdFromInitData(dto.initDataRaw);
    if (!tgId) {
      throw new UnauthorizedException(
        'Не удалось получить идентификатор пользователя'
      );
    }

    let user: User;
    try {
      const initData = new URLSearchParams(dto.initDataRaw);
      const userData = JSON.parse(initData.get('user') || '{}');

      user = await this.userService.findOrCreate({
        tgId: tgId,
        username: userData.username || null,
        firstName: userData.first_name || null,
        lastName: userData.last_name || null,
        photoUrl: userData.photo_url || null,
        email: null,
        phone: null,
        cityId: null,
        langCode: userData.language_code || null,
        invitedBy: null,
        subscribedToNewsletter: true
      });

      if (userData.username) {
        const existingUser = await this.userService.findByTgId(tgId);
        const isTelegramUrl = existingUser?.photoUrl?.startsWith(
          'https://t.me/i/userpic'
        );
        const photoUrl = isTelegramUrl
          ? userData.photo_url
          : existingUser?.photoUrl;

        await this.userService.update(user.tgId, {
          ...user,
          username: userData.username,
          firstName: user.firstName || undefined,
          lastName: user.lastName,
          photoUrl,
          email: user.email,
          phone: user.phone,
          cityId: user.city?.id || null,
          subscribedToNewsletter: user.subscribedToNewsletter
        });
      }

      if (!user.isActive) {
        await this.userService.activateUser(tgId);
      }
      if (user.isBanned) {
        throw new UnauthorizedException('Пользователь заблокирован');
      }
    } catch (error) {
      this.logger.error(`Error creating/finding user: ${error.stack}`);
      throw new UnauthorizedException(
        'Ошибка при создании/поиске пользователя'
      );
    }

    return this.generateTokens(user, dto.ip, req?.headers['user-agent']);
  }

  // Обновление токенов
  async refreshToken(
    dto: RefreshTokenDto,
    req?: Request
  ): Promise<TokenResponse> {
    const refreshTokenRecord = await this.refreshTokenService.findByToken(
      dto.refreshToken
    );

    if (!refreshTokenRecord) {
      throw new UnauthorizedException('Невалидный или истекший refresh token');
    }

    const user = await this.userService.findByTgId(refreshTokenRecord.userId);
    if (!user || user.isBanned) {
      await this.refreshTokenService.removeByToken(dto.refreshToken);
      throw new UnauthorizedException('Пользователь не найден');
    }

    if (!user.isActive) {
      await this.userService.activateUser(user.tgId);
    }

    await this.refreshTokenService.removeByToken(dto.refreshToken);

    return this.generateTokens(user, req?.ip, req?.headers['user-agent']);
  }

  // Удаление всех токенов для пользователя (при выходе из системы)
  async removeAllUserTokens(userId: string): Promise<void> {
    await this.refreshTokenService.removeByUserId(userId);
    this.logger.log(`Удалено refresh токенов для пользователя ${userId}`);
  }

  // Создание пары JWT токенов
  private async generateTokens(
    user: User,
    ip?: string,
    userAgent?: string
  ): Promise<TokenResponse> {
    const payload: JwtPayload = {
      sub: user.tgId,
      username: user.username || user.tgId
    };

    const accessToken = this.jwtService.sign(payload);

    const refreshToken = crypto.randomBytes(40).toString('hex');

    const expiresAt = new Date(Date.now() + this.refreshTokenExpiresIn);

    await this.refreshTokenService.create({
      userId: user.tgId,
      token: refreshToken,
      expiresAt,
      ip,
      userAgent
    });

    return { accessToken, refreshToken };
  }

  // Валидация JWT токена
  async validateJwtPayload(payload: JwtPayload): Promise<User | null> {
    const user = await this.userService.findByTgId(payload.sub);
    if (!user || !user.isActive) {
      return null;
    }
    return user;
  }

  // Авторизация администратора
  async adminLogin(
    dto: AdminLoginDto,
    req?: Request
  ): Promise<AdminTokenResponse> {
    const account = await this.accountService.validateAccount(
      dto.login,
      dto.password
    );

    return this.generateAdminTokens(
      account,
      dto.ip,
      req?.headers['user-agent']
    );
  }

  // Обновление токена администратора
  async adminRefreshToken(
    dto: AdminRefreshTokenDto,
    req?: Request
  ): Promise<AdminTokenResponse> {
    const tokenRecord = await this.accountTokenService.findByToken(
      dto.refreshToken
    );

    if (!tokenRecord) {
      throw new UnauthorizedException('Невалидный или истекший refresh token');
    }

    const account = await this.accountService.findById(tokenRecord.accountId);
    if (!account) {
      await this.accountTokenService.removeByToken(dto.refreshToken);
      throw new UnauthorizedException('Аккаунт не найден');
    }

    // Удаляем старый токен
    await this.accountTokenService.removeByToken(dto.refreshToken);

    // Генерируем новые токены
    return this.generateAdminTokens(
      account,
      req?.ip,
      req?.headers['user-agent']
    );
  }

  // Генерация токенов для администратора
  private async generateAdminTokens(
    account: Account,
    ip?: string,
    userAgent?: string
  ): Promise<AdminTokenResponse> {
    const payload: AdminJwtPayload = {
      sub: account.id,
      login: account.login,
      type: 'admin'
    };

    const accessToken = this.adminJwtService.sign(payload);

    const refreshToken = crypto.randomBytes(40).toString('hex');
    const expiresAt = new Date(Date.now() + this.refreshTokenExpiresIn);

    // Удаляем предыдущие токены аккаунта (один активный админ на аккаунт)
    await this.accountTokenService.removeByAccountId(account.id);

    // Создаем новый refresh токен
    await this.accountTokenService.create({
      accountId: account.id,
      token: refreshToken,
      expiresAt,
      ip,
      userAgent
    });

    return {
      accessToken,
      refreshToken,
      accountId: account.id,
      login: account.login
    };
  }

  // Валидация админского JWT токена
  async validateAdminJwtPayload(
    payload: AdminJwtPayload
  ): Promise<Account | null> {
    if (payload.type !== 'admin') {
      return null;
    }

    const account = await this.accountService.findById(payload.sub);
    return account;
  }

  async register(dto: RegisterDto) {
    const existing = await this.userService.findByEmail(dto.email);
    if (existing) throw new ConflictException('Email уже зарегистрирован');

    const verificationCode = crypto
      .randomBytes(3)
      .toString('hex')
      .toUpperCase();

    await this.userService.findOrCreate({
      tgId: 'email:' + crypto.randomUUID(),
      email: dto.email,
      passwordHash: crypto
        .createHash('sha256')
        .update(dto.password)
        .digest('hex'),
      emailVerified: false,
      emailVerificationCode: verificationCode
    });

    await this.mailService.sendEmailVerification(dto.email, verificationCode);

    return { message: 'Проверьте почту, код отправлен.' };
  }

  async confirmEmail(dto: ConfirmEmailDto) {
    const user = await this.userService.findByEmail(dto.email);
    if (!user || user.isBanned) throw new NotFoundException('User not found');

    if (user.emailVerificationCode !== dto.code)
      throw new BadRequestException('Неверный код');

    await this.userService.update(user.tgId, {
      ...user,
      emailVerified: true,
      emailVerificationCode: undefined
    });

    return { message: 'Email подтверждён' };
  }

  async resendEmailVerification(dto: ResendEmailDto) {
    const user = await this.userService.findByEmail(dto.email);

    if (!user || user.isBanned) {
      return { message: 'Если email зарегистрирован — письмо отправлено' };
    }

    if (user.emailVerified) {
      return { message: 'Email уже подтверждён' };
    }

    const verificationCode = crypto
      .randomBytes(3)
      .toString('hex')
      .toUpperCase();

    await this.userService.update(user.tgId, {
      ...user,
      emailVerificationCode: verificationCode
    });

    await this.mailService.sendEmailVerification(dto.email, verificationCode);

    return { message: 'Новый код подтверждения отправлен' };
  }

  async login(dto: LoginDto, req: Request): Promise<TokenResponse> {
    const user = await this.userService.findByEmail(dto.email);
    if (!user || user.isBanned)
      throw new UnauthorizedException('Неверный email или пароль');

    const match =
      crypto.createHash('sha256').update(dto.password).digest('hex') ===
      user.passwordHash;
    if (!match) throw new UnauthorizedException('Неверный email или пароль');

    if (!user.emailVerified)
      throw new UnauthorizedException('Email не подтверждён');

    return this.generateTokens(user, req.ip, req.headers['user-agent']);
  }

  async sendPasswordResetCode(dto: ForgotPasswordDto) {
    const user = await this.userService.findByEmail(dto.email);
    if (!user || user.isBanned)
      throw new NotFoundException('Пользователь не найден');

    const code = crypto.randomBytes(3).toString('hex').toUpperCase();

    await this.userService.update(user.tgId, { resetPasswordCode: code });
    await this.mailService.sendResetPassword(dto.email, code);

    return { message: 'Если email зарегистрирован — письмо отправлено' };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const user = await this.userService.findByEmail(dto.email);
    if (!user || user.isBanned) throw new NotFoundException();
    console.log(user.resetPasswordCode, dto.code);
    if (user.resetPasswordCode !== dto.code)
      throw new BadRequestException('Неверный код');

    await this.userService.update(user.tgId, {
      passwordHash: crypto
        .createHash('sha256')
        .update(dto.newPassword)
        .digest('hex'),
      resetPasswordCode: null
    });

    return { message: 'Пароль обновлён' };
  }

  async handleTelegramAuth(
    dto: TelegramAuthDto,
    currentUser: User,
    req?: Request
  ): Promise<TokenResponse> {
    const tgId = dto.id.toString();
    let existingTgUser = await this.userService.findByTgId(tgId);

    if (!existingTgUser) {
      const oldTgId = currentUser.tgId;

      const newUser = await this.userService.findOrCreate({
        tgId: tgId,
        username: currentUser.username || dto.username || null,
        firstName: currentUser.firstName || dto.first_name || null,
        lastName: currentUser.lastName || dto.last_name || null,
        photoUrl: currentUser.photoUrl || dto.photo_url || null,
        email: currentUser.email,
        phone: currentUser.phone,
        cityId: currentUser.city?.id || null,
        subscribedToNewsletter: currentUser.subscribedToNewsletter,
        emailVerified: currentUser.emailVerified,
        passwordHash: currentUser.passwordHash
      });

      await this.userService.transferUserData(oldTgId, tgId);

      existingTgUser = await this.userService.findByTgId(tgId);
      if (!existingTgUser) {
        existingTgUser = newUser;
      }
    }

    if (existingTgUser) {
      if (dto.username && dto.username !== existingTgUser.username) {
        await this.userService.update(existingTgUser.tgId, {
          username: dto.username
        });
        const refreshedUser = await this.userService.findByTgId(tgId);
        if (refreshedUser) {
          existingTgUser = refreshedUser;
        }
      }
    }

    if (!existingTgUser) {
      throw new UnauthorizedException('Пользователь не найден');
    }

    const oldTgId = currentUser.tgId;
    let finalUser = existingTgUser;
    let tokens: TokenResponse;

    if (existingTgUser.tgId !== currentUser.tgId) {
      if (
        existingTgUser.email &&
        currentUser.email &&
        existingTgUser.email !== currentUser.email
      ) {
        throw new ConflictException(
          'Нельзя схлопывать аккаунты с разными email'
        );
      }

      finalUser = await this.userService.mergeAccounts(
        existingTgUser,
        currentUser
      );
    }

    tokens = await this.generateTokens(
      finalUser,
      req?.ip,
      req?.headers['user-agent']
    );

    if (oldTgId !== finalUser.tgId && oldTgId.startsWith('email:')) {
      setTimeout(async () => {
        try {
          await this.userService.update(oldTgId, {
            isActive: false
          });
          await this.removeAllUserTokens(oldTgId);
        } catch (error) {
          this.logger.error(
            `Ошибка при деактивации старого пользователя ${oldTgId}:`,
            error
          );
        }
      }, 5000);
    }

    return tokens;
  }

  async loginWithTelegram(
    dto: TelegramAuthDto,
    req?: Request
  ): Promise<TokenResponse> {
    const tgId = dto.id.toString();
    try {
      const user = await this.userService.findOrCreate({
        tgId: tgId,
        username: dto.username || null,
        firstName: dto.first_name || null,
        lastName: dto.last_name || null,
        photoUrl: dto.photo_url || null
      });

      if (dto.username && dto.username !== user.username) {
        await this.userService.update(user.tgId, { username: dto.username });
      }

      if (user.isBanned) {
        throw new UnauthorizedException('Пользователь заблокирован');
      }

      return this.generateTokens(user, req?.ip, req?.headers['user-agent']);
    } catch (error) {
      throw new UnauthorizedException('Ошибка при входе через Telegram');
    }
  }
}
