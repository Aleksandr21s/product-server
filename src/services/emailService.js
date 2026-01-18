const nodemailer = require('nodemailer');
const path = require('path');
const fs = require('fs-extra');

class EmailService {
    constructor() {
        this.isProduction = process.env.NODE_ENV === 'production';
        this.appUrl = process.env.APP_URL || 'http://localhost:3000';
        this.appName = process.env.APP_NAME || 'Интернет-магазин';
        this.supportEmail = process.env.SUPPORT_EMAIL || 'support@example.com';
        
        // Инициализируем транспортер для продакшена
        if (this.isProduction) {
            this.transporter = nodemailer.createTransport({
                host: process.env.SMTP_HOST,
                port: process.env.SMTP_PORT || 587,
                secure: process.env.SMTP_SECURE === 'true',
                auth: {
                    user: process.env.SMTP_USER,
                    pass: process.env.SMTP_PASS
                },
                tls: {
                    rejectUnauthorized: false
                }
            });
            
            console.log('📧 Email сервис: Production mode с SMTP');
        } else {
            console.log('📧 Email сервис: Development mode (вывод в консоль)');
        }
    }

    // Базовая функция отправки email
    async sendEmail(emailContent) {
        try {
            if (this.isProduction && this.transporter) {
                // Реальная отправка в продакшене
                const info = await this.transporter.sendMail({
                    from: `"${this.appName}" <${this.supportEmail}>`,
                    ...emailContent
                });
                
                console.log(`📧 Email отправлен: ${emailContent.to}, Message ID: ${info.messageId}`);
                return true;
            } else {
                // В разработке - вывод в консоль
                this.logEmailToConsole(emailContent);
                return true;
            }
        } catch (error) {
            console.error('❌ Ошибка отправки email:', error);
            
            // В продакшене можно логировать в файл или базу данных
            if (this.isProduction) {
                await this.logEmailError(error, emailContent);
            }
            
            return false;
        }
    }

    // Логирование email в консоль (для разработки)
    logEmailToConsole(emailContent) {
        console.log('\n' + '='.repeat(70));
        console.log('📧 📧 📧 ТЕСТОВЫЙ EMAIL 📧 📧 📧');
        console.log('='.repeat(70));
        console.log(`👤 Кому: ${emailContent.to}`);
        console.log(`📝 Тема: ${emailContent.subject}`);
        console.log('-' .repeat(70));
        
        if (emailContent.html) {
            // Извлекаем ссылки из HTML для удобного копирования
            const linkRegex = /href="([^"]+)"/g;
            let match;
            const links = [];
            
            while ((match = linkRegex.exec(emailContent.html)) !== null) {
                links.push(match[1]);
            }
            
