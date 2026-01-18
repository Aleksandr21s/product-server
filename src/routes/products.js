const express = require('express');
const router = express.Router();
const {
    getAllProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct
} = require('../controllers/productController');

// Все маршруты начинаются с /api/products

// GET /api/products - получить все товары
router.get('/', getAllProducts);

// GET /api/products/:id - получить товар по ID
router.get('/:id', getProductById);

// POST /api/products - создать новый товар
router.post('/', createProduct);

// PUT /api/products/:id - обновить товар
router.put('/:id', updateProduct);

// DELETE /api/products/:id - удалить товар
router.delete('/:id', deleteProduct);

module.exports = router;