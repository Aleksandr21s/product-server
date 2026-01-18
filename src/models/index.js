const { sequelize } = require('../database');
const User = require('./User');
const Category = require('./Category');
const Product = require('./product');
const Review = require('./Review');
const Order = require('./Order');
const OrderItem = require('./OrderItem');

// 1. Users ↔ Reviews (один ко многим)
User.hasMany(Review, {
    foreignKey: 'userId',
    as: 'reviews',
    onDelete: 'CASCADE'
});
Review.belongsTo(User, {
    foreignKey: 'userId',
    as: 'user'
});

// 2. Users ↔ Orders (один ко многим)
User.hasMany(Order, {
    foreignKey: 'userId',
    as: 'orders',
    onDelete: 'CASCADE'
});
Order.belongsTo(User, {
    foreignKey: 'userId',
    as: 'user'
});

// 3. Products ↔ Reviews (один ко многим)
Product.hasMany(Review, {
    foreignKey: 'productId',
    as: 'reviews',
    onDelete: 'CASCADE'
});
Review.belongsTo(Product, {
    foreignKey: 'productId',
    as: 'product'
});

// 4. Products ↔ Categories (многие к одному)
Category.hasMany(Product, {
    foreignKey: 'categoryId',
    as: 'products',
    onDelete: 'SET NULL'
});
Product.belongsTo(Category, {
    foreignKey: 'categoryId',
    as: 'category'
});

// 5. Products ↔ OrderItems (один ко многим)
Product.hasMany(OrderItem, {
    foreignKey: 'productId',
    as: 'orderItems',
    onDelete: 'RESTRICT'
});
OrderItem.belongsTo(Product, {
    foreignKey: 'productId',
    as: 'product'
});

// 6. OrderItems ↔ Orders (многие к одному)
Order.hasMany(OrderItem, {
    foreignKey: 'orderId',
    as: 'items',
    onDelete: 'CASCADE'
});
OrderItem.belongsTo(Order, {
    foreignKey: 'orderId',
    as: 'order'
});

// Экспортируем все модели
module.exports = {
    sequelize,
    User,
    Category,
    Product,
    Review,
    Order,
    OrderItem
};