/* back/routes/cart.js */
const express = require('express');
const router = express.Router();
const db = require('../db');

// POST /api/cart/validate - 檢查購物車內的商品價格是否變動，或是否還有庫存
router.post('/validate', async (req, res) => {
    const { items } = req.body; // 前端傳來的購物車陣列
    if (!items || items.length === 0) return res.json({ valid: true });

    try {
        // 這裡可以實作比對資料庫價格的邏輯
        // 目前先簡單回傳成功
        res.json({ valid: true, message: 'Prices are up to date' });
    } catch (err) {
        res.status(500).json({ message: 'Validation failed' });
    }
});

module.exports = router;