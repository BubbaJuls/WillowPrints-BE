import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { CartService } from './cart.service';
import { SyncCartDto } from './dto/sync-cart.dto';
import { AddCartItemDto } from './dto/add-cart-item.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser, JwtPayload } from '../common/decorators/current-user.decorator';

@Controller('cart')
@UseGuards(JwtAuthGuard)
export class CartController {
  constructor(private readonly cartService: CartService) {}

  /** Get current user's cart (creates if missing) */
  @Get()
  getCart(@CurrentUser() payload: JwtPayload) {
    return this.cartService.getOrCreateCart(payload.sub);
  }

  /** Replace cart with given items (full sync) */
  @Put()
  syncCart(@CurrentUser() payload: JwtPayload, @Body() dto: SyncCartDto) {
    return this.cartService.syncCart(payload.sub, dto.items);
  }

  /** Add or update one item */
  @Post('items')
  addItem(@CurrentUser() payload: JwtPayload, @Body() dto: AddCartItemDto) {
    return this.cartService.addItem(
      payload.sub,
      dto.productId,
      dto.quantity,
    );
  }

  /** Remove one item by productId */
  @Delete('items/:productId')
  removeItem(
    @CurrentUser() payload: JwtPayload,
    @Param('productId') productId: string,
  ) {
    return this.cartService.removeItem(payload.sub, productId);
  }

  /** Clear cart */
  @Delete()
  clear(@CurrentUser() payload: JwtPayload) {
    return this.cartService.clear(payload.sub);
  }
}
