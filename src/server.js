const express = require('express');
const { testConnection } = require('./database');
const productRoutes = require('./routes/products');
const categoryRoutes = require('./routes/categories');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Логирование запросов
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// Основной маршрут
app.get('/', (req, res) => {
    res.json({
        message: 'Добро пожаловать в API управления товарами с базой данных!',
        endpoints: {
            products: {
                getAll: 'GET /api/products',
                getById: 'GET /api/products/:id',
                create: 'POST /api/products',
                update: 'PUT /api/products/:id',
                delete: 'DELETE /api/products/:id'
            },
            categories: {
                getAll: 'GET /api/categories',
                create: 'POST /api/categories'
            }
        },
        documentation: 'Для работы с API используйте JSON формат запросов'
    });
});

// Маршруты API
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);

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
        
        app.listen(PORT, () => {
            console.log(`🚀 Сервер запущен на порту ${PORT}`);
            console.log(`📁 База данных: database.sqlite`);
            console.log(`🌐 Документация API: http://localhost:${PORT}/`);
            console.log('\n📋 Доступные endpoints:');
            console.log(`  GET  http://localhost:${PORT}/api/products`);
            console.log(`  POST http://localhost:${PORT}/api/products`);
            console.log(`  GET  http://localhost:${PORT}/api/categories`);
            console.log(`\n💡 Для заполнения БД начальными данными: npm run db:init`);
        });
    } catch (error) {
        console.error('❌ Не удалось запустить сервер:', error);
        process.exit(1);
    }
};

startServer();