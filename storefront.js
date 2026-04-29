const storeTranslations = {
  lv: {
    catalog_kicker: 'Printify katalogs',
    catalog_title: 'Izvēlies preci un pārej uz apmaksu.',
    catalog_copy: 'Katalogs tiek ielasīts no tava backend, kas savienots ar Printify shop produktiem.',
    catalog_loading: 'Ielādēju produktus...',
    catalog_empty: 'Pašlaik katalogā nav nevienas preces.',
    catalog_error: 'Produktu ielāde neizdevās.',
    view_product: 'Atvērt produktu ↗',
    available: 'Pieejams',
    unavailable: 'Nav pieejams',
    from_price: 'No',
    product_kicker: 'Printify produkts',
    product_loading: 'Ielādēju produktu...',
    product_error: 'Produkta ielāde neizdevās.',
    product_color: 'Krāsa',
    product_size: 'Izmērs',
    product_variant: 'Variants',
    product_quantity: 'Daudzums',
    product_checkout: 'Pāriet uz checkout ↗',
    product_back: '← Atpakaļ uz merču',
    checkout_kicker: 'Stripe checkout',
    checkout_title: 'Aizpildi datus un apmaksā caur Stripe.',
    checkout_copy: 'Pēc veiksmīgas apmaksas pasūtījums automātiski tiks nosūtīts uz Printify.',
    checkout_customer: 'Kontakti',
    checkout_shipping: 'Piegādes adrese',
    checkout_summary: 'Pasūtījuma kopsavilkums',
    checkout_first_name: 'Vārds',
    checkout_last_name: 'Uzvārds',
    checkout_email: 'E-pasts',
    checkout_phone: 'Tālrunis',
    checkout_country: 'Valsts kods',
    checkout_region: 'Reģions',
    checkout_city: 'Pilsēta',
    checkout_zip: 'Pasta indekss',
    checkout_address1: 'Adrese',
    checkout_address2: 'Dzīvoklis / papildus adrese',
    checkout_promo: 'Promokods',
    checkout_promo_hint: 'Ja tev ir promokods, ievadi to un saņem atlaidi!',
    checkout_subtotal: 'Prece',
    checkout_discount: 'Atlaide',
    checkout_shipping_cost: 'Piegāde',
    checkout_total: 'Kopā',
    checkout_quote_pending: 'Cena tiks aprēķināta pēc valsts izvēles.',
    checkout_quote_loading: 'Aprēķinu piegādi un atlaidi...',
    checkout_submit: 'Apmaksāt ar Stripe ↗',
    checkout_redirecting: 'Pāradresēju uz Stripe...',
    checkout_invalid_variant: 'Izvēlētais variants vairs nav pieejams.',
    success_title: 'Pasūtījums ir apmaksāts.',
    success_copy: 'Maksājums saņemts. Tālāk backend izveido Printify pasūtījumu un statusi atnāks caur webhook.',
    cancel_title: 'Apmaksa tika atcelta.',
    cancel_copy: 'Tu vari atgriezties checkout lapā un mēģināt vēlreiz.',
    order_status_payment: 'Maksājums',
    order_status_fulfillment: 'Izpilde',
    order_status_loading: 'Ielādēju pasūtījuma statusu...',
    api_unreachable: 'Backend API nav sasniedzams. Palaid backend serveri un pārbaudi store API adresi.',
  },
  ru: {
    catalog_kicker: 'Каталог Printify',
    catalog_title: 'Выбери товар и перейди к оплате.',
    catalog_copy: 'Каталог загружается с твоего backend, который подключён к товарам Printify shop.',
    catalog_loading: 'Загружаю товары...',
    catalog_empty: 'Сейчас в каталоге нет товаров.',
    catalog_error: 'Не удалось загрузить товары.',
    view_product: 'Открыть товар ↗',
    available: 'В наличии',
    unavailable: 'Недоступно',
    from_price: 'От',
    product_kicker: 'Товар Printify',
    product_loading: 'Загружаю товар...',
    product_error: 'Не удалось загрузить товар.',
    product_color: 'Цвет',
    product_size: 'Размер',
    product_variant: 'Вариант',
    product_quantity: 'Количество',
    product_checkout: 'Перейти к checkout ↗',
    product_back: '← Обратно в мерч',
    checkout_kicker: 'Stripe checkout',
    checkout_title: 'Заполни данные и оплати через Stripe.',
    checkout_copy: 'После успешной оплаты заказ автоматически уйдёт в Printify.',
    checkout_customer: 'Контакты',
    checkout_shipping: 'Адрес доставки',
    checkout_summary: 'Сводка заказа',
    checkout_first_name: 'Имя',
    checkout_last_name: 'Фамилия',
    checkout_email: 'Email',
    checkout_phone: 'Телефон',
    checkout_country: 'Код страны',
    checkout_region: 'Регион',
    checkout_city: 'Город',
    checkout_zip: 'Индекс',
    checkout_address1: 'Адрес',
    checkout_address2: 'Квартира / доп. адрес',
    checkout_promo: 'Промокод',
    checkout_promo_hint: 'Если у тебя есть промокод, впиши его и получи скидку!',
    checkout_subtotal: 'Товар',
    checkout_discount: 'Скидка',
    checkout_shipping_cost: 'Доставка',
    checkout_total: 'Итого',
    checkout_quote_pending: 'Стоимость посчитается после выбора страны.',
    checkout_quote_loading: 'Считаю доставку и скидку...',
    checkout_submit: 'Оплатить через Stripe ↗',
    checkout_redirecting: 'Перенаправляю в Stripe...',
    checkout_invalid_variant: 'Выбранный вариант больше недоступен.',
    success_title: 'Заказ оплачен.',
    success_copy: 'Платёж получен. Дальше backend создаст заказ в Printify, а статусы придут через webhook.',
    cancel_title: 'Оплата отменена.',
    cancel_copy: 'Можешь вернуться на checkout и попробовать ещё раз.',
    order_status_payment: 'Оплата',
    order_status_fulfillment: 'Исполнение',
    order_status_loading: 'Загружаю статус заказа...',
    api_unreachable: 'Backend API недоступен. Запусти backend сервер и проверь адрес store API.',
  },
  en: {
    catalog_kicker: 'Printify catalog',
    catalog_title: 'Choose a product and continue to payment.',
    catalog_copy: 'The catalog is loaded from your backend connected to your Printify shop products.',
    catalog_loading: 'Loading products...',
    catalog_empty: 'There are no products in the catalog right now.',
    catalog_error: 'Failed to load products.',
    view_product: 'Open product ↗',
    available: 'Available',
    unavailable: 'Unavailable',
    from_price: 'From',
    product_kicker: 'Printify product',
    product_loading: 'Loading product...',
    product_error: 'Failed to load product.',
    product_color: 'Color',
    product_size: 'Size',
    product_variant: 'Variant',
    product_quantity: 'Quantity',
    product_checkout: 'Continue to checkout ↗',
    product_back: '← Back to merch',
    checkout_kicker: 'Stripe checkout',
    checkout_title: 'Enter your details and pay with Stripe.',
    checkout_copy: 'After successful payment the order is created in Printify automatically.',
    checkout_customer: 'Contact details',
    checkout_shipping: 'Shipping address',
    checkout_summary: 'Order summary',
    checkout_first_name: 'First name',
    checkout_last_name: 'Last name',
    checkout_email: 'Email',
    checkout_phone: 'Phone',
    checkout_country: 'Country code',
    checkout_region: 'Region',
    checkout_city: 'City',
    checkout_zip: 'Postal code',
    checkout_address1: 'Address',
    checkout_address2: 'Apartment / address line 2',
    checkout_promo: 'Promo code',
    checkout_promo_hint: 'If you have a promo code, enter it and get a discount!',
    checkout_subtotal: 'Product',
    checkout_discount: 'Discount',
    checkout_shipping_cost: 'Shipping',
    checkout_total: 'Total',
    checkout_quote_pending: 'The final price will be calculated after you choose the country.',
    checkout_quote_loading: 'Calculating shipping and discount...',
    checkout_submit: 'Pay with Stripe ↗',
    checkout_redirecting: 'Redirecting to Stripe...',
    checkout_invalid_variant: 'The selected variant is no longer available.',
    success_title: 'Order paid successfully.',
    success_copy: 'Payment was received. The backend will create the Printify order next and update statuses through webhooks.',
    cancel_title: 'Payment was cancelled.',
    cancel_copy: 'You can go back to the checkout page and try again.',
    order_status_payment: 'Payment',
    order_status_fulfillment: 'Fulfillment',
    order_status_loading: 'Loading order status...',
    api_unreachable: 'Backend API is unreachable. Start the backend server and verify the store API base URL.',
  },
};

