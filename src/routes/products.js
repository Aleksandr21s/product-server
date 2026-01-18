const express = require('express');
const router = express.Router();
let products = require('../data/products');

// Генерация нового ID
const generateId = () => {
    return products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1;
};

// Получить все товары
router.get('/', (req, res) => {
    res.json({
        success: true,
        count: products.length,
        data: products
    });
});

// Получить товар по ID
router.get('/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const product = products.find(p => p.id === id);
    
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
});

// Добавить новый товар
router.post('/', (req, res) => {
    const { name, description, price, category, inStock } = req.body;
    
    if (!name || !price) {
        return res.status(400).json({
            success: false,
            message: 'Пожалуйста, укажите название и цену товара'
        });
    }
    
    const newProduct = {
        id: generateId(),
        name,
        description: description || '',
        price: Number(price),
        category: category || 'Без категории',
        inStock: inStock !== undefined ? inStock : true
    };
    
    products.push(newProduct);
    
    res.status(201).json({
        success: true,
        message: 'Товар успешно добавлен',
        data: newProduct
    });
});

// Обновить товар по ID
router.put('/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const { name, description, price, category, inStock } = req.body;
    
    const productIndex = products.findIndex(p => p.id === id);
    
    if (productIndex === -1) {
        return res.status(404).json({
            success: false,
            message: 'Товар не найден'
        });
    }
    
    // Обновляем только переданные поля
    const updatedProduct = {
        ...products[productIndex],
        name: name || products[productIndex].name,
        description: description !== undefined ? description : products[productIndex].description,
        price: price !== undefined ? Number(price) : products[productIndex].price,
        category: category || products[productIndex].category,
        inStock: inStock !== undefined ? inStock : products[productIndex].inStock
    };
    
    products[productIndex] = updatedProduct;
    
    res.json({
        success: true,
        message: 'Товар успешно обновлен',
        data: updatedProduct
    });
});

// Частичное обновление товара по ID (PATCH)
router.patch('/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const updates = req.body;
    
    const productIndex = products.findIndex(p => p.id === id);
    
    if (productIndex === -1) {
        return res.status(404).json({
            success: false,
            message: 'Товар не найден'
        });
    }
    
    // Обновляем только переданные поля
    const updatedProduct = {
        ...products[productIndex],
        ...updates
    };
    
    // Преобразуем price в число, если оно передано
    if (updates.price !== undefined) {
        updatedProduct.price = Number(updates.price);
    }
    
    products[productIndex] = updatedProduct;
    
    res.json({
        success: true,
        message: 'Товар успешно обновлен',
        data: updatedProduct
    });
});

// Удалить товар по ID
router.delete('/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const productIndex = products.findIndex(p => p.id === id);
    
    if (productIndex === -1) {
        return res.status(404).json({
            success: false,
            message: 'Товар не найден'
        });
    }
    
    const deletedProduct = products[productIndex];
    products = products.filter(p => p.id !== id);
    
    res.json({
        success: true,
        message: 'Товар успешно удален',
        data: deletedProduct
    });
});

module.exports = router;