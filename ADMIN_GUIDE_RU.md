# Admin Guide

## 1. Что это за файл

Этот файл объясняет, как тебе управлять магазином после интеграции.

Тут про:

- товары
- варианты товаров
- промокоды
- заказы
- Stripe
- Printify
- webhooks
- диагностику проблем

Важно:

сейчас полноценной admin-panel в проекте ещё нет.

Поэтому управление идёт через:

- Printify dashboard
- Stripe dashboard
- PostgreSQL
- `.env`
- server logs

## 2. Где управлять товарами

Товары теперь не жёстко вшиты в HTML.

Они приходят из Printify.

Значит товаром ты управляешь в первую очередь в Printify dashboard.

### Где именно

В Printify:

- shop products
- variants
- images
- title
- description
- publish / visibility

## 3. Как добавить новый товар

### Делай так

1. Зайди в Printify
2. Создай новый product
3. Настрой blueprint
4. Добавь design
5. Включи нужные variants
6. Добавь title
7. Добавь description
8. Убедись, что product visible / published

После этого backend сможет подтянуть товар через:

- `GET /api/products`

Если товар не появился сразу, причина обычно одна из этих:

- product invisible
- wrong shop
- кеш backend ещё не истёк
- Printify product не готов

## 4. Как обновить товар

Менять товар надо в Printify.

Меняются там:

- название
- описание
- изображения
- варианты
- доступность

Код сайта для этого обычно менять не нужно.

## 5. Где в коде идёт получение товаров

Frontend:

- `storefront.js`
  - `initCatalogPage()`
  - `initProductPage()`

Backend:

- `backend/src/routes/products.routes.js`
- `backend/src/services/catalog.service.js`
- `backend/src/lib/printify.js`

Если товар не подтягивается, смотри эти файлы.

## 6. Как понять, какой shop используется

Shop ID задаётся в:

- `backend/.env`

Поле:

- `PRINTIFY_SHOP_ID`

Если у тебя несколько shop в Printify, очень важно, чтобы был указан правильный `shop_id`.

## 7. Где управлять промокодами

Промокоды хранятся в PostgreSQL в таблице:

- `promo_codes`

Создаются первоначально через:

- `backend/db/schema.sql`

Но после этого удобнее управлять ими SQL-запросами напрямую.

## 8. Логика промокодов

Сейчас логика такая:

- один код = максимум одно использование
- код резервируется при checkout
- если checkout не оплатили, резерв снимается
- если Stripe оплату подтвердил, код окончательно списывается

То есть один и тот же промокод нельзя гонять бесконечно.

## 9. Как посмотреть все промокоды

SQL:

```sql
SELECT
  code,
  discount_percent,
  max_redemptions,
  redemptions_count,
  is_active,
  reserved_by_order_id,
  reserved_until,
  redeemed_by_order_id,
  redeemed_at
FROM promo_codes
ORDER BY code ASC;
```

## 10. Как добавить новый промокод

Пример SQL:

```sql
INSERT INTO promo_codes (code, discount_percent, max_redemptions)
VALUES ('NEWDROP15', 15, 1);
```

Если нужен многоразовый код, например на 20 использований:

```sql
INSERT INTO promo_codes (code, discount_percent, max_redemptions)
VALUES ('SUMMER10', 10, 20);
```

## 11. Как отключить промокод

```sql
UPDATE promo_codes
SET is_active = FALSE,
    updated_at = NOW()
WHERE code = 'NEWDROP15';
```

## 12. Как снова включить промокод

```sql
UPDATE promo_codes
SET is_active = TRUE,
    updated_at = NOW()
WHERE code = 'NEWDROP15';
```

## 13. Как удалить промокод

```sql
DELETE FROM promo_codes
WHERE code = 'NEWDROP15';
```

Обычно лучше не удалять, а выключать через `is_active = FALSE`.

## 14. Как вручную освободить зависший промокод

Если вдруг checkout оборвался, а код остался в reserve:

```sql
UPDATE promo_codes
SET reserved_by_order_id = NULL,
    reserved_until = NULL,
    updated_at = NOW()
WHERE code = 'ALMA26ZX09'
  AND redeemed_by_order_id IS NULL;
```

## 15. Как посмотреть заказы

Главная таблица:

- `orders`

Посмотреть заказы:

```sql
SELECT
  public_id,
  payment_status,
  fulfillment_status,
  printify_status,
  promo_code,
  subtotal_amount,
  discount_amount,
  shipping_amount,
  total_amount,
  customer_email,
  created_at
FROM orders
ORDER BY created_at DESC;
```

## 16. Как посмотреть товары внутри заказа

```sql
SELECT
  o.public_id,
  oi.product_title,
  oi.variant_title,
  oi.option_color,
  oi.option_size,
  oi.quantity,
  oi.unit_amount,
  oi.total_amount
FROM orders o
JOIN order_items oi ON oi.order_id = o.id
WHERE o.public_id = 'AM-EXAMPLE';
```

## 17. Что значат статусы заказа

### payment_status

Может быть:

- `pending`
  - заказ создан, но Stripe session ещё не завершена
- `checkout_created`
  - Stripe session создана
- `paid`
  - оплата подтверждена
- `payment_failed`
  - Stripe сообщил о неудачной оплате
- `expired`
  - session истекла

### fulfillment_status

Может быть:

- `pending`
  - ещё не отправляли в Printify
- `submitted_to_printify`
  - заказ создан в Printify
- `in_production`
  - ушёл в производство
- `shipped`
  - отправлен
- `delivered`
  - доставлен
- `printify_failed`
  - попытка создать заказ в Printify упала

### printify_status