const localeMap = {
  lv: 'lv-LV',
  ru: 'ru-RU',
  en: 'en-US',
};

function getStoreLang() {
  if (typeof getCurrentLanguage === 'function') {
    return getCurrentLanguage();
  }

  try {
    return localStorage.getItem('alekseymedia_lang') || document.documentElement.lang || 'lv';
  } catch (error) {
    return document.documentElement.lang || 'lv';
  }
}

function st(key, fallback = '') {
  const lang = getStoreLang().slice(0, 2);
  return storeTranslations[lang]?.[key] || storeTranslations.lv[key] || fallback;
}

function applyStoreTranslations() {
  document.querySelectorAll('[data-store-i18n]').forEach((element) => {
    const key = element.dataset.storeI18n;
    const value = st(key, element.textContent || '');
    if (value) element.textContent = value;
  });

  document.querySelectorAll('[data-store-placeholder]').forEach((element) => {
    const key = element.dataset.storePlaceholder;
    const value = st(key, element.placeholder || '');
    if (value) element.placeholder = value;
  });
}

function formatMoney(amount, currency = 'EUR') {
  return new Intl.NumberFormat(localeMap[getStoreLang().slice(0, 2)] || 'lv-LV', {
    style: 'currency',
    currency,
  }).format((Number(amount) || 0) / 100);
}

