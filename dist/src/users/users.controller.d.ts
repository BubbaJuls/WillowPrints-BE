import { UsersService } from './users.service';
import { JwtPayload } from '../common/decorators/current-user.decorator';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    getMe(payload: JwtPayload): Promise<any>;
    findAll(): Promise<any>;
}
