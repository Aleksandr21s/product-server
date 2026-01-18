const express = require('express');
const router = express.Router();
const {
    getAllReviews,
    getReviewById,
    createReview,
    updateReview,
    deleteReview
} = require('../controllers/reviewController');
const { authenticateToken } = require('../middleware/auth');

// Публичные маршруты
router.get('/', getAllReviews);
router.get('/:id', getReviewById);

// Защищённые маршруты (требуется авторизация)
router.post('/', authenticateToken, createReview);
router.put('/:id', authenticateToken, updateReview);
router.delete('/:id', authenticateToken, deleteReview);

module.exports = router;