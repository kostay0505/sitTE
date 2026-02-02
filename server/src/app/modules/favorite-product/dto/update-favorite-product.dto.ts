import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateFavoriteProductDto {
    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
}
