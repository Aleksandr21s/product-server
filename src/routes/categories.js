const express = require('express');
const router = express.Router();
const {
    getAllCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory
} = require('../controllers/categoryController');
const { authenticateToken } = require('../middleware/auth');
const { requireRole, requirePermission } = require('../middleware/roles');
const { ROLES } = require('../config/permissions');

// 📋 ПУБЛИЧНЫЕ МАРШРУТЫ
router.get('/', getAllCategories);
router.get('/:id', getCategoryById);

// 🔐 ЗАЩИЩЁННЫЕ МАРШРУТЫ

// Создание категории: только модераторы и админы
router.post(
    '/',
    authenticateToken,
    requireRole(ROLES.MODERATOR, ROLES.ADMIN),
    requirePermission('categories:create'),
    createCategory
);

// Обновление категории: только модераторы и админы
router.put(
    '/:id',
    authenticateToken,
    requireRole(ROLES.MODERATOR, ROLES.ADMIN),
    requirePermission('categories:update'),
    updateCategory
);

// Удаление категории: только админы
router.delete(
    '/:id',
    authenticateToken,
    requireRole(ROLES.ADMIN),
    requirePermission('categories:delete'),
    deleteCategory
);

module.exports = router;