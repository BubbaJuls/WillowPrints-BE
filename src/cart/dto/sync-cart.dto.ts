import { IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { SyncCartItemDto } from './sync-cart-item.dto';

export class SyncCartDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SyncCartItemDto)
  items: SyncCartItemDto[];
}
