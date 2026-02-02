import { IsUUID } from 'class-validator';

export class DeleteVacancyDto {
    @IsUUID()
    id: string;
}