            if (links.length > 0) {
                console.log('🔗 Ссылки в письме:');
                links.forEach((link, index) => {
                    console.log(`   ${index + 1}. ${link}`);
                });
            }
        }
        
        console.log('-' .repeat(70));
        console.log('📄 Текст письма:');
        console.log(emailContent.text || 'Текст не указан');
        console.log('='.repeat(70) + '\n');
    }

    // Логирование ошибок отправки email
    async logEmailError(error, emailContent) {
        try {
            const logDir = './logs/emails';
            await fs.ensureDir(logDir);
            
            const timestamp = new Date().toISOString().replace(/:/g, '-');
            const logFile = path.join(logDir, `error-${timestamp}.json`);
            
            const errorLog = {
                timestamp: new Date().toISOString(),
                error: {
                    message: error.message,
                    stack: error.stack,
                    code: error.code
                },
                email: {
                    to: emailContent.to,
                    subject: emailContent.subject,
                    text: emailContent.text ? emailContent.text.substring(0, 500) + '...' : null
                }
            };
            
            await fs.writeJson(logFile, errorLog, { spaces: 2 });
            console.log(`📝 Ошибка email записана в лог: ${logFile}`);
        } catch (logError) {
            console.error('Не удалось записать лог ошибки email:', logError);
        }
    }

    // Отправка email для активации аккаунта
    async sendActivationEmail(email, activationToken, userName = '') {
        try {
            const activationLink = `${this.appUrl}/api/auth/activate/${activationToken}`;
            const supportLink = `${this.appUrl}/support`;
            const faqLink = `${this.appUrl}/faq`;
            
            const emailContent = {
                to: email,
                subject: `Активация аккаунта в ${this.appName}`,
                html: `
                    <!DOCTYPE html>
                    <html lang="ru">
                    <head>
                        <meta charset="UTF-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        <title>Активация аккаунта</title>
                        <style>
                            * {
                                margin: 0;
                                padding: 0;
                                box-sizing: border-box;
                            }
                            
                            body {
                                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                                line-height: 1.6;
                                color: #333;
                                background-color: #f5f5f5;
                                padding: 20px;
                            }
                            
                            .email-container {
                                max-width: 600px;
                                margin: 0 auto;
                                background: white;
                                border-radius: 10px;
                                overflow: hidden;
                                box-shadow: 0 5px 15px rgba(0,0,0,0.1);
                            }
                            
                            .header {
                                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                                color: white;
                                padding: 40px 30px;
                                text-align: center;
                            }
                            
                            .header h1 {
                                font-size: 28px;
                                margin-bottom: 10px;
                                font-weight: 600;
                            }
                            
                            .header p {
                                font-size: 16px;
                                opacity: 0.9;
                            }
                            
                            .content {
                                padding: 40px 30px;
                            }
                            
                            .greeting {
                                font-size: 18px;
                                margin-bottom: 25px;
                                color: #444;
                            }
                            
                            .message {
                                font-size: 16px;
                                color: #555;
                                margin-bottom: 30px;
                                line-height: 1.7;
                            }
                            
                            .activation-box {
                                background: #f8f9fa;
                                border-radius: 8px;
                                padding: 25px;
                                margin: 30px 0;
                                border-left: 4px solid #007bff;
                            }
                            
                            .activation-button {
                                display: inline-block;
                                padding: 14px 32px;
                                background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
                                color: white !important;
                                text-decoration: none;
                                border-radius: 6px;
                                font-size: 16px;
                                font-weight: 600;
                                margin: 15px 0;
                                transition: transform 0.2s, box-shadow 0.2s;
                            }
                            
                            .activation-button:hover {
                                transform: translateY(-2px);
                                box-shadow: 0 5px 15px rgba(0,123,255,0.3);
                            }
                            
                            .token-info {
                                margin-top: 20px;
                                padding: 15px;
                                background: #e9ecef;
                                border-radius: 6px;
                                font-family: 'Courier New', monospace;
                                word-break: break-all;
                                font-size: 14px;
                                color: #495057;
                            }
                            
                            .expiry-note {
                                margin-top: 25px;
                                padding: 15px;
                                background: #fff3cd;
                                border: 1px solid #ffeaa7;
                                border-radius: 6px;
                                color: #856404;
                                font-size: 14px;
                            }
                            
                            .help-section {
                                margin-top: 30px;
                                padding-top: 25px;
                                border-top: 1px solid #e9ecef;
                                font-size: 14px;
                                color: #6c757d;
                            }
                            
                            .help-section a {
                                color: #007bff;
                                text-decoration: none;
                            }
                            
                            .help-section a:hover {
                                text-decoration: underline;
                            }
                            
                            .footer {
                                background: #f8f9fa;
                                padding: 25px 30px;
                                text-align: center;
                                color: #6c757d;
                                font-size: 14px;
                                border-top: 1px solid #e9ecef;
                            }
                            
                            .social-links {
                                margin-top: 15px;
                            }
                            
                            .social-links a {
                                display: inline-block;
                                margin: 0 10px;
                                color: #6c757d;
                                text-decoration: none;
                            }
                            
                            .social-links a:hover {
                                color: #007bff;
                            }
                            
                            .logo {
                                font-size: 20px;
                                font-weight: bold;
                                color: #007bff;
                                margin-bottom: 10px;
                            }
                            
                            @media (max-width: 600px) {
                                .header {
                                    padding: 30px 20px;
                                }
                                
                                .content {
                                    padding: 30px 20px;
                                }
                                
                                .activation-button {
                                    display: block;
                                    text-align: center;
                                }
                            }
                        </style>
                    </head>
                    <body>
                        <div class="email-container">
                            <div class="header">
                                <div class="logo">${this.appName}</div>
                                <h1>Добро пожаловать!</h1>
                                <p>Почти готово! Остался последний шаг.</p>
                            </div>
                            
                            <div class="content">
                                <div class="greeting">
                                    Здравствуйте${userName ? ', <strong>' + userName + '</strong>' : ''}!
                                </div>
                                
                                <div class="message">
                                    Благодарим вас за регистрацию в <strong>${this.appName}</strong>! 
                                    Мы рады приветствовать вас в нашем сообществе.
                                </div>
                                
                                <div class="activation-box">
                                    <p style="margin-bottom: 15px; font-weight: 500;">Для завершения регистрации и активации вашего аккаунта, пожалуйста, нажмите на кнопку ниже:</p>
                                    
                                    <div style="text-align: center;">
                                        <a href="${activationLink}" class="activation-button">
                                            ✅ Активировать мой аккаунт
                                        </a>
                                    </div>
                                    
                                    <p style="margin-top: 20px; font-size: 14px; color: #666;">
                                        Или скопируйте и вставьте эту ссылку в адресную строку браузера:
                                    </p>
                                    
                                    <div class="token-info">
                                        ${activationLink}
                                    </div>
                                </div>
                                
                                <div class="expiry-note">
                                    <strong>⏰ Внимание:</strong> Ссылка активации действительна в течение <strong>24 часов</strong>. 
                                    После истечения этого времени вам потребуется запросить новую ссылку активации.
                                </div>
                                
                                <div class="help-section">
                                    <p><strong>Нужна помощь?</strong></p>
                                    <p>Если у вас возникли проблемы с активацией аккаунта или кнопка не работает:</p>
                                    <ul style="margin-top: 10px; padding-left: 20px;">
                                        <li>Посетите наш <a href="${faqLink}">центр помощи</a></li>
                                        <li>Напишите в <a href="${supportLink}">службу поддержки</a></li>
                                        <li>Ответьте на это письмо для связи с нами</li>
                                    </ul>
                                </div>
                            </div>
                            
                            <div class="footer">
                                <p>© ${new Date().getFullYear()} ${this.appName}. Все права защищены.</p>
                                <p>Это письмо отправлено автоматически. Пожалуйста, не отвечайте на него.</p>
                                
                                <div class="social-links">
                                    <a href="${this.appUrl}">🌐 Сайт</a>
                                    <a href="mailto:${this.supportEmail}">📧 Поддержка</a>
                                </div>
                                
                                <p style="margin-top: 15px; font-size: 12px; color: #adb5bd;">
                                    Если вы не регистрировались в ${this.appName}, просто проигнорируйте это письмо.
                                </p>
                            </div>
                        </div>
                    </body>
                    </html>
                `,
                text: `
                    АКТИВАЦИЯ АККАУНТА
                    ====================
                    
                    Здравствуйте${userName ? ', ' + userName : ''}!
                    
                    Благодарим вас за регистрацию в ${this.appName}!
                    
                    ДЛЯ АКТИВАЦИИ АККАУНТА:
                    
                    Перейдите по ссылке:
                    ${activationLink}
                    
                    Или скопируйте ссылку выше и вставьте в браузер.
                    
                    ⚠️ ВАЖНО:
                    Ссылка действительна в течение 24 часов.
                    
                    НУЖНА ПОМОЩЬ?
                    - Центр помощи: ${faqLink}
                    - Служба поддержки: ${supportLink}
                    - Ответьте на это письмо
                    
                    ---
                    
                    © ${new Date().getFullYear()} ${this.appName}
                    Это письмо отправлено автоматически.
                    
                    Если вы не регистрировались, проигнорируйте это письмо.
                `
            };
            
            return await this.sendEmail(emailContent);
        } catch (error) {
            console.error('Ошибка при отправке email активации:', error);
            return false;
        }
    }

    // Отправка email для сброса пароля
    async sendPasswordResetEmail(email, resetToken, userName = '') {
        try {
            const resetLink = `${this.appUrl}/api/auth/reset-password/${resetToken}`;
            const supportLink = `${this.appUrl}/support`;
            
            const emailContent = {
                to: email,
                subject: `Восстановление пароля в ${this.appName}`,
                html: `
                    <!DOCTYPE html>
                    <html lang="ru">
                    <head>
                        <meta charset="UTF-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        <title>Восстановление пароля</title>
                        <style>
                            * {
                                margin: 0;
                                padding: 0;
                                box-sizing: border-box;
                            }
                            
                            body {
                                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                                line-height: 1.6;
                                color: #333;
                                background-color: #f5f5f5;
                                padding: 20px;
                            }
                            
                            .email-container {
                                max-width: 600px;
                                margin: 0 auto;
                                background: white;
                                border-radius: 10px;
                                overflow: hidden;
                                box-shadow: 0 5px 15px rgba(0,0,0,0.1);
                            }
                            
                            .header {
                                background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
                                color: white;
                                padding: 40px 30px;
                                text-align: center;
                            }
                            
                            .header h1 {
                                font-size: 28px;
                                margin-bottom: 10px;
                                font-weight: 600;
                            }
                            
                            .content {
                                padding: 40px 30px;
                            }
                            
                            .greeting {
                                font-size: 18px;
                                margin-bottom: 25px;
                                color: #444;
                            }
                            
                            .message {
                                font-size: 16px;
                                color: #555;
                                margin-bottom: 30px;
                                line-height: 1.7;
                            }
                            
                            .reset-box {
                                background: #f8f9fa;
                                border-radius: 8px;
                                padding: 25px;
                                margin: 30px 0;
                                border-left: 4px solid #f5576c;
                            }
                            
                            .reset-button {
                                display: inline-block;
                                padding: 14px 32px;
                                background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
                                color: white !important;
                                text-decoration: none;
                                border-radius: 6px;
                                font-size: 16px;
                                font-weight: 600;
                                margin: 15px 0;
                                transition: transform 0.2s, box-shadow 0.2s;
                            }
                            
                            .reset-button:hover {
                                transform: translateY(-2px);
                                box-shadow: 0 5px 15px rgba(245,87,108,0.3);
                            }
                            
                            .token-info {
                                margin-top: 20px;
                                padding: 15px;
                                background: #e9ecef;
                                border-radius: 6px;
                                font-family: 'Courier New', monospace;
                                word-break: break-all;
                                font-size: 14px;
                                color: #495057;
                            }
                            
                            .security-note {
                                margin-top: 25px;
                                padding: 15px;
                                background: #fff3cd;
                                border: 1px solid #ffeaa7;
                                border-radius: 6px;
                                color: #856404;
                                font-size: 14px;
                            }
                            
                            .help-section {
                                margin-top: 30px;
                                padding-top: 25px;
                                border-top: 1px solid #e9ecef;
                                font-size: 14px;
                                color: #6c757d;
                            }
                            
                            .footer {
                                background: #f8f9fa;
                                padding: 25px 30px;
                                text-align: center;
                                color: #6c757d;
                                font-size: 14px;
                                border-top: 1px solid #e9ecef;
                            }
                            
                            .logo {
                                font-size: 20px;
                                font-weight: bold;
                                color: #f5576c;
                                margin-bottom: 10px;
                            }
                            
                            @media (max-width: 600px) {
                                .reset-button {
                                    display: block;
                                    text-align: center;
                                }
                            }
                        </style>
                    </head>
                    <body>
                        <div class="email-container">
                            <div class="header">
                                <div class="logo">${this.appName}</div>
                                <h1>Восстановление пароля</h1>
                                <p>Мы получили запрос на сброс вашего пароля</p>
                            </div>
                            
                            <div class="content">
                                <div class="greeting">
                                    Здравствуйте${userName ? ', <strong>' + userName + '</strong>' : ''}!
                                </div>
                                
                                <div class="message">
                                    Мы получили запрос на сброс пароля для вашей учетной записи в <strong>${this.appName}</strong>.
                                    Если это были не вы, просто проигнорируйте это письмо.
                                </div>
                                
                                <div class="reset-box">
                                    <p style="margin-bottom: 15px; font-weight: 500;">Для установки нового пароля нажмите на кнопку ниже:</p>
                                    
                                    <div style="text-align: center;">
                                        <a href="${resetLink}" class="reset-button">
                                            🔐 Установить новый пароль
                                        </a>
                                    </div>
                                    
                                    <p style="margin-top: 20px; font-size: 14px; color: #666;">
                                        Или скопируйте и вставьте эту ссылку в браузер:
                                    </p>
                                    
                                    <div class="token-info">
                                        ${resetLink}
                                    </div>
                                </div>
                                
                                <div class="security-note">
                                    <strong>🔒 Важно для безопасности:</strong>
                                    <ul style="margin-top: 10px; padding-left: 20px;">
                                        <li>Ссылка действительна в течение <strong>1 часа</strong></li>
                                        <li>Никому не передавайте эту ссылку</li>
                                        <li>Если вы не запрашивали сброс пароля, немедленно свяжитесь с поддержкой</li>
                                    </ul>
                                </div>
                                
                                <div class="help-section">
                                    <p><strong>Возникли проблемы?</strong></p>
                                    <p>Если кнопка не работает или у вас есть вопросы:</p>
                                    <ul style="margin-top: 10px; padding-left: 20px;">
                                        <li>Напишите в <a href="${supportLink}">службу поддержки</a></li>
                                        <li>Ответьте на это письмо</li>
                                    </ul>
                                </div>
                            </div>
                            
                            <div class="footer">
                                <p>© ${new Date().getFullYear()} ${this.appName}</p>
                                <p>Это письмо отправлено автоматически.</p>
                                <p style="margin-top: 15px; font-size: 12px; color: #adb5bd;">
                                    Для безопасности вашего аккаунта никогда не передавайте свои учетные данные третьим лицам.
                                </p>
                            </div>
                        </div>
                    </body>
                    </html>
                `,
                text: `
                    ВОССТАНОВЛЕНИЕ ПАРОЛЯ
                    =====================
                    
                    Здравствуйте${userName ? ', ' + userName : ''}!
                    
                    Мы получили запрос на сброс пароля для вашей учетной записи в ${this.appName}.
                    
                    ДЛЯ УСТАНОВКИ НОВОГО ПАРОЛЯ:
                    
                    Перейдите по ссылке:
                    ${resetLink}
                    
                    Или скопируйте ссылку выше и вставьте в браузер.
                    
                    ⚠️ БЕЗОПАСНОСТЬ:
                    - Ссылка действительна 1 час
                    - Никому не передавайте эту ссылку
                    - Если не вы запрашивали сброс, свяжитесь с поддержкой
                    
                    НУЖНА ПОМОЩЬ?
                    Служба поддержки: ${supportLink}
                    
                    ---
                    
                    © ${new Date().getFullYear()} ${this.appName}
                    Это письмо отправлено автоматически.
                    
                    Берегите свои учетные данные!
                `
            };
            
            return await this.sendEmail(emailContent);
        } catch (error) {
            console.error('Ошибка при отправке email сброса пароля:', error);
            return false;
        }
    }

    // Отправка email о новом заказе
    async sendOrderConfirmationEmail(email, order, userName = '') {
        try {
            const orderLink = `${this.appUrl}/orders/${order.id}`;
            const supportLink = `${this.appUrl}/support`;
            
            const emailContent = {
                to: email,
                subject: `Заказ #${order.id} подтверждён в ${this.appName}`,
                html: `
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <style>
                            body { font-family: Arial, sans-serif; }
                            .order-details { background: #f8f9fa; padding: 20px; border-radius: 5px; }
                            .item { display: flex; justify-content: space-between; margin: 10px 0; }
                            .total { font-weight: bold; font-size: 18px; }
                        </style>
                    </head>
                    <body>
                        <h2>Спасибо за ваш заказ!</h2>
                        <p>Здравствуйте${userName ? ', ' + userName : ''}!</p>
                        <p>Ваш заказ #${order.id} успешно создан.</p>
                        <div class="order-details">
                            <h3>Детали заказа:</h3>
                            ${order.items ? order.items.map(item => `
                                <div class="item">
                                    <span>${item.product?.name || 'Товар'} × ${item.quantity}</span>
                                    <span>${(item.priceAtATime * item.quantity).toFixed(2)} руб.</span>
                                </div>
                            `).join('') : ''}
                            <div class="total">
                                <span>Итого:</span>
                                <span>${order.amount.toFixed(2)} руб.</span>
                            </div>
                        </div>
                        <p>Статус: ${this.getOrderStatusText(order.status)}</p>
                        <p>Просмотреть заказ: <a href="${orderLink}">${orderLink}</a></p>
                    </body>
                    </html>
                `,
                text: `
                    ЗАКАЗ ПОДТВЕРЖДЁН #${order.id}
                    
                    Здравствуйте${userName ? ', ' + userName : ''}!
                    
                    Ваш заказ успешно создан.
                    
                    Детали заказа:
                    ${order.items ? order.items.map(item => 
                        `- ${item.product?.name || 'Товар'} × ${item.quantity}: ${(item.priceAtATime * item.quantity).toFixed(2)} руб.`
                    ).join('\n') : ''}
                    
                    Итого: ${order.amount.toFixed(2)} руб.
                    Статус: ${this.getOrderStatusText(order.status)}
                    
                    Просмотреть заказ: ${orderLink}
                    
                    Спасибо за покупку!
                `
            };
            
            return await this.sendEmail(emailContent);
        } catch (error) {
            console.error('Ошибка при отправке email подтверждения заказа:', error);
            return false;
        }
    }

    // Отправка email об изменении статуса заказа
    async sendOrderStatusUpdateEmail(email, order, userName = '') {
        try {
            const orderLink = `${this.appUrl}/orders/${order.id}`;
            
            const emailContent = {
                to: email,
                subject: `Статус заказа #${order.id} обновлён`,
                html: `
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <style>
                            body { font-family: Arial, sans-serif; }
                            .status-update { background: #e7f3ff; padding: 20px; border-radius: 5px; }
                        </style>
                    </head>
                    <body>
                        <h2>Обновление статуса заказа</h2>
                        <p>Здравствуйте${userName ? ', ' + userName : ''}!</p>
                        <div class="status-update">
                            <h3>Статус вашего заказа #${order.id} изменён:</h3>
                            <p><strong>Новый статус: ${this.getOrderStatusText(order.status)}</strong></p>
                            ${order.trackingNumber ? `<p>Трек-номер: ${order.trackingNumber}</p>` : ''}
                        </div>
                        <p>Просмотреть заказ: <a href="${orderLink}">${orderLink}</a></p>
                    </body>
                    </html>
                `,
                text: `
                    ОБНОВЛЕНИЕ СТАТУСА ЗАКАЗА #${order.id}
                    
                    Здравствуйте${userName ? ', ' + userName : ''}!
                    
                    Статус вашего заказа изменён.
                    
                    Новый статус: ${this.getOrderStatusText(order.status)}
                    ${order.trackingNumber ? `Трек-номер: ${order.trackingNumber}` : ''}
                    
                    Просмотреть заказ: ${orderLink}
                `
            };
            
            return await this.sendEmail(emailContent);
        } catch (error) {
            console.error('Ошибка при отправке email обновления статуса заказа:', error);
            return false;
        }
    }

    // Отправка email об успешной оплате
    async sendPaymentSuccessEmail(email, order, userName = '') {
        try {
            const emailContent = {
                to: email,
                subject: `Оплата заказа #${order.id} успешна`,
                html: `
                    <!DOCTYPE html>
                    <html>
                    <body>
                        <h2>Оплата успешно проведена!</h2>
                        <p>Здравствуйте${userName ? ', ' + userName : ''}!</p>
                        <p>Оплата вашего заказа #${order.id} на сумму ${order.amount.toFixed(2)} руб. успешно проведена.</p>
                        <p>Спасибо за покупку!</p>
                    </body>
                    </html>
                `,
                text: `
                    ОПЛАТА УСПЕШНА #${order.id}
                    
                    Здравствуйте${userName ? ', ' + userName : ''}!
                    
                    Оплата вашего заказа на сумму ${order.amount.toFixed(2)} руб. успешно проведена.
                    
                    Спасибо за покупку!
                `
            };
            
            return await this.sendEmail(emailContent);
        } catch (error) {
            console.error('Ошибка при отправке email об успешной оплате:', error);
            return false;
        }
    }

    // Вспомогательная функция для перевода статуса заказа
    getOrderStatusText(status) {
        const statusMap = {
            'pending': 'Ожидание обработки',
            'processing': 'В обработке',
            'shipped': 'Отправлен',
            'delivered': 'Доставлен',
            'cancelled': 'Отменён'
        };
        return statusMap[status] || status;
    }

    // Отправка тестового email
    async sendTestEmail(email) {
        try {
            const emailContent = {
                to: email,
                subject: 'Тестовое письмо от Email сервиса',
                html: `
                    <!DOCTYPE html>
                    <html>
                    <body>
                        <h2>Тестовое письмо</h2>
                        <p>Это тестовое письмо отправлено из ${this.appName}.</p>
                        <p>Время отправки: ${new Date().toLocaleString()}</p>
                        <p>Режим работы: ${this.isProduction ? 'PRODUCTION' : 'DEVELOPMENT'}</p>
                    </body>
                    </html>
                `,
                text: `Тестовое письмо от ${this.appName}\nВремя: ${new Date().toLocaleString()}`
            };
            
            return await this.sendEmail(emailContent);
        } catch (error) {
            console.error('Ошибка при отправке тестового email:', error);
            return false;
        }
    }
}

// Создаём и экспортируем экземпляр сервиса
const emailService = new EmailService();

// Экспортируем также класс для тестирования
module.exports = emailService;
module.exports.EmailService = EmailService;