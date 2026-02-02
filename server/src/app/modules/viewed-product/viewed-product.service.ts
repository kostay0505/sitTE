import { Injectable } from '@nestjs/common';
import { viewedProducts } from './schemas/viewed-products';
import { type ViewedProduct } from './schemas/viewed-products';
import { ViewedProductRepository } from './viewed-product.repository';

@Injectable()
export class ViewedProductService {
    constructor(
        private readonly viewedProductRepository: ViewedProductRepository,
    ) { }

    async getProductViewCounts(): Promise<{ productId: string; viewCount: number }[]> {
        return this.viewedProductRepository.getProductViewCounts();
    }

    async create(userId: string, productId: string): Promise<ViewedProduct> {
        const viewedProductData = {
            userId,
            productId,
        };
        await this.viewedProductRepository.create(viewedProductData);
        const viewedProduct = await this.viewedProductRepository.findByUserAndProduct(userId, productId);
        return viewedProduct!;
    }
}
