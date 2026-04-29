import { Router } from 'express';
import { asyncHandler } from '../lib/async-handler.js';
import { parseOrThrow, promoClaimSchema } from '../validation/store.js';
import { claimPromoCodeForClient, getPromoCodeClaimForClient } from '../repositories/promo-codes.repository.js';

const router = Router();

router.post(
  '/claim',
  asyncHandler(async (req, res) => {
    const input = parseOrThrow(promoClaimSchema, req.body);
    const claim = await claimPromoCodeForClient(input.code, input.clientToken);

    if (!claim) {
      return res.status(409).json({
        message: 'Promo code is already used or expired',
      });
    }

    return res.json({
      code: claim.code,
      discountPercent: Number(claim.discountPercent),
      validUntil: claim.validUntil,
    });
  }),
);

router.post(
  '/check',
  asyncHandler(async (req, res) => {
    const input = parseOrThrow(promoClaimSchema, req.body);
    const claim = await getPromoCodeClaimForClient(input.code, input.clientToken);

    if (!claim) {
      return res.status(404).json({
        message: 'Promo code is unavailable',
      });
    }

    return res.json({
      code: claim.code,
      discountPercent: Number(claim.discountPercent),
      validUntil: claim.validUntil,
    });
  }),
);

export default router;
