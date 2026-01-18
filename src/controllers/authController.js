const jwt = require('jsonwebtoken');
const { secret, expiresIn } = require('../config/jwt.config');

// ==================== МИНИМАЛЬНЫЙ РАБОЧИЙ КОНТРОЛЛЕР ====================

// 1. Регистрация
const register = async (req, res) => {
    console.log('📝 Регистрация пользователя:', req.body.email);
    
    try {
        const { email, password, firstName, lastName } = req.body;
        
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email и пароль обязательны'
            });
        }
        
        // Генерируем токен (в реальном приложении здесь была бы БД)
        const token = jwt.sign(
            { userId: 1, email: email },
            secret,
            { expiresIn }
        );
        
        res.status(201).json({
            success: true,
            message: 'Регистрация успешна',
            data: {
                user: {
                    id: 1,
                    email: email,
                    firstName: firstName || '',
                    lastName: lastName || '',
                    role: 'user'
                },
                token
            }
        });
        
    } catch (error) {
        console.error('❌ Ошибка регистрации:', error);
        res.status(500).json({
            success: false,
            message: 'Ошибка при регистрации',
            error: error.message
        });
    }
};

// 2. Вход
const login = async (req, res) => {
    console.log('🔐 Попытка входа:', req.body.email);
    
    try {
        const { email, password } = req.body;
        
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email и пароль обязательны'
            });
        }
        
        // Тестовые пользователи для демонстрации
        const testUsers = {
            'admin@example.com': { 
                id: 1, 
                password: 'admin123', 
                role: 'admin',
                firstName: 'Админ',
                lastName: 'Системный'
            },
            'user@example.com': { 
                id: 2, 
                password: 'user123', 
                role: 'user',
                firstName: 'Иван',
                lastName: 'Петров'
            }
        };
        
        const user = testUsers[email];
        
        if (!user || user.password !== password) {
            return res.status(401).json({
                success: false,
                message: 'Неверные учетные данные'
            });
        }
        
        const token = jwt.sign(
            { userId: user.id, email: email },
            secret,
            { expiresIn }
        );
        
        res.json({
            success: true,
            message: 'Вход выполнен успешно',
            data: {
                user: {
                    id: user.id,
                    email: email,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    role: user.role
                },
                token
            }
        });
        
    } catch (error) {
        console.error('❌ Ошибка входа:', error);
        res.status(500).json({
            success: false,
            message: 'Ошибка при входе',
            error: error.message
        });
    }
};

// 3. Получение текущего пользователя
const getCurrentUser = async (req, res) => {
    console.log('👤 Получение текущего пользователя');
    
    try {
        // В реальном приложении здесь будет поиск пользователя по ID из токена
        // Для демонстрации возвращаем тестового пользователя
        res.json({
            success: true,
            data: {
                id: 1,
                email: 'admin@example.com',
                firstName: 'Админ',
                lastName: 'Системный',
                role: 'admin'
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Ошибка при получении пользователя',
            error: error.message
        });
    }
};

// 4. Обновление профиля
const updateProfile = async (req, res) => {
    console.log('✏️ Обновление профиля:', req.body);
    
    res.json({
        success: true,
        message: 'Профиль обновлён',
        data: req.body
    });
};

// 5. Смена пароля
const changePassword = async (req, res) => {
    console.log('🔑 Смена пароля');
    
    res.json({
        success: true,
        message: 'Пароль изменён'
    });
};

// 6. Запрос восстановления пароля
const requestPasswordReset = async (req, res) => {
    const { email } = req.body;
    console.log('📧 Запрос восстановления пароля для:', email);
    
    res.json({ 
        success: true, 
        message: 'Если email существует, ссылка будет отправлена' 
    });
};

// 7. Валидация токена восстановления
const validateResetToken = async (req, res) => {
    const { token } = req.params;
    console.log('✅ Валидация токена:', token);
    
    res.json({ 
        success: true, 
        message: 'Токен действителен',
        data: { token }
    });
};

// 8. Сброс пароля
const resetPassword = async (req, res) => {
    const { token } = req.params;
    const { newPassword, confirmPassword } = req.body;
    console.log('🔄 Сброс пароля для токена:', token);
    
    res.json({ 
        success: true, 
        message: 'Пароль успешно изменён' 
    });
};

// 9. Активация аккаунта
const activateAccount = async (req, res) => {
    const { token } = req.params;
    console.log('🎯 Активация аккаунта с токеном:', token);
    
    res.json({ 
        success: true, 
        message: 'Аккаунт активирован' 
    });
};

// 10. Веб-страница восстановления пароля
const getForgotPasswordPage = (req, res) => {
    console.log('🌐 Загрузка страницы восстановления пароля');
    
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Восстановление пароля</title>
            <style>
                body { font-family: Arial; padding: 40px; }
                input, button { padding: 10px; margin: 10px; }
            </style>
        </head>
        <body>
            <h1>Забыли пароль?</h1>
            <p>Введите ваш email для восстановления</p>
            <form action="/api/auth/forgot-password" method="POST">
                <input type="email" name="email" placeholder="Email" required>
                <button type="submit">Отправить</button>
            </form>
        </body>
        </html>
    `);
};

// 11. Веб-страница сброса пароля
const getResetPasswordPage = (req, res) => {
    const { token } = req.params;
    console.log('🌐 Загрузка страницы сброса пароля для токена:', token);
    
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Новый пароль</title>
            <style>
                body { font-family: Arial; padding: 40px; }
                input, button { padding: 10px; margin: 10px; }
            </style>
        </head>
        <body>
            <h1>Создайте новый пароль</h1>
            <p>Токен: ${token}</p>
            <form action="/api/auth/reset-password/${token}" method="POST">
                <input type="password" name="newPassword" placeholder="Новый пароль" required>
                <input type="password" name="confirmPassword" placeholder="Подтвердите пароль" required>
                <button type="submit">Установить пароль</button>
            </form>
        </body>
        </html>
    `);
};

// 12. Удаление аватара
const deleteAvatar = async (req, res) => {
    console.log('🖼️ Удаление аватара');
    
    res.json({
        success: true,
        message: 'Аватар удалён'
    });
};

// ==================== ЭКСПОРТ ====================

module.exports = {
    // Основные функции
    register,
    login,
    getCurrentUser,
    updateProfile,
    changePassword,
    deleteAvatar,
    
    // Восстановление пароля
    requestPasswordReset,
    validateResetToken,
    resetPassword,
    
    // Активация аккаунта
    activateAccount,
    
    // Веб-страницы
    getForgotPasswordPage,
    getResetPasswordPage
};