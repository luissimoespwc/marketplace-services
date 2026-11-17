import { ConfigService } from '@nestjs/config';
import { envSchema, type Env } from './env.schema.js';

export const APP_ENV = Symbol('APP_ENV');

export function readEnv(config: ConfigService): Env {
  return envSchema.parse({
    NODE_ENV: config.get('NODE_ENV'),
    PORT: config.get('PORT'),
    DATAHUB_ADAPTER: config.get('DATAHUB_ADAPTER'),
    DATAHUB_GMS_URL: config.get('DATAHUB_GMS_URL'),
    DATAHUB_TIMEOUT_MS: config.get('DATAHUB_TIMEOUT_MS'),
    DATAHUB_TOKEN: config.get('DATAHUB_TOKEN'),
    AUTH_MODE: config.get('AUTH_MODE'),
  });
}
