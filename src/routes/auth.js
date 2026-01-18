const express = require('express');
const router = express.Router();
const {
    register,
    login,
    getCurrentUser,
    updateProfile,
    changePassword
} = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');

// POST /api/auth/register - регистрация
router.post('/register', register);

// POST /api/auth/login - вход
router.post('/login', login);

// GET /api/auth/me - получить текущего пользователя (требуется авторизация)
router.get('/me', authenticateToken, getCurrentUser);

// PUT /api/auth/profile - обновить профиль (требуется авторизация)
router.put('/profile', authenticateToken, updateProfile);

// PUT /api/auth/change-password - сменить пароль (требуется авторизация)
router.put('/change-password', authenticateToken, changePassword);

module.exports = router;