import { Injectable, Inject } from '@nestjs/common';
import { eq, sql } from 'drizzle-orm';
import { Database } from '../../../database/schema';
import { cities } from './schemas/cities';
import { type City, CityShort } from './schemas/cities';
import { countries, CountryShort } from '../country/schemas/countries';
import { CreateCityDto } from './dto/create-city.dto';
import { SqlQueryResult } from '../../../database/utils';
import { UpdateCityDto } from './dto/update-city.dto';
import { CountryRepository } from '../country/country.repository';

export interface CityRow {
    id: string;
    name: string;
    isActive: boolean;
    country_id: string | null;
    country_name: string | null;
    country_isActive: boolean | null;
}

export interface CityShortRow {
    id: string;
    name: string;
    country_id: string | null;
    country_name: string | null;
}

@Injectable()
export class CityRepository {
    constructor(
        @Inject('DATABASE') private readonly db: Database,
        private readonly countryRepository: CountryRepository,
    ) { }

    mapToCity(row: CityRow): City {
        const country: CountryShort | null = row.country_id ? this.countryRepository.mapToCountryShort({
            id: row.country_id,
            name: row.country_name!
        }) : null;

        return {
            id: row.id,
            name: row.name,
            isActive: row.isActive,
            country
        };
    }

    mapToCityShort(row: CityShortRow): CityShort {
        const country = row.country_id ? this.countryRepository.mapToCountryShort({
            id: row.country_id,
            name: row.country_name!
        }) : null;

        return {
            id: row.id,
            name: row.name,
            country
        };
    }

    async findAll(): Promise<City[]> {
        const result = await this.db.execute(sql`
            SELECT 
                city.id,
                city.name,
                city.isActive,
                country.id as country_id,
                country.name as country_name,
                country.isActive as country_isActive
            FROM ${cities} city
            LEFT JOIN ${countries} country ON city.countryId = country.id
            ORDER BY city.createdAt DESC
        `) as SqlQueryResult<CityRow>;

        if (!Array.isArray(result[0])) {
            throw new Error('Unexpected query result format');
        }

        return result[0].map((row) => this.mapToCity(row));
    }

    async findAllAvailable(): Promise<CityShort[]> {
        const result = await this.db.execute(sql`
            SELECT 
                city.id,
                city.name,
                country.id as country_id,
                country.name as country_name
            FROM ${cities} city
            LEFT JOIN ${countries} country ON city.countryId = country.id
            WHERE city.isActive = true AND (country.isActive = true OR country.id IS NULL)
        `) as SqlQueryResult<CityShortRow>;

        if (!Array.isArray(result[0])) {
            throw new Error('Unexpected query result format');
        }

        return result[0].map((row) => this.mapToCityShort(row));
    }

    async findById(id: string): Promise<City | null> {
        const result = await this.db.execute(sql`
            SELECT 
                city.id,
                city.name,
                city.isActive,
                country.id as country_id,
                country.name as country_name,
                country.isActive as country_isActive
            FROM ${cities} city
            LEFT JOIN ${countries} country ON city.countryId = country.id
            WHERE city.id = ${id}
        `) as SqlQueryResult<CityRow>;

        if (!Array.isArray(result[0]) || !result[0][0]) return null;

        return this.mapToCity(result[0][0]);
    }

    async findShortById(id: string): Promise<CityShort | null> {
        const result = await this.db.execute(sql`
            SELECT 
                city.id,
                city.name,
                country.id as country_id,
                country.name as country_name
            FROM ${cities} city
            LEFT JOIN ${countries} country ON city.countryId = country.id
            WHERE city.id = ${id}
        `) as SqlQueryResult<CityShortRow>;

        if (!Array.isArray(result[0]) || !result[0][0]) return null;

        return this.mapToCityShort(result[0][0]);
    }

    async create(dto: CreateCityDto): Promise<City> {
        const data = {
            ...dto,
            id: crypto.randomUUID(),
        };
        await this.db.insert(cities).values(data);

        const result = await this.findById(data.id);

        if (!result) {
            throw new Error('City not created');
        }

        return result;
    }

    async update(id: string, dto: UpdateCityDto): Promise<boolean> {
        await this.db.update(cities)
            .set(dto)
            .where(eq(cities.id, id));
        return true;
    }

    async delete(id: string): Promise<boolean> {
        await this.db.update(cities)
            .set({ isActive: false })
            .where(eq(cities.id, id));
        return true;
    }
}