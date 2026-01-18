const Category = require('../models/Category');
const Product = require('../models/Product');

// Получить все категории
const getAllCategories = async (req, res) => {
    try {
        const categories = await Category.findAll({
            include: {
                model: Product,
                as: 'products',
                attributes: ['id', 'name', 'price', 'inStock']
            }
        });
        
        res.json({
            success: true,
            count: categories.length,
            data: categories
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Ошибка при получении категорий',
            error: error.message
        });
    }
};

// Создать новую категорию
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
        // Если категория с таким именем уже существует
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({
                success: false,
                message: 'Категория с таким названием уже существует'
            });
        }
        
        res.status(500).json({
            success: false,
            message: 'Ошибка при создании категории',
            error: error.message
        });
    }
};

module.exports = {
    getAllCategories,
    createCategory
};