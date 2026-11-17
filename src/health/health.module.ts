import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { DataHubModule } from '../integrations/datahub/datahub.module.js';
import { DataHubHealthIndicator } from './datahub.health-indicator.js';
import { HealthController } from './health.controller.js';

@Module({
  imports: [TerminusModule, DataHubModule],
  controllers: [HealthController],
  providers: [DataHubHealthIndicator],
})
export class HealthModule {}
