require('dotenv').config();
const express = require('express');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());


// Минимальные маршруты для тестирования
const router = express.Router();

// 1. Простейший маршрут - работает
router.get('/test', (req, res) => {
    res.json({ success: true, message: 'Тест работает!' });
});

// 2. Маршрут с импортированной функцией - проверим
const authController = require('./controllers/authController');

console.log('Проверяем функции контроллера:');
console.log('register:', typeof authController.register);
console.log('login:', typeof authController.login);
console.log('getForgotPasswordPage:', typeof authController.getForgotPasswordPage);

// Добавляем только рабочие маршруты
if (typeof authController.register === 'function') {
    router.post('/register', authController.register);
} else {
    console.log('❌ Функция register не найдена');
    router.post('/register', (req, res) => {
        res.json({ error: 'Функция register недоступна' });
    });
}

if (typeof authController.login === 'function') {
    router.post('/login', authController.login);
} else {
    console.log('❌ Функция login не найдена');
    router.post('/login', (req, res) => {
        res.json({ error: 'Функция login недоступна' });
    });
}

app.use('/api/auth', router);

// Основной маршрут
app.get('/', (req, res) => {
    res.json({
        message: 'Сервер работает!',
        endpoints: {
            test: 'GET /api/auth/test',
            register: 'POST /api/auth/register',
            login: 'POST /api/auth/login'
        }
    });
});

app.listen(PORT, () => {
    console.log(`🚀 Сервер запущен на порту ${PORT}`);
    console.log(`🌐 http://localhost:${PORT}`);
});