import {
  createParamDecorator,
  type ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import type { MarketplaceRequest } from '../http/marketplace-request.js';
import type { Principal } from './principal.js';

export const CurrentPrincipal = createParamDecorator(
  (_data: unknown, context: ExecutionContext): Principal => {
    const request = context.switchToHttp().getRequest<MarketplaceRequest>();
    if (!request.principal) {
      throw new UnauthorizedException('Authentication is required');
    }
    return request.principal;
  },
);
