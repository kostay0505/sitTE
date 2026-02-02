import { Injectable } from '@nestjs/common';
import { CategoryShort } from './schemas/categories';
import { type Category } from './schemas/categories';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CategoryRepository } from './category.repository';

@Injectable()
export class CategoryService {
    constructor(
        private readonly repository: CategoryRepository,
    ) { }

    async create(dto: CreateCategoryDto): Promise<Omit<Category, 'createdAt' | 'updatedAt'>> {
        return this.repository.create(dto);
    }

    async update(id: string, dto: UpdateCategoryDto): Promise<boolean> {
        return this.repository.update(id, dto);
    }

    async findAll(): Promise<Omit<Category, 'createdAt' | 'updatedAt'>[]> {
        return this.repository.findAll();
    }

    async findAllAvailable(): Promise<Omit<Category, 'createdAt' | 'updatedAt'>[]> {
        return this.repository.findAllAvailable();
    }

    async findById(id: string): Promise<Omit<Category, 'createdAt' | 'updatedAt'> | null> {
        return this.repository.findById(id);
    }

    async getChildCategoryIds(parentId: string): Promise<string[]> {
        return this.repository.getChildCategoryIds(parentId);
    }
}
