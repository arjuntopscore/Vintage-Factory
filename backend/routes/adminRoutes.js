const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });
const { protect, adminOnly } = require('../middleware/auth');
const { 
    createProduct, updateProduct, deleteProduct, importProductsCSV, bulkMarkup,
    getOrders, getOrderById, updateOrderStatus, getStats, getAdminProducts
} = require('../controllers/adminController');

router.use(protect, adminOnly);

router.get('/products', getAdminProducts);
router.post('/products', createProduct);
router.put('/products/:id', updateProduct);
router.delete('/products/:id', deleteProduct);
router.post('/products/import-csv', upload.single('file'), importProductsCSV);
router.patch('/products/bulk-markup', bulkMarkup);

router.get('/orders', getOrders);
router.get('/orders/:id', getOrderById);
router.patch('/orders/:id/status', updateOrderStatus);

router.get('/stats', getStats);

module.exports = router;