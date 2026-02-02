import { Injectable, Inject } from '@nestjs/common';
import { count, eq, and } from 'drizzle-orm';
import { users } from '../user/schemas/users';
import { products } from '../product/schemas/products';
import { Database } from '../../../database/schema';
import { Stats } from './types/stats.type';

@Injectable()
export class StatsService {
    constructor(
        @Inject('DATABASE') private readonly db: Database,
    ) { }

    async getStats(): Promise<Stats> {
        const [usersCount, productsCount] = await Promise.all([
            this.getUsersCount(),
            this.getProductsCount()
        ]);

        const averageProductsPerUser = usersCount > 0 
            ? Math.round((productsCount / usersCount) * 100) / 100 
            : 0;

        return {
            usersCount,
            productsCount,
            averageProductsPerUser
        };
    }

    private async getUsersCount(): Promise<number> {
        const result = await this.db.select({ count: count() })
            .from(users)
            .where(eq(users.isActive, true));
        
        return result[0]?.count || 0;
    }

    private async getProductsCount(): Promise<number> {
        const result = await this.db.select({ count: count() })
            .from(products)
            .where(and(
                eq(products.isActive, true),
                eq(products.isDeleted, false)
            ));
        
        return result[0]?.count || 0;
    }
}
