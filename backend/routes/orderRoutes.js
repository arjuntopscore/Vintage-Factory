const express = require('express');
const router = express.Router();
const { createOrder, getMyOrders } = require('../controllers/orderController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { z } = require('zod');

const createOrderSchema = z.object({
    body: z.object({
        items: z.array(z.object({
            productId: z.string(),
            size: z.string(),
            qty: z.number().int().positive()
        })).min(1),
        shippingAddress: z.object({
            name: z.string(),
            phone: z.string(),
            line1: z.string(),
            line2: z.string().optional(),
            city: z.string(),
            state: z.string(),
            pincode: z.string()
        })
    })
});

router.post('/', protect, validate(createOrderSchema), createOrder);
router.get('/my', protect, getMyOrders);

module.exports = router;