function escapeHtml(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function normalizeApiBase(base) {
  return String(base || '/api').replace(/\/$/, '');
}

function getApiBaseCandidates() {
  const configured = document.querySelector('meta[name="store-api-base"]')?.getAttribute('content');
  const candidates = [];
  const add = (value) => {
    const normalized = normalizeApiBase(value);
    if (!candidates.includes(normalized)) {
      candidates.push(normalized);
    }
  };

  add(configured || '/api');

  const isLocalRuntime = window.location.protocol === 'file:' || ['localhost', '127.0.0.1'].includes(window.location.hostname);
  if (isLocalRuntime) {
    add('http://localhost:4000/api');
    add('http://127.0.0.1:4000/api');
  }

  return candidates;
}

async function parseResponsePayload(response) {
  const text = await response.text();
  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch (error) {
    return {
      rawText: text,
    };
  }
}

function shouldTryNextApiCandidate({ candidate, response, error }) {
  const isLocalCandidate = candidate.startsWith('/api') || candidate.includes('localhost:4000') || candidate.includes('127.0.0.1:4000');
  const isLocalRuntime = window.location.protocol === 'file:' || ['localhost', '127.0.0.1'].includes(window.location.hostname);
  if (!isLocalRuntime || !isLocalCandidate) return false;

  if (error) return true;
  if (!response) return false;

  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) return true;
  if ([404, 405, 502, 503, 504].includes(response.status)) return true;
  return false;
}

async function apiFetch(path, init = {}) {
  const candidates = getApiBaseCandidates();
  let lastError = null;

  for (const candidate of candidates) {
    try {
      const response = await fetch(`${candidate}${path}`, {
        ...init,
        headers: {
          Accept: 'application/json',
          ...(init.body ? { 'Content-Type': 'application/json' } : {}),
          ...(init.headers || {}),
        },
      });

      const data = await parseResponsePayload(response);

      if (!response.ok) {
        if (shouldTryNextApiCandidate({ candidate, response })) {
          lastError = new Error(data?.message || `Request failed with status ${response.status}`);
          continue;
        }

        throw new Error(data?.message || `Request failed with status ${response.status}`);
      }

      if ((response.headers.get('content-type') || '').includes('application/json')) {
        return data;
      }

      if (shouldTryNextApiCandidate({ candidate, response })) {
        lastError = new Error(st('api_unreachable', 'Backend API is unreachable.'));
        continue;
      }

      return data;
    } catch (error) {
      if (shouldTryNextApiCandidate({ candidate, error })) {
        lastError = error;
        continue;
      }

      throw error;
    }
  }

  throw new Error(lastError?.message || st('api_unreachable', 'Backend API is unreachable.'));
}

