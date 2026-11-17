import { Module } from '@nestjs/common';
import { DataHubModule } from '../integrations/datahub/datahub.module.js';
import { AccessRequestsController } from './access-requests.controller.js';
import {
  ACCESS_REQUEST_REPOSITORY,
  InMemoryAccessRequestRepository,
} from './access-requests.repository.js';
import { AccessRequestsService } from './access-requests.service.js';

@Module({
  imports: [DataHubModule],
  controllers: [AccessRequestsController],
  providers: [
    AccessRequestsService,
    InMemoryAccessRequestRepository,
    {
      provide: ACCESS_REQUEST_REPOSITORY,
      useExisting: InMemoryAccessRequestRepository,
    },
  ],
})
export class AccessRequestsModule {}
