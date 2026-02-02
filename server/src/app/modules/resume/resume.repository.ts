import { Injectable, Inject } from '@nestjs/common';
import { eq, and, not, sql } from 'drizzle-orm';
import { resumes } from './schemas/resumes';
import { type Resume } from './schemas/resumes';
import { Database } from '../../../database/schema';
import { CreateResumeDto } from './dto/create-resume.dto';
import { UpdateResumeDto } from './dto/update-resume.dto';
import { AdminUpdateResumeDto } from './dto/admin-update-resume.dto';
import { GetResumesDto, OrderBy, SortDirection } from './dto/get-resumes.dto';
import { users, UserShort } from '../user/schemas/users';
import { UserRepository } from '../user/user.repository';
import { CityRepository } from '../city/city.repository';
import { cities, CityShort } from '../city/schemas/cities';
import { SqlQueryResult } from 'src/database/utils';
import { countries } from '../country/schemas/countries';

export interface ResumeRow {
    id: string;
    firstName: string;
    lastName: string;
    position: string;
    phone: string;
    description: string;
    files: string;
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
export class ResumeRepository {
    constructor(
        @Inject('DATABASE') private readonly db: Database,
        private readonly userRepository: UserRepository,
        private readonly cityRepository: CityRepository,
    ) { }

    mapToResume(row: ResumeRow): Resume {
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
            position: row.position,
            phone: row.phone,
            description: row.description,
            files: typeof row.files === 'string' ? JSON.parse(row.files) : row.files || [],
            isActive: row.isActive,
            isDeleted: row.isDeleted,
            city,
            user,
            updatedAt: new Date(row.updatedAt),
        };
    }

    async create(dto: CreateResumeDto & { userId: string }): Promise<Resume> {
        const data = {
            ...dto,
            id: crypto.randomUUID(),
            userId: dto.userId,
            files: JSON.stringify(dto.files),
        };
        await this.db.insert(resumes).values(data);

        const result = await this.findById(data.id);

        if (!result) {
            throw new Error('Resume not created');
        }

        return result;
    }

    async update(id: string, userId: string, dto: UpdateResumeDto): Promise<boolean> {
        await this.db.update(resumes)
            .set({
                ...dto,
                files: JSON.stringify(dto.files),
            })
            .where(and(eq(resumes.id, id), eq(resumes.userId, userId)));
        return true;
    }

    async adminUpdate(id: string, dto: AdminUpdateResumeDto): Promise<boolean> {
        await this.db.update(resumes)
            .set({
                ...dto,
                files: JSON.stringify(dto.files),
            })
            .where(eq(resumes.id, id));
        return true;
    }

    async toggleActivate(id: string, userId: string): Promise<boolean> {
        await this.db.update(resumes)
            .set({ isActive: not(resumes.isActive) })
            .where(and(eq(resumes.id, id), eq(resumes.userId, userId)));

        const [resumeBase] = await this.db.select({ isActive: resumes.isActive })
            .from(resumes)
            .where(eq(resumes.id, id));

        return resumeBase?.isActive;
    }

    async delete(id: string, userId: string): Promise<boolean> {
        await this.db.update(resumes)
            .set({ isDeleted: true })
            .where(and(eq(resumes.id, id), eq(resumes.userId, userId)));

        return true;
    }

    async findById(id: string): Promise<Resume | null> {
        const result = await this.db.execute(sql`
            SELECT 
                resume.id,
                resume.firstName,
                resume.lastName,
                resume.position,
                resume.phone,
                resume.description,
                resume.files,
                resume.isActive,
                resume.isDeleted,
                resume.updatedAt,
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
            FROM ${resumes} resume
            LEFT JOIN ${users} user ON resume.userId = user.tgId
            LEFT JOIN ${cities} city ON resume.cityId = city.id
            LEFT JOIN ${countries} country ON city.countryId = country.id
            WHERE resume.id = ${id}
        `) as SqlQueryResult<ResumeRow>;

        if (!Array.isArray(result[0]) || !result[0][0]) return null;

        return this.mapToResume(result[0][0]);
    }

    async findAll(): Promise<Resume[]> {
        const result = await this.db.execute(sql`
            SELECT 
                resume.id,
                resume.firstName,
                resume.lastName,
                resume.position,
                resume.phone,
                resume.description,
                resume.files,
                resume.isActive,
                resume.isDeleted,
                resume.updatedAt,
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
            FROM ${resumes} resume
            LEFT JOIN ${users} user ON resume.userId = user.tgId
            LEFT JOIN ${cities} city ON resume.cityId = city.id
            LEFT JOIN ${countries} country ON city.countryId = country.id
            WHERE resume.isDeleted = false
        `) as SqlQueryResult<ResumeRow>;

        if (!Array.isArray(result[0])) {
            throw new Error('Unexpected query result format');
        }

        return result[0].map(row => this.mapToResume(row));
    }

    async findAllMy(userId: string): Promise<Resume[]> {
        const result = await this.db.execute(sql`
            SELECT 
                resume.id,
                resume.firstName,
                resume.lastName,
                resume.position,
                resume.phone,
                resume.description,
                resume.files,
                resume.isActive,
                resume.isDeleted,
                resume.updatedAt,
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
            FROM ${resumes} resume
            LEFT JOIN ${users} user ON resume.userId = user.tgId
            LEFT JOIN ${cities} city ON resume.cityId = city.id
            LEFT JOIN ${countries} country ON city.countryId = country.id
            WHERE resume.userId = ${userId} AND resume.isDeleted = false
        `) as SqlQueryResult<ResumeRow>;

        if (!Array.isArray(result[0])) {
            throw new Error('Unexpected query result format');
        }

        return result[0].map(row => this.mapToResume(row));
    }

    async findAllAvailable(query: GetResumesDto): Promise<Resume[]> {
        const conditions = [
            sql`resume.isActive = true`,
            sql`resume.isDeleted = false`,
        ];

        if (query.userId) {
            conditions.push(sql`resume.userId = ${query.userId}`);
        }

        if (query.cityId) {
            conditions.push(sql`resume.cityId = ${query.cityId}`);
        }

        if (query.searchQuery) {
            const searchPattern = `%${query.searchQuery}%`;
            conditions.push(sql`resume.position LIKE ${searchPattern}`);
        }

        const orderByField = query.orderBy === OrderBy.DATE ? 'resume.createdAt' : 'resume.createdAt';
        const orderByDirection = query.sortDirection === SortDirection.ASC ? 'ASC' : 'DESC';

        const result = await this.db.execute(sql`
            SELECT 
                resume.id,
                resume.firstName,
                resume.lastName,
                resume.position,
                resume.phone,
                resume.description,
                resume.files,
                resume.isActive,
                resume.isDeleted,
                resume.updatedAt,
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
            FROM ${resumes} resume
            LEFT JOIN ${users} user ON resume.userId = user.tgId
            LEFT JOIN ${cities} city ON resume.cityId = city.id
            LEFT JOIN ${countries} country ON city.countryId = country.id
            WHERE ${sql.join(conditions, sql` AND `)}
            ORDER BY ${sql.raw(orderByField)} ${sql.raw(orderByDirection)}
            LIMIT ${query.limit}
            OFFSET ${query.offset}
        `) as SqlQueryResult<ResumeRow>;

        if (!Array.isArray(result[0])) {
            throw new Error('Unexpected query result format');
        }

        return result[0].map(row => this.mapToResume(row));
    }
}