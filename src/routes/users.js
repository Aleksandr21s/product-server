const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { requireRole, requirePermission } = require('../middleware/roles');
const { ROLES } = require('../config/permissions');

// Контроллер пользователей (нужно создать)
const userController = {
    getAllUsers: async (req, res) => {
        res.json({ message: 'Все пользователи' });
    },
    
    getUserById: async (req, res) => {
        res.json({ message: `Пользователь ${req.params.id}` });
    },
    
    updateUser: async (req, res) => {
        res.json({ message: 'Пользователь обновлён' });
    },
    
    deleteUser: async (req, res) => {
        res.json({ message: 'Пользователь удалён' });
    },
    
    updateUserRole: async (req, res) => {
        res.json({ message: 'Роль обновлена' });
    },
    
    getUserPermissions: async (req, res) => {
        res.json({ message: 'Разрешения пользователя' });
    }
};

// 🔐 ВСЕ МАРШРУТЫ ТРЕБУЮТ АУТЕНТИФИКАЦИИ

// Получение всех пользователей: только админы
router.get(
    '/',
    authenticateToken,
    requireRole(ROLES.ADMIN),
    requirePermission('users:read'),
    userController.getAllUsers
);

// Получение пользователя по ID
router.get(
    '/:id',
    authenticateToken,
    requireRole(ROLES.MODERATOR, ROLES.ADMIN),
    requirePermission('users:read'),
    userController.getUserById
);

// Обновление пользователя
router.put(
    '/:id',
    authenticateToken,
    requireRole(ROLES.MODERATOR, ROLES.ADMIN),
    requirePermission('users:update'),
    userController.updateUser
);

// Удаление пользователя: только админы
router.delete(
    '/:id',
    authenticateToken,
    requireRole(ROLES.ADMIN),
    requirePermission('users:delete'),
    userController.deleteUser
);

// Обновление роли пользователя: только админы
router.put(
    '/:id/role',
    authenticateToken,
    requireRole(ROLES.ADMIN),
    requirePermission('users:manage-roles'),
    userController.updateUserRole
);

// Получение разрешений пользователя
router.get(
    '/:id/permissions',
    authenticateToken,
    requireRole(ROLES.MODERATOR, ROLES.ADMIN),
    userController.getUserPermissions
);

module.exports = router;