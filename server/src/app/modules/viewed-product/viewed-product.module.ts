import { Module } from '@nestjs/common';
import { ViewedProductController } from './viewed-product.controller';
import { ViewedProductService } from './viewed-product.service';
import { ViewedProductRepository } from './viewed-product.repository';

@Module({
    controllers: [ViewedProductController],
    providers: [ViewedProductService, ViewedProductRepository],
    exports: [ViewedProductService, ViewedProductRepository],
})
export class ViewedProductModule { }
