const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');
const User = require('../models/User');
const PasswordReset = require('../models/PasswordReset');
const { secret, expiresIn } = require('../config/jwt.config');
const emailService = require('../services/emailService');

// Простая функция для страницы восстановления пароля
const getForgotPasswordPage = (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Восстановление пароля</title>
            <style>
                body { font-family: Arial; padding: 20px; }
                .container { max-width: 400px; margin: 0 auto; }
                input, button { width: 100%; padding: 10px; margin: 10px 0; }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>Забыли пароль?</h1>
                <form id="forgotForm">
                    <input type="email" id="email" placeholder="Ваш email" required>
                    <button type="submit">Отправить ссылку</button>
                </form>
                <div id="message"></div>
            </div>
            <script>
                document.getElementById('forgotForm').onsubmit = async (e) => {
                    e.preventDefault();
                    const email = document.getElementById('email').value;
                    
                    const response = await fetch('/api/auth/forgot-password', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ email })
                    });
                    
                    const result = await response.json();
                    document.getElementById('message').innerHTML = 
                        result.success ? '✅ Проверьте вашу почту' : '❌ Ошибка: ' + result.message;
                };
            </script>
        </body>
        </html>
    `);
};

// Простая функция для страницы сброса пароля
const getResetPasswordPage = (req, res) => {
    const { token } = req.params;
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Новый пароль</title>
            <style>
                body { font-family: Arial; padding: 20px; }
                .container { max-width: 400px; margin: 0 auto; }
                input, button { width: 100%; padding: 10px; margin: 10px 0; }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>Создайте новый пароль</h1>
                <form id="resetForm">
                    <input type="hidden" id="token" value="${token}">
                    <input type="password" id="newPassword" placeholder="Новый пароль" required>
                    <input type="password" id="confirmPassword" placeholder="Подтвердите пароль" required>
                    <button type="submit">Установить пароль</button>
                </form>
                <div id="message"></div>
            </div>
            <script>
                document.getElementById('resetForm').onsubmit = async (e) => {
                    e.preventDefault();
                    const token = document.getElementById('token').value;
                    const newPassword = document.getElementById('newPassword').value;
                    const confirmPassword = document.getElementById('confirmPassword').value;
                    
                    const response = await fetch(\`/api/auth/reset-password/\${token}\`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ newPassword, confirmPassword })
                    });
                    
                    const result = await response.json();
                    document.getElementById('message').innerHTML = 
                        result.success ? '✅ Пароль изменён!' : '❌ Ошибка: ' + result.message;
                };
            </script>
        </body>
        </html>
    `);
};

// Остальные функции (минимум для работы)
const register = async (req, res) => {
    res.json({ success: true, message: 'Регистрация работает' });
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Проверяем обязательные поля
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Пожалуйста, укажите email и пароль'
            });
        }
        
        // Ищем пользователя
        const user = await User.findOne({ 
            where: { email },
            attributes: ['id', 'email', 'password', 'username', 'firstName', 'lastName', 'role', 'isActive']
        });
        
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
        const bcrypt = require('bcryptjs');
        const isValidPassword = await bcrypt.compare(password, user.password);
        
        if (!isValidPassword) {
            return res.status(401).json({
                success: false,
                message: 'Неверные учетные данные'
            });
        }
        
        // Генерируем токен
        const token = jwt.sign(
            { userId: user.id },
            secret,
            { expiresIn }
        );
        
        // Убираем пароль из ответа
        const userData = user.toJSON();
        delete userData.password;
        
        res.json({
            success: true,
            message: 'Вход выполнен успешно',
            data: {
                user: userData,
                token  // <-- Токен здесь!
            }
        });
        
    } catch (error) {
        console.error('Ошибка входа:', error);
        res.status(500).json({
            success: false,
            message: 'Ошибка при входе',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

const getCurrentUser = async (req, res) => {
    res.json({ success: true, user: { id: 1, username: 'test' } });
};

const updateProfile = async (req, res) => {
    res.json({ success: true, message: 'Профиль обновлён' });
};

const changePassword = async (req, res) => {
    res.json({ success: true, message: 'Пароль изменён' });
};

const requestPasswordReset = async (req, res) => {
    const { email } = req.body;
    console.log(`Запрос восстановления пароля для: ${email}`);
    res.json({ 
        success: true, 
        message: 'Если email существует, ссылка будет отправлена' 
    });
};

const validateResetToken = async (req, res) => {
    const { token } = req.params;
    console.log(`Валидация токена: ${token}`);
    res.json({ 
        success: true, 
        message: 'Токен действителен',
        data: { token, email: 'test@example.com' }
    });
};

const resetPassword = async (req, res) => {
    const { token } = req.params;
    const { newPassword, confirmPassword } = req.body;
    console.log(`Сброс пароля для токена: ${token}`);
    res.json({ 
        success: true, 
        message: 'Пароль успешно изменён' 
    });
};

module.exports = {
    register,
    login,
    getCurrentUser,
    updateProfile,
    changePassword,
    requestPasswordReset,
    validateResetToken,
    resetPassword,
    getResetPasswordPage,
    getForgotPasswordPage
};