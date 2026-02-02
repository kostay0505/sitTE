import { Injectable } from '@nestjs/common';
import { type RefreshToken } from './schemas/refresh-tokens';
import { CreateRefreshTokenDto } from './dto/create-refresh-token.dto';
import { RefreshTokenRepository } from './refresh-token.repository';

@Injectable()
export class RefreshTokenService {
  constructor(
    private readonly refreshTokenRepository: RefreshTokenRepository,
  ) { }

  async create(dto: CreateRefreshTokenDto): Promise<RefreshToken> {
    return this.refreshTokenRepository.create(dto);
  }

  async findByToken(token: string): Promise<RefreshToken | null> {
    return this.refreshTokenRepository.findByToken(token);
  }

  async removeByUserId(userId: string): Promise<void> {
    await this.refreshTokenRepository.removeByUserId(userId);
  }

  async removeByToken(token: string): Promise<void> {
    await this.refreshTokenRepository.removeByToken(token);
  }

  async removeExpired(): Promise<void> {
    await this.refreshTokenRepository.removeExpired();
  }
} 