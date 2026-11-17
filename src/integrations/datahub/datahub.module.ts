import { Module } from '@nestjs/common';
import { APP_ENV } from '../../config/app-env.js';
import type { Env } from '../../config/env.schema.js';
import { DATAHUB_ADAPTER, type DataHubAdapter } from './datahub.adapter.js';
import { StubDataHubAdapter } from './stub-datahub.adapter.js';

@Module({
  providers: [
    StubDataHubAdapter,
    {
      provide: DATAHUB_ADAPTER,
      inject: [APP_ENV, StubDataHubAdapter],
      useFactory: (env: Env, stub: StubDataHubAdapter): DataHubAdapter => {
        switch (env.DATAHUB_ADAPTER) {
          case 'stub':
            return stub;
          default: {
            const unsupported: never = env.DATAHUB_ADAPTER;
            throw new Error(
              `DATAHUB_ADAPTER "${String(unsupported)}" is not implemented`,
            );
          }
        }
      },
    },
  ],
  exports: [DATAHUB_ADAPTER],
})
export class DataHubModule {}
