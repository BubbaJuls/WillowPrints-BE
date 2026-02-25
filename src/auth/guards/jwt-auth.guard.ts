import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/** Guard that requires a valid JWT. Use on routes that need authentication. */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
