import {
  Module,
  type MiddlewareConsumer,
  type NestModule,
} from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AccessRequestsModule } from './access-requests/access-requests.module.js';
import { PrincipalGuard } from './common/auth/principal.guard.js';
import { RequestIdMiddleware } from './common/request-id.middleware.js';
import { AppConfigModule } from './config/app-config.module.js';
import { HealthModule } from './health/health.module.js';
import { DataHubModule } from './integrations/datahub/datahub.module.js';

@Module({
  imports: [AppConfigModule, DataHubModule, HealthModule, AccessRequestsModule],
  providers: [
    {
      provide: APP_GUARD,
      useClass: PrincipalGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(RequestIdMiddleware).forRoutes('{*path}');
  }
}
