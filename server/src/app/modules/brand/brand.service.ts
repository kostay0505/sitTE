import { Injectable } from '@nestjs/common';
import { BrandShort } from './schemas/brands';
import { type Brand } from './schemas/brands';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';
import { BrandRepository } from './brand.repository';

@Injectable()
export class BrandService {
    constructor(
        private readonly repository: BrandRepository,
    ) { }

    async create(dto: CreateBrandDto): Promise<Omit<Brand, 'createdAt' | 'updatedAt'>> {
        return this.repository.create(dto);
    }

    async update(id: string, dto: UpdateBrandDto): Promise<boolean> {
        return this.repository.update(id, dto);
    }

    async findAll(): Promise<Omit<Brand, 'createdAt' | 'updatedAt'>[]> {
        return this.repository.findAll();
    }

    async findAllAvailable(): Promise<BrandShort[]> {
        return this.repository.findAllAvailable();
    }

    async findById(id: string): Promise<Omit<Brand, 'createdAt' | 'updatedAt'> | null> {
        return this.repository.findById(id);
    }
}
