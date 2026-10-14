require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');
const { errorHandler } = require('./middleware/errorHandler');

const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();

// Security & Middleware
app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(cookieParser());

// Webhook needs raw body before express.json()
app.use('/api/payment/webhook', express.raw({ type: 'application/json' }));

app.use(express.json({ limit: '1mb' }));

// Rate limiting
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });
const apiLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 3000 });
app.use('/api/auth/', authLimiter);
app.use('/api/', apiLimiter);

const bannerRoutes = require('./routes/bannerRoutes');

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/banners', bannerRoutes);

// Error Handling
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const User = require('./models/User');
const bcrypt = require('bcryptjs');

connectDB().then(async () => {
    // Seed default admin
    const adminEmail = 'arjunktp88@gmail.com';
    let adminUser = await User.findOne({ email: adminEmail });
    if (!adminUser) {
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash('arjun@1221', salt);
        await User.create({
            name: 'Admin Arjun',
            email: adminEmail,
            passwordHash,
            role: 'admin'
        });
        console.log('Default admin seeded successfully');
    }

    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
});