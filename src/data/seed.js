const { sequelize } = require('../database');
const User = require('../models/User');
const Category = require('../models/Category');
const Product = require('../models/product');
const PasswordReset = require('../models/PasswordReset');
const fs = require('fs-extra');
const path = require('path');
const bcrypt = require('bcryptjs');

const seedDatabase = async () => {
    try {
        console.log('🔄 Начинаю заполнение базы данных...');
        
        // Синхронизируем модели с базой данных
        await sequelize.sync({ force: true });
        console.log('✅ База данных синхронизирована');
        
        // Создаём папки для загрузок
        await fs.ensureDir('./uploads/products');
        await fs.ensureDir('./uploads/categories');
        await fs.ensureDir('./uploads/temp');
        await fs.ensureDir('./public/images');
        console.log('✅ Папки для загрузок созданы');
        
        // Создаём пользователей
        const salt = await bcrypt.genSalt(10);
        
        const users = await User.bulkCreate([
            {
                username: 'admin',
                email: 'admin@example.com',
                password: await bcrypt.hash('admin123', salt),
                firstName: 'Администратор',
                lastName: 'Системы',
                role: 'admin',
                isActive: true,
                lastLogin: new Date()
            },
            {
                username: 'user1',
                email: 'user1@example.com',
                password: await bcrypt.hash('user123', salt),
                firstName: 'Иван',
                lastName: 'Петров',
                role: 'user',
                isActive: true,
                lastLogin: new Date()
            },
            {
                username: 'user2',
                email: 'user2@example.com',
                password: await bcrypt.hash('user123', salt),
                firstName: 'Мария',
                lastName: 'Сидорова',
                role: 'user',
                isActive: true,
                lastLogin: new Date()
            },
            {
                username: 'inactive_user',
                email: 'inactive@example.com',
                password: await bcrypt.hash('user123', salt),
                firstName: 'Неактивный',
                lastName: 'Пользователь',
                role: 'user',
                isActive: false,
                lastLogin: null
            }
        ]);
        console.log(`✅ Создано ${users.length} пользователей`);
        
        // Создаём категории
        const categories = await Category.bulkCreate([
            { 
                name: 'Электроника', 
                description: 'Техника и гаджеты',
                imageUrl: null
            },
            { 
                name: 'Книги', 
                description: 'Художественная и учебная литература',
                imageUrl: null
            },
            { 
                name: 'Одежда', 
                description: 'Мужская и женская одежда',
                imageUrl: null
            },
            { 
                name: 'Продукты питания', 
                description: 'Продукты питания и напитки',
                imageUrl: null
            },
            { 
                name: 'Спорт', 
                description: 'Спортивные товары и инвентарь',
                imageUrl: null
            }
        ]);
        console.log(`✅ Создано ${categories.length} категорий`);
        
        // Создаём товары
        const products = await Product.bulkCreate([
            {
                name: 'Ноутбук Dell XPS 13',
                description: '13-дюймовый ноутбук с процессором Intel Core i7, 16GB RAM, 512GB SSD',
                price: 129999.99,
                categoryId: 1,
                userId: 1,
                inStock: true,
                imageUrl: null,
                images: []
            },
            {
                name: 'Смартфон iPhone 14 Pro',
                description: 'Смартфон Apple с камерой 48 МП, процессором A16 Bionic',
                price: 99999.50,
                categoryId: 1,
                userId: 2,
                inStock: true,
                imageUrl: null,
                images: []
            },
            {
                name: 'Наушники Sony WH-1000XM5',
                description: 'Беспроводные наушники с шумоподавлением, 30 часов работы',
                price: 29999.00,
                categoryId: 1,
                userId: 1,
                inStock: true,
                imageUrl: null,
                images: []
            },
            {
                name: 'Книга "Чистый код"',
                description: 'Роберт Мартин. Искусство написания чистого кода',
                price: 2499.00,
                categoryId: 2,
                userId: 3,
                inStock: false,
                imageUrl: null,
                images: []
            },
            {
                name: 'Книга "Гарри Поттер и философский камень"',
                description: 'Дж. К. Роулинг. Первая книга серии о Гарри Поттере',
                price: 899.00,
                categoryId: 2,
                userId: 2,
                inStock: true,
                imageUrl: null,
                images: []
            },
            {
                name: 'Футболка мужская хлопковая',
                description: 'Хлопковая футболка, размер M, чёрная',
                price: 1999.00,
                categoryId: 3,
                userId: 3,
                inStock: true,
                imageUrl: null,
                images: []
            },
            {
                name: 'Джинсы Levi\'s 501',
                description: 'Классические джинсы, синие, размер 32/32',
                price: 5999.00,
                categoryId: 3,
                userId: 1,
                inStock: true,
                imageUrl: null,
                images: []
            },
            {
                name: 'Кофе в зёрнах Lavazza',
                description: '1 кг, 100% арабика, средней обжарки',
                price: 1499.00,
                categoryId: 4,
                userId: 2,
                inStock: true,
                imageUrl: null,
                images: []
            },
            {
                name: 'Фитнес-браслет Xiaomi Mi Band 7',
                description: 'Умный браслет с пульсоксиметром, 1.62" AMOLED экран',
                price: 3999.00,
                categoryId: 5,
                userId: 3,
                inStock: true,
                imageUrl: null,
                images: []
            },
            {
                name: 'Йога-мат',
                description: 'Пенополиуретановый коврик для йоги, 183x61 см, 6 мм',
                price: 1299.00,
                categoryId: 5,
                userId: 1,
                inStock: true,
                imageUrl: null,
                images: []
            }
        ]);
        console.log(`✅ Создано ${products.length} товаров`);
        
        // Создаём тестовый токен для сброса пароля (для демонстрации)
        const testToken = require('crypto').randomBytes(32).toString('hex');
        const testExpiresAt = new Date(Date.now() + 3600000); // +1 час
        
        await PasswordReset.create({
            userId: 2, // user1
            token: testToken,
            expiresAt: testExpiresAt,
            used: false
        });
        console.log('✅ Создан тестовый токен для восстановления пароля');
        
        console.log('\n' + '='.repeat(60));
        console.log('🎉 БАЗА ДАННЫХ УСПЕШНО ЗАПОЛНЕНА!');
        console.log('='.repeat(60));
        
        console.log('\n👤 ТЕСТОВЫЕ ПОЛЬЗОВАТЕЛИ:');
        console.log('╔══════════════════════════════════════════════════════╗');
        console.log('║ Администратор:                                      ║');
        console.log('║   👤 Email:    admin@example.com                    ║');
        console.log('║   🔑 Пароль:   admin123                             ║');
        console.log('║   🎭 Роль:     admin                                ║');
        console.log('║   ✅ Статус:   Активен                              ║');
        console.log('╠══════════════════════════════════════════════════════╣');
        console.log('║ Обычный пользователь 1:                             ║');
        console.log('║   👤 Email:    user1@example.com                    ║');
        console.log('║   🔑 Пароль:   user123                              ║');
        console.log('║   🎭 Роль:     user                                 ║');
        console.log('║   👤 Имя:      Иван Петров                          ║');
        console.log('║   ✅ Статус:   Активен                              ║');
        console.log('╠══════════════════════════════════════════════════════╣');
        console.log('║ Обычный пользователь 2:                             ║');
        console.log('║   👤 Email:    user2@example.com                    ║');
        console.log('║   🔑 Пароль:   user123                              ║');
        console.log('║   🎭 Роль:     user                                 ║');
        console.log('║   👤 Имя:      Мария Сидорова                       ║');
        console.log('║   ✅ Статус:   Активен                              ║');
        console.log('╠══════════════════════════════════════════════════════╣');
        console.log('║ Неактивный пользователь:                            ║');
        console.log('║   👤 Email:    inactive@example.com                 ║');
        console.log('║   🔑 Пароль:   user123                              ║');
        console.log('║   🎭 Роль:     user                                 ║');
        console.log('║   👤 Имя:      Неактивный Пользователь              ║');
        console.log('║   ❌ Статус:   Неактивен (заблокирован)             ║');
        console.log('╚══════════════════════════════════════════════════════╝');
        
        console.log('\n📦 ТЕСТОВЫЕ ДАННЫЕ:');
        console.log(`   📚 Категорий: ${categories.length}`);
        console.log(`   🛒 Товаров:   ${products.length}`);
        console.log(`   👥 Пользователей: ${users.length}`);
        
        console.log('\n🔐 АУТЕНТИФИКАЦИЯ И ВОССТАНОВЛЕНИЕ ПАРОЛЯ:');
        console.log('╔══════════════════════════════════════════════════════╗');
        console.log('║ 📍 Регистрация нового пользователя:                 ║');
        console.log('║   METHOD: POST                                       ║');
        console.log('║   URL:    /api/auth/register                         ║');
        console.log('╠══════════════════════════════════════════════════════╣');
        console.log('║ 📍 Вход в систему:                                  ║');
        console.log('║   METHOD: POST                                       ║');
        console.log('║   URL:    /api/auth/login                            ║');
        console.log('╠══════════════════════════════════════════════════════╣');
        console.log('║ 📍 Запрос восстановления пароля:                    ║');
        console.log('║   METHOD: POST                                       ║');
        console.log('║   URL:    /api/auth/forgot-password                  ║');
        console.log('║   BODY:   {"email": "user1@example.com"}             ║');
        console.log('╠══════════════════════════════════════════════════════╣');
        console.log('║ 📍 Тестовый токен для восстановления:               ║');
        console.log('║   Токен:  ${testToken}               ║');
        console.log('║   Действителен до: ${testExpiresAt.toLocaleString()} ║');
        console.log('╠══════════════════════════════════════════════════════╣');
        console.log('║ 📍 Валидация токена:                                ║');
        console.log('║   METHOD: GET                                        ║');
        console.log('║   URL:    /api/auth/validate-reset-token/${testToken}║');
        console.log('╠══════════════════════════════════════════════════════╣');
        console.log('║ 📍 Сброс пароля:                                    ║');
        console.log('║   METHOD: POST                                       ║');
        console.log('║   URL:    /api/auth/reset-password/${testToken}      ║');
        console.log('║   BODY:   {"newPassword": "новыйпароль123",         ║');
        console.log('║            "confirmPassword": "новыйпароль123"}      ║');
        console.log('╚══════════════════════════════════════════════════════╝');
        
        console.log('\n🌐 ВЕБ-ИНТЕРФЕЙС:');
        console.log('   📧 Страница восстановления пароля:');
        console.log('      http://localhost:3000/api/auth/forgot-password-page');
        console.log('\n   🔗 Страница сброса пароля (с токеном):');
        console.log(`      http://localhost:3000/api/auth/reset-password-page/${testToken}`);
        
        console.log('\n📊 СТАТИСТИКА:');
        console.log('   👥 Пользователи по ролям:');
        const adminCount = users.filter(u => u.role === 'admin').length;
        const userCount = users.filter(u => u.role === 'user').length;
        console.log(`      • Администраторы: ${adminCount}`);
        console.log(`      • Обычные пользователи: ${userCount}`);
        
        console.log('\n   🛒 Товары по категориям:');
        for (const category of categories) {
            const productCount = products.filter(p => p.categoryId === category.id).length;
            console.log(`      • ${category.name}: ${productCount} товаров`);
        }
        
        console.log('\n   📈 Товары по наличию:');
        const inStockCount = products.filter(p => p.inStock).length;
        const outOfStockCount = products.length - inStockCount;
        console.log(`      • В наличии: ${inStockCount}`);
        console.log(`      • Нет в наличии: ${outOfStockCount}`);
        
        console.log('\n' + '='.repeat(60));
        console.log('💡 СОВЕТЫ:');
        console.log('='.repeat(60));
        console.log('   1. Для тестирования восстановления пароля используйте:');
        console.log('      POST /api/auth/forgot-password с email user1@example.com');
        console.log('\n   2. Ссылка для сброса пароля появится в консоли сервера');
        console.log('\n   3. Или используйте готовый тестовый токен выше');
        console.log('\n   4. В продакшене настройте .env переменные для email:');
        console.log('      SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS');
        console.log('='.repeat(60));
        
        process.exit(0);
    } catch (error) {
        console.error('❌ ОШИБКА ПРИ ЗАПОЛНЕНИИ БАЗЫ ДАННЫХ:');
        console.error('   Сообщение:', error.message);
        console.error('   Стек вызовов:', error.stack);
        
        if (error.name === 'SequelizeUniqueConstraintError') {
            console.error('\n   🔍 Возможные причины:');
            console.error('      • Дублирующиеся email или username');
            console.error('      • Нарушение уникальных ограничений');
        }
        
        if (error.name === 'SequelizeValidationError') {
            console.error('\n   🔍 Ошибки валидации:');
            error.errors.forEach((err, i) => {
                console.error(`      ${i + 1}. ${err.message} (${err.path})`);
            });
        }
        
        console.error('\n   🛠️  Рекомендации:');
        console.error('      • Проверьте настройки базы данных');
        console.error('      • Убедитесь, что все модели корректно экспортируются');
        console.error('      • Проверьте корректность данных в seed.js');
        
        process.exit(1);
    }
};

// Если файл запущен напрямую, выполняем заполнение
if (require.main === module) {
    seedDatabase();
} else {
    module.exports = seedDatabase;
}