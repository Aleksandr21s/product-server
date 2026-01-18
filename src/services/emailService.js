// Упрощённый сервис для отправки email
// В реальном приложении используйте nodemailer с настройками SMTP

class EmailService {
    constructor() {
        // В разработке просто логируем, в продакшене можно настроить nodemailer
        this.isProduction = process.env.NODE_ENV === 'production';
    }

    // Отправка email для сброса пароля
    async sendPasswordResetEmail(email, resetToken, userName = '') {
        try {
            const resetLink = `${process.env.APP_URL || 'http://localhost:3000'}/api/auth/reset-password/${resetToken}`;
            
            const emailContent = {
                to: email,
                subject: 'Восстановление пароля',
                html: `
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <style>
                            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                            .header { background: #007bff; color: white; padding: 20px; text-align: center; }
                            .content { padding: 30px; background: #f9f9f9; }
                            .button { 
                                display: inline-block; 
                                padding: 12px 24px; 
                                background: #007bff; 
                                color: white; 
                                text-decoration: none; 
                                border-radius: 5px;
                                margin: 20px 0;
                            }
                            .token { 
                                background: #eee; 
                                padding: 10px; 
                                font-family: monospace; 
                                word-break: break-all;
                                margin: 10px 0;
                            }
                            .footer { 
                                margin-top: 30px; 
                                padding-top: 20px; 
                                border-top: 1px solid #ddd; 
                                font-size: 12px; 
                                color: #666; 
                            }
                        </style>
                    </head>
                    <body>
                        <div class="container">
                            <div class="header">
                                <h1>Восстановление пароля</h1>
                            </div>
                            <div class="content">
                                <p>Здравствуйте${userName ? ', ' + userName : ''}!</p>
                                <p>Мы получили запрос на сброс пароля для вашего аккаунта.</p>
                                <p>Для установки нового пароля нажмите на кнопку ниже:</p>
                                
                                <div style="text-align: center;">
                                    <a href="${resetLink}" class="button">Сбросить пароль</a>
                                </div>
                                
                                <p>Или скопируйте и вставьте эту ссылку в браузер:</p>
                                <div class="token">${resetLink}</div>
                                
                                <p><strong>Ссылка действительна в течение 1 часа.</strong></p>
                                
                                <p>Если вы не запрашивали сброс пароля, просто проигнорируйте это письмо.</p>
                            </div>
                            <div class="footer">
                                <p>Это письмо отправлено автоматически. Пожалуйста, не отвечайте на него.</p>
                                <p>© ${new Date().getFullYear()} Product Management System</p>
                            </div>
                        </div>
                    </body>
                    </html>
                `,
                text: `
                    Восстановление пароля
                    
                    Здравствуйте${userName ? ', ' + userName : ''}!
                    
                    Мы получили запрос на сброс пароля для вашего аккаунта.
                    Для установки нового пароля перейдите по ссылке:
                    
                    ${resetLink}
                    
                    Ссылка действительна в течение 1 часа.
                    
                    Если вы не запрашивали сброс пароля, просто проигнорируйте это письмо.
                    
                    © ${new Date().getFullYear()} Product Management System
                `
            };

            if (this.isProduction) {
                // Здесь будет реальная отправка email через nodemailer
                // await this.sendRealEmail(emailContent);
                console.log(`[PRODUCTION] Email отправлен на: ${email}`);
            } else {
                // В разработке выводим ссылку в консоль
                console.log('\n📧 === ТЕСТОВЫЙ EMAIL ДЛЯ СБРОСА ПАРОЛЯ ===');
                console.log(`📨 Кому: ${email}`);
                console.log(`📝 Тема: ${emailContent.subject}`);
                console.log(`🔗 Ссылка для сброса: ${resetLink}`);
                console.log(`⏰ Действительна до: ${new Date(Date.now() + 3600000).toLocaleString()}`);
                console.log('==========================================\n');
            }

            return true;
        } catch (error) {
            console.error('Ошибка отправки email:', error);
            return false;
        }
    }

    // Метод для реальной отправки email (заглушка)
    async sendRealEmail(emailContent) {
        // Реализация с использованием nodemailer
        // const nodemailer = require('nodemailer');
        // const transporter = nodemailer.createTransport({...});
        // await transporter.sendMail(emailContent);
    }
}

module.exports = new EmailService();