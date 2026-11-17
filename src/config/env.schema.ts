import { z } from 'zod';

// .env files often keep unused keys as blank lines. Treat those as missing
// so optional settings and numeric defaults still apply.
const blankToUndefined = (value: unknown) =>
  typeof value === 'string' && value.trim() === '' ? undefined : value;

export const envSchema = z
  .object({
    NODE_ENV: z
      .enum(['development', 'test', 'production'])
      .default('development'),
    PORT: z.preprocess(
      blankToUndefined,
      z.coerce.number().int().min(1).max(65_535).default(3000),
    ),
    // Only the offline stub exists. Any other value fails startup so a
    // half-configured real adapter cannot boot.
    DATAHUB_ADAPTER: z.enum(['stub']).default('stub'),
    DATAHUB_GMS_URL: z.preprocess(blankToUndefined, z.url().optional()),
    DATAHUB_TIMEOUT_MS: z.preprocess(
      blankToUndefined,
      z.coerce.number().int().min(100).max(60_000).default(5_000),
    ),
    DATAHUB_TOKEN: z.preprocess(blankToUndefined, z.string().min(1).optional()),
    AUTH_MODE: z.enum(['disabled', 'dev-stub']).default('disabled'),
  })
  .superRefine((env, ctx) => {
    // dev-stub attaches a fixed identity and must never run in production.
    if (env.NODE_ENV === 'production' && env.AUTH_MODE === 'dev-stub') {
      ctx.addIssue({
        code: 'custom',
        path: ['AUTH_MODE'],
        message: 'dev-stub is not allowed when NODE_ENV is production',
      });
    }
  });

export type Env = z.infer<typeof envSchema>;
