import { IsUUID, IsBoolean, IsOptional } from 'class-validator';

export class CreateFavoriteProductDto {
    @IsUUID()
    productId: string;

    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
}
