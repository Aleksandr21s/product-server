const express = require('express');
const router = express.Router();
const {
    register,
    login,
    getCurrentUser,
    updateProfile,
    changePassword,
    requestPasswordReset,
    validateResetToken,
    resetPassword,
    getResetPasswordPage,
    getForgotPasswordPage  // <-- Убедись, что эта функция импортирована
} = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');

// Страницы
router.get('/forgot-password-page', getForgotPasswordPage);
router.get('/reset-password-page/:token', getResetPasswordPage);

// API endpoints
router.post('/register', register);
router.post('/login', login);
router.get('/me', authenticateToken, getCurrentUser);
router.put('/profile', authenticateToken, updateProfile);
router.put('/change-password', authenticateToken, changePassword);

// Восстановление пароля
router.post('/forgot-password', requestPasswordReset);
router.get('/validate-reset-token/:token', validateResetToken);
router.post('/reset-password/:token', resetPassword);

module.exports = router;