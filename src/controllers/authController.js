const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { secret, expiresIn } = require('../config/jwt.config');
const { validateRegister, validateLogin } = require('../utils/validators');

// Генерация JWT токена
const generateToken = (userId) => {
    return jwt.sign(
        { userId },
        secret,
        { expiresIn }
    );
};

// Регистрация пользователя
const register = async (req, res) => {
    try {
        const { username, email, password, confirmPassword, firstName, lastName } = req.body;
        
        // Валидация данных
        const validation = validateRegister({
            username,
            email,
            password,
            confirmPassword
        });
        
        if (!validation.isValid) {
            return res.status(400).json({
                success: false,
                message: 'Ошибка валидации',
                errors: validation.errors
            });
        }
        
        // Проверяем, существует ли пользователь с таким email или username
        const existingUser = await User.findOne({
            where: {
                [Op.or]: [
                    { email },
                    { username }
                ]
            }
        });
        
        if (existingUser) {
            const errors = [];
            if (existingUser.email === email) {
                errors.push('Пользователь с таким email уже существует');
            }
            if (existingUser.username === username) {
                errors.push('Пользователь с таким именем уже существует');
            }
            
            return res.status(400).json({
                success: false,
                message: 'Ошибка регистрации',
                errors
            });
        }
        
        // Создаём пользователя
        const user = await User.create({
            username,
            email,
            password,
            firstName,
            lastName,
            role: 'user' // По умолчанию обычный пользователь
        });
        
        // Генерируем токен
        const token = generateToken(user.id);
        
        res.status(201).json({
            success: true,
            message: 'Регистрация успешна',
            data: {
                user: user.toSafeObject(),
                token
            }
        });
    } catch (error) {
        console.error('Ошибка регистрации:', error);
        res.status(500).json({
            success: false,
            message: 'Ошибка при регистрации',
            error: error.message
        });
    }
};

// Вход пользователя
const login = async (req, res) => {
    try {
        const { email, username, password } = req.body;
        
        // Валидация данных
        const validation = validateLogin({ email, username, password });
        
        if (!validation.isValid) {
            return res.status(400).json({
                success: false,
                message: 'Ошибка валидации',
                errors: validation.errors
            });
        }
        
        // Ищем пользователя по email или username
        const whereCondition = {};
        if (email) {
            whereCondition.email = email;
        } else if (username) {
            whereCondition.username = username;
        }
        
        const user = await User.findOne({ where: whereCondition });
        
        // Проверяем существование пользователя и активность
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Неверные учетные данные'
            });
        }
        
        if (!user.isActive) {
            return res.status(403).json({
                success: false,
                message: 'Аккаунт заблокирован'
            });
        }
        
        // Проверяем пароль
        const isValidPassword = await user.validatePassword(password);
        
        if (!isValidPassword) {
            return res.status(401).json({
                success: false,
                message: 'Неверные учетные данные'
            });
        }
        
        // Обновляем время последнего входа
        await user.update({ lastLogin: new Date() });
        
        // Генерируем токен
        const token = generateToken(user.id);
        
        res.json({
            success: true,
            message: 'Вход выполнен успешно',
            data: {
                user: user.toSafeObject(),
                token
            }
        });
    } catch (error) {
        console.error('Ошибка входа:', error);
        res.status(500).json({
            success: false,
            message: 'Ошибка при входе',
            error: error.message
        });
    }
};

// Получение текущего пользователя
const getCurrentUser = async (req, res) => {
    try {
        const user = await User.findByPk(req.userId);
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Пользователь не найден'
            });
        }
        
        res.json({
            success: true,
            data: user.toSafeObject()
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Ошибка при получении пользователя',
            error: error.message
        });
    }
};

// Обновление профиля
const updateProfile = async (req, res) => {
    try {
        const { firstName, lastName } = req.body;
        const user = await User.findByPk(req.userId);
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Пользователь не найден'
            });
        }
        
        // Обновляем только разрешённые поля
        await user.update({
            firstName: firstName !== undefined ? firstName : user.firstName,
            lastName: lastName !== undefined ? lastName : user.lastName
        });
        
        res.json({
            success: true,
            message: 'Профиль обновлён',
            data: user.toSafeObject()
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Ошибка при обновлении профиля',
            error: error.message
        });
    }
};

// Смена пароля
const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword, confirmPassword } = req.body;
        const user = await User.findByPk(req.userId);
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Пользователь не найден'
            });
        }
        
        // Проверяем текущий пароль
        const isValidPassword = await user.validatePassword(currentPassword);
        
        if (!isValidPassword) {
            return res.status(400).json({
                success: false,
                message: 'Неверный текущий пароль'
            });
        }
        
        // Проверяем новый пароль
        if (newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'Новый пароль должен содержать минимум 6 символов'
            });
        }
        
        if (newPassword !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: 'Пароли не совпадают'
            });
        }
        
        // Обновляем пароль (хеширование происходит в хуке модели)
        await user.update({ password: newPassword });
        
        res.json({
            success: true,
            message: 'Пароль успешно изменён'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Ошибка при смене пароля',
            error: error.message
        });
    }
};

module.exports = {
    register,
    login,
    getCurrentUser,
    updateProfile,
    changePassword
};