const Product = require('../models/Product');
const Category = require('../models/Category');

// Получить все товары
const getAllProducts = async (req, res) => {
    try {
        const products = await Product.findAll({
            include: {
                model: Category,
                as: 'category',
                attributes: ['id', 'name'] // берём только id и название категории
            }
        });
        
        res.json({
            success: true,
            count: products.length,
            data: products
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Ошибка при получении товаров',
            error: error.message
        });
    }
};

// Получить товар по ID
const getProductById = async (req, res) => {
    try {
        const { id } = req.params;
        const product = await Product.findByPk(id, {
            include: {
                model: Category,
                as: 'category'
            }
        });
        
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Товар не найден'
            });
        }
        
        res.json({
            success: true,
            data: product
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Ошибка при получении товара',
            error: error.message
        });
    }
};

// Создать новый товар
const createProduct = async (req, res) => {
    try {
        const { name, description, price, categoryId, inStock } = req.body;
        
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
            description: description || '',
            price: parseFloat(price),
            categoryId,
            inStock: inStock !== undefined ? inStock : true
        });
        
        res.status(201).json({
            success: true,
            message: 'Товар успешно создан',
            data: product
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Ошибка при создании товара',
            error: error.message
        });
    }
};

// Обновить товар
const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, price, categoryId, inStock } = req.body;
        
        const product = await Product.findByPk(id);
        
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Товар не найден'
            });
        }
        
        // Если меняем категорию, проверяем её существование
        if (categoryId) {
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
            description: description !== undefined ? description : product.description,
            price: price !== undefined ? parseFloat(price) : product.price,
            categoryId: categoryId || product.categoryId,
            inStock: inStock !== undefined ? inStock : product.inStock
        });
        
        res.json({
            success: true,
            message: 'Товар успешно обновлён',
            data: product
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Ошибка при обновлении товара',
            error: error.message
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
        res.status(500).json({
            success: false,
            message: 'Ошибка при удалении товара',
            error: error.message
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