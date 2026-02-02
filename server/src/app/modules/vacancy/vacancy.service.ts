import { Injectable } from '@nestjs/common';
import { type Vacancy } from './schemas/vacancies';
import { CreateVacancyDto } from './dto/create-vacancy.dto';
import { UpdateVacancyDto } from './dto/update-vacancy.dto';
import { AdminCreateVacancyDto } from './dto/admin-create-vacancy.dto';
import { AdminUpdateVacancyDto } from './dto/admin-update-vacancy.dto';
import { GetVacanciesDto } from './dto/get-vacancies.dto';
import { CityService } from '../city/city.service';
import { VacancyRepository } from './vacancy.repository';
import { Resume } from '../resume/schemas/resumes';

@Injectable()
export class VacancyService {
    constructor(
        private readonly vacancyRepository: VacancyRepository,
    ) { }

    async create(userId: string, dto: CreateVacancyDto): Promise<Vacancy> {

        return this.vacancyRepository.create({ ...dto, userId });
    }

    async update(userId: string, id: string, dto: UpdateVacancyDto): Promise<boolean> {

        return this.vacancyRepository.update(id, userId, dto);
    }

    async toggleActivate(userId: string, id: string): Promise<boolean> {
        return this.vacancyRepository.toggleActivate(id, userId);
    }

    async delete(userId: string, id: string): Promise<boolean> {
        return this.vacancyRepository.delete(id, userId);
    }

    async findAllAvailable(query: GetVacanciesDto): Promise<Vacancy[]> {
        return this.vacancyRepository.findAllAvailable(query);
    }

    async findAllMy(userId: string): Promise<Vacancy[]> {
        return this.vacancyRepository.findAllMy(userId);
    }

    async findAll(): Promise<Vacancy[]> {
        return this.vacancyRepository.findAll();
    }

    async findById(id: string): Promise<Vacancy | null> {
        return this.vacancyRepository.findById(id);
    }

    async adminCreate(dto: AdminCreateVacancyDto): Promise<Vacancy> {
        return this.vacancyRepository.create(dto);
    }

    async adminUpdate(dto: AdminUpdateVacancyDto): Promise<boolean> {
        return this.vacancyRepository.adminUpdate(dto.id, dto);
    }
}
