import { IsString, IsUUID, IsBoolean, IsOptional, IsPhoneNumber, IsArray } from 'class-validator';

export class AdminCreateResumeDto {
    @IsString()
    userId: string;

    @IsString()
    firstName: string;

    @IsOptional()
    @IsString()
    lastName?: string;

    @IsString()
    position: string;

    @IsOptional()
    @IsPhoneNumber()
    phone?: string;

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
