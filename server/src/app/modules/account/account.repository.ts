import { Injectable, Inject } from '@nestjs/common';
import { eq, like, sql } from 'drizzle-orm';
import { accounts } from './schemas/accounts';
import { accountTokens } from '../account-token/schemas/account-tokens';
import { type Account } from './schemas/accounts';
import { Database } from '../../../database/schema';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import { DATABASE_CONSTANTS } from 'src/database/constants';
import * as bcrypt from 'bcrypt';
import { SqlQueryResult } from 'src/database/utils';


@Injectable()
export class AccountRepository {
    constructor(
        @Inject('DATABASE') private readonly db: Database,
    ) { }

    async create(dto: CreateAccountDto): Promise<Account> {
        const hashedPassword = await bcrypt.hash(dto.password, DATABASE_CONSTANTS.PASSWORD_SALT_ROUNDS);
        const data = {
            ...dto,
            id: crypto.randomUUID(),
            password: hashedPassword,
        };
        await this.db.insert(accounts).values(data);

        const result = await this.findById(data.id);

        if (!result) {
            throw new Error('Account not created');
        }

        return result;
    }

    async update(id: string, dto: UpdateAccountDto): Promise<boolean> {
        const data = { ...dto };

        if (dto.password) {
            data.password = await bcrypt.hash(dto.password, DATABASE_CONSTANTS.PASSWORD_SALT_ROUNDS);
        }

        await this.db.update(accounts)
            .set(data)
            .where(eq(accounts.id, id));

        return true;
    }

    async findAll(): Promise<Account[]> {
        const result = await this.db.execute(sql`
            SELECT * FROM ${accounts}
        `) as SqlQueryResult<Account>;

        if (!Array.isArray(result[0])) {
            throw new Error('Unexpected query result format');
        }

        return result[0];
    }

    async findById(id: string): Promise<Account | null> {
        const result = await this.db.execute(sql`
            SELECT * FROM ${accounts}
            WHERE ${accounts.id} = ${id}
        `) as SqlQueryResult<Account>;

        if (!Array.isArray(result[0]) || !result[0][0]) return null;

        return result[0][0];
    }

    async findByLogin(login: string): Promise<Account | null> {
        const result = await this.db.execute(sql`
            SELECT * FROM ${accounts}
            WHERE ${accounts.login} = ${login}
        `) as SqlQueryResult<Account>;

        if (!Array.isArray(result[0]) || !result[0][0]) return null;

        return result[0][0];
    }

    async findAllPaginated(
        limit: number,
        offset: number,
        search?: string
    ): Promise<{ accounts: Account[], total: number }> {
        const searchCondition = search ? like(accounts.login, `%${search}%`) : undefined;

        const totalResult = await this.db.execute(sql`
            SELECT COUNT(*) as count
            FROM ${accounts}
            ${searchCondition ? sql`WHERE ${searchCondition}` : sql``}
        `) as SqlQueryResult<{ count: number }>;

        const accountsResult = await this.db.execute(sql`
            SELECT * 
            FROM ${accounts}
            ${searchCondition ? sql`WHERE ${searchCondition}` : sql``}
            ORDER BY ${accounts.createdAt} DESC
            LIMIT ${limit}
            OFFSET ${offset}
        `) as SqlQueryResult<Account>;

        if (!Array.isArray(totalResult[0]) || !totalResult[0][0]
            || !Array.isArray(accountsResult[0])) {
            throw new Error('Unexpected query result format');
        }

        return {
            accounts: accountsResult[0],
            total: totalResult[0][0].count
        };
    }

    async remove(id: string): Promise<void> {
        await this.db.delete(accounts)
            .where(eq(accounts.id, id));
    }

    async removeTokens(accountId: string): Promise<void> {
        await this.db.delete(accountTokens)
            .where(eq(accountTokens.accountId, accountId));
    }
}
