import { Inject, Injectable } from '@nestjs/common';
import { HealthIndicatorService } from '@nestjs/terminus';
import {
  DATAHUB_ADAPTER,
  type DataHubAdapter,
} from '../integrations/datahub/datahub.adapter.js';

@Injectable()
export class DataHubHealthIndicator {
  constructor(
    private readonly healthIndicatorService: HealthIndicatorService,
    @Inject(DATAHUB_ADAPTER) private readonly datahub: DataHubAdapter,
  ) {}

  async isHealthy(key: string) {
    const indicator = this.healthIndicatorService.check(key);
    try {
      const result = await this.datahub.checkHealth();
      if (result.status === 'down') {
        return indicator.down({ mode: result.mode });
      }
      return indicator.up({ mode: result.mode });
    } catch {
      // A thrown indicator becomes HTTP 500. Report down instead, and do not
      // copy the error text because it may contain downstream details.
      return indicator.down('DataHub health check failed');
    }
  }
}
