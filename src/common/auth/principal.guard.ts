import {
  type CanActivate,
  type ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { APP_ENV } from '../../config/app-env.js';
import type { Env } from '../../config/env.schema.js';
import type { MarketplaceRequest } from '../http/marketplace-request.js';
import { DEV_PRINCIPAL } from './principal.js';
import { IS_PUBLIC_KEY } from './public.decorator.js';

@Injectable()
export class PrincipalGuard implements CanActivate {
  constructor(
    @Inject(APP_ENV) private readonly env: Env,
    private readonly reflector: Reflector,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<MarketplaceRequest>();
    switch (this.env.AUTH_MODE) {
      case 'disabled':
        throw new UnauthorizedException('Authentication is required');
      case 'dev-stub':
        request.principal = DEV_PRINCIPAL;
        return true;
      default: {
        const unsupported: never = this.env.AUTH_MODE;
        throw new UnauthorizedException(
          `Authentication mode "${String(unsupported)}" is not available`,
        );
      }
    }
  }
}
