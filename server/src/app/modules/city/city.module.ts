import { Module } from '@nestjs/common';
import { CityController } from './city.controller';
import { CityService } from './city.service';
import { CountryModule } from '../country/country.module';
import { CityRepository } from './city.repository';

@Module({
    imports: [CountryModule],
    controllers: [CityController],
    providers: [CityService, CityRepository],
    exports: [CityService, CityRepository],
})
export class CityModule { }
