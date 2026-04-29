import express from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { env } from './config/env.js';
import { HttpError, isHttpError } from './lib/http-error.js';
import webhooksRouter from './routes/webhooks.routes.js';
import productsRouter from './routes/products.routes.js';
import checkoutRouter from './routes/checkout.routes.js';
import ordersRouter from './routes/orders.routes.js';
import promoCodesRouter from './routes/promo-codes.routes.js';

const projectRoot = path.resolve(fileURLToPath(new URL('../../', import.meta.url)));

function apiCors(req, res, next) {
  const origin = req.headers.origin;

  if (!origin) {
    return next();
  }

  const allowedOrigins = new Set([
    env.APP_BASE_URL,
    'http://localhost:5500',
    'http://127.0.0.1:5500',
    'http://localhost:3000',
    'http://127.0.0.1:3000',
  ]);

  if (origin === 'null') {
    res.setHeader('Access-Control-Allow-Origin', '*');
  } else if (allowedOrigins.has(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else if (env.NODE_ENV !== 'production') {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }

  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept, Stripe-Signature');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  return next();
}

export function createApp() {
  const app = express();
  app.disable('x-powered-by');

  app.use('/api', apiCors);

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true });
  });

  app.use('/api/webhooks', webhooksRouter);
  app.use('/api', express.json({ limit: '1mb' }));
  app.use('/api/products', productsRouter);
  app.use('/api/checkout', checkoutRouter);
  app.use('/api/orders', ordersRouter);
  app.use('/api/promo-codes', promoCodesRouter);

  app.use('/api/*', (_req, _res, next) => {
    next(new HttpError(404, 'API route not found'));
  });

  app.use(express.static(projectRoot));

  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api/')) {
      return next(new HttpError(404, 'API route not found'));
    }

    const requestPath = req.path === '/' ? 'index.html' : req.path.replace(/^\//, '');
    const absoluteFilePath = path.join(projectRoot, requestPath);

    if (fs.existsSync(absoluteFilePath) && fs.statSync(absoluteFilePath).isFile()) {
      return res.sendFile(absoluteFilePath);
    }

    return next(new HttpError(404, 'Page not found'));
  });

  app.use((error, _req, res, _next) => {
    const statusCode = isHttpError(error) ? error.statusCode : 500;
    const message = isHttpError(error) ? error.message : 'Internal server error';

    if (!isHttpError(error)) {
      console.error(error);
    }

    res.status(statusCode).json({
      message,
      ...(error.details ? { details: error.details } : {}),
      ...(env.NODE_ENV !== 'production' && !isHttpError(error) ? { stack: error.stack } : {}),
    });
  });

  return app;
}
