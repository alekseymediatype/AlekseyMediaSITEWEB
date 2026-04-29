# Printify + Stripe Integration Guide

## 1. Что сейчас сделано

В проект добавлена новая схема магазина:

- `merch.html` -> каталог товаров из Printify через backend API
- `product.html` -> страница одного товара с вариантами
- `checkout.html` -> checkout-страница с адресом, промокодом и Stripe
- после успешной оплаты backend автоматически создаёт заказ в Printify
- статус заказа хранится в PostgreSQL
- Stripe и Printify webhooks обновляют состояние заказа

Важно:

- старые страницы `order.html`, `order-delivery.html`, `order-payment.html` сейчас не являются основным рабочим flow
- основной новый flow теперь идёт через `merch.html -> product.html -> checkout.html`

## 2. Важное предупреждение по ключу

Ты присылал Printify token в чат.

Этот token уже считается скомпрометированным.

Нужно сделать так:

1. Зайти в Printify
2. Отозвать старый token
3. Создать новый token
4. Вставить новый token только в `backend/.env`

Никогда не вставляй Printify token в `script.js`, `storefront.js`, HTML или CSS.

## 3. Структура проекта

### Frontend, корень проекта

- `index.html`
  - главная страница сайта
- `merch.html`
  - новая страница каталога, теперь работает через backend API
- `product.html`
  - новая страница товара
- `checkout.html`
  - новая страница checkout
- `checkout-success.html`
  - страница после успешной оплаты
- `checkout-cancel.html`
  - страница после отмены оплаты
- `storefront.js`
  - вся новая storefront-логика каталога, товара, checkout, order status
- `script.js`
  - старая общая логика сайта: языки, анимации, контактная форма, старые merch/order вещи
- `styles.css`
  - все общие стили сайта, плюс новые стили storefront и checkout

### Backend

- `backend/package.json`
  - зависимости backend и npm scripts
- `backend/.env.example`
  - пример env-переменных
- `backend/db/schema.sql`
  - схема таблиц PostgreSQL

### Backend source

- `backend/src/server.js`
  - старт сервера
- `backend/src/app.js`
  - Express app, routes, static serving, CORS, error handling
- `backend/src/config/env.js`
  - загрузка и валидация env-переменных через `zod`
- `backend/src/lib/db.js`
  - подключение к PostgreSQL
- `backend/src/lib/stripe.js`
  - Stripe client
- `backend/src/lib/printify.js`
  - Printify API client
- `backend/src/lib/http-error.js`
  - единый HTTP error class
- `backend/src/lib/async-handler.js`
  - обёртка для async Express handlers

### Backend validation

- `backend/src/validation/store.js`
  - валидация запросов для quote и checkout

### Backend repositories

- `backend/src/repositories/orders.repository.js`
  - создание и обновление заказов в БД
- `backend/src/repositories/promo-codes.repository.js`
  - логика одноразовых промокодов

### Backend services

- `backend/src/services/catalog.service.js`
  - получение и нормализация товаров Printify
- `backend/src/services/checkout.service.js`
  - quote, Stripe session, создание заказа в Printify, webhook flow

### Backend routes

- `backend/src/routes/products.routes.js`
  - API каталога
- `backend/src/routes/checkout.routes.js`
  - API quote и Stripe checkout session
- `backend/src/routes/orders.routes.js`
  - API статуса заказа
- `backend/src/routes/webhooks.routes.js`
  - Stripe webhook + Printify webhook

### Backend scripts

- `backend/src/scripts/register-printify-webhooks.js`
  - регистрация Printify webhook endpoints в твоём shop

## 4. Как работает flow заказа

### Полный путь

1. Клиент открывает `merch.html`
2. `storefront.js` делает запрос в `GET /api/products`
3. Backend идёт в Printify и получает товары shop
4. Клиент открывает `product.html?id=...`
5. `storefront.js` делает запрос в `GET /api/products/:productId`
6. Клиент выбирает вариант и переходит в `checkout.html`
7. На checkout frontend делает `POST /api/checkout/quote`
8. Backend:
   - проверяет variant
   - считает shipping
   - проверяет промокод
   - возвращает сумму
9. Клиент нажимает кнопку Stripe
10. Frontend делает `POST /api/checkout/session`
11. Backend:
   - создаёт заказ в БД
   - резервирует промокод
   - создаёт Stripe Checkout Session
12. Клиент уходит в Stripe
13. После оплаты Stripe вызывает webhook
14. Backend:
   - помечает заказ как `paid`
   - окончательно списывает промокод
   - создаёт Printify order
