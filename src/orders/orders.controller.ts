import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
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

  /** Admin: list all orders (must be before Get(':id')) */
  @Get()
  @UseGuards(RolesGuard)
  @Roles(Role.admin)
  findAll() {
    return this.ordersService.findAll();
  }

  /** Admin: list transaction logs (optional ?orderId=) */
  @Get('order-logs')
  @UseGuards(RolesGuard)
  @Roles(Role.admin)
  findLogs(@Query('orderId') orderId?: string) {
    return this.ordersService.findLogs(orderId);
  }

  /** Get single order (own or admin) – for receipt / order detail */
  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() payload: JwtPayload) {
    const isAdmin = payload.role === Role.admin;
    return this.ordersService.findOne(id, payload.sub, isAdmin);
  }

  /** Admin: update order status */
  @Patch(':id/status')
  @UseGuards(RolesGuard)
  @Roles(Role.admin)
  updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateOrderStatusDto,
    @CurrentUser() payload: JwtPayload,
  ) {
    return this.ordersService.updateStatus(id, dto, payload.sub);
  }
}
