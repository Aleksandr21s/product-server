const express = require('express');
const router = express.Router();
const {
    getAllCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory
} = require('../controllers/categoryController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// Публичные маршруты
router.get('/', getAllCategories);
router.get('/:id', getCategoryById);

// Защищённые маршруты (требуется админ)
router.post('/', authenticateToken, requireAdmin, createCategory);
router.put('/:id', authenticateToken, requireAdmin, updateCategory);
router.delete('/:id', authenticateToken, requireAdmin, deleteCategory);

module.exports = router;