15. Printify отправляет webhook по статусам
16. Backend обновляет `fulfillment_status` и `printify_status`

## 5. Какие страницы теперь рабочие

### Рабочие страницы нового flow

- `merch.html`
- `product.html`
- `checkout.html`
- `checkout-success.html`
- `checkout-cancel.html`

### Старые страницы

- `order.html`
- `order-delivery.html`
- `order-payment.html`

Они сейчас остались в проекте как старый интерфейс, но не являются основным Printify + Stripe flow.

## 6. Что находится в `storefront.js`

Это главный файл нового магазина на frontend.

### Основные части

- переводы storefront-текста
- `apiFetch()`
  - запросы в backend API
  - fallback на `localhost:4000/api` для локальной разработки
- `initCatalogPage()`
  - логика каталога для `merch.html`
- `initProductPage()`
  - логика страницы товара
- `initCheckoutPage()`
  - логика checkout
- `initOrderStatusPage()`
  - логика success-страницы со статусом заказа

### Если что-то не работает на storefront

Первым делом проверяй:

- `F12 -> Console`
- `F12 -> Network`
- доступен ли `http://localhost:4000/api/health`

## 7. Что находится в `backend/src/lib/printify.js`

Тут лежат прямые запросы в Printify API.

Используются такие методы:

- `listShops()`
- `getShopProducts()`
- `getShopProduct(productId)`
- `getShippingProfiles(blueprintId, printProviderId)`
- `createPrintifyOrder(payload)`
- `listPrintifyWebhooks()`
- `createPrintifyWebhook(payload)`

То есть вся работа с Printify идёт только отсюда.

Если надо менять endpoint Printify или request body, смотри сюда первым.

## 8. Что находится в `backend/src/services/catalog.service.js`

Этот файл делает из сырого ответа Printify нормальный формат для frontend.

Тут происходит:

- кеширование товаров
- очистка HTML из описаний
- сбор вариантов товара
- выделение color/size options
- подбор изображений под вариант
- расчёт shipping quote

Frontend не работает с сырым ответом Printify напрямую.
Он получает уже нормализованные данные именно из этого service.

## 9. Что находится в `backend/src/services/checkout.service.js`

Это главный backend-файл всей логики заказа.

### Там происходит:

- `buildCheckoutQuote(input)`
  - получает товар
  - получает variant
  - считает доставку
  - применяет промокод
  - возвращает breakdown суммы

- `createCheckoutSession(input)`
  - создаёт заказ в БД
  - резервирует промокод
  - создаёт Stripe Checkout Session

- `submitPaidOrderToPrintify(order)`
  - после оплаты создаёт реальный заказ в Printify

- `handleStripeEvent(event)`
  - принимает Stripe webhook
  - помечает заказ как `paid`
  - redeem промокод
  - создаёт Printify order

- `handlePrintifyEvent(payload)`
  - принимает Printify webhook
  - обновляет статус заказа в БД

Если ломается логика оплаты, искать проблему нужно почти всегда тут.

## 10. Что находится в `orders.repository.js`

Этот файл работает с таблицами заказов.

Тут есть:

- `createOrder()`
- `updateOrderStripeSession()`
- `markOrderPaid()`
- `markOrderPaymentFailed()`
- `markOrderExpired()`
- `attachPrintifyOrder()`
- `markPrintifyFailed()`
- `updateOrderFromPrintifyEvent()`
- `recordWebhookEvent()`
- `deleteWebhookEvent()`
- `getOrderByPublicId()`
- `getOrderByStripeSessionId()`

Это слой между business logic и PostgreSQL.

## 11. Что находится в `promo-codes.repository.js`

Этот файл отвечает за одноразовые промокоды.

### Логика такая

- код можно использовать только один раз
- пока checkout не оплачен, код резервируется на 30 минут
- если checkout не удался или истёк, резерв снимается
- если Stripe подтвердил оплату, код окончательно списывается

### Основные методы

- `getPromoCodeForPreview(code)`
  - проверить, доступен ли код для расчёта
- `reservePromoCodeForOrder(client, code, orderId)`
  - зарезервировать код под конкретный заказ
- `releasePromoCodeReservation(orderId)`
  - снять резерв
- `redeemPromoCodeReservation(orderId)`
  - окончательно использовать код

## 12. Где лежат промокоды

Все промокоды сейчас сидят в:

- `backend/db/schema.sql`

Там они добавляются через `INSERT INTO promo_codes ...`

### Старые коды

- `ALMA26ZX09` -> 10%
- `YXASWD206` -> 10%
- `ALEKSEYPRODUCTION` -> 5%

