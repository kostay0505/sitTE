import { IsUUID, IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export enum OrderBy {
    DATE = 'date',
}

export enum SortDirection {
    ASC = 'asc',
    DESC = 'desc',
}

export class GetResumesDto {
    @IsOptional()
    @IsString()
    userId?: string;

    @IsOptional()
    @IsUUID()
    cityId?: string;

    @IsOptional()
    @IsString()
    searchQuery?: string;

    @IsOptional()
    @IsEnum(OrderBy)
    orderBy?: OrderBy = OrderBy.DATE;

    @IsOptional()
    @IsEnum(SortDirection)
    sortDirection?: SortDirection = SortDirection.DESC;

    @Transform(({ value }) => Number(value))
    @IsNumber()
    limit: number = 25;

    @Transform(({ value }) => Number(value))
    @IsNumber()
    offset: number = 0;
}
