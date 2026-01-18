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
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    inStock: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    imageUrl: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null
    },
    images: {
        type: DataTypes.JSON, // JSON массив для нескольких изображений
        allowNull: true,
        defaultValue: []
    }
}, {
    tableName: 'products',
    timestamps: true
});

// Связи
Category.hasMany(Product, {
    foreignKey: 'categoryId',
    as: 'products'
});

Product.belongsTo(Category, {
    foreignKey: 'categoryId',
    as: 'category'
});

module.exports = Product;