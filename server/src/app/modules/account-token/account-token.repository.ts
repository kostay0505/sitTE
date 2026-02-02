import { Injectable, Inject } from '@nestjs/common';
import { eq, sql } from 'drizzle-orm';
import { accountTokens } from './schemas/account-tokens';
import { accounts } from '../account/schemas/accounts';
import { type AccountToken } from './schemas/account-tokens';
import { Database } from '../../../database/schema';
import { CreateAccountTokenDto } from './dto/create-account-token.dto';
import { SqlQueryResult } from 'src/database/utils';

@Injectable()
export class AccountTokenRepository {
    constructor(
        @Inject('DATABASE') private readonly db: Database,
    ) { }

    async create(dto: CreateAccountTokenDto): Promise<AccountToken> {
        const data = {
            ...dto,
            id: crypto.randomUUID(),
        };
        await this.db.insert(accountTokens).values(data);

        const result = await this.findByToken(data.token);

        if (!result) {
            throw new Error('Account token not created');
        }

        return result;
    }

    async findByToken(token: string): Promise<AccountToken | null> {
        const result = await this.db.execute(sql`
            SELECT 
                accountToken.id,
                accountToken.token,
                accountToken.expiresAt,
                accountToken.accountId,
                accountToken.ip,
                accountToken.userAgent
            FROM ${accountTokens} accountToken
            WHERE accountToken.token = ${token}
            AND accountToken.expiresAt > ${new Date()}
        `) as SqlQueryResult<AccountToken>;

        if (!Array.isArray(result[0]) || !result[0][0]) return null;

        return result[0][0];
    }

    async removeByAccountId(accountId: string): Promise<void> {
        await this.db.delete(accountTokens).where(eq(accountTokens.accountId, accountId));
    }

    async removeByToken(token: string): Promise<void> {
        await this.db.delete(accountTokens).where(eq(accountTokens.token, token));
    }
}
