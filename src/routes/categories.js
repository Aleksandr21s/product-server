const express = require('express');
const router = express.Router();
const {
    getAllCategories,
    createCategory
} = require('../controllers/categoryController');

// GET /api/categories - получить все категории
router.get('/', getAllCategories);

// POST /api/categories - создать новую категорию
router.post('/', createCategory);

module.exports = router;