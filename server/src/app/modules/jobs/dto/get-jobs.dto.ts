import { IsOptional, IsString, IsNumber, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';

export enum JobType {
    RESUME = 'resume',
    VACANCY = 'vacancy'
}

export enum OrderBy {
    DATE = 'date'
}

export enum SortDirection {
    ASC = 'asc',
    DESC = 'desc'
}

export class GetJobsDto {
    @IsOptional()
    @IsString()
    userId?: string;

    @IsOptional()
    @IsString()
    cityId?: string;

    @IsOptional()
    @IsString()
    searchQuery?: string;

    @IsOptional()
    @IsEnum(JobType)
    type?: JobType;

    @IsOptional()
    @IsEnum(OrderBy)
    orderBy?: OrderBy = OrderBy.DATE;

    @IsOptional()
    @IsEnum(SortDirection)
    sortDirection?: SortDirection = SortDirection.DESC;

    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    limit?: number = 10;

    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    offset?: number = 0;
}
