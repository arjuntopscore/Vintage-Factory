const express = require('express');
const router = express.Router();
const { getProducts, getProductBySlug, addReview, getProductReviews, getCategories } = require('../controllers/productController');
const { protect } = require('../middleware/auth');

router.get('/', getProducts);
router.get('/categories', getCategories);
router.get('/:slug', getProductBySlug);

// Reviews
router.post('/:id/reviews', protect, addReview);
router.get('/:id/reviews', getProductReviews);

module.exports = router;