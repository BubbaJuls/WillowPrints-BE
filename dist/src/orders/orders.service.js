"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrdersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
let OrdersService = class OrdersService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(userId, dto) {
        if (!dto.items?.length) {
            throw new common_1.BadRequestException('Order must have at least one item');
        }
        const productIds = dto.items.map((i) => i.productId);
        const products = await this.prisma.product.findMany({
            where: { id: { in: productIds } },
        });
        if (products.length !== productIds.length) {
            throw new common_1.BadRequestException('One or more products not found');
        }
        const productMap = new Map(products.map((p) => [p.id, p]));
        let total = new client_1.Prisma.Decimal(0);
        const orderItems = [];
        for (const item of dto.items) {
            const product = productMap.get(item.productId);
            const priceAtOrder = product.price;
            const lineTotal = new client_1.Prisma.Decimal(priceAtOrder).mul(item.quantity);
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
                status: client_1.OrderStatus.pending,
                items: { create: orderItems },
            },
            include: {
                items: { include: { product: true } },
            },
        });
    }
    async findMyOrders(userId) {
        return this.prisma.order.findMany({
            where: { userId },
            include: { items: { include: { product: true } } },
            orderBy: { createdAt: 'desc' },
        });
    }
    async findAll() {
        return this.prisma.order.findMany({
            include: {
                user: { select: { id: true, email: true, name: true } },
                items: { include: { product: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async updateStatus(id, dto) {
        const order = await this.prisma.order.findUnique({ where: { id } });
        if (!order)
            throw new common_1.NotFoundException('Order not found');
        return this.prisma.order.update({
            where: { id },
            data: { status: dto.status },
            include: { items: { include: { product: true } } },
        });
    }
};
exports.OrdersService = OrdersService;
exports.OrdersService = OrdersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], OrdersService);
//# sourceMappingURL=orders.service.js.map