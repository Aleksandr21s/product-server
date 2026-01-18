const express = require('express');
const router = express.Router();
const {
    getAllProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct
} = require('../controllers/productController');
const { authenticateToken } = require('../middleware/auth');
const { 
    requireRole, 
    requirePermission,
    requireOwnerOrRole,
    resourceGuard 
} = require('../middleware/roles');
const { ROLES } = require('../config/permissions');

// 📋 ПУБЛИЧНЫЕ МАРШРУТЫ (доступны всем)
router.get('/', getAllProducts); // Чтение всех товаров
router.get('/:id', getProductById); // Чтение конкретного товара

// 🔐 ЗАЩИЩЁННЫЕ МАРШРУТЫ

// Создание товара: продавцы, модераторы, админы
router.post(
    '/',
    authenticateToken,
    requireRole(ROLES.SELLER, ROLES.MODERATOR, ROLES.ADMIN),
    requirePermission('products:create'),
    createProduct
);

// Обновление товара: владелец или модератор/админ
router.put(
    '/:id',
    authenticateToken,
    requireOwnerOrRole('userId', ROLES.MODERATOR, ROLES.ADMIN),
    updateProduct
);

// Удаление товара: владелец или модератор/админ
router.delete(
    '/:id',
    authenticateToken,
    requireOwnerOrRole('userId', ROLES.MODERATOR, ROLES.ADMIN),
    deleteProduct
);

// 📊 Специальные маршруты для продавцов
router.get(
    '/seller/my-products',
    authenticateToken,
    requireRole(ROLES.SELLER, ROLES.MODERATOR, ROLES.ADMIN),
    (req, res) => {
        // Контроллер для получения товаров продавца
        res.json({ message: 'Товары продавца' });
    }
);

// 🛠️ Административные маршруты
router.get(
    '/admin/statistics',
    authenticateToken,
    requireRole(ROLES.ADMIN),
    (req, res) => {
        res.json({ message: 'Статистика товаров' });
    }
);

module.exports = router;