import { Controller, Get, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser, JwtPayload } from '../common/decorators/current-user.decorator';
import { Role } from '@prisma/client';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /** Get current user info (requires JWT) */
  @Get('me')
  @UseGuards(JwtAuthGuard)
  getMe(@CurrentUser() payload: JwtPayload) {
    return this.usersService.findById(payload.sub);
  }

  /** List all users – admin only */
  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.admin)
  findAll() {
    return this.usersService.findAll();
  }
}
