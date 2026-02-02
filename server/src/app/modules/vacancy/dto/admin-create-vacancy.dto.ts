import { IsString, IsUUID, IsBoolean, IsOptional, IsPhoneNumber } from 'class-validator';

export class AdminCreateVacancyDto {
    @IsString()
    userId: string;

    @IsString()
    firstName: string;

    @IsOptional()
    @IsString()
    lastName?: string;

    @IsString()
    companyName: string;

    @IsString()
    position: string;

    @IsOptional()
    @IsPhoneNumber()
    phone?: string;

    @IsUUID()
    cityId: string;

    @IsString()
    address: string;

    @IsString()
    description: string;

    @IsOptional()
    @IsBoolean()
    isActive?: boolean;

    @IsOptional()
    @IsBoolean()
    isDeleted?: boolean;
}
