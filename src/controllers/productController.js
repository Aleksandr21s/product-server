const Product = require('../models/Product');
const Category = require('../models/Category');
const { getPublicUrl, moveFileToPermanent } = require('../middleware/upload');
const fs = require('fs-extra');
const path = require('path');

// Получить все товары
const getAllProducts = async (req, res) => {
    try {
        const products = await Product.findAll({
            include: {
                model: Category,
                as: 'category',
                attributes: ['id', 'name', 'imageUrl']
            },
            order: [['createdAt', 'DESC']]
        });
        
        // Добавляем полные URL к изображениям
        const productsWithFullUrls = products.map(product => ({
            ...product.toJSON(),
            imageUrl: product.imageUrl ? `${req.protocol}://${req.get('host')}${product.imageUrl}` : null,
            images: product.images ? product.images.map(img => 
                `${req.protocol}://${req.get('host')}${img}`
            ) : []
        }));
        
        res.json({
            success: true,
            count: products.length,
            data: productsWithFullUrls
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
                as: 'category',
                attributes: ['id', 'name', 'description', 'imageUrl']
            }
        });
        
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Товар не найден'
            });
        }
        
        // Добавляем полные URL к изображениям
        const productWithFullUrls = {
            ...product.toJSON(),
            imageUrl: product.imageUrl ? `${req.protocol}://${req.get('host')}${product.imageUrl}` : null,
            images: product.images ? product.images.map(img => 
                `${req.protocol}://${req.get('host')}${img}`
            ) : []
        };
        
        res.json({
            success: true,
            data: productWithFullUrls
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
        let imageUrl = null;
        let images = [];
        
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
        
        // Обрабатываем основное изображение
        if (req.file) {
            const filename = req.file.filename;
            await moveFileToPermanent(filename, 'products');
            imageUrl = getPublicUrl(filename, 'products');
        }
        
        // Обрабатываем дополнительные изображения
        if (req.files && req.files.length > 0) {
            for (const file of req.files) {
                const filename = file.filename;
                await moveFileToPermanent(filename, 'products');
                images.push(getPublicUrl(filename, 'products'));
            }
        }
        
        const product = await Product.create({
            name,
            description: description || '',
            price: parseFloat(price),
            categoryId,
            inStock: inStock !== undefined ? inStock : true,
            imageUrl,
            images
        });
        
        // Получаем созданный товар с категорией
        const productWithCategory = await Product.findByPk(product.id, {
            include: {
                model: Category,
                as: 'category',
                attributes: ['id', 'name']
            }
        });
        
        res.status(201).json({
            success: true,
            message: 'Товар успешно создан',
            data: productWithCategory
        });
    } catch (error) {
        // Удаляем загруженные файлы в случае ошибки
        const filesToDelete = [];
        if (req.file) filesToDelete.push(`./uploads/temp/${req.file.filename}`);
        if (req.files) {
            req.files.forEach(file => {
                filesToDelete.push(`./uploads/temp/${file.filename}`);
            });
        }
        
        filesToDelete.forEach(async filepath => {
            await fs.remove(filepath).catch(console.error);
        });
        
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
        if (categoryId && categoryId !== product.categoryId) {
            const category = await Category.findByPk(categoryId);
            if (!category) {
                return res.status(400).json({
                    success: false,
                    message: 'Указанная категория не существует'
                });
            }
        }
        
        let imageUrl = product.imageUrl;
        
        // Обрабатываем новое основное изображение
        if (req.file) {
            const filename = req.file.filename;
            await moveFileToPermanent(filename, 'products');
            imageUrl = getPublicUrl(filename, 'products');
            
            // Удаляем старое изображение, если оно было
            if (product.imageUrl) {
                const oldFilename = path.basename(product.imageUrl);
                const oldPath = `./uploads/products/${oldFilename}`;
                await fs.remove(oldPath).catch(console.error);
            }
        }
        
        // Обновляем поля
        await product.update({
            name: name || product.name,
            description: description !== undefined ? description : product.description,
            price: price !== undefined ? parseFloat(price) : product.price,
            categoryId: categoryId || product.categoryId,
            inStock: inStock !== undefined ? inStock : product.inStock,
            imageUrl
        });
        
        // Получаем обновлённый товар с категорией
        const updatedProduct = await Product.findByPk(id, {
            include: {
                model: Category,
                as: 'category',
                attributes: ['id', 'name']
            }
        });
        
        res.json({
            success: true,
            message: 'Товар успешно обновлён',
            data: updatedProduct
        });
    } catch (error) {
        // Удаляем загруженный файл в случае ошибки
        if (req.file) {
            await fs.remove(`./uploads/temp/${req.file.filename}`).catch(console.error);
        }
        
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
        
        // Удаляем основное изображение
        if (product.imageUrl) {
            const filename = path.basename(product.imageUrl);
            const imagePath = `./uploads/products/${filename}`;
            await fs.remove(imagePath).catch(console.error);
        }
        
        // Удаляем дополнительные изображения
        if (product.images && product.images.length > 0) {
            for (const imageUrl of product.images) {
                const filename = path.basename(imageUrl);
                const imagePath = `./uploads/products/${filename}`;
                await fs.remove(imagePath).catch(console.error);
            }
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

// Загрузить изображение для товара
const uploadProductImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Файл не загружен'
            });
        }
        
        const { id } = req.params;
        const product = await Product.findByPk(id);
        
        if (!product) {
            await fs.remove(`./uploads/temp/${req.file.filename}`).catch(console.error);
            return res.status(404).json({
                success: false,
                message: 'Товар не найден'
            });
        }
        
        const filename = req.file.filename;
        await moveFileToPermanent(filename, 'products');
        const imageUrl = getPublicUrl(filename, 'products');
        
        // Удаляем старое изображение, если оно было
        if (product.imageUrl) {
            const oldFilename = path.basename(product.imageUrl);
            const oldPath = `./uploads/products/${oldFilename}`;
            await fs.remove(oldPath).catch(console.error);
        }
        
        // Обновляем товар
        await product.update({ imageUrl });
        
        res.json({
            success: true,
            message: 'Изображение успешно загружено',
            data: {
                imageUrl: `${req.protocol}://${req.get('host')}${imageUrl}`,
                filename
            }
        });
    } catch (error) {
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

// Загрузить дополнительные изображения для товара
const uploadProductImages = async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Файлы не загружены'
            });
        }
        
        const { id } = req.params;
        const product = await Product.findByPk(id);
        
        if (!product) {
            // Удаляем все загруженные файлы
            req.files.forEach(async file => {
                await fs.remove(`./uploads/temp/${file.filename}`).catch(console.error);
            });
            return res.status(404).json({
                success: false,
                message: 'Товар не найден'
            });
        }
        
        const newImages = [];
        
        // Обрабатываем каждый файл
        for (const file of req.files) {
            const filename = file.filename;
            await moveFileToPermanent(filename, 'products');
            newImages.push(getPublicUrl(filename, 'products'));
        }
        
        // Обновляем массив изображений
        const currentImages = product.images || [];
        const updatedImages = [...currentImages, ...newImages];
        
        await product.update({ images: updatedImages });
        
        res.json({
            success: true,
            message: `Добавлено ${req.files.length} изображений`,
            data: {
                images: updatedImages.map(img => 
                    `${req.protocol}://${req.get('host')}${img}`
                ),
                count: updatedImages.length
            }
        });
    } catch (error) {
        // Удаляем все загруженные файлы в случае ошибки
        if (req.files) {
            req.files.forEach(async file => {
                await fs.remove(`./uploads/temp/${file.filename}`).catch(console.error);
            });
        }
        
        res.status(500).json({
            success: false,
            message: 'Ошибка при загрузке изображений',
            error: error.message
        });
    }
};

