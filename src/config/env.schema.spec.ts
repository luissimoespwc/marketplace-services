import { envSchema } from './env.schema.js';

describe('envSchema', () => {
  it('applies defaults when the environment is empty', () => {
    const env = envSchema.parse({});

    expect(env).toMatchObject({
      NODE_ENV: 'development',
      PORT: 3000,
      DATAHUB_ADAPTER: 'stub',
      DATAHUB_TIMEOUT_MS: 5000,
      AUTH_MODE: 'disabled',
    });
    expect(env.DATAHUB_GMS_URL).toBeUndefined();
    expect(env.DATAHUB_TOKEN).toBeUndefined();
  });

  it('treats blank optional values as unset', () => {
    const env = envSchema.parse({
      DATAHUB_GMS_URL: '  ',
      DATAHUB_TOKEN: '',
      PORT: '',
    });

    expect(env.PORT).toBe(3000);
    expect(env.DATAHUB_GMS_URL).toBeUndefined();
    expect(env.DATAHUB_TOKEN).toBeUndefined();
  });

  it('rejects an invalid port', () => {
    expect(envSchema.safeParse({ PORT: '0' }).success).toBe(false);
    expect(envSchema.safeParse({ PORT: '70000' }).success).toBe(false);
    expect(envSchema.safeParse({ PORT: 'nope' }).success).toBe(false);
  });

  it('rejects dev-stub when NODE_ENV is production', () => {
    const result = envSchema.safeParse({
      NODE_ENV: 'production',
      AUTH_MODE: 'dev-stub',
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            path: ['AUTH_MODE'],
            message: 'dev-stub is not allowed when NODE_ENV is production',
          }),
        ]),
      );
    }
  });

  it('rejects an adapter other than stub', () => {
    expect(envSchema.safeParse({ DATAHUB_ADAPTER: 'graphql' }).success).toBe(
      false,
    );
  });
});
