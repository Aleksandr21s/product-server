const { Product, Category, Review, User } = require('../models');
const { Op } = require('sequelize');

// Получить все товары с пагинацией и фильтрами
const getAllProducts = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;
        
        const categoryId = req.query.categoryId;
        const minPrice = req.query.minPrice;
        const maxPrice = req.query.maxPrice;
        const search = req.query.search;
        const sortBy = req.query.sortBy || 'createdAt';
        const sortOrder = req.query.sortOrder || 'DESC';
        
        // Построение условий WHERE
        const whereCondition = {};
        
        if (categoryId) {
            whereCondition.categoryId = categoryId;
        }
        
        if (minPrice || maxPrice) {
            whereCondition.price = {};
            if (minPrice) whereCondition.price[Op.gte] = parseFloat(minPrice);
            if (maxPrice) whereCondition.price[Op.lte] = parseFloat(maxPrice);
        }
        
        if (search) {
            whereCondition.name = { [Op.iLike]: `%${search}%` };
        }
        
        // Получаем товары
        const { count, rows: products } = await Product.findAndCountAll({
            where: whereCondition,
            include: [
                {
                    model: Category,
                    as: 'category',
                    attributes: ['id', 'name']
                },
                {
                    model: Review,
                    as: 'reviews',
                    attributes: ['id', 'rating'],
                    required: false
                }
            ],
            limit,
            offset,
            order: [[sortBy, sortOrder]],
            distinct: true
        });
        
        // Вычисляем средний рейтинг для каждого товара
        const productsWithStats = products.map(product => {
            const productJson = product.toJSON();
            const reviews = productJson.reviews || [];
            
            if (reviews.length > 0) {
                const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
                productJson.averageRating = (totalRating / reviews.length).toFixed(1);
                productJson.reviewCount = reviews.length;
            } else {
                productJson.averageRating = null;
                productJson.reviewCount = 0;
            }
            
            delete productJson.reviews;
            return productJson;
        });
        
        const totalPages = Math.ceil(count / limit);
        
        res.json({
            success: true,
            data: productsWithStats,
            pagination: {
                page,
                limit,
                totalItems: count,
                totalPages,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1
            },
            filters: {
                categoryId,
                minPrice,
                maxPrice,
                search,
                sortBy,
                sortOrder
            }
        });
    } catch (error) {
        console.error('Ошибка при получении товаров:', error);
        res.status(500).json({
            success: false,
            message: 'Ошибка при получении товаров',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Получить товар по ID
const getProductById = async (req, res) => {
    try {
        const { id } = req.params;
        
        const product = await Product.findByPk(id, {
            include: [
                {
                    model: Category,
                    as: 'category',
                    attributes: ['id', 'name', 'description']
                },
                {
                    model: Review,
                    as: 'reviews',
                    include: [{
                        model: User,
                        as: 'user',
                        attributes: ['id', 'firstName', 'lastName', 'avatar']
                    }],
                    order: [['createdAt', 'DESC']]
                }
            ]
        });
        
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Товар не найден'
            });
        }
        
        // Вычисляем статистику отзывов
        const productJson = product.toJSON();
        const reviews = productJson.reviews || [];
        
        if (reviews.length > 0) {
            const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
            productJson.averageRating = (totalRating / reviews.length).toFixed(1);
            productJson.reviewCount = reviews.length;
            
            // Распределение по рейтингам
            const ratingDistribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
            reviews.forEach(review => {
                ratingDistribution[review.rating]++;
            });
            productJson.ratingDistribution = ratingDistribution;
        } else {
            productJson.averageRating = null;
            productJson.reviewCount = 0;
            productJson.ratingDistribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
        }
        
        res.json({
            success: true,
            data: productJson
        });
    } catch (error) {
        console.error('Ошибка при получении товара:', error);
        res.status(500).json({
            success: false,
            message: 'Ошибка при получении товара',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Создать товар
const createProduct = async (req, res) => {
    try {
        const { name, image, description, price, categoryId, stockQuantity } = req.body;
        
        // Проверяем обязательные поля
        if (!name || !price || !categoryId) {
            return res.status(400).json({
                success: false,
                message: 'Пожалуйста, укажите название, цену и категорию товара'
            });
        }
        
        // Проверяем существование категории
        const category = await Category.findByPk(categoryId);
        if (!category) {
            return res.status(400).json({
                success: false,
                message: 'Указанная категория не существует'
            });
        }
        
        const product = await Product.create({
            name,
            image: image || null,
            description: description || '',
            price: parseFloat(price),
            categoryId,
            stockQuantity: stockQuantity || 0
        });
        
        res.status(201).json({
            success: true,
            message: 'Товар успешно создан',
            data: product
        });
    } catch (error) {
        console.error('Ошибка при создании товара:', error);
        res.status(500).json({
            success: false,
            message: 'Ошибка при создании товара',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Обновить товар
const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, image, description, price, categoryId, stockQuantity } = req.body;
        
        const product = await Product.findByPk(id);
        
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Товар не найден'
            });
        }
        
        // Если меняем категорию, проверяем её существование
        if (categoryId && categoryId !== product.categoryId) {
            const category = await Category.findByPk(categoryId);
            if (!category) {
                return res.status(400).json({
                    success: false,
                    message: 'Указанная категория не существует'
                });
            }
        }
        
        // Обновляем поля
        await product.update({
            name: name || product.name,
            image: image !== undefined ? image : product.image,
            description: description !== undefined ? description : product.description,
            price: price !== undefined ? parseFloat(price) : product.price,
            categoryId: categoryId || product.categoryId,
            stockQuantity: stockQuantity !== undefined ? stockQuantity : product.stockQuantity
        });
        
        res.json({
            success: true,
            message: 'Товар успешно обновлён',
            data: product
        });
    } catch (error) {
        console.error('Ошибка при обновлении товара:', error);
        res.status(500).json({
            success: false,
            message: 'Ошибка при обновлении товара',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Удалить товар
const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        
        const product = await Product.findByPk(id);
        
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Товар не найден'
            });
        }
        
        await product.destroy();
        
        res.json({
            success: true,
            message: 'Товар успешно удалён',
            data: product
        });
    } catch (error) {
        console.error('Ошибка при удалении товара:', error);
        res.status(500).json({
            success: false,
            message: 'Ошибка при удалении товара',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

module.exports = {
    getAllProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct
};