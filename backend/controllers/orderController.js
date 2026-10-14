const Order = require('../models/Order');
const Product = require('../models/Product');
const { catchAsync } = require('../middleware/errorHandler');

exports.createOrder = catchAsync(async (req, res) => {
    const { items, shippingAddress } = req.body;
    if (!items || items.length === 0) {
        return res.status(400).json({ message: 'No order items' });
    }

    const orderItems = [];
    let totalAmount = 0;

    for (const item of items) {
        const product = await Product.findById(item.productId);
        if (!product) return res.status(404).json({ message: `Product ${item.productId} not found` });
        
        const variant = product.variants.find(v => v.size === item.size);
        if (!variant || variant.stock < item.qty) {
            return res.status(400).json({ message: `Insufficient stock for ${product.title} (Size: ${item.size})` });
        }

        orderItems.push({
            product: product._id,
            title: product.title,
            image: product.images[0],
            size: item.size,
            qty: item.qty,
            price: product.sellingPrice
        });
        totalAmount += (product.sellingPrice * item.qty);
    }

    const order = await Order.create({
        user: req.user._id,
        items: orderItems,
        shippingAddress,
        totalAmount
    });

    res.status(201).json(order);
});

exports.getMyOrders = catchAsync(async (req, res) => {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(orders);
});