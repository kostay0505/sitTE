import { Injectable, Inject } from '@nestjs/common';
import { eq, sql } from 'drizzle-orm';
import { categories, CategoryShort } from './schemas/categories';
import { type Category } from './schemas/categories';
import { Database } from '../../../database/schema';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { SqlQueryResult } from 'src/database/utils';

export interface CategoryRow {
    id: string;
    name: string;
    slug: string | null;
    parentId: string | null;
    displayOrder: number;
    isActive: boolean;
}

@Injectable()
export class CategoryRepository {
    constructor(
        @Inject('DATABASE') private readonly db: Database,
    ) { }

    async create(dto: CreateCategoryDto): Promise<Omit<Category, 'createdAt' | 'updatedAt'>> {
        const data = { ...dto, id: crypto.randomUUID() };
        await this.db.insert(categories).values(data);
        const result = await this.findById(data.id);
        if (!result) throw new Error('Category not created');
        return result;
    }

    async update(id: string, dto: UpdateCategoryDto): Promise<boolean> {
        await this.db.update(categories).set(dto).where(eq(categories.id, id));
        return true;
    }

    async delete(id: string): Promise<boolean> {
        await this.db.delete(categories).where(eq(categories.id, id));
        return true;
    }

    async findAll(): Promise<Omit<Category, 'createdAt' | 'updatedAt'>[]> {
        const result = await this.db.execute(sql`
            SELECT id, name, slug, parentId, displayOrder, isActive
            FROM ${categories}
            ORDER BY ${categories.displayOrder} ASC
        `) as SqlQueryResult<CategoryRow>;
        if (!Array.isArray(result[0])) throw new Error('Unexpected query result format');
        return result[0];
    }

    async findAllAvailable(): Promise<Omit<Category, 'createdAt' | 'updatedAt'>[]> {
        const result = await this.db.execute(sql`
            SELECT id, name, slug, parentId, displayOrder, isActive
            FROM ${categories}
            WHERE ${categories.isActive} = true
            ORDER BY ${categories.displayOrder} ASC
        `) as SqlQueryResult<CategoryRow>;
        if (!Array.isArray(result[0])) throw new Error('Unexpected query result format');
        return result[0];
    }

    async findById(id: string): Promise<Omit<Category, 'createdAt' | 'updatedAt'> | null> {
        const result = await this.db.execute(sql`
            SELECT id, name, slug, parentId, displayOrder, isActive
            FROM ${categories}
            WHERE ${categories.id} = ${id}
        `) as SqlQueryResult<Category>;
        if (!Array.isArray(result[0])) throw new Error('Unexpected query result format');
        return result[0][0] ?? null;
    }

    async findBySlug(slug: string): Promise<Omit<Category, 'createdAt' | 'updatedAt'> | null> {
        const result = await this.db.execute(sql`
            SELECT id, name, slug, parentId, displayOrder, isActive
            FROM ${categories}
            WHERE ${categories.slug} = ${slug}
        `) as SqlQueryResult<Category>;
        if (!Array.isArray(result[0])) throw new Error('Unexpected query result format');
        return result[0][0] ?? null;
    }

    async findFallbackCategory(): Promise<Omit<Category, 'createdAt' | 'updatedAt'> | null> {
        const result = await this.db.execute(sql`
            SELECT id, name, slug, parentId, displayOrder, isActive
            FROM ${categories}
            WHERE ${categories.parentId} IS NULL
            AND ${categories.name} = ${'Без категории'}
            LIMIT 1
        `) as SqlQueryResult<Category>;
        if (!Array.isArray(result[0])) return null;
        return result[0][0] ?? null;
    }

    async findShortById(id: string): Promise<CategoryShort | null> {
        const result = await this.db.execute(sql`
            SELECT id, name FROM ${categories}
            WHERE ${categories.id} = ${id}
        `) as SqlQueryResult<CategoryShort>;
        if (!Array.isArray(result[0]) || !result[0][0]) return null;
        return result[0][0];
    }

    async getChildCategoryIds(parentId: string): Promise<string[]> {
        const result = await this.db.execute(sql`
            SELECT id FROM ${categories}
            WHERE ${categories.parentId} = ${parentId}
        `) as SqlQueryResult<{ id: string }>;
        if (!Array.isArray(result[0])) throw new Error('Unexpected query result format');
        return result[0].map((c) => c.id);
    }

    async moveProductsToCategory(fromCategoryId: string, toCategoryId: string): Promise<void> {
        await this.db.execute(sql`
            UPDATE Products
            SET categoryId = ${toCategoryId}
            WHERE categoryId = ${fromCategoryId}
        `);
    }
}
