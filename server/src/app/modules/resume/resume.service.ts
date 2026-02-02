import { Injectable } from '@nestjs/common';
import { type Resume } from './schemas/resumes';
import { CreateResumeDto } from './dto/create-resume.dto';
import { UpdateResumeDto } from './dto/update-resume.dto';
import { AdminCreateResumeDto } from './dto/admin-create-resume.dto';
import { AdminUpdateResumeDto } from './dto/admin-update-resume.dto';
import { GetResumesDto } from './dto/get-resumes.dto';
import { ResumeRepository } from './resume.repository';

@Injectable()
export class ResumeService {
    constructor(
        private readonly resumeRepository: ResumeRepository,
    ) { }

    async create(userId: string, dto: CreateResumeDto): Promise<Resume> {
        if (dto.files?.length > 5) {
            throw new Error('Вы не можете добавить более 5 файлов в резюме');
        }

        return this.resumeRepository.create({ ...dto, userId });
    }

    async update(userId: string, id: string, dto: UpdateResumeDto): Promise<boolean> {
        if (dto.files?.length > 5) {
            throw new Error('Вы не можете добавить более 5 файлов в резюме');
        }

        return this.resumeRepository.update(id, userId, dto);
    }

    async toggleActivate(userId: string, id: string): Promise<boolean> {
        return this.resumeRepository.toggleActivate(id, userId);
    }

    async delete(userId: string, id: string): Promise<boolean> {
        return this.resumeRepository.delete(id, userId);
    }

    async findAllAvailable(query: GetResumesDto): Promise<Resume[]> {
        return this.resumeRepository.findAllAvailable(query);
    }

    async findAllMy(userId: string): Promise<Resume[]> {
        return this.resumeRepository.findAllMy(userId);
    }

    async findAll(): Promise<Resume[]> {
        return this.resumeRepository.findAll();
    }

    async findById(id: string): Promise<Resume | null> {
        return this.resumeRepository.findById(id);
    }

    async adminCreate(dto: AdminCreateResumeDto): Promise<Resume> {
        if (dto.files?.length > 5) {
            throw new Error('Вы не можете добавить более 5 файлов в резюме');
        }

        return this.resumeRepository.create(dto);
    }

    async adminUpdate(id: string, dto: AdminUpdateResumeDto): Promise<boolean> {
        if (dto.files?.length > 5) {
            throw new Error('Вы не можете добавить более 5 файлов в резюме');
        }

        return this.resumeRepository.adminUpdate(id, dto);
    }
}
