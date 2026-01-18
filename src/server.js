const express = require('express');
const path = require('path');
const fs = require('fs-extra');
const { testConnection } = require('./database');
const productRoutes = require('./routes/products');
const categoryRoutes = require('./routes/categories');

const app = express();
const PORT = process.env.PORT || 3000;

// Создаём символические ссылки для статических файлов
const createSymlinks = async () => {
    try {
        const links = [
            { target: './uploads/products', link: './public/images/products' },
            { target: './uploads/categories', link: './public/images/categories' }
        ];
        
        for (const { target, link } of links) {
            if (await fs.pathExists(target)) {
                if (await fs.pathExists(link)) {
                    await fs.remove(link);
                }
                await fs.ensureSymlink(path.resolve(target), path.resolve(link));
            }
        }
    } catch (error) {
        console.warn('⚠️ Не удалось создать символические ссылки:', error.message);
    }
};

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Раздаём статические файлы
app.use('/images', express.static(path.join(__dirname, '../uploads')));
app.use('/public', express.static(path.join(__dirname, '../public')));

// Логирование запросов
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// Основной маршрут
app.get('/', (req, res) => {
    res.json({
        message: 'Добро пожаловать в API управления товарами с базой данных и загрузкой файлов!',
        endpoints: {
            products: {
                getAll: 'GET /api/products',
                getById: 'GET /api/products/:id',
                create: 'POST /api/products',
                createWithMultipleImages: 'POST /api/products/multiple',
                update: 'PUT /api/products/:id',
                delete: 'DELETE /api/products/:id',
                uploadImage: 'POST /api/products/:id/upload',
                uploadMultipleImages: 'POST /api/products/:id/upload-multiple'
            },
            categories: {
                getAll: 'GET /api/categories',
                getById: 'GET /api/categories/:id',
                create: 'POST /api/categories',
                update: 'PUT /api/categories/:id',
                delete: 'DELETE /api/categories/:id',
                uploadImage: 'POST /api/categories/:id/upload'
            },
            staticFiles: {
                images: 'GET /images/:type/:filename',
                public: 'GET /public/:path'
            }
        },
        examples: {
            uploadImage: 'Используйте multipart/form-data с полем "image"',
            uploadMultiple: 'Используйте multipart/form-data с полем "images[]"'
        }
    });
});

// Маршруты API
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);

// Пример маршрута для тестирования загрузки файлов
app.get('/upload-test', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Тест загрузки файлов</title>
        </head>
        <body>
            <h1>Тест загрузки файла в категорию</h1>
            <form action="/api/categories/1/upload" method="POST" enctype="multipart/form-data">
                <input type="file" name="image" accept="image/*">
                <button type="submit">Загрузить</button>
            </form>
            
            <h1>Тест создания товара с изображением</h1>
            <form action="/api/products" method="POST" enctype="multipart/form-data">
                <input type="text" name="name" placeholder="Название" required><br>
                <input type="number" name="price" placeholder="Цена" step="0.01" required><br>
                <input type="number" name="categoryId" placeholder="ID категории" required><br>
                <input type="file" name="image" accept="image/*"><br>
                <button type="submit">Создать товар</button>
            </form>
        </body>
        </html>
    `);
});

// Обработка 404
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Маршрут не найден'
    });
});

// Обработка ошибок
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: 'Внутренняя ошибка сервера',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// Запуск сервера
const startServer = async () => {
    try {
        // Проверяем подключение к базе данных
        await testConnection();
        
        // Создаём символические ссылки
        await createSymlinks();
        
        app.listen(PORT, () => {
            console.log(`🚀 Сервер запущен на порту ${PORT}`);
            console.log(`📁 База данных: database.sqlite`);
            console.log(`📁 Папка загрузок: ./uploads/`);
            console.log(`🌐 Основной URL: http://localhost:${PORT}/`);
            console.log(`📸 Тест загрузки: http://localhost:${PORT}/upload-test`);
            console.log(`\n📋 Примеры запросов:`);
            console.log(`  Загрузить изображение категории: POST /api/categories/1/upload`);
            console.log(`  Создать товар с фото: POST /api/products (multipart/form-data)`);
            console.log(`  Просмотреть изображение: GET /images/products/filename.jpg`);
        });
    } catch (error) {
        console.error('❌ Не удалось запустить сервер:', error);
        process.exit(1);
    }
};

startServer();