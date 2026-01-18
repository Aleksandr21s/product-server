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

// GET /api/products - получить все товары
router.get('/', getAllProducts);

// GET /api/products/:id - получить товар по ID
router.get('/:id', getProductById);

// POST /api/products - создать новый товар (с одним изображением)
router.post('/', uploadSingle('image'), createProduct);

// POST /api/products/multiple - создать товар с несколькими изображениями
router.post('/multiple', uploadMultiple('images', 5), createProduct);

// PUT /api/products/:id - обновить товар
router.put('/:id', uploadSingle('image'), updateProduct);

// DELETE /api/products/:id - удалить товар
router.delete('/:id', deleteProduct);

// POST /api/products/:id/upload - загрузить основное изображение
router.post('/:id/upload', uploadSingle('image'), uploadProductImage);

// POST /api/products/:id/upload-multiple - загрузить дополнительные изображения
router.post('/:id/upload-multiple', uploadMultiple('images', 10), uploadProductImages);

// DELETE /api/products/:id/images/:imageIndex - удалить дополнительное изображение
router.delete('/:id/images/:imageIndex', deleteProductImage);

module.exports = router;