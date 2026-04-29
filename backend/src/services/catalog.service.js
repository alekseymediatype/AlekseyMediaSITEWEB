import { env } from '../config/env.js';
import { getShopProduct, getShopProducts, getShippingProfiles } from '../lib/printify.js';
import { HttpError } from '../lib/http-error.js';

const PRODUCT_CACHE_TTL_MS = 60 * 1000;
const productCache = new Map();

function getCached(key) {
  const cached = productCache.get(key);
  if (!cached) return null;
  if (cached.expiresAt < Date.now()) {
    productCache.delete(key);
    return null;
  }
  return cached.value;
}

function setCached(key, value) {
  productCache.set(key, {
    value,
    expiresAt: Date.now() + PRODUCT_CACHE_TTL_MS,
  });
}

function stripHtml(input = '') {
  return String(input).replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

function normalizeOptionValue(value = {}) {
  return {
    id: value.id,
    title: value.title || String(value.id),
    colors: Array.isArray(value.colors) ? value.colors : [],
  };
}

function normalizeOption(option = {}) {
  return {
    name: option.name || 'Option',
    type: option.type || 'text',
    values: Array.isArray(option.values) ? option.values.map(normalizeOptionValue) : [],
  };
}

function normalizeImage(image = {}) {
  return {
    src: image.src,
    variantIds: Array.isArray(image.variant_ids) ? image.variant_ids.map(Number) : [],
    isDefault: Boolean(image.is_default),
    position: image.position || 'front',
  };
}

function uniqueImages(images) {
  const seen = new Set();
  return images.filter((image) => {
    if (!image?.src || seen.has(image.src)) return false;
    seen.add(image.src);
    return true;
  });
}

function buildVariantOptions(variant, options) {
  const optionMaps = options.map((option) => new Map(option.values.map((value) => [Number(value.id), value])));

  return (variant.options || []).map((valueId, index) => {
    const option = options[index];
    const resolvedValue = optionMaps[index]?.get(Number(valueId));

    return {
      name: option?.name || `Option ${index + 1}`,
      type: option?.type || 'text',
      valueId: Number(valueId),
      value: resolvedValue?.title || String(valueId),
      colors: resolvedValue?.colors || [],
    };
  });
}

function getVariantImages(variantId, allImages) {
  const specific = allImages.filter((image) => image.variantIds.length === 0 || image.variantIds.includes(Number(variantId)));
  return uniqueImages(specific.length ? specific : allImages);
}

function normalizeProduct(product) {
  const options = Array.isArray(product.options) ? product.options.map(normalizeOption) : [];
  const images = uniqueImages(Array.isArray(product.images) ? product.images.map(normalizeImage) : []);
  const variants = Array.isArray(product.variants)
    ? product.variants
        .filter((variant) => variant.is_enabled)
        .map((variant) => ({
          id: Number(variant.id),
          sku: variant.sku || '',
          title: variant.title,
          price: Number(variant.price || 0),
          cost: Number(variant.cost || 0),
          grams: Number(variant.grams || 0),
          available: Boolean(variant.is_enabled && variant.is_available),
          isDefault: Boolean(variant.is_default),
          options: buildVariantOptions(variant, options),
          images: getVariantImages(variant.id, images),
        }))
    : [];

  const prices = variants.map((variant) => variant.price).filter((value) => Number.isFinite(value));

  return {
    id: String(product.id),
    title: product.title,
    description: stripHtml(product.description || ''),
    safetyInformation: stripHtml(product.safety_information || ''),
    tags: Array.isArray(product.tags) ? product.tags : [],
    visible: Boolean(product.visible),
    blueprintId: Number(product.blueprint_id),
    printProviderId: Number(product.print_provider_id),
    thumbnail: images[0]?.src || '',
    images,
    options,
    variants,
    available: variants.some((variant) => variant.available),
    priceRange: {
      min: prices.length ? Math.min(...prices) : 0,
      max: prices.length ? Math.max(...prices) : 0,
      currency: env.STORE_CURRENCY,
    },
    updatedAt: product.updated_at,
  };
}

export async function listCatalogProducts({ page = 1, limit = 24 } = {}) {
  const cacheKey = `products:${page}:${limit}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  const response = await getShopProducts({ page, limit });
  const payload = {
    items: Array.isArray(response.data) ? response.data.map(normalizeProduct) : [],
    pagination: {
      currentPage: response.current_page || page,
      lastPage: response.last_page || 1,
      perPage: response.per_page || limit,
      total: response.total || 0,
    },
  };

  setCached(cacheKey, payload);
  return payload;
}

export async function getCatalogProduct(productId) {
  const cacheKey = `product:${productId}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  const product = normalizeProduct(await getShopProduct(productId));
  setCached(cacheKey, product);
  return product;
}

export function requireAvailableVariant(product, variantId) {
  const variant = product.variants.find((entry) => Number(entry.id) === Number(variantId));

  if (!variant) {
    throw new HttpError(404, 'Selected variant was not found');
  }

  if (!variant.available) {
    throw new HttpError(409, 'Selected variant is unavailable');
  }

  return variant;
}

export function getVariantOption(variant, type) {
  return variant.options.find((option) => option.type === type || option.name.toLowerCase().includes(type));
}

export async function getShippingQuote({ product, variantId, quantity, country }) {
  const shipping = await getShippingProfiles(product.blueprintId, product.printProviderId);
  const profiles = Array.isArray(shipping.profiles) ? shipping.profiles : [];

  const profile = profiles.find((entry) => {
    const matchesVariant = Array.isArray(entry.variant_ids) && entry.variant_ids.map(Number).includes(Number(variantId));
    const countries = Array.isArray(entry.countries) ? entry.countries : [];
    const matchesCountry = countries.includes(country) || countries.includes('REST_OF_THE_WORLD');
    return matchesVariant && matchesCountry;
  });

  if (!profile) {
    throw new HttpError(422, 'Shipping profile not found for the selected country and variant');
  }

  const currency = String(profile.first_item?.currency || env.STORE_CURRENCY).toUpperCase();
  if (currency !== env.STORE_CURRENCY) {
    throw new HttpError(500, `Shipping currency mismatch: expected ${env.STORE_CURRENCY}, got ${currency}`);
  }

  const firstItem = Number(profile.first_item?.cost || 0);
  const additionalItem = Number(profile.additional_items?.cost || 0);

  return {
    amount: firstItem + Math.max(0, quantity - 1) * additionalItem,
    currency,
    profile,
  };
}
