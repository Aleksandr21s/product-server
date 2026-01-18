const express = require('express');
const router = express.Router();
const {
    getAllProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    uploadProductImage,
    uploadProductImages,
    deleteProductImage
} = require('../controllers/productController');
const { uploadSingle, uploadMultiple } = require('../middleware/upload');
const { authenticateToken } = require('../middleware/auth');

// GET /api/products - получить все товары (доступно всем, но фильтруется)
router.get('/', getAllProducts);

// GET /api/products/:id - получить товар по ID (доступно всем, но фильтруется)
router.get('/:id', getProductById);

// POST /api/products - создать новый товар (требуется авторизация)
router.post('/', authenticateToken, uploadSingle('image'), createProduct);

// POST /api/products/multiple - создать товар с несколькими изображениями (требуется авторизация)
router.post('/multiple', authenticateToken, uploadMultiple('images', 5), createProduct);

// PUT /api/products/:id - обновить товар (требуется авторизация)
router.put('/:id', authenticateToken, uploadSingle('image'), updateProduct);

// DELETE /api/products/:id - удалить товар (требуется авторизация)
router.delete('/:id', authenticateToken, deleteProduct);

// POST /api/products/:id/upload - загрузить основное изображение (требуется авторизация)
router.post('/:id/upload', authenticateToken, uploadSingle('image'), uploadProductImage);

// POST /api/products/:id/upload-multiple - загрузить дополнительные изображения (требуется авторизация)
router.post('/:id/upload-multiple', authenticateToken, uploadMultiple('images', 10), uploadProductImages);

// DELETE /api/products/:id/images/:imageIndex - удалить дополнительное изображение (требуется авторизация)
router.delete('/:id/images/:imageIndex', authenticateToken, deleteProductImage);

module.exports = router;