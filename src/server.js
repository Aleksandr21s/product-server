require('dotenv').config();
const express = require('express');
const path = require('path');
const fs = require('fs-extra');
const { testConnection } = require('./database');
const authRoutes = require('./routes/auth');
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
        message: 'Добро пожаловать в API управления товарами с аутентификацией!',
        version: '2.0.0',
        features: [
            'Аутентификация и авторизация пользователей',
            'JWT токены для защиты API',
            'Управление товарами и категориями',
            'Загрузка изображений',
            'Ролевая модель (user/admin)',
            'Связь товаров с пользователями'
        ],
        endpoints: {
            auth: {
                register: 'POST /api/auth/register',
                login: 'POST /api/auth/login',
                getCurrentUser: 'GET /api/auth/me (требуется токен)',
                updateProfile: 'PUT /api/auth/profile (требуется токен)',
                changePassword: 'PUT /api/auth/change-password (требуется токен)'
            },
            products: {
                getAll: 'GET /api/products',
                getById: 'GET /api/products/:id',
                create: 'POST /api/products (требуется токен)',
                createWithMultipleImages: 'POST /api/products/multiple (требуется токен)',
                update: 'PUT /api/products/:id (требуется токен)',
                delete: 'DELETE /api/products/:id (требуется токен)',
                uploadImage: 'POST /api/products/:id/upload (требуется токен)',
                uploadMultipleImages: 'POST /api/products/:id/upload-multiple (требуется токен)',
                deleteImage: 'DELETE /api/products/:id/images/:imageIndex (требуется токен)'
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
            register: {
                method: 'POST',
                url: '/api/auth/register',
                body: {
                    username: 'newuser',
                    email: 'user@example.com',
                    password: 'password123',
                    confirmPassword: 'password123',
                    firstName: 'Иван',
                    lastName: 'Петров'
                }
            },
            login: {
                method: 'POST',
                url: '/api/auth/login',
                body: {
                    email: 'user@example.com',
                    password: 'password123'
                }
            },
            createProduct: {
                method: 'POST',
                url: '/api/products',
                headers: {
                    'Authorization': 'Bearer YOUR_JWT_TOKEN'
                },
                body: {
                    name: 'Новый товар',
                    price: 1000,
                    categoryId: 1
                }
            }
        },
        testAccounts: {
            admin: {
                email: 'admin@example.com',
                password: 'admin123',
                role: 'admin'
            },
            user: {
                email: 'user1@example.com',
                password: 'user123',
                role: 'user'
            }
        }
    });
});

