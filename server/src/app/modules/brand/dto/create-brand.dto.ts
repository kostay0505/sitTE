import { IsString, IsNumber, IsBoolean, IsOptional, IsUrl } from 'class-validator';

export class CreateBrandDto {
    @IsString()
    name: string;

    @IsUrl()
    photo: string;

    @IsString()
    description: string;

    @IsString()
    contact?: string;

    @IsNumber()
    displayOrder: number;

    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
}
