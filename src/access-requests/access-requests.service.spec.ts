import { NotFoundException } from '@nestjs/common';
import type { Principal } from '../common/auth/principal.js';
import type { DataHubAdapter } from '../integrations/datahub/datahub.adapter.js';
import { DataHubAdapterError } from '../integrations/datahub/datahub.errors.js';
import {
  parseDataProductUrn,
  type DataProductUrn,
} from '../integrations/datahub/urn.js';
import { AccessRequestStatus } from './access-request.status.js';
import { InMemoryAccessRequestRepository } from './access-requests.repository.js';
import { AccessRequestsService } from './access-requests.service.js';

const owner: Principal = { id: 'owner-1', displayName: 'Owner' };
const other: Principal = { id: 'other-1', displayName: 'Other' };
const sampleUrn = parseDataProductUrn('urn:li:dataProduct:sample_sales');

function serviceWith(known: DataProductUrn[]): AccessRequestsService {
  const adapter: DataHubAdapter = {
    checkHealth: () => Promise.resolve({ status: 'up', mode: 'stub' }),
    getDataProduct: (urn) => {
      if (!known.includes(urn)) {
        return Promise.reject(
          new DataHubAdapterError('NotFound', 'Data product not found'),
        );
      }
      return Promise.resolve({ urn, name: 'Sample Sales' });
    },
  };
  return new AccessRequestsService(
    new InMemoryAccessRequestRepository(),
    adapter,
  );
}

describe('AccessRequestsService', () => {
  it('creates a submitted request for the authenticated principal', async () => {
    const service = serviceWith([sampleUrn]);

    const created = await service.create(
      {
        dataProductUrn: sampleUrn,
        justification: 'Needed for a sample analysis',
      },
      owner,
    );

    expect(created).toMatchObject({
      dataProductUrn: sampleUrn,
      justification: 'Needed for a sample analysis',
      status: AccessRequestStatus.Submitted,
      requestedBy: owner.id,
    });
    expect(created.id).toEqual(expect.any(String));
    await expect(service.getById(created.id, owner)).resolves.toEqual(created);
  });

  it('propagates NotFound when the data product is unknown', async () => {
    const service = serviceWith([]);

    await expect(
      service.create(
        {
          dataProductUrn: 'urn:li:dataProduct:missing_product',
          justification: 'Needed for a sample analysis',
        },
        owner,
      ),
    ).rejects.toMatchObject({ kind: 'NotFound' });
  });

  it('hides requests owned by someone else', async () => {
    const service = serviceWith([sampleUrn]);
    const created = await service.create(
      {
        dataProductUrn: sampleUrn,
        justification: 'Needed for a sample analysis',
      },
      owner,
    );

    await expect(service.getById(created.id, other)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
