const { DataTypes } = require('sequelize');
const { sequelize } = require('../database');

const Review = sequelize.define('Review', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    productId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'products',
            key: 'id'
        }
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    text: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
            len: [10, 2000]
        }
    },
    rating: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 5,
        validate: {
            min: 1,
            max: 5
        }
    }
}, {
    tableName: 'reviews',
    timestamps: true,
    indexes: [
        {
            fields: ['productId']
        },
        {
            fields: ['userId']
        },
        {
            unique: true,
            fields: ['productId', 'userId'] // Один отзыв на товар от пользователя
        }
    ]
});

module.exports = Review;