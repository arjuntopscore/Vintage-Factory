const express = require('express');
const router = express.Router();
const { register, login, logout, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { z } = require('zod');

const registerSchema = z.object({
    body: z.object({
        name: z.string().min(2),
        email: z.string().email(),
        password: z.string().min(6),
        phone: z.string().optional()
    })
});

const loginSchema = z.object({
    body: z.object({
        email: z.string().email(),
        password: z.string().min(6)
    })
});

router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.post('/logout', logout);
router.get('/me', protect, getMe);

module.exports = router;