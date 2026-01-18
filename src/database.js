const { Sequelize } = require('sequelize');

// Создаём подключение к базе данных
// 'database.sqlite' - файл базы данных (создастся автоматически)
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: './database.sqlite',
    logging: false // отключаем логи SQL запросов в консоль
});

// Проверяем подключение
const testConnection = async () => {
    try {
        await sequelize.authenticate();
        console.log('✅ Подключение к базе данных успешно!');
    } catch (error) {
        console.error('❌ Ошибка подключения к базе данных:', error);
    }
};

module.exports = { sequelize, testConnection };