// Удалить изображение из товара
const deleteProductImage = async (req, res) => {
    try {
        const { id, imageIndex } = req.params;
        const product = await Product.findByPk(id);
        
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Товар не найден'
            });
        }
        
        const images = product.images || [];
        const index = parseInt(imageIndex);
        
        if (index < 0 || index >= images.length) {
            return res.status(400).json({
                success: false,
                message: 'Неверный индекс изображения'
            });
        }
        
        // Получаем URL удаляемого изображения
        const imageUrlToDelete = images[index];
        const filename = path.basename(imageUrlToDelete);
        
        // Удаляем файл с диска
        const imagePath = `./uploads/products/${filename}`;
        await fs.remove(imagePath).catch(console.error);
        
        // Удаляем из массива
        const updatedImages = images.filter((_, i) => i !== index);
        
        await product.update({ images: updatedImages });
        
        res.json({
            success: true,
            message: 'Изображение успешно удалено',
            data: {
                images: updatedImages.map(img => 
                    `${req.protocol}://${req.get('host')}${img}`
                ),
                count: updatedImages.length
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Ошибка при удалении изображения',
            error: error.message
        });
    }
};

// Экспортируем все функции
module.exports = {
    getAllProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    uploadProductImage,
    uploadProductImages,
    deleteProductImage
};