### Новые коды

15%:

- `DRIP15`
- `STREET15`
- `HOOD15`
- `STYLE15`
- `FLEX15`
- `URBAN15`
- `WAVE15`
- `CAP15`
- `VIBE15`
- `DROP15`

10%:

- `SAVE10`
- `MERCH10`
- `FIT10`
- `SWAG10`
- `LOOK10`
- `BASIC10`
- `DAILY10`
- `STREET10`
- `COOL10`
- `STYLE10`

5%:

- `MINI5`
- `TRY5`
- `START5`
- `NEW5`
- `HELLO5`
- `CAP5`
- `FIT5`
- `EASY5`
- `SMALL5`
- `QUICK5`

Если хочешь добавить новые коды, добавляй их в таблицу `promo_codes`.

## 13. Что лежит в базе данных

Схема находится в:

- `backend/db/schema.sql`

### Таблица `orders`

Хранит:

- публичный id заказа
- stripe session id
- stripe payment intent id
- printify order id
- payment status
- fulfillment status
- printify status
- promo code
- subtotal
- discount
- shipping
- total
- customer данные
- shipping address
- metadata

### Таблица `order_items`

Хранит:

- product id
- variant id
- sku
- название товара
- название варианта
- цвет
- размер
- image url
- quantity
- price

### Таблица `webhook_events`

Нужна для идемпотентности.

То есть если Stripe или Printify повторно пришлют один и тот же webhook, backend не обработает его два раза.

### Таблица `promo_codes`

Хранит:

- code
- discount percent
- сколько максимум использований
- сколько уже использовано
- активен ли код
- кем зарезервирован
- кем уже использован

## 14. ENV-переменные

Пример лежит в:

- `backend/.env.example`

Нужно создать файл:

- `backend/.env`

### Основные поля

- `NODE_ENV`
- `PORT`
- `APP_BASE_URL`
- `DATABASE_URL`
- `STORE_CURRENCY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `PRINTIFY_API_TOKEN`
- `PRINTIFY_SHOP_ID`
- `PRINTIFY_USER_AGENT`
- `PRINTIFY_WEBHOOK_TOKEN`

### Пример

```env
NODE_ENV=development
PORT=4000
APP_BASE_URL=http://localhost:4000
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/alekseymedia_store
STORE_CURRENCY=EUR
STRIPE_SECRET_KEY=sk_live_or_test_here
STRIPE_WEBHOOK_SECRET=whsec_here
PRINTIFY_API_TOKEN=printify_pat_here
PRINTIFY_SHOP_ID=1234567
PRINTIFY_USER_AGENT=AlekseyMediaStore/1.0
PRINTIFY_WEBHOOK_TOKEN=super_long_random_secret
```

## 15. Как правильно запускать локально

### Шаг 1. Установить backend зависимости

Открой PowerShell в папке `backend` и выполни:

```powershell
npm install
```

### Шаг 2. Создать PostgreSQL базу

Создай базу, например:

- имя: `alekseymedia_store`

### Шаг 3. Применить схему

Если у тебя установлен `psql`, выполни:

```powershell
psql "$env:DATABASE_URL" -f ".\db\schema.sql"
```

Или вставь содержимое `backend/db/schema.sql` через pgAdmin / DBeaver / TablePlus.

### Шаг 4. Создать `.env`

Скопируй:

- `backend/.env.example`

в:

- `backend/.env`

и заполни настоящими значениями.

### Шаг 5. Запустить backend

```powershell
npm run dev
```

### Шаг 6. Открывать сайт правильно

Лучше всего открывать не через `file://`, а так:

```text
http://localhost:4000/merch.html
```

Тогда и frontend, и backend будут на одном origin.

## 16. Почему раньше было `Failed to fetch`

Потому что storefront ходит в backend API.

Если backend не запущен, frontend не может получить товары.

Сейчас добавлен fallback:

- `/api`
- `http://localhost:4000/api`
- `http://127.0.0.1:4000/api`

Но backend всё равно должен быть запущен.

## 17. Stripe webhook

Route:

- `POST /api/webhooks/stripe`

Файл:

- `backend/src/routes/webhooks.routes.js`

Логика:

- проверяется подпись Stripe через `STRIPE_WEBHOOK_SECRET`
- дальше event уходит в `handleStripeEvent()`

### Локальный запуск Stripe webhook

Если используешь Stripe CLI:

```powershell
stripe listen --forward-to localhost:4000/api/webhooks/stripe
```

Stripe CLI покажет `whsec_...`.
Его нужно вставить в `backend/.env` как `STRIPE_WEBHOOK_SECRET`.

