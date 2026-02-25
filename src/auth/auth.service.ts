import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';

/**
 * Placeholder auth service. Extend with real strategies (e.g. JWT, sessions)
 * and password hashing (e.g. bcrypt) when implementing login/register.
 */
@Injectable()
export class AuthService {
  constructor(private readonly usersService: UsersService) {}

  async validateUser(email: string, _password: string) {
    const user = await this.usersService.findByEmail(email);
    if (user) {
      // TODO: compare hashed password
      const { passwordHash: _, ...result } = user;
      return result;
    }
    return null;
  }
}
