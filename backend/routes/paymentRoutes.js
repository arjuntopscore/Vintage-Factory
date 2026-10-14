const express = require('express');
const router = express.Router();
const { createOrder, verifyPayment, webhook } = require('../controllers/paymentController');
const { protect } = require('../middleware/auth');

router.post('/create-order', protect, createOrder);
router.post('/verify', protect, verifyPayment);
// Note: Webhook must use express.raw which is configured in server.js before body parser
router.post('/webhook', webhook);

module.exports = router;