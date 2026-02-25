import { SetMetadata } from '@nestjs/common';
import { Role } from '@prisma/client';

export const ROLES_KEY = 'roles';

/** Mark a route as restricted to given roles (e.g. admin-only). */
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
