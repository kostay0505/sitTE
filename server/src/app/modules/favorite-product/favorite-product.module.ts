import { Module } from '@nestjs/common';
import { FavoriteProductService } from './favorite-product.service';
import { FavoriteProductRepository } from './favorite-product.repository';

@Module({
    providers: [FavoriteProductService, FavoriteProductRepository],
    exports: [FavoriteProductService, FavoriteProductRepository],
})
export class FavoriteProductModule { }
