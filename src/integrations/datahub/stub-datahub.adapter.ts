import { Injectable } from '@nestjs/common';
import type { DataHubAdapter } from './datahub.adapter.js';
import { DataHubAdapterError } from './datahub.errors.js';
import type { DataHubHealth, DataProductSummary } from './datahub.types.js';
import { parseDataProductUrn, type DataProductUrn } from './urn.js';

// Offline fixtures only. This adapter never opens a socket and never reads
// DATAHUB_TOKEN, so local startup does not need DataHub credentials.
const FIXTURES: readonly DataProductSummary[] = [
  {
    urn: parseDataProductUrn('urn:li:dataProduct:sample_sales'),
    name: 'Sample Sales',
    domain: 'Commercial',
  },
  {
    urn: parseDataProductUrn('urn:li:dataProduct:sample_customers'),
    name: 'Sample Customers',
    domain: 'Commercial',
  },
];

@Injectable()
export class StubDataHubAdapter implements DataHubAdapter {
  checkHealth(): Promise<DataHubHealth> {
    return Promise.resolve({ status: 'up', mode: 'stub' });
  }

  getDataProduct(urn: DataProductUrn): Promise<DataProductSummary> {
    const product = FIXTURES.find((candidate) => candidate.urn === urn);
    if (!product) {
      return Promise.reject(
        new DataHubAdapterError('NotFound', 'Data product not found'),
      );
    }
    return Promise.resolve(product);
  }
}
