import { Test } from '@nestjs/testing';
import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { DEV_PRINCIPAL } from '../src/common/auth/principal.js';
import { AppModule } from '../src/app.module.js';
import { configureApp } from '../src/app.setup.js';
import { APP_ENV } from '../src/config/app-env.js';
import { envSchema } from '../src/config/env.schema.js';

async function boot(
  authMode: 'disabled' | 'dev-stub',
): Promise<INestApplication> {
  // ConfigModule reads the environment when AppModule is imported, so each
  // app under test replaces the validated env instead of mutating process.env.
  const env = envSchema.parse({
    NODE_ENV: 'test',
    AUTH_MODE: authMode,
    DATAHUB_ADAPTER: 'stub',
  });
  const moduleFixture = await Test.createTestingModule({
    imports: [AppModule],
  })
    .overrideProvider(APP_ENV)
    .useValue(env)
    .compile();
  const app = moduleFixture.createNestApplication();
  configureApp(app);
  await app.init();
  return app;
}

describe('Marketplace API (e2e)', () => {
  describe('when authentication is disabled', () => {
    let app: INestApplication;

    beforeAll(async () => {
      app = await boot('disabled');
    });

    afterAll(async () => {
      await app.close();
    });

    it('GET /health/live is public and echoes the request id', async () => {
      const response = await request(app.getHttpServer())
        .get('/health/live')
        .set('x-request-id', 'req-live');

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({ status: 'ok' });
      expect(response.headers['x-request-id']).toBe('req-live');
    });

    it('GET /health/ready reports the stub adapter as up', async () => {
      const response = await request(app.getHttpServer()).get('/health/ready');

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        status: 'ok',
        details: { datahub: { status: 'up', mode: 'stub' } },
      });
      expect(response.headers['x-request-id']).toEqual(expect.any(String));
    });

    it('GET /api/v1/access-requests/:id returns 401', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/access-requests/00000000-0000-4000-8000-000000000000')
        .set('x-request-id', 'req-401');

      expect(response.status).toBe(401);
      expect(response.body).toEqual({
        statusCode: 401,
        error: 'Unauthorized',
        message: 'Authentication is required',
        requestId: 'req-401',
      });
      expect(response.headers['x-request-id']).toBe('req-401');
      expect(response.body.stack).toBeUndefined();
    });
  });

  describe('when dev-stub authentication is enabled', () => {
    let app: INestApplication;

    beforeAll(async () => {
      app = await boot('dev-stub');
    });

    afterAll(async () => {
      await app.close();
    });

    it('creates an access request and reads it back', async () => {
      const created = await request(app.getHttpServer())
        .post('/api/v1/access-requests')
        .send({
          dataProductUrn: 'urn:li:dataProduct:sample_sales',
          justification: 'Needed for a sample analysis',
        });

      expect(created.status).toBe(201);
      expect(created.body).toMatchObject({
        dataProductUrn: 'urn:li:dataProduct:sample_sales',
        justification: 'Needed for a sample analysis',
        status: 'SUBMITTED',
        requestedBy: DEV_PRINCIPAL.id,
      });
      expect(created.headers['x-request-id']).toEqual(expect.any(String));

      const fetched = await request(app.getHttpServer()).get(
        `/api/v1/access-requests/${created.body.id}`,
      );

      expect(fetched.status).toBe(200);
      expect(fetched.body).toEqual(created.body);
    });

    it('returns 404 when the data product is unknown', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/access-requests')
        .send({
          dataProductUrn: 'urn:li:dataProduct:missing_product',
          justification: 'Needed for a sample analysis',
        });

      expect(response.status).toBe(404);
      expect(response.body).toMatchObject({
        statusCode: 404,
        error: 'Not Found',
        message: 'Data product not found',
      });
      expect(response.body.stack).toBeUndefined();
    });

    it('returns 400 for a malformed URN, an unknown field, or a bad id', async () => {
      const malformed = await request(app.getHttpServer())
        .post('/api/v1/access-requests')
        .send({
          dataProductUrn:
            'urn:li:dataset:(urn:li:dataPlatform:mysql,db.table,PROD)',
          justification: 'Needed for a sample analysis',
        });
      expect(malformed.status).toBe(400);
      expect(malformed.body.statusCode).toBe(400);

      const unknownField = await request(app.getHttpServer())
        .post('/api/v1/access-requests')
        .send({
          dataProductUrn: 'urn:li:dataProduct:sample_sales',
          justification: 'Needed for a sample analysis',
          requestedBy: 'someone-else',
        });
      expect(unknownField.status).toBe(400);

      const badId = await request(app.getHttpServer()).get(
        '/api/v1/access-requests/not-a-uuid',
      );
      expect(badId.status).toBe(400);
      expect(badId.body.statusCode).toBe(400);
    });

    it('does not serve access requests without the version prefix', async () => {
      await request(app.getHttpServer())
        .get('/api/access-requests')
        .expect(404);
      await request(app.getHttpServer()).get('/access-requests').expect(404);
    });
  });
});
