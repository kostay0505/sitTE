import { IsString, IsNumber, IsUUID, IsEnum, IsArray, Min } from 'class-validator';
import { CurrencyList, QuantityType } from '../types/enums';

export class UpdateProductDto {
    @IsString()
    name: string;

    @IsNumber()
    @Min(0)
    priceCash: number;

    @IsNumber()
    @Min(0)
    priceNonCash: number;

    @IsEnum(CurrencyList)
    currency: CurrencyList;

    @IsString()
    preview: string;
    
    @IsArray()
    files: string[];

    @IsString()
    description: string;

    @IsUUID()
    categoryId: string;

    @IsUUID()
    brandId: string;

    @IsNumber()
    @Min(1)
    quantity: number;

    @IsEnum(QuantityType)
    quantityType: QuantityType;
}