/* back/routes/products.js */
const express = require('express');
const router = express.Router();
const productsController = require('../controllers/productsController');

// 順序很重要：特定的路徑 (如 /featured) 要放在動態參數 (/:id) 之前

// GET /api/products/featured - 取得熱門餐點
router.get('/featured', productsController.getFeaturedProducts);

// GET /api/products - 取得所有餐點
router.get('/', productsController.getAllProducts);

// GET /api/products/:id - 取得單一餐點
router.get('/:id', productsController.getProductById);

// POST /api/products - 新增餐點
router.post('/', productsController.createProduct);

// PUT /api/products/:id - 更新餐點
router.put('/:id', productsController.updateProduct);

// DELETE /api/products/:id - 刪除餐點
router.delete('/:id', productsController.deleteProduct);

module.exports = router;