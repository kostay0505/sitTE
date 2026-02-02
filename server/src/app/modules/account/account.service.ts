import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { like } from 'drizzle-orm';
import { accounts } from './schemas/accounts';
import { type Account } from './schemas/accounts';
import { CreateAccountDto } from './dto/create-account.dto';
import { PAGINATION_CONSTANTS } from '../../../database/constants';
import { DatabaseUtils } from '../../../database/utils';
import * as bcrypt from 'bcrypt';
import { UpdateAccountDto } from './dto/update-account.dto';
import { AccountRepository } from './account.repository';

@Injectable()
export class AccountService {
  constructor(
    private readonly repository: AccountRepository,
  ) { }

  async create(dto: CreateAccountDto): Promise<Account> {
    const existingAccount = await this.repository.findByLogin(dto.login);
    if (existingAccount) {
      throw new ConflictException('Account with this login already exists');
    }

    return this.repository.create(dto);
  }

  async update(id: string, dto: UpdateAccountDto): Promise<boolean> {
    if (dto.login) {
      const existingAccount = await this.repository.findByLogin(dto.login);
      if (existingAccount && existingAccount.id !== id) {
        throw new ConflictException('Account with this login already exists');
      }
    }

    return this.repository.update(id, dto);
  }

  async findById(id: string): Promise<Account | null> {
    const account = await this.repository.findById(id);

    return account ? { ...account, password: '' } : null;
  }

  async findByLogin(login: string): Promise<Account | null> {
    const account = await this.repository.findByLogin(login);

    return account ? { ...account, password: '' } : null;
  }

  async validateAccount(login: string, password: string): Promise<Account> {
    const account = await this.repository.findByLogin(login);

    if (!account) {
      throw new UnauthorizedException('Неверный логин или пароль');
    }

    const isPasswordValid = await bcrypt.compare(password, account.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Неверный логин или пароль');
    }

    return account;
  }

  async findAllPaginated(
    page: number = PAGINATION_CONSTANTS.DEFAULT_PAGE,
    limit: number = PAGINATION_CONSTANTS.DEFAULT_LIMIT,
    search?: string
  ): Promise<{ accounts: Account[], total: number }> {
    const { page: validPage, limit: validLimit } = DatabaseUtils.validatePaginationParams(page, limit);
    const offset = DatabaseUtils.calculateOffset(validPage, validLimit);
    const sanitizedSearch = DatabaseUtils.sanitizeSearchTerm(search);

    const result = await this.repository.findAllPaginated(validLimit, offset, sanitizedSearch);

    const accountsWithoutPasswords = result.accounts.map(({ password, ...account }) => account);

    return {
      accounts: accountsWithoutPasswords as Account[],
      total: result.total
    };
  }

  async remove(id: string): Promise<void> {
    if (!DatabaseUtils.validateId(id)) {
      throw new Error('Invalid account ID');
    }

    const account = await this.repository.findById(id);
    if (!account) {
      throw new Error('Account not found');
    }

    // Удаляем связанные токены
    await this.repository.removeTokens(id);

    // Удаляем аккаунт
    await this.repository.remove(id);
  }
} 