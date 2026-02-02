import { IsString, IsUUID, IsPhoneNumber, IsBoolean, IsOptional } from 'class-validator';

export class AdminUpdateVacancyDto {
    @IsUUID()
    id: string;

    @IsString()
    userId: string;

    @IsString()
    firstName: string;

    @IsString()
    lastName: string | null;

    @IsString()
    companyName: string;

    @IsString()
    position: string;

    @IsPhoneNumber()
    phone: string | null;

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
