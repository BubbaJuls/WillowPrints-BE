import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { JwtPayload } from '../common/decorators/current-user.decorator';
export declare class OrdersController {
    private readonly ordersService;
    constructor(ordersService: OrdersService);
    create(payload: JwtPayload, dto: CreateOrderDto): Promise<any>;
    findMyOrders(payload: JwtPayload): Promise<any>;
    findAll(): Promise<any>;
    updateStatus(id: string, dto: UpdateOrderStatusDto): Promise<any>;
}
