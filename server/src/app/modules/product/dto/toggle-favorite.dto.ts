import { IsUUID, IsBoolean } from 'class-validator';

export class ToggleFavoriteDto {
    @IsUUID()
    id: string;

    @IsBoolean()
    isFavorite: boolean;
}
