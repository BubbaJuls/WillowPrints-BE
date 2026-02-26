import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { OrderLogAction, OrderStatus, Prisma } from '@prisma/client';

function generateOrderNumber(): string {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const rand = Math.random().toString(36).slice(2, 10);
  return `WP-${date}-${rand}`;
}

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  /** Create order for current user; total computed from product prices; writes transaction log */
  async create(userId: string, dto: CreateOrderDto) {
    if (!dto.items?.length) {
      throw new BadRequestException('Order must have at least one item');
    }
    const productIds = dto.items.map((i) => i.productId);
    const products = await this.prisma.product.findMany({
      where: { id: { in: productIds } },
    });
    if (products.length !== productIds.length) {
      throw new BadRequestException('One or more products not found');
    }
    const productMap = new Map(products.map((p) => [p.id, p]));
    let total = new Prisma.Decimal(0);
    const orderItems: Prisma.OrderItemCreateWithoutOrderInput[] = [];
    for (const item of dto.items) {
      const product = productMap.get(item.productId)!;
      const priceAtOrder = product.price;
      const lineTotal = new Prisma.Decimal(priceAtOrder).mul(item.quantity);
      total = total.add(lineTotal);
      orderItems.push({
        product: { connect: { id: product.id } },
        quantity: item.quantity,
        priceAtOrder,
      });
    }
    const orderNumber = generateOrderNumber();
    const order = await this.prisma.order.create({
      data: {
        orderNumber,
        userId,
        total,
        status: OrderStatus.pending,
        items: { create: orderItems },
      },
      include: {
        items: { include: { product: true } },
        user: { select: { id: true, email: true, name: true } },
      },
    });
    await this.prisma.orderLog.create({
      data: {
        orderId: order.id,
        action: OrderLogAction.order_created,
        toStatus: OrderStatus.pending,
        performedBy: userId,
      },
    });
    return order;
  }

  /** List orders for current user */
  async findMyOrders(userId: string) {
    return this.prisma.order.findMany({
      where: { userId },
      include: { items: { include: { product: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  /** Get one order by id (own order or admin); for receipt / order detail */
  async findOne(id: string, userId: string, isAdmin: boolean) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        items: { include: { product: true } },
        user: { select: { id: true, email: true, name: true } },
      },
    });
    if (!order) throw new NotFoundException('Order not found');
    if (!isAdmin && order.userId !== userId) {
      throw new ForbiddenException('You can only view your own orders');
    }
    return order;
  }

  /** Admin: list all orders */
  async findAll() {
    return this.prisma.order.findMany({
      include: {
        user: { select: { id: true, email: true, name: true } },
        items: { include: { product: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /** Admin: update order status; writes transaction log */
  async updateStatus(id: string, dto: UpdateOrderStatusDto, performedBy: string) {
    const order = await this.prisma.order.findUnique({ where: { id } });
    if (!order) throw new NotFoundException('Order not found');
    const updated = await this.prisma.order.update({
      where: { id },
      data: { status: dto.status },
      include: { items: { include: { product: true } } },
    });
    await this.prisma.orderLog.create({
      data: {
        orderId: id,
        action: OrderLogAction.status_updated,
        fromStatus: order.status,
        toStatus: dto.status,
        performedBy,
      },
    });
    return updated;
  }

  /** Admin: list transaction logs for an order (or globally) */
  async findLogs(orderId?: string) {
    return this.prisma.orderLog.findMany({
      where: orderId ? { orderId } : undefined,
      orderBy: { createdAt: 'desc' },
      take: orderId ? 100 : 500,
    });
  }
}
