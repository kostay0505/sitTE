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
import { CityService } from './city.service';
import { CreateCityDto } from './dto/create-city.dto';
import { UpdateCityDto } from './dto/update-city.dto';
import { AdminJwtAuth } from '../../decorators/admin-jwt-auth.decorator';
import { CityShort, type City } from './schemas/cities';

@Controller('cities')
export class CityController {
    constructor(private readonly service: CityService) { }

    @Get()
    @AdminJwtAuth()
    async findAll(): Promise<City[]> {
        const cities = await this.service.findAll();
        return cities;
    }

    @Get('available')
    async findAllAvailable(): Promise<CityShort[]> {
        const cities = await this.service.findAllAvailable();
        return cities;
    }

    @Get(':id')
    @AdminJwtAuth()
    async findOne(@Param('id') id: string): Promise<City> {
        const city = await this.service.findById(id);
        if (!city) {
            throw new Error('Город не найден');
        }
        return city;
    }

    @Post()
    @AdminJwtAuth()
    @HttpCode(HttpStatus.CREATED)
    async create(@Body() dto: CreateCityDto): Promise<City> {
        return this.service.create(dto);
    }

    @Put(':id')
    @AdminJwtAuth()
    @HttpCode(HttpStatus.OK)
    async update(
        @Param('id') id: string,
        @Body() dto: UpdateCityDto
    ): Promise<City> {
        await this.service.update(id, dto);
        const updatedCity = await this.service.findById(id);
        if (!updatedCity) {
            throw new Error('Город не найден после обновления');
        }
        return updatedCity;
    }
}
