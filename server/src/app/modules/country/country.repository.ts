import { Injectable, Inject } from '@nestjs/common';
import { eq, sql } from 'drizzle-orm';
import { Database } from '../../../database/schema';
import { countries } from './schemas/countries';
import { type Country, CountryShort } from './schemas/countries';
import { CreateCountryDto } from './dto/create-country.dto';
import { SqlQueryResult } from '../../../database/utils';
import { UpdateCountryDto } from './dto/update-country.dto';

export interface CountryRow {
    id: string;
    name: string;
    isActive: boolean;
}

export interface CountryShortRow {
    id: string;
    name: string;
}

@Injectable()
export class CountryRepository {
    constructor(@Inject('DATABASE') private readonly db: Database) { }

    mapToCountry(row: CountryRow): Omit<Country, 'createdAt' | 'updatedAt'> {
        return {
            id: row.id,
            name: row.name,
            isActive: row.isActive
        };
    }

    mapToCountryShort(row: CountryShortRow): CountryShort {
        return {
            id: row.id,
            name: row.name
        };
    }

    async findAll(): Promise<Omit<Country, 'createdAt' | 'updatedAt'>[]> {
        const result = await this.db.execute(sql`
            SELECT 
                id,
                name,
                isActive
            FROM ${countries}
            ORDER BY createdAt DESC
        `) as SqlQueryResult<CountryRow>;

        if (!Array.isArray(result[0])) {
            throw new Error('Unexpected query result format');
        }

        return result[0].map((row) => this.mapToCountry(row));
    }

    async findAllAvailable(): Promise<CountryShort[]> {
        const result = await this.db.execute(sql`
            SELECT 
                id,
                name
            FROM ${countries}
            WHERE isActive = true
        `) as SqlQueryResult<CountryShortRow>;

        if (!Array.isArray(result[0])) {
            throw new Error('Unexpected query result format');
        }

        return result[0].map((row) => this.mapToCountryShort(row));
    }

    async findById(id: string): Promise<Omit<Country, 'createdAt' | 'updatedAt'> | null> {
        const result = await this.db.execute(sql`
            SELECT 
                id,
                name,
                isActive
            FROM ${countries}
            WHERE id = ${id}
        `) as SqlQueryResult<CountryRow>;

        if (!Array.isArray(result[0]) || !result[0][0]) return null;

        return this.mapToCountry(result[0][0]);
    }

    async findShortById(id: string): Promise<CountryShort | null> {
        const result = await this.db.execute(sql`
            SELECT 
                id,
                name
            FROM ${countries}
            WHERE id = ${id}
        `) as SqlQueryResult<CountryShortRow>;

        if (!Array.isArray(result[0]) || !result[0][0]) return null;

        return this.mapToCountryShort(result[0][0]);
    }

    async create(dto: CreateCountryDto): Promise<Omit<Country, 'createdAt' | 'updatedAt'>> {
        const data = {
            ...dto,
            id: crypto.randomUUID(),
        };
        await this.db.insert(countries).values(data);

        const result = await this.findById(data.id);

        if (!result) {
            throw new Error('Country not created');
        }

        return result;
    }

    async update(id: string, dto: UpdateCountryDto): Promise<boolean> {
        await this.db.update(countries)
            .set(dto)
            .where(eq(countries.id, id));
        return true;
    }

    async delete(id: string): Promise<boolean> {
        await this.db.update(countries)
            .set({ isActive: false })
            .where(eq(countries.id, id));
        return true;
    }
}