Это либо тип события Printify, либо текущий статус из payload Printify.

## 18. Как понять, что заказ реально ушёл в Printify

Смотри в таблице `orders`:

- `printify_order_id` не пустой
- `fulfillment_status = submitted_to_printify` или дальше

SQL:

```sql
SELECT
  public_id,
  printify_order_id,
  fulfillment_status,
  printify_status,
  created_at
FROM orders
ORDER BY created_at DESC;
```

## 19. Как найти заказ по email

```sql
SELECT
  public_id,
  payment_status,
  fulfillment_status,
  total_amount,
  customer_email,
  created_at
FROM orders
WHERE customer_email = 'user@example.com'
ORDER BY created_at DESC;
```

## 20. Как найти заказ по Printify order id

```sql
SELECT *
FROM orders
WHERE printify_order_id = '123456789';
```

## 21. Как посмотреть webhook события

Таблица:

- `webhook_events`

Запрос:

```sql
SELECT provider, event_id, processed_at
FROM webhook_events
ORDER BY processed_at DESC
LIMIT 100;
```

Это полезно, если хочешь понять:

- приходят ли Stripe webhooks
- приходят ли Printify webhooks

## 22. Где смотреть Stripe часть

Stripe лучше смотреть в Stripe Dashboard.

Там смотри:

- Payments
- Checkout Sessions
- Webhooks
- Event deliveries

Если что-то не так с оплатой, сначала проверь именно Stripe dashboard.

## 23. Где смотреть Printify часть

В Printify смотри:

- Orders
- Products
- Webhooks
- Shop settings

Если товар есть на сайте, но заказ не пошёл в производство, проверь:

- создался ли order в Printify
- не упал ли webhook
- не заблокирован ли variant

## 24. Как вручную зарегистрировать Printify webhooks

Команда:

```bash
npm run printify:webhooks
```

Файл:

- `backend/src/scripts/register-printify-webhooks.js`

Перед запуском проверь:

- `APP_BASE_URL`
- `PRINTIFY_WEBHOOK_TOKEN`
- `PRINTIFY_API_TOKEN`

## 25. Как ротировать ключи безопасно

### Printify

1. Создаёшь новый token
2. Меняешь `PRINTIFY_API_TOKEN` в `backend/.env`
3. Перезапускаешь backend
4. Проверяешь `api/health` и каталог
5. Старый token удаляешь

### Stripe

1. Меняешь `STRIPE_SECRET_KEY`
2. При необходимости создаёшь новый webhook secret
3. Меняешь `STRIPE_WEBHOOK_SECRET`
4. Перезапускаешь backend

## 26. Как перезапускать backend после изменений

Если сервер на `systemd`:

```bash
sudo systemctl restart alekseymedia
sudo systemctl status alekseymedia
```

Логи:

```bash
sudo journalctl -u alekseymedia -f
```

## 27. Как понять, почему каталог не загружается

Смотри по порядку:

1. `api/health` жив?
2. backend process жив?
3. правильный ли `PRINTIFY_API_TOKEN`?
4. правильный ли `PRINTIFY_SHOP_ID`?
5. есть ли товары в shop?
6. открывается ли `GET /api/products`?

## 28. Как понять, почему checkout не создаётся

Смотри:

- `backend/src/routes/checkout.routes.js`
- `backend/src/services/checkout.service.js`
- `backend/src/validation/store.js`
- логи сервера

Типичные причины:

- страна не указана
- variant недоступен
- shipping profile не найден
- промокод уже использован
- Stripe key неправильный

## 29. Как понять, почему промокод не проходит

Проверь:

1. есть ли код в `promo_codes`
2. `is_active = true`
3. `redemptions_count < max_redemptions`
4. не висит ли `reserved_until` на активном резерве

Запрос:

```sql
SELECT *
FROM promo_codes
WHERE code = 'ALMA26ZX09';
```

## 30. Где менять тексты storefront страниц

Файл:

- `storefront.js`

Там есть объект:

- `storeTranslations`

В нём лежат тексты для:

- `lv`
- `ru`
- `en`

Если хочешь менять тексты каталога, товара, checkout и success/cancel страниц, ищи именно там.

## 31. Где менять внешний вид storefront

Файл:

- `styles.css`

Блоки по storefront находятся в нижней части файла.

Ищи классы:

- `.store-shell`
- `.store-catalog-grid`
- `.store-product-layout`
- `.store-checkout-layout`
- `.store-checkout-summary-panel`
- `.store-choice-btn`

## 32. Что legacy и что можно не трогать

Сейчас старые страницы:

- `order.html`
- `order-delivery.html`
- `order-payment.html`

не являются основным рабочим flow для Printify + Stripe.

Если ты управляешь новым магазином, в первую очередь работай с:

- `merch.html`
- `product.html`
- `checkout.html`
- `storefront.js`
- `backend/*`

## 33. Что ещё полезно сделать потом

В будущем я рекомендую добавить:

1. простую admin-panel для заказов
2. страницу управления промокодами
3. выгрузку заказов в CSV
4. повторную отправку order в Printify вручную
5. retry queue для ошибок fulfillment

Сейчас этого ещё нет, но текущая база уже подготовлена для таких задач.

## 34. Самые важные admin-задачи коротко

### Если хочешь добавить товар

- делай это в Printify

### Если хочешь добавить промокод

- делай `INSERT` в `promo_codes`

### Если хочешь проверить заказ

- смотри таблицу `orders`

### Если хочешь проверить webhook

- смотри `webhook_events`

### Если хочешь проверить оплату

- смотри Stripe Dashboard

### Если хочешь проверить fulfillment

- смотри Printify Dashboard + `orders.printify_order_id`
