import { IsUUID } from 'class-validator';

export class DeleteResumeDto {
    @IsUUID()
    id: string;
}
