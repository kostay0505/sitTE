import {
    Controller,
    Get,
} from '@nestjs/common';
import { ViewedProductService } from './viewed-product.service';
import { AdminJwtAuth } from 'src/app/decorators/admin-jwt-auth.decorator';

@Controller('viewed-products')
export class ViewedProductController {
    constructor(private readonly service: ViewedProductService) { }

    @Get('counts')
    @AdminJwtAuth()
    async getViewCounts() {
        return this.service.getProductViewCounts();
    }
}
