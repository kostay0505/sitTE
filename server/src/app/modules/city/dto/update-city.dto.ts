import { IsString, IsUUID, IsBoolean, IsOptional } from 'class-validator';

export class UpdateCityDto {
    @IsOptional()
    @IsString()
    name?: string;

    @IsOptional()
    @IsUUID()
    countryId?: string;

    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
}
