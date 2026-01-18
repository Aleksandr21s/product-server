const express = require('express');
const router = express.Router();

// Минимальные обработчики прямо в маршрутах
router.post('/register', (req, res) => {
    res.json({ success: true, message: 'Регистрация работает' });
});

router.post('/login', (req, res) => {
    res.json({ 
        success: true, 
        message: 'Вход работает',
        data: {
            user: { id: 1, email: 'test@example.com' },
            token: 'test-token'
        }
    });
});

router.get('/me', (req, res) => {
    res.json({ success: true, data: { id: 1, email: 'test@example.com' } });
});

module.exports = router;