## 18. Printify webhook

Route:

- `POST /api/webhooks/printify?token=...`

Файл:

- `backend/src/routes/webhooks.routes.js`

Логика:

- сравнивается `token` из query string с `PRINTIFY_WEBHOOK_TOKEN`
- дальше event уходит в `handlePrintifyEvent()`

### Почему тут token, а не signature

Потому что в публичной документации Printify сейчас нет нормально задокументированной схемы подписи webhook, как у Stripe.

Поэтому используется безопасный длинный секрет в URL.

### Важно

Printify не сможет достучаться до `localhost` из интернета.

Для реальных webhook тебе нужен публичный HTTPS URL:

- VPS
- Vercel + отдельный API server
- Railway
- Render
- Cloudflare Tunnel
- ngrok

## 19. Регистрация Printify webhooks

Файл:

- `backend/src/scripts/register-printify-webhooks.js`

Команда:

```powershell
npm run printify:webhooks
```

Что делает:

- создаёт webhooks на события:
  - `order:created`
  - `order:updated`
  - `order:shipment:created`
  - `order:shipment:delivered`
  - `order:sent-to-production`

Важно:

- `APP_BASE_URL` должен быть публичным URL, если хочешь реальные Printify webhooks

## 20. Какие API endpoints у backend

### Products

- `GET /api/products`
- `GET /api/products/:productId`

### Checkout

- `POST /api/checkout/quote`
- `POST /api/checkout/session`

### Orders

- `GET /api/orders/:publicId`

### Webhooks

- `POST /api/webhooks/stripe`
- `POST /api/webhooks/printify?token=...`

## 21. Как проверить, что всё работает

### Backend health

Открой:

```text
http://localhost:4000/api/health
```

Должен прийти JSON:

```json
{ "ok": true }
```

### Каталог

Открой:

```text
http://localhost:4000/merch.html
```

Если товары не показываются:

1. открой `F12 -> Console`
2. открой `F12 -> Network`
3. проверь запрос `GET /api/products`

### Checkout

1. зайди в товар
2. выбери variant
3. перейди в checkout
4. введи адрес
5. нажми Stripe

### Success page

После оплаты:

- откроется `checkout-success.html`
- там подтянется статус заказа по `GET /api/orders/:publicId`

## 22. Что сейчас можно ещё улучшить

На текущий момент scaffold уже рабочий по архитектуре, но для production я бы ещё доделал:

1. админ-страницу заказов
2. логирование в файл или Sentry
3. отдельную миграционную систему вместо одного `schema.sql`
4. фоновый retry для Printify create order, если Printify временно недоступен
5. очистку старых `reserved` промокодов cron-задачей
6. отдельный inventory cache
7. более точный выбор shipping method, если захочешь несколько типов доставки

## 23. Что важно не забыть

- не хранить ключи на frontend
- не пушить `.env` в git
- открыть сайт через backend origin, а не просто через файл
- использовать новый Printify token, а не тот, который был отправлен в чат

## 24. Где искать проблему по типу ошибки

### Если не грузится каталог

Смотри:

- `storefront.js`
- `backend/src/routes/products.routes.js`
- `backend/src/services/catalog.service.js`
- `backend/src/lib/printify.js`

### Если не создаётся checkout

Смотри:

- `storefront.js`
- `backend/src/routes/checkout.routes.js`
- `backend/src/services/checkout.service.js`
- `backend/src/validation/store.js`

### Если оплата прошла, но заказ не создался в Printify

Смотри:

- Stripe webhook route
- `handleStripeEvent()` в `checkout.service.js`
- `createPrintifyOrder()` в `lib/printify.js`

### Если Printify заказ создался, но статус не обновляется

Смотри:

- `backend/src/routes/webhooks.routes.js`
- `handlePrintifyEvent()`
- `APP_BASE_URL`
- `PRINTIFY_WEBHOOK_TOKEN`
- публичен ли URL backend

## 25. Кратко: с чего тебе начать прямо сейчас

Если коротко, порядок такой:

1. Отозвать старый Printify token
2. Заполнить `backend/.env`
3. Поднять PostgreSQL
4. Выполнить `backend/db/schema.sql`
5. Запустить `npm install`
6. Запустить `npm run dev`
7. Открыть `http://localhost:4000/merch.html`
8. Настроить Stripe webhook
9. Настроить публичный URL для Printify webhook

---

Если хочешь, следующим сообщением я могу ещё сделать второй файл:

- `DEPLOY_RU.md`

где будет уже отдельно расписано, как это выкатывать на сервер или хостинг шаг за шагом.
