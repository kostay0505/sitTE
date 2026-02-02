import {
    Controller,
    Get,
    Post,
    Put,
    Body,
    Param,
    HttpCode,
    HttpStatus
} from '@nestjs/common';
import { CountryService } from './country.service';
import { CreateCountryDto } from './dto/create-country.dto';
import { UpdateCountryDto } from './dto/update-country.dto';
import { AdminJwtAuth } from '../../decorators/admin-jwt-auth.decorator';
import { CountryShort, type Country } from './schemas/countries';

@Controller('countries')
export class CountryController {
    constructor(private readonly service: CountryService) { }

    @Get()
    @AdminJwtAuth()
    async findAll(): Promise<Omit<Country, 'createdAt' | 'updatedAt'>[]> {
        const countries = await this.service.findAll();
        return countries;
    }

    @Get('available')
    async findAllAvailable(): Promise<CountryShort[]> {
        const countries = await this.service.findAllAvailable();
        return countries;
    }

    @Get(':id')
    @AdminJwtAuth()
    async findOne(@Param('id') id: string): Promise<Omit<Country, 'createdAt' | 'updatedAt'>> {
        const country = await this.service.findById(id);
        if (!country) {
            throw new Error('Страна не найдена');
        }
        return country;
    }

    @Post()
    @AdminJwtAuth()
    @HttpCode(HttpStatus.CREATED)
    async create(@Body() dto: CreateCountryDto): Promise<Omit<Country, 'createdAt' | 'updatedAt'>> {
        return this.service.create(dto);
    }

    @Put(':id')
    @AdminJwtAuth()
    @HttpCode(HttpStatus.OK)
    async update(
        @Param('id') id: string,
        @Body() dto: UpdateCountryDto
    ): Promise<Omit<Country, 'createdAt' | 'updatedAt'>> {
        await this.service.update(id, dto);
        const updatedCountry = await this.service.findById(id);
        if (!updatedCountry) {
            throw new Error('Страна не найдена после обновления');
        }
        return updatedCountry;
    }
}
