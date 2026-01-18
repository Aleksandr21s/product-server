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
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        }
    },
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

const User = require('./User');

// Владелец товара
Product.belongsTo(User, {
    foreignKey: 'userId',
    as: 'owner'
});

User.hasMany(Product, {
    foreignKey: 'userId',
    as: 'products'
});