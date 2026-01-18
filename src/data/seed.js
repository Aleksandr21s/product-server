const { sequelize, User, Category, Product, Review, Order, OrderItem } = require('../models');
const bcrypt = require('bcryptjs');

const seedDatabase = async () => {
    try {
        console.log('🔄 Начинаю заполнение базы данных новой схемы...');
        
        await sequelize.sync({ force: true });
        console.log('✅ База данных синхронизирована');
        
        // Создаём пользователей
        const salt = await bcrypt.genSalt(10);
        
        const users = await User.bulkCreate([
            {
                email: 'admin@example.com',
                password: await bcrypt.hash('admin123', salt),
                firstName: 'Админ',
                lastName: 'Системный',
                role: 'admin',
                activated: true,
                isActive: true
            },
            {
                email: 'user1@example.com',
                password: await bcrypt.hash('user123', salt),
                firstName: 'Иван',
                lastName: 'Петров',
                role: 'user',
                activated: true,
                isActive: true
            },
            {
                email: 'user2@example.com',
                password: await bcrypt.hash('user123', salt),
                firstName: 'Мария',
                lastName: 'Сидорова',
                role: 'user',
                activated: true,
                isActive: true
            }
        ]);
        console.log(`✅ Создано ${users.length} пользователей`);
        
        // Создаём категории
        const categories = await Category.bulkCreate([
            { name: 'Электроника', description: 'Техника и гаджеты' },
            { name: 'Книги', description: 'Художественная и учебная литература' },
            { name: 'Одежда', description: 'Мужская и женская одежда' },
            { name: 'Продукты питания', description: 'Продукты питания' },
            { name: 'Дом и сад', description: 'Товары для дома и сада' }
        ]);
        console.log(`✅ Создано ${categories.length} категорий`);
        
        // Создаём товары
        const products = await Product.bulkCreate([
            // Электроника
            {
                name: 'Ноутбук Dell XPS 13',
                image: 'laptop.jpg',
                description: '13-дюймовый ноутбук с процессором Intel Core i7',
                price: 129999.99,
                categoryId: 1,
                stockQuantity: 10
            },
            {
                name: 'Смартфон iPhone 14 Pro',
                image: 'iphone.jpg',
                description: 'Смартфон Apple с камерой 48 МП',
                price: 99999.50,
                categoryId: 1,
                stockQuantity: 15
            },
            {
                name: 'Наушники Sony WH-1000XM5',
                image: 'headphones.jpg',
                description: 'Беспроводные наушники с шумоподавлением',
                price: 29999.00,
                categoryId: 1,
                stockQuantity: 25
            },
            // Книги
            {
                name: 'Книга "Чистый код"',
                image: 'clean_code.jpg',
                description: 'Роберт Мартин. Искусство написания чистого кода',
                price: 2499.00,
                categoryId: 2,
                stockQuantity: 50
            },
            {
                name: 'Книга "Гарри Поттер и философский камень"',
                image: 'harry_potter.jpg',
                description: 'Дж. К. Роулинг. Первая книга серии',
                price: 899.00,
                categoryId: 2,
                stockQuantity: 100
            },
            // Одежда
            {
                name: 'Футболка мужская хлопковая',
                image: 'tshirt.jpg',
                description: 'Хлопковая футболка, размер M',
                price: 1999.00,
                categoryId: 3,
                stockQuantity: 200
            },
            {
                name: 'Джинсы Levi\'s 501',
                image: 'jeans.jpg',
                description: 'Классические джинсы',
                price: 5999.00,
                categoryId: 3,
                stockQuantity: 75
            },
            // Продукты
            {
                name: 'Кофе в зёрнах Lavazza',
                image: 'coffee.jpg',
                description: '1 кг, 100% арабика',
                price: 1499.00,
                categoryId: 4,
                stockQuantity: 300
            },
            // Дом и сад
            {
                name: 'Горшок для цветов керамический',
                image: 'flower_pot.jpg',
                description: 'Керамический горшок, диаметр 20 см',
                price: 799.00,
                categoryId: 5,
                stockQuantity: 150
            }
        ]);
        console.log(`✅ Создано ${products.length} товаров`);
        
        // Создаём отзывы
        const reviews = await Review.bulkCreate([
            {
                productId: 1,
                userId: 2,
                text: 'Отличный ноутбук! Быстрый, лёгкий, экран просто супер.',
                rating: 5
            },
            {
                productId: 1,
                userId: 3,
                text: 'Хороший ноутбук, но дорогой. Батареи хватает на весь день.',
                rating: 4
            },
            {
                productId: 2,
                userId: 2,
                text: 'Лучший смартфон на рынке! Камера просто потрясающая.',
                rating: 5
            },
            {
                productId: 4,
                userId: 3,
                text: 'Обязательная книга для каждого программиста.',
                rating: 5
            },
            {
                productId: 6,
                userId: 2,
                text: 'Удобная футболка, качественный материал.',
                rating: 4
            }
        ]);
        console.log(`✅ Создано ${reviews.length} отзывов`);
        
        // Создаём заказы
        const orders = await Order.bulkCreate([
            {
                userId: 2,
                date: new Date('2024-01-15'),
                amount: 159998.99, // Ноутбук + наушники
                status: 'delivered',
                shippingAddress: 'ул. Ленина, д. 10, кв. 25',
                paymentMethod: 'card',
                paymentStatus: 'paid'
            },
            {
                userId: 3,
                date: new Date('2024-01-20'),
                amount: 12999.00, // 2 книги + кофе
                status: 'processing',
                shippingAddress: 'пр. Мира, д. 45, кв. 12',
                paymentMethod: 'card',
                paymentStatus: 'paid'
            }
        ]);
        console.log(`✅ Создано ${orders.length} заказов`);
        
        // Создаём элементы заказа
        const orderItems = await OrderItem.bulkCreate([
            // Заказ 1
            {
                orderId: 1,
                productId: 1,
                priceAtATime: 129999.99,
                quantity: 1
            },
            {
                orderId: 1,
                productId: 3,
                priceAtATime: 29999.00,
                quantity: 1
            },
            // Заказ 2
            {
                orderId: 2,
                productId: 4,
                priceAtATime: 2499.00,
                quantity: 2
            },
            {
                orderId: 2,
                productId: 8,
                priceAtATime: 1499.00,
                quantity: 3
            }
        ]);
        console.log(`✅ Создано ${orderItems.length} элементов заказа`);
        
        // Обновляем количество товаров на складе после создания заказов
        await Product.update({ stockQuantity: 9 }, { where: { id: 1 } }); // Ноутбук
        await Product.update({ stockQuantity: 24 }, { where: { id: 3 } }); // Наушники
        await Product.update({ stockQuantity: 48 }, { where: { id: 4 } }); // Книга Чистый код
        await Product.update({ stockQuantity: 297 }, { where: { id: 8 } }); // Кофе
        
        console.log('\n' + '='.repeat(60));
        console.log('🎉 БАЗА ДАННЫХ УСПЕШНО ЗАПОЛНЕНА!');
        console.log('='.repeat(60));
        
        console.log('\n📊 СТАТИСТИКА:');
        console.log(`   👥 Пользователей: ${users.length}`);
        console.log(`   📁 Категорий: ${categories.length}`);
        console.log(`   🛒 Товаров: ${products.length}`);
        console.log(`   ⭐ Отзывов: ${reviews.length}`);
        console.log(`   📦 Заказов: ${orders.length}`);
        console.log(`   🛍️ Элементов заказа: ${orderItems.length}`);
        
        console.log('\n🔗 ПРИМЕРЫ ЗАПРОСОВ:');
        console.log('   GET  /api/products?page=1&limit=10&categoryId=1');
        console.log('   GET  /api/products?minPrice=1000&maxPrice=50000&sortBy=price&sortOrder=ASC');
        console.log('   GET  /api/orders/my-orders (требуется авторизация)');
        console.log('   POST /api/orders (создание заказа)');
        
        console.log('\n' + '='.repeat(60));
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Ошибка при заполнении базы данных:', error);
        process.exit(1);
    }
};

seedDatabase();