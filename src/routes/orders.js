const express = require('express');
const router = express.Router();
const {
    getAllOrders,
    getUserOrders,
    getOrderById,
    createOrder,
    updateOrderStatus,
    deleteOrder
} = require('../controllers/orderController');
const { authenticateToken } = require('../middleware/auth');
const { requireRole, requirePermission, requireOwnerOrRole } = require('../middleware/roles');
const { ROLES } = require('../config/permissions');

// 🔐 ВСЕ МАРШРУТЫ ТРЕБУЮТ АУТЕНТИФИКАЦИИ

// Получение всех заказов (админ/модератор)
router.get(
    '/',
    authenticateToken,
    requireRole(ROLES.MODERATOR, ROLES.ADMIN),
    requirePermission('orders:read:any'),
    getAllOrders
);

// Заказы текущего пользователя
router.get(
    '/my-orders',
    authenticateToken,
    requireRole(ROLES.CUSTOMER, ROLES.SELLER, ROLES.MODERATOR, ROLES.ADMIN),
    requirePermission('orders:read:own'),
    getUserOrders
);

// Получение конкретного заказа
router.get(
    '/:id',
    authenticateToken,
    requireOwnerOrRole('userId', ROLES.MODERATOR, ROLES.ADMIN),
    getOrderById
);

// Создание заказа: покупатели и выше
router.post(
    '/',
    authenticateToken,
    requireRole(ROLES.CUSTOMER, ROLES.SELLER, ROLES.MODERATOR, ROLES.ADMIN),
    requirePermission('orders:create'),
    createOrder
);

// Обновление статуса заказа: модераторы и админы
router.put(
    '/:id/status',
    authenticateToken,
    requireRole(ROLES.MODERATOR, ROLES.ADMIN),
    requirePermission('orders:update:any'),
    updateOrderStatus
);

// Удаление заказа: только админы
router.delete(
    '/:id',
    authenticateToken,
    requireRole(ROLES.ADMIN),
    requirePermission('orders:delete'),
    deleteOrder
);

module.exports = router;