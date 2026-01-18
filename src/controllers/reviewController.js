const { Review, Product, User } = require('../models');
const { Op } = require('sequelize');

// Получить все отзывы с пагинацией
const getAllReviews = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;
        
        const productId = req.query.productId;
        const userId = req.query.userId;
        const minRating = req.query.minRating;
        
        const whereCondition = {};
        
        if (productId) {
            whereCondition.productId = productId;
        }
        
        if (userId) {
            whereCondition.userId = userId;
        }
        
        if (minRating) {
            whereCondition.rating = { [Op.gte]: parseInt(minRating) };
        }
        
        const { count, rows: reviews } = await Review.findAndCountAll({
            where: whereCondition,
            include: [
                {
                    model: Product,
                    as: 'product',
                    attributes: ['id', 'name', 'image']
                },
                {
                    model: User,
                    as: 'user',
                    attributes: ['id', 'firstName', 'lastName', 'avatar']
                }
            ],
            limit,
            offset,
            order: [['createdAt', 'DESC']],
            distinct: true
        });
        
        const totalPages = Math.ceil(count / limit);
        
        res.json({
            success: true,
            data: reviews,
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
        console.error('Ошибка при получении отзывов:', error);
        res.status(500).json({
            success: false,
            message: 'Ошибка при получении отзывов',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Получить отзыв по ID
const getReviewById = async (req, res) => {
    try {
        const { id } = req.params;
        
        const review = await Review.findByPk(id, {
            include: [
                {
                    model: Product,
                    as: 'product',
                    attributes: ['id', 'name', 'image']
                },
                {
                    model: User,
                    as: 'user',
                    attributes: ['id', 'firstName', 'lastName', 'avatar']
                }
            ]
        });
        
        if (!review) {
            return res.status(404).json({
                success: false,
                message: 'Отзыв не найден'
            });
        }
        
        res.json({
            success: true,
            data: review
        });
    } catch (error) {
        console.error('Ошибка при получении отзыва:', error);
        res.status(500).json({
            success: false,
            message: 'Ошибка при получении отзыва',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Создать отзыв
const createReview = async (req, res) => {
    try {
        const { productId, text, rating } = req.body;
        const userId = req.userId; // Из middleware аутентификации
        
        if (!productId || !text || !rating) {
            return res.status(400).json({
                success: false,
                message: 'Пожалуйста, укажите товар, текст отзыва и рейтинг'
            });
        }
        
        // Проверяем существование товара
        const product = await Product.findByPk(productId);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Товар не найден'
            });
        }
        
        // Проверяем, не оставлял ли пользователь уже отзыв на этот товар
        const existingReview = await Review.findOne({
            where: { productId, userId }
        });
        
        if (existingReview) {
            return res.status(400).json({
                success: false,
                message: 'Вы уже оставляли отзыв на этот товар'
            });
        }
        
        const review = await Review.create({
            productId,
            userId,
            text,
            rating: parseInt(rating)
        });
        
        res.status(201).json({
            success: true,
            message: 'Отзыв успешно создан',
            data: review
        });
    } catch (error) {
        console.error('Ошибка при создании отзыва:', error);
        res.status(500).json({
            success: false,
            message: 'Ошибка при создании отзыва',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Обновить отзыв
const updateReview = async (req, res) => {
    try {
        const { id } = req.params;
        const { text, rating } = req.body;
        const userId = req.userId;
        
        const review = await Review.findByPk(id);
        
        if (!review) {
            return res.status(404).json({
                success: false,
                message: 'Отзыв не найден'
            });
        }
        
        // Проверяем, принадлежит ли отзыв пользователю
        if (review.userId !== userId && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Вы не можете редактировать этот отзыв'
            });
        }
        
        await review.update({
            text: text || review.text,
            rating: rating !== undefined ? parseInt(rating) : review.rating
        });
        
        res.json({
            success: true,
            message: 'Отзыв успешно обновлён',
            data: review
        });
    } catch (error) {
        console.error('Ошибка при обновлении отзыва:', error);
        res.status(500).json({
            success: false,
            message: 'Ошибка при обновлении отзыва',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Удалить отзыв
const deleteReview = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.userId;
        
        const review = await Review.findByPk(id);
        
        if (!review) {
            return res.status(404).json({
                success: false,
                message: 'Отзыв не найден'
            });
        }
        
        // Проверяем, принадлежит ли отзыв пользователю
        if (review.userId !== userId && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Вы не можете удалить этот отзыв'
            });
        }
        
        await review.destroy();
        
        res.json({
            success: true,
            message: 'Отзыв успешно удалён',
            data: review
        });
    } catch (error) {
        console.error('Ошибка при удалении отзыва:', error);
        res.status(500).json({
            success: false,
            message: 'Ошибка при удалении отзыва',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

module.exports = {
    getAllReviews,
    getReviewById,
    createReview,
    updateReview,
    deleteReview
};