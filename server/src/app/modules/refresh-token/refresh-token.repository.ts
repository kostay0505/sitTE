import { Injectable, Inject } from '@nestjs/common';
import { eq, gt, lt, and, sql } from 'drizzle-orm';
import { type RefreshToken, refreshTokens } from './schemas/refresh-tokens';
import { users } from '../user/schemas/users';
import { Database } from '../../../database/schema';
import { CreateRefreshTokenDto } from './dto/create-refresh-token.dto';
import { SqlQueryResult } from 'src/database/utils';

@Injectable()
export class RefreshTokenRepository {
    constructor(
        @Inject('DATABASE') private readonly db: Database,
    ) { }

    async create(dto: CreateRefreshTokenDto): Promise<RefreshToken> {
        const data = {
            ...dto,
            id: crypto.randomUUID(),
        };
        await this.db.insert(refreshTokens).values(data);

        const result = await this.findByToken(data.token);

        if (!result) {
            throw new Error('Refresh token not created');
        }

        return result;
    }

    async findByToken(token: string): Promise<RefreshToken | null> {
        const result = await this.db.execute(sql`
            SELECT 
                refreshToken.id,
                refreshToken.token,
                refreshToken.expiresAt,
                refreshToken.userId
            FROM ${refreshTokens} refreshToken
            WHERE refreshToken.token = ${token}
        `) as SqlQueryResult<RefreshToken>;

        if (!Array.isArray(result[0]) || !result[0][0]) return null;

        return result[0][0];
    }

    async removeByUserId(userId: string): Promise<void> {
        await this.db.delete(refreshTokens)
            .where(eq(refreshTokens.userId, userId));
    }

    async removeByToken(token: string): Promise<void> {
        await this.db.delete(refreshTokens)
            .where(eq(refreshTokens.token, token));
    }

    async removeExpired(): Promise<void> {
        await this.db.delete(refreshTokens)
            .where(lt(refreshTokens.expiresAt, new Date()));
    }
}
