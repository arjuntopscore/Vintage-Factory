const Product = require('../models/Product');
const Review = require('../models/Review');
const Order = require('../models/Order');
const { catchAsync } = require('../middleware/errorHandler');

exports.getProducts = catchAsync(async (req, res) => {
    let { q, category, minPrice, maxPrice, minRating, size, sort, page = 1, limit = 20 } = req.query;
    page = parseInt(page);
    limit = parseInt(limit);
    
    let query = { isActive: true };
    
    if (q) {
        query.$text = { $search: q };
    }
    if (category) {
        query.category = category;
    }
    if (minPrice || maxPrice) {
        query.sellingPrice = {};
        if (minPrice) query.sellingPrice.$gte = Number(minPrice);
        if (maxPrice) query.sellingPrice.$lte = Number(maxPrice);
    }
    if (minRating) {
        query.ratingAverage = { $gte: Number(minRating) };
    }
    if (size) {
        query['variants.size'] = size;
        query['variants.stock'] = { $gt: 0 };
    }

    let sortObj = {};
    if (sort === 'relevance' && q) {
        sortObj = { score: { $meta: 'textScore' } };
    } else if (sort === 'newest') {
        sortObj = { createdAt: -1 };
    } else if (sort === 'priceAsc') {
        sortObj = { sellingPrice: 1 };
    } else if (sort === 'priceDesc') {
        sortObj = { sellingPrice: -1 };
    } else if (sort === 'rating') {
        sortObj = { ratingAverage: -1 };
    } else {
        sortObj = { createdAt: -1 }; // Default sort
    }

    const products = await Product.find(query, q ? { score: { $meta: 'textScore' } } : {})
        .sort(sortObj)
        .select('-meeshoPrice -meeshoUrl')
        .limit(limit)
        .skip((page - 1) * limit)
        .exec();

    const total = await Product.countDocuments(query);
    const hasMore = page * limit < total;

    res.json({
        products,
        total,
        page,
        hasMore
    });
});

exports.getCategories = catchAsync(async (req, res) => {
    const categories = await Product.distinct('category', { isActive: true });
    // Filter out empty strings
    res.json({ categories: categories.filter(c => c).sort() });
});

exports.getProductBySlug = catchAsync(async (req, res) => {
    const product = await Product.findOne({ slug: req.params.slug, isActive: true })
        .select('-meeshoPrice -meeshoUrl');
    
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
});

exports.addReview = catchAsync(async (req, res) => {
    const { rating, comment } = req.body;
    const productId = req.params.id;
    const userId = req.user.id;

    if (!rating || rating < 1 || rating > 5) {
        return res.status(400).json({ message: 'Please provide a valid rating between 1 and 5' });
    }

    // Check if user has a PAID and DELIVERED order for this product
    const hasBought = await Order.findOne({
        user: userId,
        paymentStatus: 'paid',
        orderStatus: 'delivered',
        'items.product': productId
    });

    if (!hasBought) {
        return res.status(403).json({ message: 'You can only review products you have bought and received.' });
    }

    // Check if already reviewed
    const existingReview = await Review.findOne({ product: productId, user: userId });
    if (existingReview) {
        return res.status(400).json({ message: 'You have already reviewed this product.' });
    }

    await Review.create({
        product: productId,
        user: userId,
        rating,
        comment
    });

    // Update Product average rating and count
    const reviews = await Review.find({ product: productId });
    const count = reviews.length;
    const sum = reviews.reduce((acc, rev) => acc + rev.rating, 0);
    const average = count === 0 ? 0 : sum / count;

    await Product.findByIdAndUpdate(productId, {
        ratingAverage: Number(average.toFixed(1)),
        ratingCount: count
    });

    res.status(201).json({ message: 'Review added successfully' });
});

exports.getProductReviews = catchAsync(async (req, res) => {
    const productId = req.params.id;
    let { page = 1, limit = 10 } = req.query;
    page = parseInt(page);
    limit = parseInt(limit);

    const reviews = await Review.find({ product: productId })
        .populate('user', 'name')
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip((page - 1) * limit);

    const total = await Review.countDocuments({ product: productId });
    const hasMore = page * limit < total;

    res.json({
        reviews,
        total,
        page,
        hasMore
    });
});