import { Injectable, ConflictException, BadRequestException, NotFoundException } from '@nestjs/common';
import { BusinessPageRepository } from './business-page.repository';

@Injectable()
export class BusinessPageService {
  constructor(private readonly repo: BusinessPageRepository) {}

  async getMyPage(userId: string) {
    return this.repo.findByUserId(userId);
  }

  async getBySlug(slug: string) {
    const page = await this.repo.findBySlug(slug);
    if (!page) throw new NotFoundException('Страница не найдена');
    return page;
  }

  async getSlugByUserId(userId: string) {
    const page = await this.repo.findByUserId(userId);
    if (!page) throw new NotFoundException('Страница не найдена');
    return { slug: page.slug };
  }

  async upsert(userId: string, slug: string, blocks: any[]) {
    if (!/^[a-z0-9_-]{3,50}$/.test(slug)) {
      throw new BadRequestException(
        'Адрес должен содержать только строчные буквы a-z, цифры, дефисы и подчёркивания (3–50 символов)'
      );
    }
    const taken = await this.repo.slugExists(slug, userId);
    if (taken) throw new ConflictException('Этот адрес уже занят');
    return this.repo.upsert(userId, slug, blocks ?? []);
  }
}
