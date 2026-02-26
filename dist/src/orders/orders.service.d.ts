import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
export declare class OrdersService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(userId: string, dto: CreateOrderDto): Promise<any>;
    findMyOrders(userId: string): Promise<any>;
    findAll(): Promise<any>;
    updateStatus(id: string, dto: UpdateOrderStatusDto): Promise<any>;
}
