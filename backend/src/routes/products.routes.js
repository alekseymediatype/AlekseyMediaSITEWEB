import { Router } from 'express';
import { asyncHandler } from '../lib/async-handler.js';
import { getCatalogProduct, listCatalogProducts } from '../services/catalog.service.js';

const router = Router();

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const page = Number(req.query.page || 1);
    const limit = Number(req.query.limit || 24);
    const payload = await listCatalogProducts({ page, limit });
    res.json(payload);
  }),
);

router.get(
  '/:productId',
  asyncHandler(async (req, res) => {
    const product = await getCatalogProduct(req.params.productId);
    res.json(product);
  }),
);

export default router;
