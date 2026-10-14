require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const connectDB = require('../config/db');

const seedAdmin = async () => {
    await connectDB();
    try {
        const email = process.env.ADMIN_EMAIL;
        const password = process.env.ADMIN_PASSWORD;

        if (!email || !password) {
            console.error('ADMIN_EMAIL or ADMIN_PASSWORD missing in .env');
            process.exit(1);
        }

        const existing = await User.findOne({ email });
        if (existing) {
            console.log('Admin already exists');
            process.exit(0);
        }

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        await User.create({
            name: 'Admin',
            email,
            passwordHash,
            role: 'admin'
        });

        console.log('Admin user created successfully');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding admin:', error);
        process.exit(1);
    }
};
seedAdmin();