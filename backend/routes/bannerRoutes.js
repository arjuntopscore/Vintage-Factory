const express = require('express');
const router = express.Router();
const bannerController = require('../controllers/bannerController');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/', bannerController.getBanners);

// Admin routes
router.get('/admin', protect, adminOnly, bannerController.getAdminBanners);
router.post('/', protect, adminOnly, bannerController.createBanner);
router.put('/:id', protect, adminOnly, bannerController.updateBanner);
router.delete('/:id', protect, adminOnly, bannerController.deleteBanner);

module.exports = router;
