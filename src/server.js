const express = require('express');
const productsRouter = require('./routes/products');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware для парсинга JSON
app.use(express.json());

// Middleware для логирования запросов
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// Основной маршрут
app.get('/', (req, res) => {
    res.json({
        message: 'Добро пожаловать в API управления товарами!',
        endpoints: {
            getAllProducts: 'GET /api/products',
            getProductById: 'GET /api/products/:id',
            addProduct: 'POST /api/products',
            updateProduct: 'PUT /api/products/:id',
            patchProduct: 'PATCH /api/products/:id',
            deleteProduct: 'DELETE /api/products/:id'
        },
        documentation: 'Для использования API отправляйте JSON запросы на указанные endpoints'
    });
});

// Маршруты для товаров
app.use('/api/products', productsRouter);

// Обработка 404 ошибок
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
app.listen(PORT, () => {
    console.log(`Сервер запущен на порту ${PORT}`);
    console.log(`Доступные endpoints:`);
    console.log(`  http://localhost:${PORT}/`);
    console.log(`  http://localhost:${PORT}/api/products`);
});