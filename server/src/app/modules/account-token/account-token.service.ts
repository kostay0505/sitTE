import { Injectable } from '@nestjs/common';
import { type AccountToken } from './schemas/account-tokens';
import { CreateAccountTokenDto } from './dto/create-account-token.dto';
import { AccountTokenRepository } from './account-token.repository';

@Injectable()
export class AccountTokenService {
  constructor(
    private readonly repository: AccountTokenRepository,
  ) { }

  async create(dto: CreateAccountTokenDto): Promise<AccountToken> {
    return this.repository.create(dto);
  }

  async findByToken(token: string): Promise<AccountToken | null> {
    return this.repository.findByToken(token);
  }

  async removeByAccountId(accountId: string): Promise<void> {
    await this.repository.removeByAccountId(accountId);
  }

  async removeByToken(token: string): Promise<void> {
    await this.repository.removeByToken(token);
  }
} 