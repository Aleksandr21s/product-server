const express = require('express');
const router = express.Router();
const {
    register,
    login,
    getCurrentUser,
    updateProfile,
    changePassword,
    deleteAvatar,
    requestPasswordReset,
    validateResetToken,
    resetPassword,
    activateAccount,
    getResetPasswordPage,
    getForgotPasswordPage
} = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');
const { uploadAvatar } = require('../middleware/upload');

// Страницы
router.get('/forgot-password-page', getForgotPasswordPage);
router.get('/reset-password-page/:token', getResetPasswordPage);

// API endpoints
router.post('/register', register);
router.post('/login', login);
router.get('/activate/:token', activateAccount); // Активация аккаунта
router.get('/me', authenticateToken, getCurrentUser);
router.put('/profile', authenticateToken, uploadAvatar, updateProfile);
router.delete('/avatar', authenticateToken, deleteAvatar);
router.put('/change-password', authenticateToken, changePassword);

// Восстановление пароля
router.post('/forgot-password', requestPasswordReset);
router.get('/validate-reset-token/:token', validateResetToken);
router.post('/reset-password/:token', resetPassword);

module.exports = router;