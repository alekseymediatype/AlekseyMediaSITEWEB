import { env } from '../config/env.js';
import { HttpError } from './http-error.js';

const PRINTIFY_BASE_URL = 'https://api.printify.com/v1';

async function printifyRequest(path, { method = 'GET', body } = {}) {
  const response = await fetch(`${PRINTIFY_BASE_URL}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${env.PRINTIFY_API_TOKEN}`,
      'User-Agent': env.PRINTIFY_USER_AGENT,
      Accept: 'application/json',
      ...(body ? { 'Content-Type': 'application/json' } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (response.status === 204) {
    return null;
  }

  const rawText = await response.text();
  const payload = rawText ? JSON.parse(rawText) : null;

  if (!response.ok) {
    throw new HttpError(response.status, payload?.message || 'Printify request failed', payload);
  }

  return payload;
}

export function listShops() {
  return printifyRequest('/shops.json');
}

export function getShopProducts({ page = 1, limit = 24 } = {}) {
  const search = new URLSearchParams({
    page: String(page),
    limit: String(Math.min(limit, 50)),
  });

  return printifyRequest(`/shops/${env.PRINTIFY_SHOP_ID}/products.json?${search.toString()}`);
}

export function getShopProduct(productId) {
  return printifyRequest(`/shops/${env.PRINTIFY_SHOP_ID}/products/${productId}.json`);
}

export function getShippingProfiles(blueprintId, printProviderId) {
  return printifyRequest(`/catalog/blueprints/${blueprintId}/print_providers/${printProviderId}/shipping.json`);
}

export function createPrintifyOrder(payload) {
  return printifyRequest(`/shops/${env.PRINTIFY_SHOP_ID}/orders.json`, {
    method: 'POST',
    body: payload,
  });
}

export function listPrintifyWebhooks() {
  return printifyRequest(`/shops/${env.PRINTIFY_SHOP_ID}/webhooks.json`);
}

export function createPrintifyWebhook(payload) {
  return printifyRequest(`/shops/${env.PRINTIFY_SHOP_ID}/webhooks.json`, {
    method: 'POST',
    body: payload,
  });
}
