import { Injectable, Inject } from '@nestjs/common';
import { eq, and, not, sql } from 'drizzle-orm';
import { vacancies } from './schemas/vacancies';
import { type Vacancy } from './schemas/vacancies';
import { Database } from '../../../database/schema';
import { CreateVacancyDto } from './dto/create-vacancy.dto';
import { UpdateVacancyDto } from './dto/update-vacancy.dto';
import { AdminUpdateVacancyDto } from './dto/admin-update-vacancy.dto';
import { GetVacanciesDto, OrderBy, SortDirection } from './dto/get-vacancies.dto';
import { UserRepository } from '../user/user.repository';
import { CityRepository } from '../city/city.repository';
import { cities, CityShort } from '../city/schemas/cities';
import { users, UserShort } from '../user/schemas/users';
import { countries } from '../country/schemas/countries';
import { SqlQueryResult } from 'src/database/utils';

export interface VacancyRow {
    id: string;
    firstName: string;
    lastName: string;
    companyName: string;
    position: string;
    phone: string;
    cityId: string;
    address: string;
    description: string;
    isActive: boolean;
    isDeleted: boolean;
    user_tgId: string;
    user_firstName: string;
    user_lastName: string;
    user_username: string;
    user_photoUrl: string;
    user_phone: string;
    user_email: string;
    city_id: string;
    city_name: string;
    country_id: string;
    country_name: string;
    updatedAt: Date;
}

@Injectable()
export class VacancyRepository {
    constructor(
        @Inject('DATABASE') private readonly db: Database,
        private readonly userRepository: UserRepository,
        private readonly cityRepository: CityRepository,
    ) { }

    mapToVacancy(row: VacancyRow): Vacancy {
        const city: CityShort | null = this.cityRepository.mapToCityShort({
            id: row.city_id,
            name: row.city_name,
            country_id: row.country_id,
            country_name: row.country_name,
        });

        const user: UserShort | null = this.userRepository.mapToUserShort({
            tgId: row.user_tgId,
            username: row.user_username,
            firstName: row.user_firstName,
            lastName: row.user_lastName,
            photoUrl: row.user_photoUrl,
            email: row.user_email,
            phone: row.user_phone,
            city_id: row.city_id,
            city_name: row.city_name,
            country_id: row.country_id,
            country_name: row.country_name,
        });

        return {
            id: row.id,
            firstName: row.firstName,
            lastName: row.lastName,
            companyName: row.companyName,
            position: row.position,
            phone: row.phone,
            address: row.address,
            description: row.description,
            isActive: row.isActive,
            isDeleted: row.isDeleted,
            city,
            user,
            updatedAt: new Date(row.updatedAt),
        };
    }

    async create(dto: CreateVacancyDto & { userId: string }): Promise<Vacancy> {
        const data = {
            ...dto,
            id: crypto.randomUUID(),
            userId: dto.userId,
        };
        await this.db.insert(vacancies).values(data);

        const result = await this.findById(data.id);

        if (!result) {
            throw new Error('Vacancy not created');
        }

        return result;
    }

    async update(id: string, userId: string, dto: UpdateVacancyDto): Promise<boolean> {
        await this.db.update(vacancies)
            .set({
                ...dto,
            })
            .where(and(eq(vacancies.id, id), eq(vacancies.userId, userId)));
        return true;
    }

    async adminUpdate(id: string, dto: AdminUpdateVacancyDto): Promise<boolean> {
        await this.db.update(vacancies)
            .set({
                ...dto,
            })
            .where(eq(vacancies.id, id));
        return true;
    }

    async toggleActivate(id: string, userId: string): Promise<boolean> {
        await this.db.update(vacancies)
            .set({ isActive: not(vacancies.isActive) })
            .where(and(eq(vacancies.id, id), eq(vacancies.userId, userId)));

        const [vacancyBase] = await this.db.select({ isActive: vacancies.isActive })
            .from(vacancies)
            .where(eq(vacancies.id, id));

        return vacancyBase?.isActive;
    }

    async delete(id: string, userId: string): Promise<boolean> {
        await this.db.update(vacancies)
            .set({ isDeleted: true })
            .where(and(eq(vacancies.id, id), eq(vacancies.userId, userId)));

        return true;
    }

    async findById(id: string): Promise<Vacancy | null> {
        const result = await this.db.execute(sql`
            SELECT 
                vacancy.id,
                vacancy.firstName,
                vacancy.lastName,
                vacancy.companyName,
                vacancy.position,
                vacancy.phone,
                vacancy.address,
                vacancy.description,
                vacancy.isActive,
                vacancy.isDeleted,
                vacancy.updatedAt,
                user.tgId as user_tgId,
                user.username as user_username,
                user.firstName as user_firstName,
                user.lastName as user_lastName,
                user.photoUrl as user_photoUrl,
                user.phone as user_phone,
                user.email as user_email,
                city.id as city_id,
                city.name as city_name,
                country.id as country_id,
                country.name as country_name
            FROM ${vacancies} vacancy
            LEFT JOIN ${users} user ON vacancy.userId = user.tgId
            LEFT JOIN ${cities} city ON vacancy.cityId = city.id
            LEFT JOIN ${countries} country ON city.countryId = country.id
            WHERE vacancy.id = ${id}
        `) as SqlQueryResult<VacancyRow>;

        if (!Array.isArray(result[0]) || !result[0][0]) return null;

        return this.mapToVacancy(result[0][0]);
    }

