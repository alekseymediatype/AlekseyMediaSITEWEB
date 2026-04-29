import { z } from 'zod';
import { HttpError } from '../lib/http-error.js';

const twoLetterCountry = z.string().trim().length(2).transform((value) => value.toUpperCase());
const promoCode = z.string().trim().min(3).max(64).transform((value) => value.toUpperCase());

export const quoteSchema = z.object({
  productId: z.string().trim().min(1),
  variantId: z.coerce.number().int().positive(),
  quantity: z.coerce.number().int().min(1).max(10).default(1),
  country: twoLetterCountry,
  promoCode: promoCode.optional(),
});

export const checkoutSchema = z.object({
  productId: z.string().trim().min(1),
  variantId: z.coerce.number().int().positive(),
  quantity: z.coerce.number().int().min(1).max(10).default(1),
  promoCode: promoCode.optional(),
  customer: z.object({
    firstName: z.string().trim().min(1).max(80),
    lastName: z.string().trim().min(1).max(80),
    email: z.string().trim().email(),
    phone: z.string().trim().min(5).max(40),
  }),
  shippingAddress: z.object({
    country: twoLetterCountry,
    region: z.string().trim().max(120).optional().default(''),
    city: z.string().trim().min(1).max(120),
    zip: z.string().trim().min(1).max(40),
    address1: z.string().trim().min(1).max(180),
    address2: z.string().trim().max(180).optional().default(''),
    company: z.string().trim().max(180).optional().default(''),
  }),
});

export const promoClaimSchema = z.object({
  code: promoCode,
  clientToken: z.string().trim().min(16).max(200),
});

export function parseOrThrow(schema, payload) {
  const parsed = schema.safeParse(payload);

  if (!parsed.success) {
    throw new HttpError(422, 'Validation failed', parsed.error.flatten());
  }

  return parsed.data;
}
