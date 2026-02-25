import { Controller, Get } from '@nestjs/common';
import { AuthService } from './auth.service';

/**
 * Placeholder auth endpoints. Add POST /auth/login, /auth/register, etc.
 * when implementing real authentication (e.g. JWT or sessions).
 */
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('health')
  health() {
    return { status: 'ok', message: 'Auth module is up' };
  }
}
