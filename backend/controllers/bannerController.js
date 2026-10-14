const Banner = require('../models/Banner');
const { catchAsync } = require('../middleware/errorHandler');

exports.getBanners = catchAsync(async (req, res) => {
    const banners = await Banner.find({ isActive: true }).sort({ order: 1, createdAt: -1 });
    res.json({ banners });
});

exports.getAdminBanners = catchAsync(async (req, res) => {
    const banners = await Banner.find().sort({ order: 1, createdAt: -1 });
    res.json({ banners });
});

exports.createBanner = catchAsync(async (req, res) => {
    const banner = await Banner.create(req.body);
    res.status(201).json(banner);
});

exports.updateBanner = catchAsync(async (req, res) => {
    const banner = await Banner.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!banner) return res.status(404).json({ message: 'Banner not found' });
    res.json(banner);
});

exports.deleteBanner = catchAsync(async (req, res) => {
    const banner = await Banner.findByIdAndDelete(req.params.id);
    if (!banner) return res.status(404).json({ message: 'Banner not found' });
    res.json({ message: 'Banner removed' });
});