function setStatus(target, text = '', state = '') {
  if (!target) return;
  target.textContent = text;
  target.className = `form-status${state ? ` is-${state}` : ''}`;
}

function getOption(variant, type) {
  return (variant.options || []).find((option) => option.type === type || option.name.toLowerCase().includes(type));
}

function uniqueOptionValues(product, type) {
  const seen = new Map();

  product.variants.filter((variant) => variant.available).forEach((variant) => {
    const option = getOption(variant, type);
    if (!option || seen.has(option.valueId)) return;
    seen.set(option.valueId, option);
  });

  return Array.from(seen.values());
}

function findVariant(product, { variantId = null, colorId = null, sizeId = null } = {}) {
  const variants = product.variants.filter((variant) => variant.available);
  if (!variants.length) return null;

  if (variantId) {
    const exact = variants.find((variant) => Number(variant.id) === Number(variantId));
    if (exact) return exact;
  }

  const filtered = variants.filter((variant) => {
    const color = getOption(variant, 'color');
    const size = getOption(variant, 'size');
    const colorMatches = colorId ? color?.valueId === colorId : true;
    const sizeMatches = sizeId ? size?.valueId === sizeId : true;
    return colorMatches && sizeMatches;
  });

  return filtered[0] || variants.find((variant) => variant.isDefault) || variants[0];
}

function renderCatalogCard(product) {
  const samePrice = product.priceRange.min === product.priceRange.max;
  const priceLabel = samePrice
    ? formatMoney(product.priceRange.min, product.priceRange.currency)
    : `${st('from_price', 'From')} ${formatMoney(product.priceRange.min, product.priceRange.currency)}`;

  return `
    <article class="store-card form-card">
      <div class="store-card-media">
        <img src="${escapeHtml(product.thumbnail)}" alt="${escapeHtml(product.title)}" loading="lazy" />
      </div>
      <div class="store-card-copy">
        <div class="availability-badge${product.available ? '' : ' is-unavailable'}">${product.available ? st('available', 'Available') : st('unavailable', 'Unavailable')}</div>
        <h2>${escapeHtml(product.title)}</h2>
        <p class="store-card-price">${escapeHtml(priceLabel)}</p>
        <p class="store-card-description">${escapeHtml(product.description || '')}</p>
      </div>
      <div class="store-card-actions">
        <a class="btn primary" href="product.html?id=${encodeURIComponent(product.id)}" data-skip-loader="true">${escapeHtml(st('view_product', 'Open product ↗'))}</a>
      </div>
    </article>
  `;
}

async function initCatalogPage() {
  const mount = document.querySelector('[data-store-catalog]');
  if (!mount) return;

  const status = document.querySelector('[data-store-status]');
  let items = [];

  const render = () => {
    if (!items.length) {
      mount.innerHTML = '';
      setStatus(status, st('catalog_empty', 'There are no products in the catalog right now.'));
      return;
    }

    mount.innerHTML = items.map(renderCatalogCard).join('');
    setStatus(status, '');
  };

  setStatus(status, st('catalog_loading', 'Loading products...'));

  try {
    const payload = await apiFetch('/products?limit=24');
    items = (payload.items || []).filter((item) => item.visible !== false);
    render();
  } catch (error) {
    setStatus(status, error.message || st('catalog_error', 'Failed to load products.'), 'error');
  }

  document.addEventListener('alekseymedia:languagechange', render);
}

