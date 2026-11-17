var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Module, } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AccessRequestsModule } from './access-requests/access-requests.module.js';
import { PrincipalGuard } from './common/auth/principal.guard.js';
import { RequestIdMiddleware } from './common/request-id.middleware.js';
import { AppConfigModule } from './config/app-config.module.js';
import { HealthModule } from './health/health.module.js';
import { DataHubModule } from './integrations/datahub/datahub.module.js';
let AppModule = class AppModule {
    configure(consumer) {
        consumer.apply(RequestIdMiddleware).forRoutes('{*path}');
    }
};
AppModule = __decorate([
    Module({
        imports: [AppConfigModule, DataHubModule, HealthModule, AccessRequestsModule],
        providers: [
            {
                provide: APP_GUARD,
                useClass: PrincipalGuard,
            },
        ],
    })
], AppModule);
export { AppModule };
//# sourceMappingURL=app.module.js.map