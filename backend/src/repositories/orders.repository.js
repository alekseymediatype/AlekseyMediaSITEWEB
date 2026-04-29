import { db, withTransaction } from '../lib/db.js';
import { HttpError } from '../lib/http-error.js';
import { reservePromoCodeForOrder } from './promo-codes.repository.js';

function mapOrderRow(row) {
  if (!row) return null;

  return {
    id: row.id,
    publicId: row.public_id,
    stripeCheckoutSessionId: row.stripe_checkout_session_id,
    stripePaymentIntentId: row.stripe_payment_intent_id,
    printifyOrderId: row.printify_order_id,
    paymentStatus: row.payment_status,
    fulfillmentStatus: row.fulfillment_status,
    printifyStatus: row.printify_status,
    promoCode: row.promo_code,
    currency: row.currency,
    subtotalAmount: row.subtotal_amount,
    discountAmount: row.discount_amount,
    shippingAmount: row.shipping_amount,
    totalAmount: row.total_amount,
    shippingMethod: row.shipping_method,
    customer: {
      firstName: row.customer_first_name,
      lastName: row.customer_last_name,
      email: row.customer_email,
      phone: row.customer_phone,
    },
    shippingAddress: {
      country: row.shipping_country,
      region: row.shipping_region,
      city: row.shipping_city,
      zip: row.shipping_zip,
      address1: row.shipping_address1,
      address2: row.shipping_address2,
    },
    stripeCheckoutUrl: row.stripe_checkout_url,
    metadata: row.metadata || {},
    printifyResponse: row.printify_response,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapOrderItemRow(row) {
  return {
    id: row.id,
    orderId: row.order_id,
    productId: row.product_id,
    variantId: Number(row.variant_id),
    sku: row.sku,
    productTitle: row.product_title,
    variantTitle: row.variant_title,
    optionColor: row.option_color,
    optionSize: row.option_size,
    imageUrl: row.image_url,
    quantity: row.quantity,
    unitAmount: row.unit_amount,
    totalAmount: row.total_amount,
  };
}

async function getOrderItems(client, orderId) {
  const result = await client.query(
    `SELECT *
       FROM order_items
      WHERE order_id = $1
      ORDER BY id ASC`,
    [orderId],
  );

  return result.rows.map(mapOrderItemRow);
}

export async function createOrder(order) {
  return withTransaction(async (client) => {
    await client.query(
      `INSERT INTO orders (
        id,
        public_id,
        payment_status,
        fulfillment_status,
        promo_code,
        currency,
        subtotal_amount,
        discount_amount,
        shipping_amount,
        total_amount,
        shipping_method,
        customer_first_name,
        customer_last_name,
        customer_email,
        customer_phone,
        shipping_country,
        shipping_region,
        shipping_city,
        shipping_zip,
        shipping_address1,
        shipping_address2,
        metadata
      ) VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22::jsonb
      )`,
      [
        order.id,
        order.publicId,
        order.paymentStatus,
        order.fulfillmentStatus,
        order.promoCode || null,
        order.currency,
        order.subtotalAmount,
        order.discountAmount,
        order.shippingAmount,
        order.totalAmount,
        order.shippingMethod,
        order.customer.firstName,
        order.customer.lastName,
        order.customer.email,
        order.customer.phone || null,
        order.shippingAddress.country,
        order.shippingAddress.region || null,
        order.shippingAddress.city,
        order.shippingAddress.zip,
        order.shippingAddress.address1,
        order.shippingAddress.address2 || null,
        JSON.stringify(order.metadata || {}),
      ],
    );

    if (order.promoCode) {
      const reservedPromo = await reservePromoCodeForOrder(client, order.promoCode, order.id);
      if (!reservedPromo || Number(reservedPromo.discountPercent) !== Number(order.promoDiscountPercent || 0)) {
        throw new HttpError(409, 'Promo code is already reserved or redeemed');
      }
    }

    for (const item of order.items) {
      await client.query(
        `INSERT INTO order_items (
          order_id,
          product_id,
          variant_id,
          sku,
          product_title,
          variant_title,
          option_color,
          option_size,
          image_url,
          quantity,
          unit_amount,
          total_amount
        ) VALUES (
          $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12
        )`,
        [
          order.id,
          item.productId,
          item.variantId,
          item.sku || null,
          item.productTitle,
          item.variantTitle,
          item.optionColor || null,
          item.optionSize || null,
          item.imageUrl || null,
          item.quantity,
          item.unitAmount,
          item.totalAmount,
        ],
      );
    }

    return order;
  });
}

export async function updateOrderStripeSession(orderId, { stripeCheckoutSessionId, stripeCheckoutUrl }) {
  await db.query(
    `UPDATE orders
        SET stripe_checkout_session_id = $2,
            stripe_checkout_url = $3,
            payment_status = 'checkout_created',
            updated_at = NOW()
      WHERE id = $1`,
    [orderId, stripeCheckoutSessionId, stripeCheckoutUrl],
  );
}

export async function markOrderPaid(orderId, { stripePaymentIntentId }) {
  await db.query(
    `UPDATE orders
        SET payment_status = 'paid',
            stripe_payment_intent_id = COALESCE($2, stripe_payment_intent_id),
            updated_at = NOW()
      WHERE id = $1`,
    [orderId, stripePaymentIntentId || null],
  );
}

export async function markOrderPaymentFailed(orderId) {
  await db.query(
    `UPDATE orders
        SET payment_status = 'payment_failed',
            updated_at = NOW()
      WHERE id = $1`,
    [orderId],
  );
}

export async function markOrderExpired(orderId) {
  await db.query(
    `UPDATE orders
        SET payment_status = 'expired',
            updated_at = NOW()
      WHERE id = $1`,
    [orderId],
  );
}

export async function attachPrintifyOrder(orderId, { printifyOrderId, printifyStatus, fulfillmentStatus, printifyResponse }) {
  await db.query(
    `UPDATE orders
        SET printify_order_id = $2,
            printify_status = $3,
            fulfillment_status = $4,
            printify_response = $5::jsonb,
            updated_at = NOW()
      WHERE id = $1`,
    [orderId, String(printifyOrderId), printifyStatus, fulfillmentStatus, JSON.stringify(printifyResponse || {})],
  );
}

export async function markPrintifyFailed(orderId, errorPayload) {
  await db.query(
    `UPDATE orders
        SET fulfillment_status = 'printify_failed',
            printify_status = 'printify_failed',
            printify_response = $2::jsonb,
            updated_at = NOW()
      WHERE id = $1`,
    [orderId, JSON.stringify(errorPayload || {})],
  );
}

export async function updateOrderFromPrintifyEvent(printifyOrderId, { printifyStatus, fulfillmentStatus, payload }) {
  await db.query(
    `UPDATE orders
        SET printify_status = $2,
            fulfillment_status = $3,
            printify_response = $4::jsonb,
            updated_at = NOW()
      WHERE printify_order_id = $1`,
    [String(printifyOrderId), printifyStatus, fulfillmentStatus, JSON.stringify(payload || {})],
  );
}

export async function recordWebhookEvent(provider, eventId, payload) {
  const result = await db.query(
    `INSERT INTO webhook_events (provider, event_id, payload)
     VALUES ($1, $2, $3::jsonb)
     ON CONFLICT (provider, event_id) DO NOTHING
     RETURNING id`,
    [provider, eventId, JSON.stringify(payload || {})],
  );

  return result.rowCount > 0;
}

export async function deleteWebhookEvent(provider, eventId) {
  await db.query(
    `DELETE FROM webhook_events
      WHERE provider = $1
        AND event_id = $2`,
    [provider, eventId],
  );
}

export async function getOrderByPublicId(publicId) {
  const client = await db.connect();

  try {
    const orderResult = await client.query(
      `SELECT *
         FROM orders
        WHERE public_id = $1
        LIMIT 1`,
      [publicId],
    );

    const order = mapOrderRow(orderResult.rows[0]);
    if (!order) return null;

    order.items = await getOrderItems(client, order.id);
    return order;
  } finally {
    client.release();
  }
}

export async function getOrderByStripeSessionId(sessionId) {
  const client = await db.connect();

  try {
    const orderResult = await client.query(
      `SELECT *
         FROM orders
        WHERE stripe_checkout_session_id = $1
        LIMIT 1`,
      [sessionId],
    );

    const order = mapOrderRow(orderResult.rows[0]);
    if (!order) return null;

    order.items = await getOrderItems(client, order.id);
    return order;
  } finally {
    client.release();
  }
}
