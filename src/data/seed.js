const { sequelize } = require('../database');
const Category = require('../models/Category');
const Product = require('../models/Product');
const fs = require('fs-extra');
const path = require('path');

const seedDatabase = async () => {
    try {
        // Синхронизируем модели с базой данных
        await sequelize.sync({ force: true });
        console.log('✅ База данных синхронизирована');
        
        // Создаём папки для загрузок
        await fs.ensureDir('./uploads/products');
        await fs.ensureDir('./uploads/categories');
        await fs.ensureDir('./public/images');
        
        // Создаём категории
        const categories = await Category.bulkCreate([
            { 
                name: 'Электроника', 
                description: 'Техника и гаджеты',
                imageUrl: null // Можно добавить URL изображения
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
                name: 'Продукты', 
                description: 'Продукты питания',
                imageUrl: null
            }
        ]);
        console.log(`✅ Создано ${categories.length} категорий`);
        
        // Создаём товары
        const products = await Product.bulkCreate([
            {
                name: 'Ноутбук Dell XPS 13',
                description: '13-дюймовый ноутбук с процессором Intel Core i7',
                price: 129999.99,
                categoryId: 1,
                inStock: true,
                imageUrl: null,
                images: []
            },
            {
                name: 'Смартфон iPhone 14 Pro',
                description: 'Смартфон Apple с камерой 48 МП',
                price: 99999.50,
                categoryId: 1,
                inStock: true,
                imageUrl: null,
                images: []
            },
            {
                name: 'Книга "Чистый код"',
                description: 'Роберт Мартин. Искусство написания чистого кода',
                price: 2499.00,
                categoryId: 2,
                inStock: false,
                imageUrl: null,
                images: []
            }
        ]);
        console.log(`✅ Создано ${products.length} товаров`);
        
        console.log('\n🎉 База данных успешно заполнена!');
        console.log('💡 Теперь можно загружать изображения через API');
        console.log('📸 Пример: POST /api/categories/1/upload с файлом в поле "image"');
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Ошибка при заполнении базы данных:', error);
        process.exit(1);
    }
};

seedDatabase();