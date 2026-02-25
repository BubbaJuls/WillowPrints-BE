import { IsArray, IsNumber, IsOptional, IsString, IsUrl, Min } from 'class-validator';

export class CreateProductDto {
  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsNumber()
  @Min(0)
  price: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];
}
