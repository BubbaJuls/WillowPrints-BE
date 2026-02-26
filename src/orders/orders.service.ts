import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { OrderStatus, Prisma } from '@prisma/client';

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  /** Create order for current user; total computed from product prices */
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
    return this.prisma.order.create({
      data: {
        userId,
        total,
        status: OrderStatus.pending,
        items: { create: orderItems },
      },
      include: {
        items: { include: { product: true } },
      },
    });
  }

  /** List orders for current user */
  async findMyOrders(userId: string) {
    return this.prisma.order.findMany({
      where: { userId },
      include: { items: { include: { product: true } } },
      orderBy: { createdAt: 'desc' },
    });
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

  /** Admin: update order status */
  async updateStatus(id: string, dto: UpdateOrderStatusDto) {
    const order = await this.prisma.order.findUnique({ where: { id } });
    if (!order) throw new NotFoundException('Order not found');
    return this.prisma.order.update({
      where: { id },
      data: { status: dto.status },
      include: { items: { include: { product: true } } },
    });
  }
}