async function initProductPage() {
  const mount = document.querySelector('[data-store-product-page]');
  if (!mount) return;

  const params = new URLSearchParams(window.location.search);
  const productId = params.get('id');
  const preselectedVariantId = params.get('variant');
  const status = document.getElementById('storeProductStatus');

  if (!productId) {
    setStatus(status, st('product_error', 'Failed to load product.'), 'error');
    return;
  }

  setStatus(status, st('product_loading', 'Loading product...'));

  try {
    const product = await apiFetch(`/products/${encodeURIComponent(productId)}`);
    if (!product?.variants?.length) {
      throw new Error(st('product_error', 'Failed to load product.'));
    }

    let selectedVariant = findVariant(product, { variantId: preselectedVariantId ? Number(preselectedVariantId) : null });
    let activeImage = selectedVariant?.images?.[0]?.src || product.thumbnail;
    let quantity = Number(params.get('quantity') || 1);

    const colorChoices = uniqueOptionValues(product, 'color');
    const sizeChoices = uniqueOptionValues(product, 'size');
    const variantChoices = product.variants.filter((variant) => variant.available);

    const renderChoiceButtons = (choices, selectedValueId, type) =>
      choices
        .map((choice) => {
          const isActive = Number(choice.valueId) === Number(selectedValueId);
          const swatch = choice.colors?.[0] ? `<span class="store-swatch" style="--store-swatch:${escapeHtml(choice.colors[0])}"></span>` : '';
          return `<button class="store-choice-btn${isActive ? ' is-active' : ''}" type="button" data-choice-type="${type}" data-choice-id="${choice.valueId}">${swatch}<span>${escapeHtml(choice.value)}</span></button>`;
        })
        .join('');

    const renderVariantButtons = (choices, selectedId) =>
      choices
        .map((variant) => `<button class="store-choice-btn${Number(variant.id) === Number(selectedId) ? ' is-active' : ''}" type="button" data-choice-type="variant" data-choice-id="${variant.id}">${escapeHtml(variant.title)}</button>`)
        .join('');

    const syncVariant = (nextVariant) => {
      selectedVariant = nextVariant;
      if (!selectedVariant?.images?.some((image) => image.src === activeImage)) {
        activeImage = selectedVariant?.images?.[0]?.src || product.thumbnail;
      }
    };

    const render = () => {
      if (!selectedVariant) {
        setStatus(status, st('checkout_invalid_variant', 'The selected variant is no longer available.'), 'error');
        return;
      }

      const color = getOption(selectedVariant, 'color');
      const size = getOption(selectedVariant, 'size');
      const images = selectedVariant.images?.length ? selectedVariant.images : product.images;
      const buyLink = document.getElementById('storeCheckoutLink');

      document.getElementById('storeProductBadge').textContent = selectedVariant.available ? st('available', 'Available') : st('unavailable', 'Unavailable');
      document.getElementById('storeProductBadge').className = `availability-badge${selectedVariant.available ? '' : ' is-unavailable'}`;
      document.getElementById('storeProductTitle').textContent = product.title;
      document.getElementById('storeProductPrice').textContent = formatMoney(selectedVariant.price, product.priceRange.currency);
      document.getElementById('storeProductDescription').textContent = product.description || '';
      document.getElementById('storeProductVariantMeta').textContent = [color?.value, size?.value].filter(Boolean).join(' • ');
      document.getElementById('storeProductMainImage').src = activeImage;
      document.getElementById('storeProductMainImage').alt = product.title;

      document.getElementById('storeProductThumbs').innerHTML = images
        .map((image) => `<button class="store-thumb${image.src === activeImage ? ' is-active' : ''}" type="button" data-image-src="${escapeHtml(image.src)}"><img src="${escapeHtml(image.src)}" alt="${escapeHtml(product.title)}" loading="lazy" /></button>`)
        .join('');

      const colorGroup = document.getElementById('storeColorGroup');
      const sizeGroup = document.getElementById('storeSizeGroup');
      const variantGroup = document.getElementById('storeVariantGroup');

      if (colorChoices.length > 1) {
        colorGroup.hidden = false;
        document.getElementById('storeColorChoices').innerHTML = renderChoiceButtons(colorChoices, color?.valueId, 'color');
      } else {
        colorGroup.hidden = true;
      }

      if (sizeChoices.length > 1) {
        sizeGroup.hidden = false;
        document.getElementById('storeSizeChoices').innerHTML = renderChoiceButtons(sizeChoices, size?.valueId, 'size');
      } else {
        sizeGroup.hidden = true;
      }

      if (colorChoices.length <= 1 && sizeChoices.length <= 1 && variantChoices.length > 1) {
        variantGroup.hidden = false;
        document.getElementById('storeVariantChoices').innerHTML = renderVariantButtons(variantChoices, selectedVariant.id);
      } else {
        variantGroup.hidden = true;
      }

      document.getElementById('storeQtyValue').textContent = String(quantity);
      buyLink.href = `checkout.html?product=${encodeURIComponent(product.id)}&variant=${encodeURIComponent(selectedVariant.id)}&quantity=${encodeURIComponent(quantity)}`;
      buyLink.setAttribute('aria-disabled', selectedVariant.available ? 'false' : 'true');
      buyLink.classList.toggle('is-disabled', !selectedVariant.available);
      setStatus(status, '');

      mount.querySelectorAll('[data-choice-type]').forEach((button) => {
        button.addEventListener('click', () => {
          const choiceType = button.dataset.choiceType;
          const choiceId = Number(button.dataset.choiceId);

          if (choiceType === 'variant') {
            syncVariant(findVariant(product, { variantId: choiceId }));
          }

          if (choiceType === 'color') {
            syncVariant(findVariant(product, {
              colorId: choiceId,
              sizeId: getOption(selectedVariant, 'size')?.valueId || null,
            }));
          }

          if (choiceType === 'size') {
            syncVariant(findVariant(product, {
              colorId: getOption(selectedVariant, 'color')?.valueId || null,
              sizeId: choiceId,
            }));
          }

          render();
        });
      });

      mount.querySelectorAll('[data-image-src]').forEach((button) => {
        button.addEventListener('click', () => {
          activeImage = button.dataset.imageSrc;
          render();
        });
      });
    };

    document.getElementById('storeQtyDecrease').addEventListener('click', () => {
      quantity = Math.max(1, quantity - 1);
      render();
    });

    document.getElementById('storeQtyIncrease').addEventListener('click', () => {
      quantity = Math.min(10, quantity + 1);
      render();
    });

    render();
    document.addEventListener('alekseymedia:languagechange', render);
  } catch (error) {
    setStatus(status, error.message || st('product_error', 'Failed to load product.'), 'error');
  }
}

