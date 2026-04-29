# Deploy Guide

## 1. Что именно мы деплоим

Текущий проект теперь состоит из 2 частей:

- frontend
  - обычные HTML/CSS/JS страницы
  - они лежат в корне проекта
- backend
  - `Node.js + Express`
  - он лежит в `backend/`
  - он же отдаёт frontend-страницы как static files

То есть в проде тебе не нужно поднимать отдельно фронт и отдельно API.

Можно сделать проще:

- один сервер
- один домен
- один backend process
- один PostgreSQL

## 2. Рекомендуемая схема продакшена

Самый понятный вариант:

- VPS / dedicated server / cloud VM
- Ubuntu 22.04 или 24.04
- Node.js 20+
- PostgreSQL 15+
- Nginx
- HTTPS через Let's Encrypt

Схема:

- `https://tvoi-domen.com` -> `Nginx`
- `Nginx` проксирует на `http://127.0.0.1:4000`
- `Node/Express` обслуживает:
  - страницы сайта
  - `/api/*`
  - Stripe webhooks
  - Printify webhooks

## 3. Почему именно так

Потому что у тебя:

- не Next.js
- не React SSR
- не отдельный frontend build
- frontend уже статический

Значит не надо усложнять архитектуру.

## 4. Что нужно подготовить до деплоя

Тебе нужны:

- домен
- VPS с Ubuntu
- новый Printify token
- Stripe secret key
- Stripe webhook secret
- PostgreSQL database
- публичный HTTPS URL

Важно:

- Printify webhook не сможет работать на `localhost`
- Stripe webhook в проде тоже должен смотреть на публичный HTTPS endpoint

## 5. Пример production env

Файл:

- `backend/.env`

Пример:

```env
NODE_ENV=production
PORT=4000
APP_BASE_URL=https://alekseymedia.com
DATABASE_URL=postgresql://aleksey_store_user:very_strong_password@127.0.0.1:5432/alekseymedia_store
STORE_CURRENCY=EUR
STRIPE_SECRET_KEY=sk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
PRINTIFY_API_TOKEN=printify_pat_xxx
PRINTIFY_SHOP_ID=1234567
PRINTIFY_USER_AGENT=AlekseyMediaStore/1.0
PRINTIFY_WEBHOOK_TOKEN=super_long_random_secret_value_here
```

## 6. Подготовка сервера Ubuntu

Подключись по SSH.

### Установи базовые пакеты

```bash
sudo apt update
sudo apt install -y curl git nginx postgresql postgresql-contrib ca-certificates
```

### Установи Node.js 20

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
node -v
npm -v
```

## 7. Создание пользователя под приложение

```bash
sudo adduser --system --group --home /var/www/alekseymedia alekseymedia
sudo mkdir -p /var/www/alekseymedia
sudo chown -R alekseymedia:alekseymedia /var/www/alekseymedia
```

## 8. Загрузка проекта на сервер

### Вариант 1. Через git

Если проект в git:

```bash
sudo -u alekseymedia git clone <repo_url> /var/www/alekseymedia/app
```

### Вариант 2. Через архив / SFTP

Скопируй весь проект в:

- `/var/www/alekseymedia/app`

Важно:

- папка `backend/` должна быть внутри проекта
- root HTML-файлы тоже должны быть внутри проекта

## 9. Установка backend зависимостей

```bash
cd /var/www/alekseymedia/app/backend
sudo -u alekseymedia npm install
```

Если хочешь более строгий install:

```bash
sudo -u alekseymedia npm ci
```

Но только если у тебя будет lockfile.

## 10. Создание базы PostgreSQL

Зайди в postgres:

```bash
sudo -u postgres psql
```

Дальше:

```sql
CREATE DATABASE alekseymedia_store;
CREATE USER aleksey_store_user WITH ENCRYPTED PASSWORD 'very_strong_password';
GRANT ALL PRIVILEGES ON DATABASE alekseymedia_store TO aleksey_store_user;
\q
```

Теперь примени схему:

```bash
psql "postgresql://aleksey_store_user:very_strong_password@127.0.0.1:5432/alekseymedia_store" -f "/var/www/alekseymedia/app/backend/db/schema.sql"
```

## 11. Создание production .env

Создай файл:

- `/var/www/alekseymedia/app/backend/.env`

Заполни его production значениями.

Права можно ограничить:

```bash
sudo chown alekseymedia:alekseymedia /var/www/alekseymedia/app/backend/.env
sudo chmod 600 /var/www/alekseymedia/app/backend/.env
```

## 12. Проверка backend вручную

Сначала убедись, что backend вообще стартует.

```bash
cd /var/www/alekseymedia/app/backend
sudo -u alekseymedia npm start
```

Если всё ок, останови `Ctrl+C` и переходи к systemd.

## 13. Настройка systemd

Создай файл:

- `/etc/systemd/system/alekseymedia.service`

Содержимое:

```ini
[Unit]
Description=AlekseyMedia Printify Store
After=network.target postgresql.service

