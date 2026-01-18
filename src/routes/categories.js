const express = require('express');
const router = express.Router();
const {
    getAllCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory,
    uploadCategoryImage
} = require('../controllers/categoryController');
const { uploadSingle } = require('../middleware/upload');

// GET /api/categories - получить все категории
router.get('/', getAllCategories);

// GET /api/categories/:id - получить категорию по ID
router.get('/:id', getCategoryById);

// POST /api/categories - создать новую категорию
router.post('/', uploadSingle('image'), createCategory);

// PUT /api/categories/:id - обновить категорию
router.put('/:id', uploadSingle('image'), updateCategory);

// DELETE /api/categories/:id - удалить категорию
router.delete('/:id', deleteCategory);

// POST /api/categories/:id/upload - загрузить изображение для категории
router.post('/:id/upload', uploadSingle('image'), uploadCategoryImage);

module.exports = router;