import { IsString, IsUUID, IsBoolean, IsOptional } from 'class-validator';

export class CreateCityDto {
    @IsString()
    name: string;

    @IsOptional()
    @IsUUID()
    countryId?: string;

    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
}