    async findAll(): Promise<Vacancy[]> {
        const result = await this.db.execute(sql`
            SELECT 
                vacancy.id,
                vacancy.firstName,
                vacancy.lastName,
                vacancy.companyName,
                vacancy.position,
                vacancy.phone,
                vacancy.address,
                vacancy.description,
                vacancy.isActive,
                vacancy.isDeleted,
                vacancy.updatedAt,
                user.tgId as user_tgId,
                user.username as user_username,
                user.firstName as user_firstName,
                user.lastName as user_lastName,
                user.photoUrl as user_photoUrl,
                user.phone as user_phone,
                user.email as user_email,
                city.id as city_id,
                city.name as city_name,
                country.id as country_id,
                country.name as country_name
            FROM ${vacancies} vacancy
            LEFT JOIN ${users} user ON vacancy.userId = user.tgId
            LEFT JOIN ${cities} city ON vacancy.cityId = city.id
            LEFT JOIN ${countries} country ON city.countryId = country.id
            WHERE vacancy.isDeleted = false
        `) as SqlQueryResult<VacancyRow>;

        if (!Array.isArray(result[0])) {
            throw new Error('Unexpected query result format');
        }

        return result[0].map(row => this.mapToVacancy(row));
    }

    async findAllMy(userId: string): Promise<Vacancy[]> {
        const result = await this.db.execute(sql`
            SELECT 
                vacancy.id,
                vacancy.firstName,
                vacancy.lastName,
                vacancy.position,
                vacancy.phone,
                vacancy.address,
                vacancy.description,
                vacancy.isActive,
                vacancy.isDeleted,
                vacancy.updatedAt,
                user.tgId as user_tgId,
                user.username as user_username,
                user.firstName as user_firstName,
                user.lastName as user_lastName,
                user.photoUrl as user_photoUrl,
                user.phone as user_phone,
                user.email as user_email,
                city.id as city_id,
                city.name as city_name,
                country.id as country_id,
                country.name as country_name
            FROM ${vacancies} vacancy
            LEFT JOIN ${users} user ON vacancy.userId = user.tgId
            LEFT JOIN ${cities} city ON vacancy.cityId = city.id
            LEFT JOIN ${countries} country ON city.countryId = country.id
            WHERE vacancy.userId = ${userId} AND vacancy.isDeleted = false
        `) as SqlQueryResult<VacancyRow>;

        if (!Array.isArray(result[0])) {
            throw new Error('Unexpected query result format');
        }

        return result[0].map(row => this.mapToVacancy(row));
    }

    async findAllAvailable(query: GetVacanciesDto): Promise<Vacancy[]> {
        const conditions = [
            sql`vacancy.isActive = true`,
            sql`vacancy.isDeleted = false`,
        ];

        if (query.userId) {
            conditions.push(sql`vacancy.userId = ${query.userId}`);
        }

        if (query.cityId) {
            conditions.push(sql`vacancy.cityId = ${query.cityId}`);
        }

        if (query.searchQuery) {
            const searchPattern = `%${query.searchQuery}%`;
            conditions.push(sql`vacancy.position LIKE ${searchPattern}`);
        }

        const orderByField = query.orderBy === OrderBy.DATE ? 'vacancy.createdAt' : 'vacancy.createdAt';
        const orderByDirection = query.sortDirection === SortDirection.ASC ? 'ASC' : 'DESC';

        const result = await this.db.execute(sql`
            SELECT 
                vacancy.id,
                vacancy.firstName,
                vacancy.lastName,
                vacancy.position,
                vacancy.phone,
                vacancy.address,
                vacancy.description,
                vacancy.isActive,
                vacancy.isDeleted,
                vacancy.updatedAt,
                user.tgId as user_tgId,
                user.username as user_username,
                user.firstName as user_firstName,
                user.lastName as user_lastName,
                user.photoUrl as user_photoUrl,
                user.phone as user_phone,
                user.email as user_email,
                city.id as city_id,
                city.name as city_name,
                country.id as country_id,
                country.name as country_name
            FROM ${vacancies} vacancy
            LEFT JOIN ${users} user ON vacancy.userId = user.tgId
            LEFT JOIN ${cities} city ON vacancy.cityId = city.id
            LEFT JOIN ${countries} country ON city.countryId = country.id
            WHERE ${sql.join(conditions, sql` AND `)}
            ORDER BY ${sql.raw(orderByField)} ${sql.raw(orderByDirection)}
            LIMIT ${query.limit}
            OFFSET ${query.offset}
        `) as SqlQueryResult<VacancyRow>;

        if (!Array.isArray(result[0])) {
            throw new Error('Unexpected query result format');
        }

        return result[0].map(row => this.mapToVacancy(row));
    }
}