import crypto from 'node:crypto';
import { env } from '../config/env.js';
import { stripe } from '../lib/stripe.js';
import { HttpError } from '../lib/http-error.js';
import {
  attachPrintifyOrder,
  createOrder,
  getOrderByPublicId,
  getOrderByStripeSessionId,
  markOrderExpired,
  markOrderPaid,
  markOrderPaymentFailed,
  markPrintifyFailed,
  deleteWebhookEvent,
  recordWebhookEvent,
  updateOrderFromPrintifyEvent,
  updateOrderStripeSession,
} from '../repositories/orders.repository.js';
import {
  getPromoCodeForPreview,
  redeemPromoCodeReservation,
  releasePromoCodeReservation,
} from '../repositories/promo-codes.repository.js';
import {
  getCatalogProduct,
  getShippingQuote,
  getVariantOption,
  requireAvailableVariant,
} from './catalog.service.js';
import { createPrintifyOrder } from '../lib/printify.js';

function buildPublicOrderId() {
  return `AM-${Date.now().toString(36)}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
}

async function resolvePromoDiscount(subtotalAmount, promoCode) {
  if (!promoCode) {
    return {
      promoCode: null,
      promoDiscountPercent: 0,
      discountAmount: 0,
    };
  }

  const promo = await getPromoCodeForPreview(promoCode);
  if (!promo) {
    throw new HttpError(409, 'Promo code is invalid or already used');
  }

  return {
    promoCode: promo.code,
    promoDiscountPercent: promo.discountPercent,
    discountAmount: Math.floor(subtotalAmount * (promo.discountPercent / 100)),
  };
}

function buildProductSnapshot(product, variant, quantity) {
  return {
    productId: product.id,
    variantId: variant.id,
    sku: variant.sku,
    productTitle: product.title,
    variantTitle: variant.title,
    optionColor: getVariantOption(variant, 'color')?.value || '',
    optionSize: getVariantOption(variant, 'size')?.value || '',
    imageUrl: variant.images[0]?.src || product.thumbnail,
    quantity,
    unitAmount: variant.price,
    totalAmount: variant.price * quantity,
  };
}

export async function buildCheckoutQuote(input) {
  const product = await getCatalogProduct(input.productId);
  const variant = requireAvailableVariant(product, input.variantId);
  const quantity = Number(input.quantity || 1);

  const shipping = await getShippingQuote({
    product,
    variantId: variant.id,
    quantity,
    country: input.country,
  });

  const subtotalAmount = variant.price * quantity;
  const promo = await resolvePromoDiscount(subtotalAmount, input.promoCode);
  const totalAmount = subtotalAmount - promo.discountAmount + shipping.amount;

  return {
    product: {
      id: product.id,
      title: product.title,
      image: variant.images[0]?.src || product.thumbnail,
    },
    variant: {
      id: variant.id,
      title: variant.title,
      color: getVariantOption(variant, 'color')?.value || '',
      size: getVariantOption(variant, 'size')?.value || '',
      sku: variant.sku,
    },
    quantity,
    currency: env.STORE_CURRENCY,
    subtotalAmount,
    discountAmount: promo.discountAmount,
    shippingAmount: shipping.amount,
    totalAmount,
    promoCode: promo.promoCode,
    promoDiscountPercent: promo.promoDiscountPercent,
  };
}

export async function createCheckoutSession(input) {
  const quote = await buildCheckoutQuote({
    productId: input.productId,
    variantId: input.variantId,
    quantity: input.quantity,
    country: input.shippingAddress.country,
    promoCode: input.promoCode,
  });

  const product = await getCatalogProduct(input.productId);
  const variant = requireAvailableVariant(product, input.variantId);
  const orderId = crypto.randomUUID();
  const publicId = buildPublicOrderId();
  const item = buildProductSnapshot(product, variant, quote.quantity);

  await createOrder({
    id: orderId,
    publicId,
    paymentStatus: 'pending',
    fulfillmentStatus: 'pending',
    promoCode: quote.promoCode,
    currency: quote.currency,
    subtotalAmount: quote.subtotalAmount,
    discountAmount: quote.discountAmount,
    shippingAmount: quote.shippingAmount,
    totalAmount: quote.totalAmount,
    shippingMethod: 1,
    customer: input.customer,
    shippingAddress: input.shippingAddress,
    metadata: {
      checkoutSource: 'stripe_checkout',
      promoDiscountPercent: quote.promoDiscountPercent,
    },
    promoDiscountPercent: quote.promoDiscountPercent,
    items: [item],
  });

  let session;
  try {
    session = await stripe.checkout.sessions.create({
      mode: 'payment',
      billing_address_collection: 'required',
      customer_email: input.customer.email,
      client_reference_id: publicId,
      success_url: `${env.APP_BASE_URL}/checkout-success.html?order=${encodeURIComponent(publicId)}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${env.APP_BASE_URL}/checkout-cancel.html?order=${encodeURIComponent(publicId)}`,
      locale: 'auto',
      payment_intent_data: {
        metadata: {
          orderPublicId: publicId,
        },
      },
      metadata: {
        orderPublicId: publicId,
        ...(quote.promoCode ? { promoCode: quote.promoCode } : {}),
      },
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: env.STORE_CURRENCY.toLowerCase(),
            unit_amount: quote.subtotalAmount - quote.discountAmount,
            product_data: {
              name: product.title,
              description: `${item.variantTitle} • Qty ${quote.quantity}${quote.promoCode ? ` • Promo ${quote.promoCode}` : ''}`,
              images: item.imageUrl ? [item.imageUrl] : [],
              metadata: {
                productId: product.id,
                variantId: String(variant.id),
              },
            },
          },
        },
        {
          quantity: 1,
          price_data: {
            currency: env.STORE_CURRENCY.toLowerCase(),
            unit_amount: quote.shippingAmount,
            product_data: {
              name: 'Shipping',
              description: 'Standard shipping',
            },
          },
        },
      ],
    });
  } catch (error) {
    if (quote.promoCode) {
      await releasePromoCodeReservation(orderId);
    }
    throw error;
  }

  if (!session.url || !session.id) {
    if (quote.promoCode) {
      await releasePromoCodeReservation(orderId);
    }
    throw new HttpError(500, 'Stripe Checkout session was created without a redirect URL');
  }

  await updateOrderStripeSession(orderId, {
    stripeCheckoutSessionId: session.id,
    stripeCheckoutUrl: session.url,
  });

  return {
    orderPublicId: publicId,
    checkoutUrl: session.url,
  };
}

function mapPrintifyEventToFulfillmentStatus(eventType, printifyStatus) {
  switch (eventType) {
    case 'order:created':
      return 'submitted_to_printify';
    case 'order:sent-to-production':
      return 'in_production';
    case 'order:shipment:created':
      return 'shipped';
    case 'order:shipment:delivered':
      return 'delivered';
    case 'order:updated':
      return printifyStatus || 'updated';
    default:
      return 'pending';
  }
}

export async function submitPaidOrderToPrintify(order) {
  if (!order?.items?.length) {
    throw new HttpError(500, 'Order has no line items to send to Printify');
  }

  const payload = {
    external_id: order.publicId,
    label: order.publicId,
    shipping_method: order.shippingMethod,
    send_shipping_notification: false,
    line_items: order.items.map((item, index) => ({
      product_id: item.productId,
      variant_id: item.variantId,
      quantity: item.quantity,
      external_id: `${order.publicId}-line-${index + 1}`,
    })),
    address_to: {
      first_name: order.customer.firstName,
      last_name: order.customer.lastName,
      email: order.customer.email,
      phone: order.customer.phone,
      country: order.shippingAddress.country,
      region: order.shippingAddress.region || '',
      address1: order.shippingAddress.address1,
      address2: order.shippingAddress.address2 || '',
      city: order.shippingAddress.city,
      zip: order.shippingAddress.zip,
    },
  };

  const printifyOrder = await createPrintifyOrder(payload);

  await attachPrintifyOrder(order.id, {
    printifyOrderId: printifyOrder.id,
    printifyStatus: 'order:created',
    fulfillmentStatus: 'submitted_to_printify',
    printifyResponse: printifyOrder,
  });

  return printifyOrder;
}

export async function handleStripeEvent(event) {
  const eventWasRecorded = await recordWebhookEvent('stripe', event.id, event);
  if (!eventWasRecorded) {
    return { duplicate: true };
  }

  try {
    if (event.type === 'checkout.session.async_payment_failed') {
      const failedSession = event.data.object;
      const failedOrder = await getOrderByStripeSessionId(failedSession.id);
      if (failedOrder) {
        await markOrderPaymentFailed(failedOrder.id);
        await releasePromoCodeReservation(failedOrder.id);
      }
      return { duplicate: false };
    }

    if (event.type === 'checkout.session.expired') {
      const expiredSession = event.data.object;
      const expiredOrder = await getOrderByStripeSessionId(expiredSession.id);
      if (expiredOrder) {
        await markOrderExpired(expiredOrder.id);
        await releasePromoCodeReservation(expiredOrder.id);
      }
      return { duplicate: false };
    }

    if (event.type !== 'checkout.session.completed' && event.type !== 'checkout.session.async_payment_succeeded') {
      return { duplicate: false };
    }

    const session = event.data.object;
    const orderPublicId = session.metadata?.orderPublicId || session.client_reference_id;
    if (!orderPublicId) {
      throw new HttpError(400, 'Stripe session metadata is missing orderPublicId');
    }

    const order = await getOrderByPublicId(orderPublicId);
    if (!order) {
      throw new HttpError(404, `Order ${orderPublicId} was not found`);
    }

    await markOrderPaid(order.id, {
      stripePaymentIntentId: typeof session.payment_intent === 'string' ? session.payment_intent : null,
    });

    if (order.promoCode) {
      const redeemedPromo = await redeemPromoCodeReservation(order.id);
      if (!redeemedPromo) {
        throw new HttpError(409, 'Promo code reservation was lost before payment confirmation');
      }
    }

    if (!order.printifyOrderId) {
      try {
        await submitPaidOrderToPrintify(order);
      } catch (error) {
        await markPrintifyFailed(order.id, {
          message: error.message,
          details: error.details || null,
        });
        throw error;
      }
    }

    return { duplicate: false };
  } catch (error) {
    await deleteWebhookEvent('stripe', event.id);
    throw error;
  }
}

export async function handlePrintifyEvent(payload) {
  const eventType = payload?.type || 'unknown';
  const eventId = String(payload?.id || crypto.createHash('sha256').update(JSON.stringify(payload)).digest('hex'));
  const eventWasRecorded = await recordWebhookEvent('printify', eventId, payload);

  if (!eventWasRecorded) {
    return { duplicate: true };
  }

  try {
    const printifyOrderId = payload?.resource?.id || payload?.resource?.data?.id;
    if (!printifyOrderId) {
      throw new HttpError(400, 'Printify webhook payload is missing resource.id');
    }

    const printifyStatus = payload?.resource?.data?.status || eventType;
    await updateOrderFromPrintifyEvent(String(printifyOrderId), {
      printifyStatus,
      fulfillmentStatus: mapPrintifyEventToFulfillmentStatus(eventType, printifyStatus),
      payload,
    });

    return { duplicate: false };
  } catch (error) {
    await deleteWebhookEvent('printify', eventId);
    throw error;
  }
}
