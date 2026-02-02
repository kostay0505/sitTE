import { Injectable } from '@nestjs/common';
import { type Country, CountryShort } from './schemas/countries';
import { CreateCountryDto } from './dto/create-country.dto';
import { UpdateCountryDto } from './dto/update-country.dto';
import { CountryRepository } from './country.repository';

@Injectable()
export class CountryService {
    constructor(
        private readonly repository: CountryRepository,
    ) { }

    async create(dto: CreateCountryDto): Promise<Omit<Country, 'createdAt' | 'updatedAt'>> {
        return this.repository.create(dto);
    }

    async update(id: string, dto: UpdateCountryDto): Promise<boolean> {
        return this.repository.update(id, dto);
    }

    async findAll(): Promise<Omit<Country, 'createdAt' | 'updatedAt'>[]> {
        return this.repository.findAll();
    }

    async findAllAvailable(): Promise<CountryShort[]> {
        return this.repository.findAllAvailable();
    }

    async findById(id: string): Promise<Omit<Country, 'createdAt' | 'updatedAt'> | null> {
        return this.repository.findById(id);
    }

    async findShortById(id: string): Promise<CountryShort | null> {
        return this.repository.findShortById(id);
    }
}