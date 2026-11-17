import { Injectable } from '@nestjs/common';
import type { AccessRequestStatus } from './access-request.status.js';
import type { DataProductUrn } from '../integrations/datahub/urn.js';

export interface AccessRequestRecord {
  id: string;
  dataProductUrn: DataProductUrn;
  justification: string;
  status: AccessRequestStatus;
  requestedBy: string;
  createdAt: string;
}

export interface AccessRequestRepository {
  insert(record: AccessRequestRecord): Promise<void>;
  findById(id: string): Promise<AccessRequestRecord | undefined>;
}

export const ACCESS_REQUEST_REPOSITORY = Symbol('ACCESS_REQUEST_REPOSITORY');

@Injectable()
export class InMemoryAccessRequestRepository implements AccessRequestRepository {
  private readonly records = new Map<string, AccessRequestRecord>();

  insert(record: AccessRequestRecord): Promise<void> {
    if (this.records.has(record.id)) {
      return Promise.reject(new Error('Duplicate access request id'));
    }
    this.records.set(record.id, { ...record });
    return Promise.resolve();
  }

  findById(id: string): Promise<AccessRequestRecord | undefined> {
    const record = this.records.get(id);
    return Promise.resolve(record ? { ...record } : undefined);
  }
}