// Тестовый HTML для загрузки файлов
app.get('/upload-test', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Тест загрузки файлов и аутентификации</title>
            <style>
                body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
                .section { margin: 30px 0; padding: 20px; border: 1px solid #ddd; border-radius: 5px; }
                h1 { color: #333; }
                h2 { color: #666; margin-top: 0; }
                input, button { margin: 10px 0; padding: 8px; }
                button { background: #007bff; color: white; border: none; cursor: pointer; }
                button:hover { background: #0056b3; }
                .result { margin: 10px 0; padding: 10px; background: #f8f9fa; border-radius: 3px; }
            </style>
        </head>
        <body>
            <h1>Тестирование API с аутентификацией</h1>
            
            <div class="section">
                <h2>1. Регистрация пользователя</h2>
                <form id="registerForm">
                    <input type="text" name="username" placeholder="Имя пользователя" required><br>
                    <input type="email" name="email" placeholder="Email" required><br>
                    <input type="password" name="password" placeholder="Пароль" required><br>
                    <input type="password" name="confirmPassword" placeholder="Подтвердите пароль" required><br>
                    <input type="text" name="firstName" placeholder="Имя"><br>
                    <input type="text" name="lastName" placeholder="Фамилия"><br>
                    <button type="submit">Зарегистрироваться</button>
                </form>
                <div id="registerResult" class="result"></div>
            </div>
            
            <div class="section">
                <h2>2. Вход в систему</h2>
                <form id="loginForm">
                    <input type="email" name="email" placeholder="Email" required><br>
                    <input type="password" name="password" placeholder="Пароль" required><br>
                    <button type="submit">Войти</button>
                </form>
                <div id="loginResult" class="result"></div>
            </div>
            
            <div class="section">
                <h2>3. Создать товар (требуется токен)</h2>
                <form id="productForm">
                    <input type="text" name="name" placeholder="Название товара" required><br>
                    <input type="number" name="price" placeholder="Цена" step="0.01" required><br>
                    <input type="number" name="categoryId" placeholder="ID категории" value="1" required><br>
                    <input type="file" name="image" accept="image/*"><br>
                    <button type="submit">Создать товар</button>
                </form>
                <div id="productResult" class="result"></div>
            </div>
            
            <div class="section">
                <h2>4. Получить все товары</h2>
                <button onclick="getProducts()">Получить товары</button>
                <div id="productsResult" class="result"></div>
            </div>
            
            <script>
                let token = '';
                
                // Регистрация
                document.getElementById('registerForm').addEventListener('submit', async (e) => {
                    e.preventDefault();
                    const formData = new FormData(e.target);
                    const data = Object.fromEntries(formData.entries());
                    
                    try {
                        const response = await fetch('/api/auth/register', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(data)
                        });
                        const result = await response.json();
                        document.getElementById('registerResult').innerHTML = 
                            \`<strong>\${response.status} \${response.statusText}</strong><br>\${JSON.stringify(result, null, 2)}\`;
                    } catch (error) {
                        document.getElementById('registerResult').innerHTML = 'Ошибка: ' + error.message;
                    }
                });
                
                // Вход
                document.getElementById('loginForm').addEventListener('submit', async (e) => {
                    e.preventDefault();
                    const formData = new FormData(e.target);
                    const data = Object.fromEntries(formData.entries());
                    
                    try {
                        const response = await fetch('/api/auth/login', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(data)
                        });
                        const result = await response.json();
                        document.getElementById('loginResult').innerHTML = 
                            \`<strong>\${response.status} \${response.statusText}</strong><br>\${JSON.stringify(result, null, 2)}\`;
                        
                        if (result.success) {
                            token = result.data.token;
                            alert('Токен получен! Теперь можно создавать товары.');
                        }
                    } catch (error) {
                        document.getElementById('loginResult').innerHTML = 'Ошибка: ' + error.message;
                    }
                });
                
                // Создание товара
                document.getElementById('productForm').addEventListener('submit', async (e) => {
                    e.preventDefault();
                    if (!token) {
                        alert('Сначала войдите в систему!');
                        return;
                    }
                    
                    const formData = new FormData(e.target);
                    
                    try {
                        const response = await fetch('/api/products', {
                            method: 'POST',
                            headers: { 'Authorization': \`Bearer \${token}\` },
                            body: formData
                        });
                        const result = await response.json();
                        document.getElementById('productResult').innerHTML = 
                            \`<strong>\${response.status} \${response.statusText}</strong><br>\${JSON.stringify(result, null, 2)}\`;
                    } catch (error) {
                        document.getElementById('productResult').innerHTML = 'Ошибка: ' + error.message;
                    }
                });
                
                // Получение товаров
                async function getProducts() {
                    try {
                        const response = await fetch('/api/products');
                        const result = await response.json();
                        document.getElementById('productsResult').innerHTML = 
                            \`<strong>\${response.status} \${response.statusText}</strong><br>\${JSON.stringify(result, null, 2)}\`;
                    } catch (error) {
                        document.getElementById('productsResult').innerHTML = 'Ошибка: ' + error.message;
                    }
                }
            </script>
        </body>
        </html>
    `);
});

// Маршруты API
app.use('/api/auth', authRoutes);
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
    console.error('❌ Ошибка сервера:', err.stack);
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
            console.log(`

Сервер запущен!

Порт: ${PORT}                                            
База данных: ${process.env.DB_STORAGE || 'database.sqlite'} 
JWT: ${process.env.JWT_SECRET ? '✅ Настроен' : '❌ Не настроен!'} 

🌐 Основной URL: http://localhost:${PORT}/
📝 Тестовая страница: http://localhost:${PORT}/upload-test

👤 Тестовые аккаунты:
   Администратор:
     Email: admin@example.com
     Пароль: admin123
     Роль: admin
   
   Пользователь:
     Email: user1@example.com
     Пароль: user123
     Роль: user

📋 Ключевые endpoints:
   🔐 Регистрация: POST /api/auth/register
   🔑 Вход:        POST /api/auth/login
   📦 Товары:      GET /api/products
   📁 Категории:   GET /api/categories

💡 Совет: Используйте Postman или тестовую страницу для проверки API.
            `);
        });
    } catch (error) {
        console.error('❌ Не удалось запустить сервер:', error);
        process.exit(1);
    }
};

startServer();