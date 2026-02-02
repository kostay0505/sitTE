import { Injectable } from '@nestjs/common';
import { type FavoriteProduct } from './schemas/favorite-products';
import { CreateFavoriteProductDto } from './dto/create-favorite-product.dto';
import { UpdateFavoriteProductDto } from './dto/update-favorite-product.dto';
import { FavoriteProductRepository } from './favorite-product.repository';

@Injectable()
export class FavoriteProductService {
    constructor(
        private readonly repository: FavoriteProductRepository,
    ) { }

    async create(userId: string, dto: CreateFavoriteProductDto): Promise<FavoriteProduct> {
        const data = {
            ...dto,
            userId,
        };
        return this.repository.create(data);
    }

    async update(userId: string, productId: string, dto: UpdateFavoriteProductDto): Promise<boolean> {
        await this.repository.update(userId, productId, dto);
        return true;
    }
}
