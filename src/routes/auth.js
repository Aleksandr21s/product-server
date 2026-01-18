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
    getForgotPasswordPage,
    getResetPasswordPage
} = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');
const { requireRole, requirePermission } = require('../middleware/roles');
const { ROLES } = require('../config/permissions');

// 🌐 ПУБЛИЧНЫЕ МАРШРУТЫ (доступны без авторизации)
router.get('/forgot-password-page', getForgotPasswordPage);
router.get('/reset-password-page/:token', getResetPasswordPage);
router.get('/activate/:token', activateAccount);

router.post('/register', register); // Регистрация
router.post('/login', login); // Вход
router.post('/forgot-password', requestPasswordReset); // Запрос сброса пароля
router.get('/validate-reset-token/:token', validateResetToken); // Валидация токена
router.post('/reset-password/:token', resetPassword); // Сброс пароля

// 🔐 ЗАЩИЩЁННЫЕ МАРШРУТЫ

// Профиль текущего пользователя (доступен всем авторизованным)
router.get(
    '/me',
    authenticateToken,
    requirePermission('profile:read'),
    getCurrentUser
);

// Обновление своего профиля
router.put(
    '/profile',
    authenticateToken,
    requirePermission('profile:update:own'),
    updateProfile
);

// Смена своего пароля
router.put(
    '/change-password',
    authenticateToken,
    requirePermission('auth:change-password'),
    changePassword
);

// Удаление своего аватара
router.delete(
    '/avatar',
    authenticateToken,
    requirePermission('profile:update:own'),
    deleteAvatar
);

// 🛠️ АДМИНИСТРАТИВНЫЕ МАРШРУТЫ

// Просмотр всех пользователей (только админы)
router.get(
    '/admin/users',
    authenticateToken,
    requireRole(ROLES.ADMIN),
    requirePermission('users:read'),
    (req, res) => {
        res.json({ message: 'Административный список пользователей' });
    }
);

// Статистика системы (админы и модераторы)
router.get(
    '/admin/statistics',
    authenticateToken,
    requireRole(ROLES.MODERATOR, ROLES.ADMIN),
    (req, res) => {
        res.json({ message: 'Системная статистика' });
    }
);

module.exports = router;