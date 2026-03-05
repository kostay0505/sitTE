import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { type Category } from './schemas/categories';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CategoryRepository } from './category.repository';

function toSlug(name: string): string {
    const map: Record<string, string> = {
        'а':'a','б':'b','в':'v','г':'g','д':'d','е':'e','ё':'yo','ж':'zh',
        'з':'z','и':'i','й':'j','к':'k','л':'l','м':'m','н':'n','о':'o',
        'п':'p','р':'r','с':'s','т':'t','у':'u','ф':'f','х':'h','ц':'ts',
        'ч':'ch','ш':'sh','щ':'shch','ъ':'','ы':'y','ь':'','э':'e','ю':'yu','я':'ya',
    };
    return name.toLowerCase().split('').map(c => map[c] ?? c).join('')
        .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

@Injectable()
export class CategoryService {
    constructor(private readonly repository: CategoryRepository) { }

    async create(dto: CreateCategoryDto): Promise<Omit<Category, 'createdAt' | 'updatedAt'>> {
        const slug = dto.slug ? toSlug(dto.slug) : toSlug(dto.name);
        return this.repository.create({ ...dto, slug });
    }

    async update(id: string, dto: UpdateCategoryDto): Promise<boolean> {
        const updateData: UpdateCategoryDto = { ...dto };
        if (dto.slug) {
            updateData.slug = toSlug(dto.slug);
        } else {
            delete updateData.slug;
        }
        return this.repository.update(id, updateData);
    }

    async delete(id: string): Promise<{ moved: number }> {
        const category = await this.repository.findById(id);
        if (!category) throw new NotFoundException('Категория не найдена');

        const fallback = await this.repository.findFallbackCategory();
        if (!fallback) throw new BadRequestException('Категория "Без категории" не найдена в системе');
        if (id === fallback.id) throw new BadRequestException('Нельзя удалить категорию "Без категории"');

        // Collect all category ids to delete (self + children if parent)
        const childIds = category.parentId === null
            ? await this.repository.getChildCategoryIds(id)
            : [];

        // Move products from all affected categories to fallback
        for (const childId of childIds) {
            await this.repository.moveProductsToCategory(childId, fallback.id);
        }
        await this.repository.moveProductsToCategory(id, fallback.id);

        // Delete children first (FK), then parent
        for (const childId of childIds) {
            await this.repository.delete(childId);
        }
        await this.repository.delete(id);

        return { moved: childIds.length + 1 };
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

    async findBySlug(slug: string): Promise<Omit<Category, 'createdAt' | 'updatedAt'> | null> {
        return this.repository.findBySlug(slug);
    }

    async getChildCategoryIds(parentId: string): Promise<string[]> {
        return this.repository.getChildCategoryIds(parentId);
    }
}
