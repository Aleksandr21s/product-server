const crypto = require('crypto');

// Генерация случайного токена
const generateResetToken = () => {
    return crypto.randomBytes(32).toString('hex');
};

// Генерация токена с временем жизни
const generateTokenWithExpiry = (hours = 1) => {
    const token = generateResetToken();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + hours);
    
    return {
        token,
        expiresAt
    };
};

// Валидация токена (базовая проверка формата)
const isValidTokenFormat = (token) => {
    // Токен должен быть строкой из 64 hex символов
    const tokenRegex = /^[a-f0-9]{64}$/;
    return tokenRegex.test(token);
};

module.exports = {
    generateResetToken,
    generateTokenWithExpiry,
    isValidTokenFormat
};