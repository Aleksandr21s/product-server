const { OrderItem, Order, Product } = require('../models');

// Получить все элементы заказа
const getAllOrderItems = async (req, res) => {
    try {
        const orderId = req.query.orderId;
        const productId = req.query.productId;
        
        const whereCondition = {};
        
        if (orderId) {
            whereCondition.orderId = orderId;
        }
        
        if (productId) {
            whereCondition.productId = productId;
        }
        
        const orderItems = await OrderItem.findAll({
            where: whereCondition,
            include: [
                {
                    model: Order,
                    as: 'order',
                    attributes: ['id', 'date', 'status']
                },
                {
                    model: Product,
                    as: 'product',
                    attributes: ['id', 'name', 'image']
                }
            ],
            order: [['createdAt', 'DESC']]
        });
        
        res.json({
            success: true,
            count: orderItems.length,
            data: orderItems
        });
    } catch (error) {
        console.error('Ошибка при получении элементов заказа:', error);
        res.status(500).json({
            success: false,
            message: 'Ошибка при получении элементов заказа',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Получить элемент заказа по ID
const getOrderItemById = async (req, res) => {
    try {
        const { id } = req.params;
        
        const orderItem = await OrderItem.findByPk(id, {
            include: [
                {
                    model: Order,
                    as: 'order',
                    attributes: ['id', 'date', 'status', 'userId']
                },
                {
                    model: Product,
                    as: 'product',
                    attributes: ['id', 'name', 'image', 'description']
                }
            ]
        });
        
        if (!orderItem) {
            return res.status(404).json({
                success: false,
                message: 'Элемент заказа не найден'
            });
        }
        
        res.json({
            success: true,
            data: orderItem
        });
    } catch (error) {
        console.error('Ошибка при получении элемента заказа:', error);
        res.status(500).json({
            success: false,
            message: 'Ошибка при получении элемента заказа',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Обновить элемент заказа
const updateOrderItem = async (req, res) => {
    try {
        const { id } = req.params;
        const { quantity } = req.body;
        
        if (!quantity || quantity < 1) {
            return res.status(400).json({
                success: false,
                message: 'Укажите корректное количество'
            });
        }
        
        const orderItem = await OrderItem.findByPk(id, {
            include: [
                {
                    model: Order,
                    as: 'order'
                },
                {
                    model: Product,
                    as: 'product'
                }
            ]
        });
        
        if (!orderItem) {
            return res.status(404).json({
                success: false,
                message: 'Элемент заказа не найден'
            });
        }
        
        // Проверяем права доступа
        if (req.user.role !== 'admin' && orderItem.order.userId !== req.userId) {
            return res.status(403).json({
                success: false,
                message: 'Вы не можете редактировать этот элемент заказа'
            });
        }
        
        // Проверяем наличие товара на складе
        const quantityDifference = quantity - orderItem.quantity;
        
        if (quantityDifference > 0) {
            if (orderItem.product.stockQuantity < quantityDifference) {
                return res.status(400).json({
                    success: false,
                    message: `Недостаточно товара на складе. Доступно: ${orderItem.product.stockQuantity}`
                });
            }
            
            // Резервируем дополнительное количество
            await orderItem.product.update({
                stockQuantity: orderItem.product.stockQuantity - quantityDifference
            });
        } else if (quantityDifference < 0) {
            // Возвращаем лишнее количество на склад
            await orderItem.product.update({
                stockQuantity: orderItem.product.stockQuantity + Math.abs(quantityDifference)
            });
        }
        
        // Обновляем элемент заказа
        await orderItem.update({
            quantity
        });
        
        // Пересчитываем общую сумму заказа
        const orderItems = await OrderItem.findAll({
            where: { orderId: orderItem.orderId }
        });
        
        let newTotal = 0;
        for (const item of orderItems) {
            newTotal += item.priceAtATime * item.quantity;
        }
        
        await orderItem.order.update({
            amount: newTotal
        });
        
        res.json({
            success: true,
            message: 'Элемент заказа успешно обновлён',
            data: orderItem
        });
    } catch (error) {
        console.error('Ошибка при обновлении элемента заказа:', error);
        res.status(500).json({
            success: false,
            message: 'Ошибка при обновлении элемента заказа',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Удалить элемент заказа
const deleteOrderItem = async (req, res) => {
    try {
        const { id } = req.params;
        
        const orderItem = await OrderItem.findByPk(id, {
            include: [
                {
                    model: Order,
                    as: 'order'
                },
                {
                    model: Product,
                    as: 'product'
                }
            ]
        });
        
        if (!orderItem) {
            return res.status(404).json({
                success: false,
                message: 'Элемент заказа не найден'
            });
        }
        
        // Проверяем права доступа
        if (req.user.role !== 'admin' && orderItem.order.userId !== req.userId) {
            return res.status(403).json({
                success: false,
                message: 'Вы не можете удалить этот элемент заказа'
            });
        }
        
        // Возвращаем товар на склад
        await orderItem.product.update({
            stockQuantity: orderItem.product.stockQuantity + orderItem.quantity
        });
        
        // Удаляем элемент
        await orderItem.destroy();
        
        // Пересчитываем общую сумму заказа
        const remainingItems = await OrderItem.findAll({
            where: { orderId: orderItem.orderId }
        });
        
        let newTotal = 0;
        for (const item of remainingItems) {
            newTotal += item.priceAtATime * item.quantity;
        }
        
        await orderItem.order.update({
            amount: newTotal
        });
        
        res.json({
            success: true,
            message: 'Элемент заказа успешно удалён',
            data: orderItem
        });
    } catch (error) {
        console.error('Ошибка при удалении элемента заказа:', error);
        res.status(500).json({
            success: false,
            message: 'Ошибка при удалении элемента заказа',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

module.exports = {
    getAllOrderItems,
    getOrderItemById,
    updateOrderItem,
    deleteOrderItem
};