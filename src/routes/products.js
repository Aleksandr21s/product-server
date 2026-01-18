const express = require('express');
const router = express.Router();
const {
    getAllProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct
} = require('../controllers/productController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// Публичные маршруты
router.get('/', getAllProducts);
router.get('/:id', getProductById);

// Защищённые маршруты (требуется админ)
router.post('/', authenticateToken, requireAdmin, createProduct);
router.put('/:id', authenticateToken, requireAdmin, updateProduct);
router.delete('/:id', authenticateToken, requireAdmin, deleteProduct);

module.exports = router;