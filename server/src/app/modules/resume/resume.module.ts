import { Module } from '@nestjs/common';
import { ResumeController } from './resume.controller';
import { ResumeService } from './resume.service';
import { ResumeRepository } from './resume.repository';
import { UsersModule } from '../user/user.module';
import { CityModule } from '../city/city.module';

@Module({
    imports: [UsersModule, CityModule],
    controllers: [ResumeController],
    providers: [ResumeService, ResumeRepository],
    exports: [ResumeService, ResumeRepository],
})
export class ResumeModule { }
