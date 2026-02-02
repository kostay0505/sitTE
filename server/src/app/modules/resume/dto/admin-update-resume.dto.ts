import { IsString, IsUUID, IsPhoneNumber, IsArray, IsBoolean, IsOptional } from 'class-validator';

export class AdminUpdateResumeDto {
    @IsString()
    userId: string;

    @IsString()
    firstName: string;

    @IsString()
    lastName: string | null;

    @IsString()
    position: string;

    @IsPhoneNumber()
    phone: string | null;

    @IsUUID()
    cityId: string;

    @IsString()
    description: string;

    @IsArray()
    files: string[];

    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
}
