import { Router } from 'express';
import express from 'express';
import { stripe } from '../lib/stripe.js';
import { env } from '../config/env.js';
import { asyncHandler } from '../lib/async-handler.js';
import { HttpError } from '../lib/http-error.js';
import { handlePrintifyEvent, handleStripeEvent } from '../services/checkout.service.js';

const router = Router();

router.post(
  '/stripe',
  express.raw({ type: 'application/json' }),
  asyncHandler(async (req, res) => {
    const signature = req.headers['stripe-signature'];
    if (!signature) {
      throw new HttpError(400, 'Missing Stripe signature header');
    }

    const event = stripe.webhooks.constructEvent(req.body, signature, env.STRIPE_WEBHOOK_SECRET);
    await handleStripeEvent(event);
    res.json({ received: true });
  }),
);

router.post(
  '/printify',
  express.json({ limit: '1mb' }),
  asyncHandler(async (req, res) => {
    const token = String(req.query.token || '');
    if (token !== env.PRINTIFY_WEBHOOK_TOKEN) {
      throw new HttpError(401, 'Invalid Printify webhook token');
    }

    await handlePrintifyEvent(req.body);
    res.json({ received: true });
  }),
);

export default router;
