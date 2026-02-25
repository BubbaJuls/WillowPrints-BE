import { PartialType } from '@nestjs/mapped-types';
import { CreateProductDto } from './create-product.dto';

/** All fields optional for PATCH-style updates */
export class UpdateProductDto extends PartialType(CreateProductDto) {}
