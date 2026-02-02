import { Injectable } from '@nestjs/common';
import { GetJobsDto, JobType } from './dto/get-jobs.dto';
import { ResumeService } from '../resume/resume.service';
import { VacancyService } from '../vacancy/vacancy.service';
import { Resume } from '../resume/schemas/resumes';
import { Vacancy } from '../vacancy/schemas/vacancies';
import { GetResumesDto } from '../resume/dto/get-resumes.dto';
import { GetVacanciesDto } from '../vacancy/dto/get-vacancies.dto';

export type Job = {
    type: JobType;
    data: Resume | Vacancy;
};

@Injectable()
export class JobsService {
    constructor(
        private readonly resumeService: ResumeService,
        private readonly vacancyService: VacancyService,
    ) { }

    async findAllAvailable(query: GetJobsDto): Promise<Job[]> {
        const { type, ...commonQuery } = query;
        const jobs: Job[] = [];

        if (!type || type === JobType.RESUME) {
            const resumes = await this.resumeService.findAllAvailable(commonQuery as GetResumesDto);
            jobs.push(...resumes.map(resume => ({
                type: JobType.RESUME,
                data: resume,
            })));
        }

        if (!type || type === JobType.VACANCY) {
            const vacancies = await this.vacancyService.findAllAvailable(commonQuery as GetVacanciesDto);
            jobs.push(...vacancies.map(vacancy => ({
                type: JobType.VACANCY,
                data: vacancy,
            })));
        }

        if (query.orderBy === 'date') {
            jobs.sort((a, b) => {
                const dateA = (a.data as Resume | Vacancy).updatedAt;
                const dateB = (b.data as Resume | Vacancy).updatedAt;
                return query.sortDirection === 'asc'
                    ? dateA.getTime() - dateB.getTime()
                    : dateB.getTime() - dateA.getTime();
            });
        }

        const start = query.offset || 0;
        const end = start + (query.limit || 50);
        return jobs.slice(start, end);
    }
}

