import { Router } from 'express';
import { asyncHandler } from '../lib/async-handler.js';
import { parseOrThrow, checkoutSchema, quoteSchema } from '../validation/store.js';
import { buildCheckoutQuote, createCheckoutSession } from '../services/checkout.service.js';

const router = Router();

router.post(
  '/quote',
  asyncHandler(async (req, res) => {
    const input = parseOrThrow(quoteSchema, req.body);
    const quote = await buildCheckoutQuote(input);
    res.json(quote);
  }),
);

router.post(
  '/session',
  asyncHandler(async (req, res) => {
    const input = parseOrThrow(checkoutSchema, req.body);
    const session = await createCheckoutSession(input);
    res.status(201).json(session);
  }),
);

export default router;
