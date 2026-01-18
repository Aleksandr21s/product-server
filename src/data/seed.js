const { sequelize } = require('../database');
const Category = require('../models/Category');
const Product = require('../models/Product');

const seedDatabase = async () => {
    try {
        // Синхронизируем модели с базой данных
        // force: true - удалит все таблицы и создаст заново (только для разработки!)
        await sequelize.sync({ force: true });
        console.log('✅ База данных синхронизирована');
        
        // Создаём категории
        const categories = await Category.bulkCreate([
            { name: 'Электроника', description: 'Техника и гаджеты' },
            { name: 'Книги', description: 'Художественная и учебная литература' },
            { name: 'Одежда', description: 'Мужская и женская одежда' },
            { name: 'Продукты', description: 'Продукты питания' }
        ]);
        console.log(`✅ Создано ${categories.length} категорий`);
        
        // Создаём товары
        const products = await Product.bulkCreate([
            {
                name: 'Ноутбук Dell XPS 13',
                description: '13-дюймовый ноутбук с процессором Intel Core i7',
                price: 129999.99,
                categoryId: 1, // Электроника
                inStock: true
            },
            {
                name: 'Смартфон iPhone 14 Pro',
                description: 'Смартфон Apple с камерой 48 МП',
                price: 99999.50,
                categoryId: 1, // Электроника
                inStock: true
            },
            {
                name: 'Наушники Sony WH-1000XM5',
                description: 'Беспроводные наушники с шумоподавлением',
                price: 29999.00,
                categoryId: 1, // Электроника
                inStock: true
            },
            {
                name: 'Книга "Чистый код"',
                description: 'Роберт Мартин. Искусство написания чистого кода',
                price: 2499.00,
                categoryId: 2, // Книги
                inStock: false
            },
            {
                name: 'Футболка мужская',
                description: 'Хлопковая футболка, размер M',
                price: 1999.00,
                categoryId: 3, // Одежда
                inStock: true
            }
        ]);
        console.log(`✅ Создано ${products.length} товаров`);
        
        console.log('✅ База данных успешно заполнена начальными данными!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Ошибка при заполнении базы данных:', error);
        process.exit(1);
    }
};

seedDatabase();