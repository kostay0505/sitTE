import { IsString, IsBoolean, IsOptional } from 'class-validator';

export class UpdateCountryDto {
    @IsOptional()
    @IsString()
    name?: string;

    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
}
