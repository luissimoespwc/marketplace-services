import type { DataProductUrn } from './urn.js';

export interface DataProductSummary {
  urn: DataProductUrn;
  name: string;
  domain?: string;
}

export interface DataHubHealth {
  status: 'up' | 'down';
  mode: string;
}
