import { Module } from '@nestjs/common';
import { VacancyController } from './vacancy.controller';
import { VacancyService } from './vacancy.service';
import { VacancyRepository } from './vacancy.repository';
import { UsersModule } from '../user/user.module';
import { CityModule } from '../city/city.module';

@Module({
    imports: [UsersModule, CityModule],
    controllers: [VacancyController],
    providers: [VacancyService, VacancyRepository],
    exports: [VacancyService, VacancyRepository],
})
export class VacancyModule { }
