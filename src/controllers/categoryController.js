const Category = require('../models/Category');
const Product = require('../models/product');
const { getPublicUrl, moveFileToPermanent } = require('../middleware/upload');
const fs = require('fs-extra');
const path = require('path');

// Получить все категории
const getAllCategories = async (req, res) => {
    try {
        const categories = await Category.findAll({
            include: {
                model: Product,
                as: 'products',
                attributes: ['id', 'name', 'price', 'inStock', 'imageUrl'],
                limit: 5 // Ограничиваем количество товаров в preview
            },
            order: [['name', 'ASC']]
        });
        
        // Добавляем полные URL к изображениям
        const categoriesWithFullUrls = categories.map(category => ({
            ...category.toJSON(),
            imageUrl: category.imageUrl ? `${req.protocol}://${req.get('host')}${category.imageUrl}` : null
        }));
        
        res.json({
            success: true,
            count: categories.length,
            data: categoriesWithFullUrls
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Ошибка при получении категорий',
            error: error.message
        });
    }
};

// Получить категорию по ID
const getCategoryById = async (req, res) => {
    try {
        const { id } = req.params;
        const category = await Category.findByPk(id, {
            include: {
                model: Product,
                as: 'products'
            }
        });
        
        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Категория не найдена'
            });
        }
        
        // Добавляем полный URL к изображению
        const categoryWithFullUrl = {
            ...category.toJSON(),
            imageUrl: category.imageUrl ? `${req.protocol}://${req.get('host')}${category.imageUrl}` : null
        };
        
        res.json({
            success: true,
            data: categoryWithFullUrl
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Ошибка при получении категории',
            error: error.message
        });
    }
};

// Создать новую категорию
const createCategory = async (req, res) => {
    try {
        const { name, description } = req.body;
        let imageUrl = null;
        
        if (!name) {
            return res.status(400).json({
                success: false,
                message: 'Пожалуйста, укажите название категории'
            });
        }
        
        // Обрабатываем загруженное изображение
        if (req.file) {
            const filename = req.file.filename;
            // Перемещаем файл из temp в categories
            await moveFileToPermanent(filename, 'categories');
            imageUrl = getPublicUrl(filename, 'categories');
        }
        
        const category = await Category.create({
            name,
            description: description || '',
            imageUrl
        });
        
        res.status(201).json({
            success: true,
            message: 'Категория успешно создана',
            data: category
        });
    } catch (error) {
        // Удаляем загруженный файл в случае ошибки
        if (req.file) {
            await fs.remove(`./uploads/temp/${req.file.filename}`).catch(console.error);
        }
        
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
        
        let imageUrl = category.imageUrl;
        
        // Обрабатываем новое изображение, если оно загружено
        if (req.file) {
            const filename = req.file.filename;
            // Перемещаем файл из temp в categories
            await moveFileToPermanent(filename, 'categories');
            imageUrl = getPublicUrl(filename, 'categories');
            
            // Удаляем старое изображение, если оно было
            if (category.imageUrl) {
                const oldFilename = path.basename(category.imageUrl);
                const oldPath = `./uploads/categories/${oldFilename}`;
                await fs.remove(oldPath).catch(console.error);
            }
        }
        
        // Обновляем поля
        await category.update({
            name: name || category.name,
            description: description !== undefined ? description : category.description,
            imageUrl
        });
        
        res.json({
            success: true,
            message: 'Категория успешно обновлена',
            data: category
        });
    } catch (error) {
        // Удаляем загруженный файл в случае ошибки
        if (req.file) {
            await fs.remove(`./uploads/temp/${req.file.filename}`).catch(console.error);
        }
        
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({
                success: false,
                message: 'Категория с таким названием уже существует'
            });
        }
        
        res.status(500).json({
            success: false,
            message: 'Ошибка при обновлении категории',
            error: error.message
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
        
        // Проверяем, есть ли товары в этой категории
        const productsCount = await Product.count({
            where: { categoryId: id }
        });
        
        if (productsCount > 0) {
            return res.status(400).json({
                success: false,
                message: `Нельзя удалить категорию. В ней находится ${productsCount} товар(ов). Сначала удалите или переместите товары.`
            });
        }
        
        // Удаляем изображение категории, если оно есть
        if (category.imageUrl) {
            const filename = path.basename(category.imageUrl);
            const imagePath = `./uploads/categories/${filename}`;
            await fs.remove(imagePath).catch(console.error);
        }
        
        await category.destroy();
        
        res.json({
            success: true,
            message: 'Категория успешно удалена',
            data: category
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Ошибка при удалении категории',
            error: error.message
        });
    }
};

// Загрузить изображение для категории
const uploadCategoryImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Файл не загружен'
            });
        }
        
        const { id } = req.params;
        const category = await Category.findByPk(id);
        
        if (!category) {
            // Удаляем загруженный файл, если категория не найдена
            await fs.remove(`./uploads/temp/${req.file.filename}`).catch(console.error);
            return res.status(404).json({
                success: false,
                message: 'Категория не найдена'
            });
        }
        
        const filename = req.file.filename;
        
        // Перемещаем файл из temp в categories
        await moveFileToPermanent(filename, 'categories');
        const imageUrl = getPublicUrl(filename, 'categories');
        
        // Удаляем старое изображение, если оно было
        if (category.imageUrl) {
            const oldFilename = path.basename(category.imageUrl);
            const oldPath = `./uploads/categories/${oldFilename}`;
            await fs.remove(oldPath).catch(console.error);
        }
        
        // Обновляем категорию
        await category.update({ imageUrl });
        
        res.json({
            success: true,
            message: 'Изображение успешно загружено',
            data: {
                imageUrl: `${req.protocol}://${req.get('host')}${imageUrl}`,
                filename
            }
        });
    } catch (error) {
        // Удаляем загруженный файл в случае ошибки
        if (req.file) {
            await fs.remove(`./uploads/temp/${req.file.filename}`).catch(console.error);
        }
        
        res.status(500).json({
            success: false,
            message: 'Ошибка при загрузке изображения',
            error: error.message
        });
    }
};

module.exports = {
    getAllCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory,
    uploadCategoryImage
};