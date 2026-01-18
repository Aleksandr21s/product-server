const express = require('express');
const router = express.Router();
const {
    getAllOrderItems,
    getOrderItemById,
    updateOrderItem,
    deleteOrderItem
} = require('../controllers/orderItemController');
const { authenticateToken } = require('../middleware/auth');

// Защищённые маршруты
router.get('/', authenticateToken, getAllOrderItems);
router.get('/:id', authenticateToken, getOrderItemById);
router.put('/:id', authenticateToken, updateOrderItem);
router.delete('/:id', authenticateToken, deleteOrderItem);

module.exports = router;