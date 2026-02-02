import { Module } from '@nestjs/common';
import { JobsService } from './jobs.service';
import { JobsController } from './jobs.controller';
import { ResumeModule } from '../resume/resume.module';
import { VacancyModule } from '../vacancy/vacancy.module';

@Module({
    imports: [ResumeModule, VacancyModule],
    controllers: [JobsController],
    providers: [JobsService],
    exports: [JobsService],
})
export class JobsModule { }