[Service]
Type=simple
User=alekseymedia
Group=alekseymedia
WorkingDirectory=/var/www/alekseymedia/app/backend
ExecStart=/usr/bin/node src/server.js
Restart=always
RestartSec=5
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
```

Дальше:

```bash
sudo systemctl daemon-reload
sudo systemctl enable alekseymedia
sudo systemctl start alekseymedia
sudo systemctl status alekseymedia
```

Просмотр логов:

```bash
sudo journalctl -u alekseymedia -f
```

## 14. Настройка Nginx

Создай файл:

- `/etc/nginx/sites-available/alekseymedia`

Содержимое:

```nginx
server {
    listen 80;
    server_name alekseymedia.com www.alekseymedia.com;

    client_max_body_size 10m;

    location / {
        proxy_pass http://127.0.0.1:4000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

Включи сайт:

```bash
sudo ln -s /etc/nginx/sites-available/alekseymedia /etc/nginx/sites-enabled/alekseymedia
sudo nginx -t
sudo systemctl reload nginx
```

## 15. HTTPS через Let's Encrypt

Установи certbot:

```bash
sudo apt install -y certbot python3-certbot-nginx
```

Запусти:

```bash
sudo certbot --nginx -d alekseymedia.com -d www.alekseymedia.com
```

После этого:

- сайт будет на HTTPS
- Stripe и Printify смогут ходить в webhooks нормально

## 16. Проверка сайта после деплоя

Открой:

- `https://alekseymedia.com/`
- `https://alekseymedia.com/merch.html`
- `https://alekseymedia.com/api/health`

Ожидание:

- главная грузится
- каталог открывается
- `/api/health` возвращает JSON `{ "ok": true }`

## 17. Настройка Stripe в проде

### В Stripe Dashboard

Добавь webhook endpoint:

- `https://alekseymedia.com/api/webhooks/stripe`

События, которые нужны:

- `checkout.session.completed`
- `checkout.session.async_payment_succeeded`
- `checkout.session.async_payment_failed`
- `checkout.session.expired`

После создания webhook Stripe даст secret вида:

- `whsec_...`

Его нужно вставить в:

- `STRIPE_WEBHOOK_SECRET`

## 18. Настройка Printify webhook в проде

Тут есть 2 шага.

### Шаг 1. Проверь env

Убедись, что:

- `APP_BASE_URL=https://alekseymedia.com`
- `PRINTIFY_WEBHOOK_TOKEN=...`

### Шаг 2. Зарегистрируй webhooks

```bash
cd /var/www/alekseymedia/app/backend
sudo -u alekseymedia npm run printify:webhooks
```

Скрипт создаст webhooks на URL вида:

```text
https://alekseymedia.com/api/webhooks/printify?token=YOUR_SECRET
```

## 19. Как обновлять проект после изменений

Если проект загружен через git:

```bash
cd /var/www/alekseymedia/app
sudo -u alekseymedia git pull
cd backend
sudo -u alekseymedia npm install
sudo systemctl restart alekseymedia
```

Если менялась схема БД:

- вручную применяй новые SQL изменения
- или обновляй `schema.sql` и вноси изменения аккуратно через SQL

## 20. Как откатываться

Самый безопасный способ:

1. хранить код в git
2. перед деплоем делать commit
3. на сервере после неудачного релиза делать checkout на предыдущую ревизию

Пример:

```bash
cd /var/www/alekseymedia/app
sudo -u alekseymedia git log --oneline -n 5
sudo -u alekseymedia git checkout <old_commit>
cd backend
sudo systemctl restart alekseymedia
```

Важно:

- не делай `git reset --hard` без понимания
- не затирай `.env`

## 21. Что делать, если каталог пустой в проде

Проверь по порядку:

1. `https://alekseymedia.com/api/health`
2. логи сервера
   - `sudo journalctl -u alekseymedia -f`
3. верный ли `PRINTIFY_API_TOKEN`
4. верный ли `PRINTIFY_SHOP_ID`
5. есть ли товары в Printify shop
6. товары published / visible

## 22. Что делать, если Stripe оплата проходит, но заказ не создаётся в Printify

Проверь:

1. Stripe webhook вообще доходит?
2. правильный ли `STRIPE_WEBHOOK_SECRET`
3. есть ли ошибки в `journalctl`
4. правильный ли `PRINTIFY_API_TOKEN`
5. доступен ли Printify API

Смотреть файлы:

- `backend/src/routes/webhooks.routes.js`
- `backend/src/services/checkout.service.js`
- `backend/src/lib/printify.js`

## 23. Что делать, если Printify не обновляет статус

Проверь:

1. публичен ли домен
2. работает ли `https://alekseymedia.com/api/webhooks/printify?token=...`
3. совпадает ли `PRINTIFY_WEBHOOK_TOKEN`
4. зарегистрировались ли webhooks через `npm run printify:webhooks`

## 24. Railway / Render / другой хостинг

Если не хочешь VPS, можно деплоить и туда.

Но тогда всё равно нужно:

- Node backend service
- PostgreSQL service
- env variables
- публичный HTTPS URL

На таких сервисах логика такая же:

1. загружаешь репозиторий
2. root service для backend = `backend`
3. build command = `npm install`
4. start command = `npm start`
5. задаёшь env
6. подключаешь PostgreSQL
7. один раз применяешь `db/schema.sql`
8. регистрируешь Stripe и Printify webhooks

Но для твоего текущего проекта VPS обычно проще и понятнее.

## 25. Рекомендуемый production checklist

Перед запуском проверь:

- [ ] новый Printify token
- [ ] рабочий Stripe secret
- [ ] рабочий Stripe webhook secret
- [ ] PostgreSQL доступен
- [ ] `schema.sql` применён
- [ ] `.env` заполнен
- [ ] backend стартует без ошибок
- [ ] `api/health` отвечает
- [ ] каталог товаров грузится
- [ ] checkout создаёт Stripe session
- [ ] Stripe webhook приходит
- [ ] Printify order создаётся
- [ ] Printify webhook обновляет статус

## 26. Самый короткий путь к продакшену

Если коротко, делай так:

1. VPS Ubuntu
2. Node 20
3. PostgreSQL
4. Nginx
5. `.env`
6. `schema.sql`
7. `systemd`
8. `certbot`
9. Stripe webhook
10. `npm run printify:webhooks`

После этого у тебя будет полностью рабочая связка:

- сайт
- Stripe
- Printify
- база заказов
- промокоды
- webhook обновления
