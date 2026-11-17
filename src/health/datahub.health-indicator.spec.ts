import { HealthIndicatorService } from '@nestjs/terminus';
import type { DataHubAdapter } from '../integrations/datahub/datahub.adapter.js';
import { DataHubHealthIndicator } from './datahub.health-indicator.js';

function indicatorFor(adapter: DataHubAdapter): DataHubHealthIndicator {
  return new DataHubHealthIndicator(new HealthIndicatorService(), adapter);
}

describe('DataHubHealthIndicator', () => {
  it('reports up when the adapter is up', async () => {
    const indicator = indicatorFor({
      checkHealth: () => Promise.resolve({ status: 'up', mode: 'stub' }),
      getDataProduct: () => Promise.reject(new Error('unused')),
    });

    await expect(indicator.isHealthy('datahub')).resolves.toEqual({
      datahub: { status: 'up', mode: 'stub' },
    });
  });

  it('reports down when the adapter is down', async () => {
    const indicator = indicatorFor({
      checkHealth: () => Promise.resolve({ status: 'down', mode: 'stub' }),
      getDataProduct: () => Promise.reject(new Error('unused')),
    });

    await expect(indicator.isHealthy('datahub')).resolves.toEqual({
      datahub: { status: 'down', mode: 'stub' },
    });
  });

  it('reports down without the thrown error text', async () => {
    const indicator = indicatorFor({
      checkHealth: () => Promise.reject(new Error('token=secret')),
      getDataProduct: () => Promise.reject(new Error('unused')),
    });

    const result = await indicator.isHealthy('datahub');

    expect(result.datahub.status).toBe('down');
    expect(JSON.stringify(result)).not.toContain('secret');
  });
});
