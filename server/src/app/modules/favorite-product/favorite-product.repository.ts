import { Injectable, Inject } from '@nestjs/common';
import { eq, and, sql } from 'drizzle-orm';
import { favoriteProducts } from './schemas/favorite-products';
import { type FavoriteProduct } from './schemas/favorite-products';
import { Database } from '../../../database/schema';
import { CreateFavoriteProductDto } from './dto/create-favorite-product.dto';
import { UpdateFavoriteProductDto } from './dto/update-favorite-product.dto';
import { SqlQueryResult } from 'src/database/utils';

@Injectable()
export class FavoriteProductRepository {
    constructor(
        @Inject('DATABASE') private readonly db: Database,
    ) { }

    async create(dto: CreateFavoriteProductDto & { userId: string }): Promise<FavoriteProduct> {
        await this.db.insert(favoriteProducts).values(dto);
        const result = await this.findByUserAndProduct(dto.userId, dto.productId);
        if (!result) {
            throw new Error('Favorite product not created');
        }

        return result;
    }

    async update(userId: string, productId: string, dto: UpdateFavoriteProductDto): Promise<boolean> {
        await this.db.update(favoriteProducts)
            .set(dto)
            .where(
                and(
                    eq(favoriteProducts.userId, userId),
                    eq(favoriteProducts.productId, productId)
                )
            );
        return true;
    }

    async findByUserAndProduct(userId: string, productId: string): Promise<FavoriteProduct | null> {
        const result = await this.db.execute(sql`
            SELECT * FROM ${favoriteProducts}
            WHERE ${favoriteProducts.userId} = ${userId}
            AND ${favoriteProducts.productId} = ${productId}
        `) as SqlQueryResult<FavoriteProduct>;

        if (!Array.isArray(result[0]) || !result[0][0]) return null;

        return result[0][0];
    }

    async findActiveByUserAndProduct(userId: string, productId: string): Promise<FavoriteProduct | null> {
        const result = await this.db.execute(sql`
            SELECT * FROM ${favoriteProducts}
            WHERE ${favoriteProducts.userId} = ${userId}
            AND ${favoriteProducts.productId} = ${productId}
            AND ${favoriteProducts.isActive} = true
        `) as SqlQueryResult<FavoriteProduct>;

        if (!Array.isArray(result[0]) || !result[0][0]) return null;

        return result[0][0];
    }

    async insertOrUpdate(userId: string, productId: string, isActive: boolean): Promise<void> {
        await this.db
            .insert(favoriteProducts)
            .values({ userId, productId, isActive })
            .onDuplicateKeyUpdate({
                set: { isActive }
            });
    }

    async updateActiveStatus(userId: string, productId: string, isActive: boolean): Promise<void> {
        await this.db.update(favoriteProducts)
            .set({ isActive })
            .where(
                and(
                    eq(favoriteProducts.userId, userId),
                    eq(favoriteProducts.productId, productId)
                )
            );
    }

    async getFavoriteProductIds(): Promise<string[]> {
        const result = await this.db.execute(sql`
            SELECT ${favoriteProducts.productId} FROM ${favoriteProducts}
            WHERE ${favoriteProducts.isActive} = true
        `) as SqlQueryResult<{ productId: string }>;

        if (!Array.isArray(result[0])) {
            throw new Error('Unexpected query result format');
        }

        return result[0].map((favoriteProduct) => favoriteProduct.productId);
    }

    async isFavorite(userId: string, productId: string): Promise<boolean> {
        const result = await this.db.execute(sql`
            SELECT ${favoriteProducts.isActive} as isFavorite FROM ${favoriteProducts}
            WHERE ${favoriteProducts.userId} = ${userId}
            AND ${favoriteProducts.productId} = ${productId}
        `) as SqlQueryResult<{ isFavorite: boolean }>;

        if (!Array.isArray(result[0])) {
            throw new Error('Unexpected query result format');
        }

        return result[0][0]?.isFavorite || false;
    }
}
