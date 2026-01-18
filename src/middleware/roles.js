// Middleware для проверки ролей и разрешений

// Проверка, что пользователь аутентифицирован
const requireAuth = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: 'Требуется авторизация'
        });
    }
    next();
};

// Проверка конкретной роли
const requireRole = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Требуется авторизация'
            });
        }
        
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: `Недостаточно прав. Требуются роли: ${roles.join(', ')}`
            });
        }
        
        next();
    };
};

// Проверка конкретного разрешения
const requirePermission = (...permissions) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Требуется авторизация'
            });
        }
        
        // Админы имеют все разрешения
        if (req.user.role === 'admin') {
            return next();
        }
        
        // Проверяем каждое требуемое разрешение
        for (const permission of permissions) {
            if (!req.user.permissions || !req.user.permissions.includes(permission)) {
                return res.status(403).json({
                    success: false,
                    message: `Недостаточно прав. Требуется разрешение: ${permission}`
                });
            }
        }
        
        next();
    };
};

// Комбинированная проверка роли И разрешения
const requireRoleAndPermission = (role, ...permissions) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Требуется авторизация'
            });
        }
        
        // Проверка роли
        if (req.user.role !== role && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: `Недостаточно прав. Требуется роль: ${role}`
            });
        }
        
        // Проверка разрешений (если требуется)
        if (permissions.length > 0 && req.user.role !== 'admin') {
            for (const permission of permissions) {
                if (!req.user.permissions || !req.user.permissions.includes(permission)) {
                    return res.status(403).json({
                        success: false,
                        message: `Недостаточно прав. Требуется разрешение: ${permission}`
                    });
                }
            }
        }
        
        next();
    };
};

// Проверка владельца ресурса или прав доступа
const requireOwnerOrRole = (resourceOwnerIdField = 'userId', ...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Требуется авторизация'
            });
        }
        
        // Если пользователь имеет требуемую роль
        if (roles.includes(req.user.role)) {
            return next();
        }
        
        // Если пользователь - владелец ресурса
        const resourceOwnerId = req.params[resourceOwnerIdField] || req.body[resourceOwnerIdField];
        if (resourceOwnerId && parseInt(resourceOwnerId) === req.user.id) {
            return next();
        }
        
        return res.status(403).json({
            success: false,
            message: 'Недостаточно прав. Вы не являетесь владельцем ресурса.'
        });
    };
};

// Проверка для CRUD операций
const crudPermissions = {
    create: (resource) => `${resource}:create`,
    read: (resource) => `${resource}:read`,
    update: (resource) => `${resource}:update`,
    delete: (resource) => `${resource}:delete`,
    manage: (resource) => `${resource}:manage`
};

// Генератор middleware для ресурсов
const resourceGuard = (resource, action) => {
    const permission = crudPermissions[action](resource);
    return requirePermission(permission);
};

module.exports = {
    requireAuth,
    requireRole,
    requirePermission,
    requireRoleAndPermission,
    requireOwnerOrRole,
    crudPermissions,
    resourceGuard
};