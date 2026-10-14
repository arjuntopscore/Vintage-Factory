const Product = require('../models/Product');
const Order = require('../models/Order');
const { catchAsync } = require('../middleware/errorHandler');
const csv = require('csv-parser');
const stream = require('stream');

exports.getAdminProducts = catchAsync(async (req, res) => {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json({ products });
});

exports.createProduct = catchAsync(async (req, res) => {
    const product = await Product.create(req.body);
    res.status(201).json(product);
});

exports.updateProduct = catchAsync(async (req, res) => {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
});

exports.deleteProduct = catchAsync(async (req, res) => {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json({ message: 'Product removed' });
});

const { z } = require('zod');
const crypto = require('crypto');

const csvRowSchema = z.object({
    title: z.string().min(1),
    description: z.string().optional(),
    category: z.string().optional(),
    images: z.string().optional(),
    sizes: z.string().optional(),
    meeshoPrice: z.string().min(1),
    sellingPrice: z.string().optional(),
    mrp: z.string().optional(),
    freeDelivery: z.string().optional(),
    meeshoUrl: z.string().optional(),
    isActive: z.string().optional()
});

const generateUniqueSlug = async (title) => {
    let slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    let existing = await Product.findOne({ slug });
    if (existing) {
        slug = `${slug}-${crypto.randomBytes(2).toString('hex')}`;
    }
    return slug;
};

exports.importProductsCSV = catchAsync(async (req, res) => {
    if (!req.file) return res.status(400).json({ message: 'Please upload a CSV file' });
    
    const results = [];
    const bufferStream = new stream.PassThrough();
    bufferStream.end(req.file.buffer);
    
    bufferStream.pipe(csv({
        mapHeaders: ({ header }) => {
            if (!header) return null;
            const h = header.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
            if (h === 'title' || h === 'name') return 'title';
            if (h === 'description' || h === 'desc') return 'description';
            if (h === 'category' || h === 'cat') return 'category';
            if (h === 'images' || h === 'image' || h === 'img') return 'images';
            if (h === 'sizes' || h === 'size' || h === 'variants') return 'sizes';
            if (h === 'meeshoprice' || h === 'buyprice' || h === 'costprice' || h === 'cost') return 'meeshoPrice';
            if (h === 'sellingprice' || h === 'price' || h === 'sellprice') return 'sellingPrice';
            if (h === 'mrp' || h === 'originalprice') return 'mrp';
            if (h === 'freedelivery' || h === 'delivery') return 'freeDelivery';
            if (h === 'meeshourl' || h === 'url' || h === 'link') return 'meeshoUrl';
            if (h === 'isactive' || h === 'active') return 'isActive';
            return header.trim();
        }
    }))
        .on('data', (data) => results.push(data))
        .on('end', async () => {
            let created = 0;
            let failed = 0;
            const errors = [];
            
            for (let i = 0; i < results.length; i++) {
                const row = results[i];
                try {
                    const parsed = csvRowSchema.parse(row);
                    
                    const images = parsed.images ? parsed.images.split('|').map(u => u.trim()).filter(Boolean) : [];
                    
                    const variants = [];
                    if (parsed.sizes) {
                        const pairs = parsed.sizes.split('|');
                        for (const pair of pairs) {
                            const [size, stock] = pair.split(':');
                            if (size) variants.push({ size: size.trim(), stock: parseInt(stock) || 0 });
                        }
                    }

                    const meeshoPrice = Number(parsed.meeshoPrice);
                    if (isNaN(meeshoPrice)) throw new Error("Invalid meeshoPrice");

                    let sellingPrice;
                    if (parsed.sellingPrice && parsed.sellingPrice.trim() !== '') {
                        sellingPrice = Number(parsed.sellingPrice.trim());
                    }
                    if (!sellingPrice || isNaN(sellingPrice)) {
                        const baseSelling = meeshoPrice * 1.3;
                        sellingPrice = Math.floor(baseSelling / 10) * 10 + 9;
                    }
                    
                    let mrp;
                    if (parsed.mrp && parsed.mrp.trim() !== '') {
                        mrp = Number(parsed.mrp.trim());
                        if (isNaN(mrp) || mrp < sellingPrice) {
                            throw new Error("Invalid mrp: must be a number >= sellingPrice");
                        }
                    }

                    const freeDelivery = parsed.freeDelivery !== 'false';

                    const slug = await generateUniqueSlug(parsed.title);
                    
                    await Product.create({
                        title: parsed.title,
                        slug,
                        description: parsed.description || '',
                        images,
                        category: parsed.category || '',
                        variants,
                        meeshoPrice,
                        sellingPrice,
                        mrp,
                        freeDelivery,
                        meeshoUrl: parsed.meeshoUrl || '',
                        isActive: parsed.isActive !== 'false'
                    });
                    created++;
                } catch (err) {
                    failed++;
                    const errMsg = err.errors ? err.errors : err.message;
                    console.error(`CSV Row ${i + 1} error:`, JSON.stringify(errMsg));
                    errors.push({ row: i + 1, message: errMsg });
                }
            }
            res.json({ created, failed, errors });
        });
});

exports.bulkMarkup = catchAsync(async (req, res) => {
    const { productIds, type, value } = req.body;
    if (!Array.isArray(productIds) || !type || typeof value !== 'number' || value <= 0) {
        return res.status(400).json({ message: 'Invalid payload' });
    }
    
    let updated = 0;
    for (const id of productIds) {
        const product = await Product.findById(id);
        if (product) {
            let newPrice;
            if (type === 'percent') {
                newPrice = product.meeshoPrice * (1 + (value / 100));
            } else if (type === 'flat') {
                newPrice = product.meeshoPrice + value;
            }
            if (newPrice) {
                product.sellingPrice = Math.round(newPrice);
                await product.save();
                updated++;
            }
        }
    }
    res.json({ updated });
});

exports.getOrders = catchAsync(async (req, res) => {
    const { status, payment, page = 1, limit = 10 } = req.query;
    let query = {};
    if (status) query.orderStatus = status;
    if (payment) query.paymentStatus = payment;

    const orders = await Order.find(query)
        .populate('user', 'name email')
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);
    const count = await Order.countDocuments(query);

    res.json({ orders, totalPages: Math.ceil(count / limit), currentPage: page });
});

exports.getOrderById = catchAsync(async (req, res) => {
    const order = await Order.findById(req.params.id)
        .populate('user', 'name email')
        .populate('items.product'); // to get meeshoUrl and meeshoPrice
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
});

exports.updateOrderStatus = catchAsync(async (req, res) => {
    const { orderStatus, trackingId } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    
    if (orderStatus) order.orderStatus = orderStatus;
    if (trackingId) order.trackingId = trackingId;
    await order.save();
    
    res.json(order);
});

exports.getStats = catchAsync(async (req, res) => {
    const startOfToday = new Date();
    startOfToday.setHours(0,0,0,0);

    const todayOrders = await Order.countDocuments({ createdAt: { $gte: startOfToday } });
    const pendingOrders = await Order.countDocuments({ orderStatus: 'placed' });
    
    const revenueResult = await Order.aggregate([
        { $match: { paymentStatus: 'paid' } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);
    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;

    res.json({ todayOrders, pendingOrders, totalRevenue });
});