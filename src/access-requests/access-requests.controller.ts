import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
} from '@nestjs/common';
import type { Principal } from '../common/auth/principal.js';
import { CurrentPrincipal } from '../common/auth/current-principal.decorator.js';
import {
  accessRequestIdSchema,
  createAccessRequestSchema,
  type CreateAccessRequestDto,
} from './access-request.schemas.js';
import { AccessRequestsService } from './access-requests.service.js';

@Controller({ path: 'access-requests', version: '1' })
export class AccessRequestsController {
  constructor(private readonly accessRequests: AccessRequestsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(
    @Body({ schema: createAccessRequestSchema }) body: CreateAccessRequestDto,
    @CurrentPrincipal() principal: Principal,
  ) {
    return this.accessRequests.create(body, principal);
  }

  @Get(':id')
  getById(
    @Param('id', { schema: accessRequestIdSchema }) id: string,
    @CurrentPrincipal() principal: Principal,
  ) {
    return this.accessRequests.getById(id, principal);
  }
}
