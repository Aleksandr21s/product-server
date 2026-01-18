const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { requireRole } = require('../middleware/roles');
const { ROLES, getRolePermissions } = require('../config/permissions');

// Получение разрешений текущего пользователя
router.get('/my-permissions', authenticateToken, (req, res) => {
    res.json({
        success: true,
        data: {
            role: req.user.role,
            permissions: req.user.permissions || getRolePermissions(req.user.role)
        }
    });
});

// Получение всех возможных разрешений (админы)
router.get('/all', authenticateToken, requireRole(ROLES.ADMIN), (req, res) => {
    res.json({
        success: true,
        data: {
            roles: ROLES,
            allPermissions: ALL_PERMISSIONS,
            defaultPermissions: DEFAULT_PERMISSIONS
        }
    });
});

// Проверка разрешения
router.post('/check', authenticateToken, (req, res) => {
    const { permission } = req.body;
    
    if (!permission) {
        return res.status(400).json({
            success: false,
            message: 'Укажите разрешение для проверки'
        });
    }
    
    const hasPermission = req.user.role === ROLES.ADMIN || 
                         (req.user.permissions && req.user.permissions.includes(permission));
    
    res.json({
        success: true,
        data: {
            permission,
            hasAccess: hasPermission
        }
    });
});

module.exports = router;