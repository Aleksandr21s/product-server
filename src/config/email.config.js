require('dotenv').config();

module.exports = {
    // Основные настройки
    appName: process.env.APP_NAME || 'Интернет-магазин',
    appUrl: process.env.APP_URL || 'http://localhost:3000',
    supportEmail: process.env.SUPPORT_EMAIL || 'support@example.com',
    
    // Настройки SMTP (для продакшена)
    smtp: {
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        }
    },
    
    // Настройки шаблонов
    templates: {
        activationTokenExpiryHours: 24,
        resetTokenExpiryHours: 1,
        orderConfirmationEnabled: true,
        orderStatusUpdatesEnabled: true
    },
    
    // Настройки логирования
    logging: {
        enabled: true,
        logErrorsToFile: process.env.NODE_ENV === 'production',
        logDir: './logs/emails'
    }
};