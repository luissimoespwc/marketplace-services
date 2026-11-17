import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_ENV, readEnv } from './app-env.js';
import { envSchema } from './env.schema.js';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: envSchema,
    }),
  ],
  providers: [
    {
      provide: APP_ENV,
      inject: [ConfigService],
      useFactory: readEnv,
    },
  ],
  exports: [APP_ENV],
})
export class AppConfigModule {}
