import { Injectable, Inject } from '@nestjs/common';
import { eq, and, sql } from 'drizzle-orm';
import { viewedProducts } from './schemas/viewed-products';
import { type ViewedProduct } from './schemas/viewed-products';
import { Database } from '../../../database/schema';

@Injectable()
export class ViewedProductRepository {
    constructor(
        @Inject('DATABASE') private readonly db: Database,
    ) { }

    async getProductViewCounts(): Promise<{ productId: string; viewCount: number }[]> {
        return this.db
            .select({
                productId: viewedProducts.productId,
                viewCount: sql<number>`count(*)`.as('viewCount'),
            })
            .from(viewedProducts)
            .groupBy(viewedProducts.productId);
    }

    async create(dto: { userId: string; productId: string }): Promise<ViewedProduct> {
        await this.db.insert(viewedProducts).values(dto);

        const result = await this.findByUserAndProduct(dto.userId, dto.productId);

        if (!result) {
            throw new Error('Viewed product not created');
        }

        return result;
    }

    async insertOrUpdate(userId: string, productId: string): Promise<void> {
        await this.db.insert(viewedProducts)
            .values({
                userId,
                productId,
            })
            .onDuplicateKeyUpdate({ set: { createdAt: new Date() } });
    }

    async findByUserAndProduct(userId: string, productId: string): Promise<ViewedProduct | null> {
        const [viewedProduct] = await this.db.select()
            .from(viewedProducts)
            .where(
                and(
                    eq(viewedProducts.userId, userId),
                    eq(viewedProducts.productId, productId)
                )
            );
        return viewedProduct || null;
    }
}
