import crypto from 'node:crypto';
import { db, withTransaction } from '../lib/db.js';

const promoClaimWindowSql = "NOW() + INTERVAL '5 minutes'";

function mapPromoCode(row) {
  if (!row) return null;

  return {
    id: row.id,
    code: row.code,
    discountPercent: row.discount_percent,
    maxRedemptions: row.max_redemptions,
    redemptionsCount: row.redemptions_count,
    isActive: row.is_active,
    reservedByOrderId: row.reserved_by_order_id,
    reservedUntil: row.reserved_until,
    redeemedByOrderId: row.redeemed_by_order_id,
    redeemedAt: row.redeemed_at,
  };
}

export async function getPromoCodeForPreview(code) {
  const result = await db.query(
    `SELECT *
       FROM promo_codes
      WHERE code = $1
        AND is_active = TRUE
        AND redemptions_count < max_redemptions
        AND redeemed_by_order_id IS NULL
        AND NOT EXISTS (
          SELECT 1
            FROM promo_code_claims claims
           WHERE claims.promo_code_id = promo_codes.id
             AND claims.valid_until > NOW()
        )
        AND (reserved_until IS NULL OR reserved_until < NOW())
      LIMIT 1`,
    [code],
  );

  return mapPromoCode(result.rows[0]);
}

export async function reservePromoCodeForOrder(client, code, orderId) {
  const result = await client.query(
    `UPDATE promo_codes
        SET reserved_by_order_id = $2,
            reserved_until = ${promoClaimWindowSql},
            updated_at = NOW()
      WHERE code = $1
        AND is_active = TRUE
        AND redemptions_count < max_redemptions
        AND redeemed_by_order_id IS NULL
        AND NOT EXISTS (
          SELECT 1
            FROM promo_code_claims claims
           WHERE claims.promo_code_id = promo_codes.id
             AND claims.valid_until > NOW()
        )
        AND (reserved_until IS NULL OR reserved_until < NOW())
      RETURNING *`,
    [code, orderId],
  );

  return mapPromoCode(result.rows[0]);
}

export async function releasePromoCodeReservation(orderId) {
  await db.query(
    `UPDATE promo_codes
        SET reserved_by_order_id = NULL,
            reserved_until = NULL,
            updated_at = NOW()
      WHERE reserved_by_order_id = $1
        AND redeemed_by_order_id IS NULL`,
    [orderId],
  );
}

export async function redeemPromoCodeReservation(orderId) {
  const result = await db.query(
    `UPDATE promo_codes
        SET redemptions_count = redemptions_count + 1,
            redeemed_by_order_id = $1,
            redeemed_at = NOW(),
            reserved_by_order_id = NULL,
            reserved_until = NULL,
            updated_at = NOW()
      WHERE reserved_by_order_id = $1
        AND redeemed_by_order_id IS NULL
        AND redemptions_count < max_redemptions
      RETURNING *`,
    [orderId],
  );

  return mapPromoCode(result.rows[0]);
}

function mapPromoClaim(row) {
  if (!row) return null;

  return {
    id: row.id,
    code: row.code,
    discountPercent: row.discount_percent,
    clientToken: row.client_token,
    validUntil: row.valid_until,
    activatedAt: row.activated_at,
  };
}

export async function claimPromoCodeForClient(code, clientToken) {
  return withTransaction(async (client) => {
    const promoResult = await client.query(
      `SELECT *
         FROM promo_codes
        WHERE code = $1
          AND is_active = TRUE
          AND redemptions_count < max_redemptions
          AND redeemed_by_order_id IS NULL
        LIMIT 1
        FOR UPDATE`,
      [code],
    );

    const promo = promoResult.rows[0];
    if (!promo) return null;

    const claimResult = await client.query(
      `SELECT claims.*, promo_codes.code, promo_codes.discount_percent
         FROM promo_code_claims claims
         JOIN promo_codes ON promo_codes.id = claims.promo_code_id
        WHERE claims.promo_code_id = $1
        LIMIT 1
        FOR UPDATE`,
      [promo.id],
    );

    const existingClaim = claimResult.rows[0];

    const existingClaimIsActive = existingClaim && new Date(existingClaim.valid_until).getTime() > Date.now();

    if (!existingClaim) {
      const insertResult = await client.query(
        `INSERT INTO promo_code_claims (
           id,
           promo_code_id,
           client_token,
           discount_percent,
           valid_until
         ) VALUES (
           $1,
           $2,
           $3,
           $4,
           ${promoClaimWindowSql}
         )
         RETURNING id, promo_code_id, client_token, discount_percent, activated_at, valid_until`,
        [crypto.randomUUID(), promo.id, clientToken, promo.discount_percent],
      );

      return {
        code: promo.code,
        discountPercent: promo.discount_percent,
        clientToken,
        validUntil: insertResult.rows[0].valid_until,
        activatedAt: insertResult.rows[0].activated_at,
      };
    }

    if (existingClaimIsActive && existingClaim.client_token === clientToken) {
      return mapPromoClaim(existingClaim);
    }

    if (existingClaimIsActive) {
      return null;
    }

    const refreshResult = await client.query(
      `UPDATE promo_code_claims
          SET client_token = $2,
              discount_percent = $3,
              activated_at = NOW(),
              valid_until = ${promoClaimWindowSql}
        WHERE id = $1
      RETURNING id, promo_code_id, client_token, discount_percent, activated_at, valid_until`,
      [existingClaim.id, clientToken, promo.discount_percent],
    );

    return {
      code: promo.code,
      discountPercent: promo.discount_percent,
      clientToken,
      validUntil: refreshResult.rows[0].valid_until,
      activatedAt: refreshResult.rows[0].activated_at,
    };
  });
}

export async function getPromoCodeClaimForClient(code, clientToken) {
  const result = await db.query(
    `SELECT claims.*, promo_codes.code, promo_codes.discount_percent
       FROM promo_code_claims claims
       JOIN promo_codes ON promo_codes.id = claims.promo_code_id
      WHERE promo_codes.code = $1
        AND claims.client_token = $2
        AND claims.valid_until > NOW()
      LIMIT 1`,
    [code, clientToken],
  );

  return mapPromoClaim(result.rows[0]);
}
