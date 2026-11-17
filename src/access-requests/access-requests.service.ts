import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import type { Principal } from '../common/auth/principal.js';
import {
  DATAHUB_ADAPTER,
  type DataHubAdapter,
} from '../integrations/datahub/datahub.adapter.js';
import {
  InvalidDataProductUrnError,
  parseDataProductUrn,
  type DataProductUrn,
} from '../integrations/datahub/urn.js';
import type {
  AccessRequestResponse,
  CreateAccessRequestDto,
} from './access-request.schemas.js';
import { AccessRequestStatus } from './access-request.status.js';
import {
  ACCESS_REQUEST_REPOSITORY,
  type AccessRequestRecord,
  type AccessRequestRepository,
} from './access-requests.repository.js';

@Injectable()
export class AccessRequestsService {
  constructor(
    @Inject(ACCESS_REQUEST_REPOSITORY)
    private readonly repository: AccessRequestRepository,
    @Inject(DATAHUB_ADAPTER) private readonly datahub: DataHubAdapter,
  ) {}

  async create(
    input: CreateAccessRequestDto,
    principal: Principal,
  ): Promise<AccessRequestResponse> {
    const dataProductUrn = parseProductUrn(input.dataProductUrn);

    await this.datahub.getDataProduct(dataProductUrn);

    const record: AccessRequestRecord = {
      id: randomUUID(),
      dataProductUrn,
      justification: input.justification,
      status: AccessRequestStatus.Submitted,
      requestedBy: principal.id,
      createdAt: new Date().toISOString(),
    };
    await this.repository.insert(record);
    return toResponse(record);
  }

  async getById(
    id: string,
    principal: Principal,
  ): Promise<AccessRequestResponse> {
    const record = await this.repository.findById(id);
    if (!record || record.requestedBy !== principal.id) {
      throw new NotFoundException('Access request not found');
    }
    return toResponse(record);
  }
}

function parseProductUrn(value: string): DataProductUrn {
  try {
    return parseDataProductUrn(value);
  } catch (error) {
    if (error instanceof InvalidDataProductUrnError) {
      throw new BadRequestException(error.message);
    }
    throw error;
  }
}

function toResponse(record: AccessRequestRecord): AccessRequestResponse {
  return {
    id: record.id,
    dataProductUrn: record.dataProductUrn,
    justification: record.justification,
    status: record.status,
    requestedBy: record.requestedBy,
    createdAt: record.createdAt,
  };
}
