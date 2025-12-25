/* back/routes/users.js */
const express = require('express');
const router = express.Router();
const usersController = require('../controllers/usersController');

router.post('/login', usersController.login);
router.post('/register', usersController.register);

// 新增：取得某個用戶的歷史訂單
router.get('/:id/history', usersController.getUserHistory);

module.exports = router;