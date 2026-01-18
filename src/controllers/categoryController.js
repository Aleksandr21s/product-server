const { Category, Product } = require('../models');

// Получить все категории
const getAllCategories = async (req, res) => {
    try {
        const categories = await Category.findAll({
            include: [{
                model: Product,
                as: 'products',
                attributes: ['id'],
                required: false
            }],
            order: [['name', 'ASC']]
        });
        
        // Добавляем количество товаров в каждой категории
        const categoriesWithCount = categories.map(category => {
            const categoryJson = category.toJSON();
            categoryJson.productCount = categoryJson.products ? categoryJson.products.length : 0;
            delete categoryJson.products;
            return categoryJson;
        });
        
        res.json({
            success: true,
            count: categories.length,
            data: categoriesWithCount
        });
    } catch (error) {
        console.error('Ошибка при получении категорий:', error);
        res.status(500).json({
            success: false,
            message: 'Ошибка при получении категорий',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Получить категорию по ID
const getCategoryById = async (req, res) => {
    try {
        const { id } = req.params;
        
        const category = await Category.findByPk(id, {
            include: [{
                model: Product,
                as: 'products',
                attributes: ['id', 'name', 'price', 'image', 'stockQuantity'],
                order: [['createdAt', 'DESC']],
                limit: 10
            }]
        });
        
        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Категория не найдена'
            });
        }
        
        res.json({
            success: true,
            data: category
        });
    } catch (error) {
        console.error('Ошибка при получении категории:', error);
        res.status(500).json({
            success: false,
            message: 'Ошибка при получении категории',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Создать категорию
const createCategory = async (req, res) => {
    try {
        const { name, description } = req.body;
        
        if (!name) {
            return res.status(400).json({
                success: false,
                message: 'Пожалуйста, укажите название категории'
            });
        }
        
        const category = await Category.create({
            name,
            description: description || ''
        });
        
        res.status(201).json({
            success: true,
            message: 'Категория успешно создана',
            data: category
        });
    } catch (error) {
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({
                success: false,
                message: 'Категория с таким названием уже существует'
            });
        }
        
        console.error('Ошибка при создании категории:', error);
        res.status(500).json({
            success: false,
            message: 'Ошибка при создании категории',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Обновить категорию
const updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description } = req.body;
        
        const category = await Category.findByPk(id);
        
        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Категория не найдена'
            });
        }
        
        await category.update({
            name: name || category.name,
            description: description !== undefined ? description : category.description
        });
        
        res.json({
            success: true,
            message: 'Категория успешно обновлена',
            data: category
        });
    } catch (error) {
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({
                success: false,
                message: 'Категория с таким названием уже существует'
            });
        }
        
        console.error('Ошибка при обновлении категории:', error);
        res.status(500).json({
            success: false,
            message: 'Ошибка при обновлении категории',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Удалить категорию
const deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;
        
        const category = await Category.findByPk(id);
        
        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Категория не найдена'
            });
        }
        
        // Проверяем, есть ли товары в категории
        const productsCount = await Product.count({
            where: { categoryId: id }
        });
        
        if (productsCount > 0) {
            return res.status(400).json({
                success: false,
                message: `Нельзя удалить категорию. В ней находится ${productsCount} товар(ов).`
            });
        }
        
        await category.destroy();
        
        res.json({
            success: true,
            message: 'Категория успешно удалена',
            data: category
        });
    } catch (error) {
        console.error('Ошибка при удалении категории:', error);
        res.status(500).json({
            success: false,
            message: 'Ошибка при удалении категории',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

module.exports = {
    getAllCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory
};