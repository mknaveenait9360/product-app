import{IS_ALPHA, IsNotEmpty,IsNumber, IsOptional, IsString} from 'class-validator';
export class CreateProductDto {
    @IsNotEmpty()
    @IsString()
    name: string;

    @IsNotEmpty()
    @IsString()
    description: string;

    @IsNotEmpty()
    @IsNumber()
    price: number;

    @IsOptional()
    @IsString()
    image?: string;

    @IsOptional()
    images?: string[];

    @IsOptional()
    @IsNumber()
    stock?: number;
}
