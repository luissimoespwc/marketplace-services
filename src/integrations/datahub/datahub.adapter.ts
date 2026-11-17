import type { DataHubHealth, DataProductSummary } from './datahub.types.js';
import type { DataProductUrn } from './urn.js';

export const DATAHUB_ADAPTER = Symbol('DATAHUB_ADAPTER');

export interface DataHubAdapter {
  checkHealth(): Promise<DataHubHealth>;
  getDataProduct(urn: DataProductUrn): Promise<DataProductSummary>;
}