async function initCheckoutPage() {
  const form = document.getElementById('storeCheckoutForm');
  if (!form) return;

  const params = new URLSearchParams(window.location.search);
  const productId = params.get('product');
  const variantId = Number(params.get('variant'));
  const status = document.getElementById('storeCheckoutStatus');

  if (!productId || !variantId) {
    setStatus(status, st('checkout_invalid_variant', 'The selected variant is no longer available.'), 'error');
    return;
  }

  let product;
  let selectedVariant;
  let currentQuote = null;

  const refs = {
    qty: document.getElementById('checkoutQty'),
    country: document.getElementById('checkoutCountry'),
    promo: document.getElementById('checkoutPromoCode'),
    breakdownProductName: document.getElementById('checkoutBreakdownProductName'),
    breakdownProductAmount: document.getElementById('checkoutBreakdownProductAmount'),
    breakdownDeliveryMethod: document.getElementById('checkoutBreakdownDeliveryMethod'),
    breakdownShippingAmount: document.getElementById('checkoutBreakdownShippingAmount'),
    breakdownDiscountRow: document.getElementById('checkoutBreakdownDiscountRow'),
    breakdownDiscountAmount: document.getElementById('checkoutBreakdownDiscountAmount'),
    breakdownDiscountCode: document.getElementById('checkoutBreakdownDiscountCode'),
    breakdownTotalAmount: document.getElementById('checkoutBreakdownTotalAmount'),
    subtotal: document.getElementById('checkoutSubtotalAmount'),
    discountRow: document.getElementById('checkoutDiscountRow'),
    discountAmount: document.getElementById('checkoutDiscountAmount'),
    discountCode: document.getElementById('checkoutDiscountCode'),
    shipping: document.getElementById('checkoutShippingAmount'),
    total: document.getElementById('checkoutTotalAmount'),
    itemName: document.getElementById('checkoutItemName'),
    itemMeta: document.getElementById('checkoutItemMeta'),
    summaryItemName: document.getElementById('checkoutSummaryItemName'),
    summaryItemMeta: document.getElementById('checkoutSummaryItemMeta'),
    summaryPriceTop: document.getElementById('checkoutSummaryPriceTop'),
    summaryDeliveryMethod: document.getElementById('checkoutSummaryDeliveryMethod'),
    image: document.getElementById('checkoutItemImage'),
    button: document.getElementById('storeCheckoutSubmit'),
    bankDetails: document.getElementById('storeVisualBankDetails'),
  };

  const renderSummary = () => {
    if (!product || !selectedVariant) return;

    const quantity = Number(refs.qty.value || 1);
    const variantMeta = [getOption(selectedVariant, 'color')?.value, getOption(selectedVariant, 'size')?.value].filter(Boolean).join(' • ');
    const quantityMeta = `${quantity} x ${formatMoney(selectedVariant.price, product.priceRange.currency)}`;

    if (typeof setMerchImageWithLoading === 'function') {
      setMerchImageWithLoading(refs.image, selectedVariant.images?.[0]?.src || product.thumbnail, product.title);
    } else {
      refs.image.src = selectedVariant.images?.[0]?.src || product.thumbnail;
      refs.image.alt = product.title;
    }
    refs.itemName.textContent = product.title;
    refs.itemMeta.textContent = variantMeta;
    refs.summaryItemName.textContent = product.title;
    refs.summaryItemMeta.textContent = [variantMeta, quantityMeta].filter(Boolean).join(' • ');
    refs.breakdownProductName.textContent = product.title;
    refs.breakdownDeliveryMethod.textContent = 'Standard';
    refs.summaryDeliveryMethod.textContent = 'Standard';

    if (!currentQuote) {
      const fallbackSubtotal = formatMoney(selectedVariant.price * quantity, product.priceRange.currency);
      refs.summaryPriceTop.textContent = formatMoney(selectedVariant.price, product.priceRange.currency);
      refs.subtotal.textContent = fallbackSubtotal;
      refs.breakdownProductAmount.textContent = fallbackSubtotal;
      refs.shipping.textContent = '—';
      refs.breakdownShippingAmount.textContent = '—';
      refs.total.textContent = '—';
      refs.breakdownTotalAmount.textContent = '—';
      refs.discountRow.hidden = true;
      refs.breakdownDiscountRow.hidden = true;
      return;
    }

    refs.summaryPriceTop.textContent = formatMoney(currentQuote.totalAmount, currentQuote.currency);
    refs.subtotal.textContent = formatMoney(currentQuote.subtotalAmount, currentQuote.currency);
    refs.breakdownProductAmount.textContent = formatMoney(currentQuote.subtotalAmount, currentQuote.currency);
    refs.shipping.textContent = formatMoney(currentQuote.shippingAmount, currentQuote.currency);
    refs.breakdownShippingAmount.textContent = formatMoney(currentQuote.shippingAmount, currentQuote.currency);
    refs.total.textContent = formatMoney(currentQuote.totalAmount, currentQuote.currency);
    refs.breakdownTotalAmount.textContent = formatMoney(currentQuote.totalAmount, currentQuote.currency);
    refs.discountRow.hidden = !currentQuote.discountAmount;
    refs.breakdownDiscountRow.hidden = !currentQuote.discountAmount;
    refs.discountAmount.textContent = `-${formatMoney(currentQuote.discountAmount, currentQuote.currency)}`;
    refs.breakdownDiscountAmount.textContent = `-${formatMoney(currentQuote.discountAmount, currentQuote.currency)}`;
    refs.discountCode.textContent = currentQuote.promoCode || '';
    refs.breakdownDiscountCode.textContent = currentQuote.promoCode || '';
  };

  const refreshQuote = async ({ silent = false } = {}) => {
    if (!product || !selectedVariant) return;

    const country = refs.country.value.trim().toUpperCase();
    if (country.length !== 2) {
      currentQuote = null;
      renderSummary();
      if (!silent) setStatus(status, st('checkout_quote_pending', 'The final price will be calculated after you choose the country.'));
      return;
    }

    if (!silent) {
      setStatus(status, st('checkout_quote_loading', 'Calculating shipping and discount...'));
    }

    try {
      currentQuote = await apiFetch('/checkout/quote', {
        method: 'POST',
        body: JSON.stringify({
          productId,
          variantId,
          quantity: Number(refs.qty.value || 1),
          country,
          promoCode: refs.promo.value.trim() || undefined,
        }),
      });
      renderSummary();
      if (!silent) setStatus(status, '');
    } catch (error) {
      currentQuote = null;
      renderSummary();
      setStatus(status, error.message, 'error');
    }
  };

  try {
    product = await apiFetch(`/products/${encodeURIComponent(productId)}`);
    selectedVariant = findVariant(product, { variantId });
    if (!selectedVariant) {
      throw new Error(st('checkout_invalid_variant', 'The selected variant is no longer available.'));
    }

    refs.qty.value = String(Math.max(1, Math.min(10, Number(params.get('quantity') || 1))));
    renderSummary();
    await refreshQuote({ silent: false });
  } catch (error) {
    setStatus(status, error.message, 'error');
    return;
  }

  refs.country.addEventListener('change', () => refreshQuote({ silent: false }));
  refs.qty.addEventListener('change', () => refreshQuote({ silent: false }));
  refs.promo.addEventListener('blur', () => refreshQuote({ silent: false }));

  document.querySelectorAll('[data-store-visual-payment]').forEach((card) => {
    card.addEventListener('click', () => {
      document.querySelectorAll('[data-store-visual-payment]').forEach((item) => item.classList.remove('is-store-selected'));
      card.classList.add('is-store-selected');

      if (refs.bankDetails) {
        refs.bankDetails.classList.toggle('is-hidden', card.dataset.storeVisualPayment !== 'bank');
      }

      refs.button.scrollIntoView({ behavior: 'smooth', block: 'center' });
      refs.button.focus({ preventScroll: true });
    });
  });

  document.querySelectorAll('[data-copy-text]').forEach((button) => {
    button.addEventListener('click', async () => {
      const idleLabel = button.textContent;
      const doneLabel = typeof getTranslation === 'function'
        ? getTranslation(getStoreLang(), 'order_copied', 'Copied')
        : 'Copied';

      try {
        await navigator.clipboard.writeText(button.dataset.copyText || '');
        button.textContent = doneLabel;
        window.setTimeout(() => {
          button.textContent = idleLabel;
        }, 1400);
      } catch (error) {
        button.textContent = idleLabel;
      }
    });
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;

    refs.button.classList.add('is-submitting');
    refs.button.disabled = true;
    refs.button.textContent = st('checkout_redirecting', 'Redirecting to Stripe...');

    try {
      const payload = {
        productId,
        variantId,
        quantity: Number(refs.qty.value || 1),
        promoCode: refs.promo.value.trim() || undefined,
        customer: {
          firstName: form.first_name.value.trim(),
          lastName: form.last_name.value.trim(),
          email: form.email.value.trim(),
          phone: form.phone.value.trim(),
        },
        shippingAddress: {
          country: form.country.value.trim().toUpperCase(),
          region: form.region.value.trim(),
          city: form.city.value.trim(),
          zip: form.zip.value.trim(),
          address1: form.address1.value.trim(),
          address2: form.address2.value.trim(),
        },
      };

      const session = await apiFetch('/checkout/session', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      window.location.href = session.checkoutUrl;
    } catch (error) {
      refs.button.classList.remove('is-submitting');
      refs.button.disabled = false;
      refs.button.textContent = st('checkout_submit', 'Pay with Stripe ↗');
      setStatus(status, error.message, 'error');
      await refreshQuote({ silent: true });
    }
  });

  document.addEventListener('alekseymedia:languagechange', () => {
    refs.button.textContent = st('checkout_submit', 'Pay with Stripe ↗');
    renderSummary();
  });
}

async function initOrderStatusPage() {
  const mount = document.querySelector('[data-store-order-status-page]');
  if (!mount) return;

  const params = new URLSearchParams(window.location.search);
  const orderId = params.get('order');
  const status = document.getElementById('storeOrderStatus');

  if (!orderId) {
    setStatus(status, 'Missing order id', 'error');
    return;
  }

  setStatus(status, st('order_status_loading', 'Loading order status...'));

  try {
    const payload = await apiFetch(`/orders/${encodeURIComponent(orderId)}`);
    const order = payload.order;
    document.getElementById('storeOrderPublicId').textContent = order.publicId;
    document.getElementById('storeOrderPaymentValue').textContent = order.paymentStatus;
    document.getElementById('storeOrderFulfillmentValue').textContent = order.fulfillmentStatus;
    document.getElementById('storeOrderTotalValue').textContent = formatMoney(order.totalAmount, order.currency);
    setStatus(status, '');
  } catch (error) {
    setStatus(status, error.message, 'error');
  }
}

applyStoreTranslations();
initCatalogPage();
initProductPage();
initCheckoutPage();
initOrderStatusPage();

document.addEventListener('alekseymedia:languagechange', applyStoreTranslations);
