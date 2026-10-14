const Razorpay = require('razorpay');
const crypto = require('crypto');
const Order = require('../models/Order');
const { catchAsync } = require('../middleware/errorHandler');

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || 'dummy_key_id',
    key_secret: process.env.RAZORPAY_KEY_SECRET || 'dummy_key_secret'
});

exports.createOrder = catchAsync(async (req, res) => {
    const { orderId } = req.body;
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (order.user.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Unauthorized' });
    }

    const options = {
        amount: Math.round(order.totalAmount * 100), // amount in paise
        currency: 'INR',
        receipt: order._id.toString()
    };

    const rzpOrder = await razorpay.orders.create(options);
    order.razorpayOrderId = rzpOrder.id;
    await order.save();

    res.json({ id: rzpOrder.id, currency: rzpOrder.currency, amount: rzpOrder.amount });
});

exports.verifyPayment = catchAsync(async (req, res) => {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

    const body = razorpayOrderId + "|" + razorpayPaymentId;
    const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(body.toString())
        .digest('hex');

    const isAuthentic = crypto.timingSafeEqual(Buffer.from(expectedSignature), Buffer.from(razorpaySignature));
    
    if (isAuthentic) {
        const order = await Order.findOne({ razorpayOrderId });
        if (!order) return res.status(404).json({ message: 'Order not found' });

        order.paymentStatus = 'paid';
        order.razorpayPaymentId = razorpayPaymentId;
        await order.save();
        
        // Product stock reduction logic could go here

        res.json({ message: 'Payment verified successfully' });
    } else {
        res.status(400).json({ message: 'Invalid signature' });
    }
});

exports.webhook = catchAsync(async (req, res) => {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const signature = req.headers['x-razorpay-signature'];
    
    const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(req.body)
        .digest('hex');

    if (expectedSignature === signature) {
        const event = JSON.parse(req.body);
        if (event.event === 'payment.captured') {
            const payment = event.payload.payment.entity;
            const order = await Order.findOne({ razorpayOrderId: payment.order_id });
            if (order && order.paymentStatus !== 'paid') {
                order.paymentStatus = 'paid';
                order.razorpayPaymentId = payment.id;
                await order.save();
            }
        } else if (event.event === 'payment.failed') {
            const payment = event.payload.payment.entity;
            const order = await Order.findOne({ razorpayOrderId: payment.order_id });
            if (order) {
                order.paymentStatus = 'failed';
                await order.save();
            }
        }
        res.status(200).json({ status: 'ok' });
    } else {
        res.status(400).json({ status: 'invalid signature' });
    }
});