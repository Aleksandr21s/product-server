const { DataTypes } = require('sequelize');
const { sequelize } = require('../database');
const Category = require('./Category');

const Product = sequelize.define('Product', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    price: {
        type: DataTypes.DECIMAL(10, 2), // 10 цифр, 2 после запятой
        allowNull: false
    },
    inStock: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    tableName: 'products',
    timestamps: true
});

// Устанавливаем связь: Категория имеет много Продуктов
Category.hasMany(Product, {
    foreignKey: 'categoryId',
    as: 'products'
});

// Продукт принадлежит одной Категории
Product.belongsTo(Category, {
    foreignKey: 'categoryId',
    as: 'category'
});

module.exports = Product;