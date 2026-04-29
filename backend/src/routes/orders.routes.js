import { Router } from 'express';
import { asyncHandler } from '../lib/async-handler.js';
import { getOrderByPublicId } from '../repositories/orders.repository.js';

const router = Router();

router.get(
  '/:publicId',
  asyncHandler(async (req, res) => {
    const order = await getOrderByPublicId(req.params.publicId);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    return res.json({
      order: {
        publicId: order.publicId,
        paymentStatus: order.paymentStatus,
        fulfillmentStatus: order.fulfillmentStatus,
        printifyStatus: order.printifyStatus,
        promoCode: order.promoCode,
        currency: order.currency,
        subtotalAmount: order.subtotalAmount,
        discountAmount: order.discountAmount,
        shippingAmount: order.shippingAmount,
        totalAmount: order.totalAmount,
        createdAt: order.createdAt,
        items: order.items,
      },
    });
  }),
);

export default router;
