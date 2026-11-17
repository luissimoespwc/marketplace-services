import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { configureApp } from './app.setup.js';
import { APP_ENV } from './config/app-env.js';
import type { Env } from './config/env.schema.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  configureApp(app);
  const env = app.get<Env>(APP_ENV);
  await app.listen(env.PORT);
  Logger.log(
    `Listening on port ${env.PORT} with DataHub adapter "${env.DATAHUB_ADAPTER}" and auth mode "${env.AUTH_MODE}"`,
    'Bootstrap',
  );
}
await bootstrap();
