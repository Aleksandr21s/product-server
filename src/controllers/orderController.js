const { Order, OrderItem, Product, User } = require('../models');
const { Op } = require('sequelize');

// Получить все заказы (админ)
const getAllOrders = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;
        
        const userId = req.query.userId;
        const status = req.query.status;
        const startDate = req.query.startDate;
        const endDate = req.query.endDate;
        
        const whereCondition = {};
        
        if (userId) {
            whereCondition.userId = userId;
        }
        
        if (status) {
            whereCondition.status = status;
        }
        
        if (startDate || endDate) {
            whereCondition.date = {};
            if (startDate) whereCondition.date[Op.gte] = new Date(startDate);
            if (endDate) whereCondition.date[Op.lte] = new Date(endDate);
        }
        
        // Если не админ, показываем только свои заказы
        if (req.user.role !== 'admin') {
            whereCondition.userId = req.userId;
        }
        
        const { count, rows: orders } = await Order.findAndCountAll({
            where: whereCondition,
            include: [
                {
                    model: User,
                    as: 'user',
                    attributes: ['id', 'firstName', 'lastName', 'email']
                },
                {
                    model: OrderItem,
                    as: 'items',
                    include: [{
                        model: Product,
                        as: 'product',
                        attributes: ['id', 'name', 'image']
                    }]
                }
            ],
            limit,
            offset,
            order: [['date', 'DESC']],
            distinct: true
        });
        
        const totalPages = Math.ceil(count / limit);
        
        res.json({
            success: true,
            data: orders,
            pagination: {
                page,
                limit,
                totalItems: count,
                totalPages,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1
            }
        });
    } catch (error) {
        console.error('Ошибка при получении заказов:', error);
        res.status(500).json({
            success: false,
            message: 'Ошибка при получении заказов',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Получить заказы пользователя
const getUserOrders = async (req, res) => {
    try {
        const userId = req.userId;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;
        const status = req.query.status;
        
        const whereCondition = { userId };
        
        if (status) {
            whereCondition.status = status;
        }
        
        const { count, rows: orders } = await Order.findAndCountAll({
            where: whereCondition,
            include: [{
                model: OrderItem,
                as: 'items',
                include: [{
                    model: Product,
                    as: 'product',
                    attributes: ['id', 'name', 'image']
                }]
            }],
            limit,
            offset,
            order: [['date', 'DESC']],
            distinct: true
        });
        
        const totalPages = Math.ceil(count / limit);
        
        res.json({
            success: true,
            data: orders,
            pagination: {
                page,
                limit,
                totalItems: count,
                totalPages,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1
            }
        });
    } catch (error) {
        console.error('Ошибка при получении заказов пользователя:', error);
        res.status(500).json({
            success: false,
            message: 'Ошибка при получении заказов пользователя',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Получить заказ по ID
const getOrderById = async (req, res) => {
    try {
        const { id } = req.params;
        
        const whereCondition = { id };
        
        // Если не админ, проверяем принадлежность заказа
        if (req.user.role !== 'admin') {
            whereCondition.userId = req.userId;
        }
        
        const order = await Order.findOne({
            where: whereCondition,
            include: [
                {
                    model: User,
                    as: 'user',
                    attributes: ['id', 'firstName', 'lastName', 'email']
                },
                {
                    model: OrderItem,
                    as: 'items',
                    include: [{
                        model: Product,
                        as: 'product',
                        attributes: ['id', 'name', 'image', 'description']
                    }]
                }
            ]
        });
        
        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Заказ не найден'
            });
        }
        
        res.json({
            success: true,
            data: order
        });
    } catch (error) {
        console.error('Ошибка при получении заказа:', error);
        res.status(500).json({
            success: false,
            message: 'Ошибка при получении заказа',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Создать заказ
const createOrder = async (req, res) => {
    try {
        const userId = req.userId;
        const { items, shippingAddress, paymentMethod } = req.body;
        
        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Добавьте товары в заказ'
            });
        }
        
        if (!shippingAddress) {
            return res.status(400).json({
                success: false,
                message: 'Укажите адрес доставки'
            });
        }
        
        // Проверяем наличие товаров и рассчитываем общую сумму
        let totalAmount = 0;
        const orderItems = [];
        
        for (const item of items) {
            const product = await Product.findByPk(item.productId);
            
            if (!product) {
                return res.status(404).json({
                    success: false,
                    message: `Товар с ID ${item.productId} не найден`
                });
            }
            
            if (product.stockQuantity < item.quantity) {
                return res.status(400).json({
                    success: false,
                    message: `Недостаточно товара "${product.name}" на складе. Доступно: ${product.stockQuantity}`
                });
            }
            
            const itemTotal = product.price * item.quantity;
            totalAmount += itemTotal;
            
            orderItems.push({
                productId: item.productId,
                priceAtATime: product.price,
                quantity: item.quantity
            });
            
            // Резервируем товар (уменьшаем количество на складе)
            await product.update({
                stockQuantity: product.stockQuantity - item.quantity
            });
        }
        
        // Создаём заказ
        const order = await Order.create({
            userId,
            date: new Date(),
            amount: totalAmount,
            status: 'pending',
            shippingAddress,
            paymentMethod: paymentMethod || 'card',
            paymentStatus: 'pending'
        });
        
        // Создаём элементы заказа
        const createdItems = await Promise.all(
            orderItems.map(item => 
                OrderItem.create({
                    orderId: order.id,
                    ...item
                })
            )
        );
        
        // Получаем полный заказ с элементами
        const fullOrder = await Order.findByPk(order.id, {
            include: [{
                model: OrderItem,
                as: 'items',
                include: [{
                    model: Product,
                    as: 'product',
                    attributes: ['id', 'name', 'image']
                }]
            }]
        });
        
        res.status(201).json({
            success: true,
            message: 'Заказ успешно создан',
            data: fullOrder
        });
    } catch (error) {
        console.error('Ошибка при создании заказа:', error);
        res.status(500).json({
            success: false,
            message: 'Ошибка при создании заказа',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Обновить статус заказа
const updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        
        if (!status) {
            return res.status(400).json({
                success: false,
                message: 'Укажите новый статус заказа'
            });
        }
        
        const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: `Неверный статус. Допустимые значения: ${validStatuses.join(', ')}`
            });
        }
        
        const order = await Order.findByPk(id);
        
        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Заказ не найден'
            });
        }
        
        // Если отменяем заказ, возвращаем товары на склад
        if (status === 'cancelled' && order.status !== 'cancelled') {
            const items = await OrderItem.findAll({
                where: { orderId: order.id },
                include: [{
                    model: Product,
                    as: 'product'
                }]
            });
            
            for (const item of items) {
                await item.product.update({
                    stockQuantity: item.product.stockQuantity + item.quantity
                });
            }
        }
        
        await order.update({ status });
        
        res.json({
            success: true,
            message: 'Статус заказа успешно обновлён',
            data: order
        });
    } catch (error) {
        console.error('Ошибка при обновлении статуса заказа:', error);
        res.status(500).json({
            success: false,
            message: 'Ошибка при обновлении статуса заказа',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Удалить заказ (админ)
const deleteOrder = async (req, res) => {
    try {
        const { id } = req.params;
        
        const order = await Order.findByPk(id);
        
        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Заказ не найден'
            });
        }
        
        // Возвращаем товары на склад
        const items = await OrderItem.findAll({
            where: { orderId: order.id },
            include: [{
                model: Product,
                as: 'product'
            }]
        });
        
        for (const item of items) {
            await item.product.update({
                stockQuantity: item.product.stockQuantity + item.quantity
            });
        }
        
        await order.destroy();
        
        res.json({
            success: true,
            message: 'Заказ успешно удалён',
            data: order
        });
    } catch (error) {
        console.error('Ошибка при удалении заказа:', error);
        res.status(500).json({
            success: false,
            message: 'Ошибка при удалении заказа',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

module.exports = {
    getAllOrders,
    getUserOrders,
    getOrderById,
    createOrder,
    updateOrderStatus,
    deleteOrder
};