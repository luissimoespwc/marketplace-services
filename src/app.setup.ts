import {
  type INestApplication,
  StandardSchemaValidationPipe,
  VersioningType,
} from '@nestjs/common';
import { HttpExceptionFilter } from './common/filters/http-exception.filter.js';

export function configureApp(app: INestApplication): void {
  // path-to-regexp requires a named wildcard. `{*path}` is optional, so this
  // excludes /health and /health/live without a version prefix.
  app.setGlobalPrefix('api', { exclude: ['health/{*path}'] });
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });
  app.useGlobalPipes(new StandardSchemaValidationPipe());
  app.useGlobalFilters(new HttpExceptionFilter());
  app.enableShutdownHooks();
}
