import type { DataHubAdapter } from './datahub.adapter.js';
import { DataHubAdapterError } from './datahub.errors.js';
import { parseDataProductUrn } from './urn.js';

export interface DataHubAdapterContractOptions {
  knownUrn?: string;
}

export function runDataHubAdapterContract(
  factory: () => DataHubAdapter,
  options: DataHubAdapterContractOptions = {},
): void {
  const knownUrn = parseDataProductUrn(
    options.knownUrn ?? 'urn:li:dataProduct:sample_sales',
  );
  const unknownUrn = parseDataProductUrn('urn:li:dataProduct:missing_product');

  describe('DataHubAdapter contract', () => {
    it('reports health with a status and a mode', async () => {
      const health = await factory().checkHealth();

      expect(['up', 'down']).toContain(health.status);
      expect(health.mode.length).toBeGreaterThan(0);
    });

    it('returns a summary for a known data product', async () => {
      const product = await factory().getDataProduct(knownUrn);

      expect(product.urn).toBe(knownUrn);
      expect(product.name.length).toBeGreaterThan(0);
    });

    it('throws NotFound for an unknown data product', async () => {
      const adapter = factory();

      await expect(adapter.getDataProduct(unknownUrn)).rejects.toBeInstanceOf(
        DataHubAdapterError,
      );
      await expect(adapter.getDataProduct(unknownUrn)).rejects.toMatchObject({
        kind: 'NotFound',
      });
    });
  });
}
