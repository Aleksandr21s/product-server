const jwt = require('jsonwebtoken');
const { secret } = require('../config/jwt.config');
const User = require('../models/User');

// Middleware для проверки JWT токена
const authenticateToken = async (req, res, next) => {
    try {
        // Получаем токен из заголовка Authorization
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
        
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Токен не предоставлен'
            });
        }
        
        // Верифицируем токен
        const decoded = jwt.verify(token, secret);
        
        // Находим пользователя
        const user = await User.findByPk(decoded.userId);
        
        if (!user || !user.isActive) {
            return res.status(401).json({
                success: false,
                message: 'Пользователь не найден или неактивен'
            });
        }
        
        // Обновляем время последнего входа
        await user.update({ lastLogin: new Date() });
        
        // Добавляем пользователя в запрос
        req.user = user.toSafeObject();
        req.userId = user.id;
        
        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(403).json({
                success: false,
                message: 'Неверный токен'
            });
        }
        
        if (error.name === 'TokenExpiredError') {
            return res.status(403).json({
                success: false,
                message: 'Токен истёк'
            });
        }
        
        res.status(500).json({
            success: false,
            message: 'Ошибка аутентификации',
            error: error.message
        });
    }
};

// Middleware для проверки роли (admin)
const requireAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({
            success: false,
            message: 'Требуются права администратора'
        });
    }
    next();
};

// Middleware для проверки владельца или администратора
const requireOwnerOrAdmin = async (req, res, next) => {
    try {
        const { id } = req.params;
        const product = await Product.findByPk(id);
        
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Товар не найден'
            });
        }
        
        // Если пользователь админ или владелец товара
        if (req.user.role === 'admin' || product.userId === req.userId) {
            return next();
        }
        
        res.status(403).json({
            success: false,
            message: 'Нет прав для выполнения этого действия'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Ошибка при проверке прав',
            error: error.message
        });
    }
};

module.exports = {
    authenticateToken,
    requireAdmin,
    requireOwnerOrAdmin
};