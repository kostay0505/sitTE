import { Injectable } from '@nestjs/common';
import { type City, CityShort } from './schemas/cities';
import { CreateCityDto } from './dto/create-city.dto';
import { UpdateCityDto } from './dto/update-city.dto';
import { CityRepository } from './city.repository';

@Injectable()
export class CityService {
    constructor(
        private readonly repository: CityRepository,
    ) { }

    async create(dto: CreateCityDto): Promise<City> {
        return this.repository.create(dto);
    }

    async update(id: string, dto: UpdateCityDto): Promise<boolean> {
        return this.repository.update(id, dto);
    }

    async findAll(): Promise<City[]> {
        return this.repository.findAll();
    }

    async findAllAvailable(): Promise<CityShort[]> {
        return this.repository.findAllAvailable();
    }

    async findById(id: string): Promise<City | null> {
        return this.repository.findById(id);
    }

    async findShortById(id: string): Promise<CityShort | null> {
        return this.repository.findShortById(id);
    }
}