import { IsString, IsBoolean, IsOptional } from 'class-validator';

export class CreateCountryDto {
    @IsString()
    name: string;

    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
}
