/* back/routes/orders.js */
const express = require('express');
const router = express.Router();
const ordersController = require('../controllers/ordersController');

// POST /api/orders - 建立新訂單 (結帳)
router.post('/', ordersController.createOrder);

// GET /api/orders - 取得訂單列表 (後台/廚房)
router.get('/', ordersController.getAllOrders);

// GET /api/orders/:id - 取得訂單詳細內容 (含餐點項目)
router.get('/:id', ordersController.getOrderById);

// PUT /api/orders/:id/status - 更新訂單狀態 (接單/完成)
router.put('/:id/status', ordersController.updateOrderStatus);

module.exports = router;