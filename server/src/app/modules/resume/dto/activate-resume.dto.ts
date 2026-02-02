import { IsUUID } from 'class-validator';

export class ActivateResumeDto {
    @IsUUID()
    id: string;
}
