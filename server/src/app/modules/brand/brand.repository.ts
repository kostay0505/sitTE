import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { eq, sql } from 'drizzle-orm';
import { brands, BrandShort } from './schemas/brands';
import { type Brand } from './schemas/brands';
import { Database } from '../../../database/schema';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';
import { SqlQueryResult } from 'src/database/utils';
import { HrefService } from 'src/app/services/href/href.service';
import { products } from '../product/schemas/products';
import { ProductStatus } from '../product/types/enums';

export interface BrandRow {
  id: string;
  name: string;
  photo: string;
  contact: string;
  description: string;
  displayOrder: number;
  isActive: boolean;
}

export interface BrandShortRow {
  id: string;
  name: string;
  photo: string;
  contact: string;
  description: string;
}

@Injectable()
export class BrandRepository {
  constructor(
    @Inject('DATABASE') private readonly db: Database,
    @Inject(forwardRef(() => HrefService))
    private readonly hrefService: HrefService
  ) { }

  async create(
    dto: CreateBrandDto
  ): Promise<Omit<Brand, 'createdAt' | 'updatedAt'>> {
    const data = {
      ...dto,
      id: crypto.randomUUID()
    };
    await this.db.insert(brands).values(data);

    const result = await this.findById(data.id);

    if (!result) {
      throw new Error('Brand not created');
    }

    return result;
  }

  async update(id: string, dto: UpdateBrandDto): Promise<boolean> {
    await this.db.update(brands).set(dto).where(eq(brands.id, id));
    return true;
  }

  async findAll(): Promise<Omit<Brand, 'createdAt' | 'updatedAt'>[]> {
    const result = (await this.db.execute(sql`
            SELECT 
                id, 
                name,
                photo,
                contact,
                description,
                displayOrder,
                isActive
            FROM ${brands}
            ORDER BY ${brands.displayOrder} ASC
        `)) as SqlQueryResult<BrandRow>;

    if (!Array.isArray(result[0])) {
      throw new Error('Unexpected query result format');
    }

    return result[0];
  }

  async findAllAvailable(): Promise<BrandShort[]> {
    const result = await this.db.execute(sql`
    SELECT 
      brand.id,
      brand.name,
      brand.photo,
      brand.contact,
      brand.description,
      COUNT(product.id) AS productCount
    FROM ${brands} brand
    LEFT JOIN ${products} product
      ON product.brandId = brand.id
      AND product.isActive = true
      AND product.isDeleted = false
      AND product.status = ${ProductStatus.APPROVED}
    GROUP BY brand.id, brand.name, brand.photo, brand.description
    ORDER BY brand.name ASC
  `);
    const rows = result[0] as unknown as BrandShort[];
    return rows.map(row => ({
      id: row.id,
      name: row.name,
      photo: row.photo,
      contact: row.contact,
      description: row.description,
      productCount: Number(row.productCount) || 0
    }));
  }

  async findById(
    id: string
  ): Promise<Omit<Brand, 'createdAt' | 'updatedAt'> | null> {
    const result = (await this.db.execute(sql`
            SELECT
                id, 
                name,
                photo,
                contact,
                description,
                displayOrder,
                isActive
            FROM ${brands}
            WHERE ${brands.id} = ${id}
        `)) as SqlQueryResult<Brand>;

    if (!Array.isArray(result[0]) || !result[0][0]) return null;
    const url = await this.hrefService.generateShareLink(
      result[0][0].id,
      'brand'
    );
    return { ...result[0][0], url };
  }
}
