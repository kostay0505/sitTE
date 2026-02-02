import { IsString, IsUUID, IsPhoneNumber } from 'class-validator';

export class UpdateVacancyDto {
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
}
