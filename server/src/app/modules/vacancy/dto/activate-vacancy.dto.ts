import { IsUUID } from 'class-validator';

export class ActivateVacancyDto {
    @IsUUID()
    id: string;
}
