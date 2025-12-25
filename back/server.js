/* back/server.js */
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/front', express.static(path.join(__dirname, '../front')));

// 靜態檔案 (若想直接由 Node 託管前端，可選)
// app.use(express.static('../front'));

// Routes (暫時引入，下一步我們實作這些檔案)
const productsRoutes = require('./routes/products');
const ordersRoutes = require('./routes/orders');
const usersRoutes = require('./routes/users');
const cartRoutes = require('./routes/cart'); 
// 註: 購物車邏輯通常建議在前端 LocalStorage 處理，結帳才送後端，這樣伺服器負擔較小

// Use Routes
app.use('/api/products', productsRoutes);
app.use('/api/orders', ordersRoutes);
// app.use('/api/users', usersRoutes);

// Test Route
app.get('/', (req, res) => {
    res.send('Chimo Breakfast API is running...');
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

/* 補user & cart */

app.use('/api/users', usersRoutes);
app.use('/api/cart', cartRoutes);