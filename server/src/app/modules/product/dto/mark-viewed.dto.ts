import { IsUUID } from 'class-validator';

export class MarkViewedDto {
    @IsUUID()
    id: string;
}
