import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(4000),
  APP_BASE_URL: z.string().url(),
  DATABASE_URL: z.string().min(1),
  STORE_CURRENCY: z.string().length(3).default('EUR'),
  STRIPE_SECRET_KEY: z.string().min(1),
  STRIPE_WEBHOOK_SECRET: z.string().min(1),
  PRINTIFY_API_TOKEN: z.string().min(1),
  PRINTIFY_SHOP_ID: z.coerce.number().int().positive(),
  PRINTIFY_USER_AGENT: z.string().min(1).default('AlekseyMediaStore/1.0'),
  PRINTIFY_WEBHOOK_TOKEN: z.string().min(16),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid environment configuration:', parsed.error.flatten().fieldErrors);
  process.exit(1);
}

const normalizedAppBaseUrl = parsed.data.APP_BASE_URL.replace(/\/$/, '');

export const env = {
  ...parsed.data,
  APP_BASE_URL: normalizedAppBaseUrl,
  STORE_CURRENCY: parsed.data.STORE_CURRENCY.toUpperCase(),
};
