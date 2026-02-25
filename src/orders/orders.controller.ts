import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser, JwtPayload } from '../common/decorators/current-user.decorator';
import { Role } from '@prisma/client';

@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  /** Create order for current user */
  @Post()
  create(@CurrentUser() payload: JwtPayload, @Body() dto: CreateOrderDto) {
    return this.ordersService.create(payload.sub, dto);
  }

  /** List current user's orders */
  @Get('me')
  findMyOrders(@CurrentUser() payload: JwtPayload) {
    return this.ordersService.findMyOrders(payload.sub);
  }

  /** Admin: list all orders */
  @Get()
  @UseGuards(RolesGuard)
  @Roles(Role.admin)
  findAll() {
    return this.ordersService.findAll();
  }

  /** Admin: update order status */
  @Patch(':id/status')
  @UseGuards(RolesGuard)
  @Roles(Role.admin)
  updateStatus(@Param('id') id: string, @Body() dto: UpdateOrderStatusDto) {
    return this.ordersService.updateStatus(id, dto);
  }
}
