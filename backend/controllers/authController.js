const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { catchAsync } = require('../middleware/errorHandler');

const generateToken = (userId, res) => {
    const token = jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000
    });
};

exports.register = catchAsync(async (req, res) => {
    const { name, email, password, phone } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Email already in use' });

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await User.create({ name, email, passwordHash, phone, role: 'customer' });
    generateToken(user._id, res);

    res.status(201).json({ _id: user._id, name: user.name, email: user.email, role: user.role });
});

exports.login = catchAsync(async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    generateToken(user._id, res);
    res.json({ _id: user._id, name: user.name, email: user.email, role: user.role });
});

exports.logout = (req, res) => {
    res.cookie('token', '', { httpOnly: true, expires: new Date(0) });
    res.json({ message: 'Logged out' });
};

exports.getMe = catchAsync(async (req, res) => {
    res.json(req.user);
});