import {
    Controller,
    Get,
    Post,
    Put,
    Body,
    Param,
    HttpCode,
    HttpStatus
} from '@nestjs/common';
import { BrandService } from './brand.service';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';
import { AdminJwtAuth } from '../../decorators/admin-jwt-auth.decorator';
import { BrandShort, type Brand } from './schemas/brands';

@Controller('brands')
export class BrandController {
    constructor(private readonly service: BrandService) { }

    @Get()
    @AdminJwtAuth()
    async findAll(): Promise<Omit<Brand, 'createdAt' | 'updatedAt'>[]> {
        const brands = await this.service.findAll();
        return brands;
    }

    @Get('available')
    async findAllAvailable(): Promise<BrandShort[]> {
        const brands = await this.service.findAllAvailable();
        return brands;
    }

    @Get(':id')
    async findById(@Param('id') id: string): Promise<Omit<Brand, 'createdAt' | 'updatedAt'>> {
        const brand = await this.service.findById(id);
        if (!brand) {
            throw new Error('Brand not found');
        }
        return brand;
    }

    @Post()
    @AdminJwtAuth()
    @HttpCode(HttpStatus.CREATED)
    async create(@Body() dto: CreateBrandDto): Promise<Omit<Brand, 'createdAt' | 'updatedAt'>> {
        return this.service.create(dto);
    }

    @Put(':id')
    @AdminJwtAuth()
    @HttpCode(HttpStatus.OK)
    async update(
        @Param('id') id: string,
        @Body() dto: UpdateBrandDto
    ): Promise<Omit<Brand, 'createdAt' | 'updatedAt'>> {
        await this.service.update(id, dto);
        const updatedBrand = await this.service.findById(id);
        if (!updatedBrand) {
            throw new Error('Brand not found after update');
        }
        return updatedBrand;
    }
}
