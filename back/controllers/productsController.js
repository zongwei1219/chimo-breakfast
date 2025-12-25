/* back/controllers/productsController.js */
const db = require('../db');

// 取得所有上架餐點 (給 Menu 頁面用)
// 已修改函式for productAdmin擷取確認是否為Admin
exports.getAllProducts = async (req, res) => {
    try {
        // 檢查是否有 query 參數 ?admin=true
        const isAdmin = req.query.admin === 'true';
        
        let sql = 'SELECT * FROM products';
        // 如果不是管理員，只顯示上架商品
        if (!isAdmin) {
            sql += ' WHERE is_available = 1';
        }
        
        const [rows] = await db.query(sql);
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
};

// 取得熱門餐點 (給首頁橫幅廣告用 - 需求 #2)
exports.getFeaturedProducts = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM products WHERE is_featured = 1 AND is_available = 1');
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
};

// 取得單一餐點詳情
exports.getProductById = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM products WHERE id = ?', [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ message: 'Product not found' });
        res.json(rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
};

// 新增餐點 (給後台 Admin 用 - 需求 #4)
exports.createProduct = async (req, res) => {
    const { name, description, price, image_url, category, is_featured } = req.body;
    try {
        const sql = `INSERT INTO products (name, description, price, image_url, category, is_featured) VALUES (?, ?, ?, ?, ?, ?)`;
        const [result] = await db.query(sql, [name, description, price, image_url, category, is_featured || 0]);
        res.status(201).json({ id: result.insertId, name, price });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
};

// 更新餐點 (給後台 Admin 用)
exports.updateProduct = async (req, res) => {
    const { name, description, price, image_url, category, is_featured, is_available } = req.body;
    const { id } = req.params;
    try {
        const sql = `UPDATE products SET name=?, description=?, price=?, image_url=?, category=?, is_featured=?, is_available=? WHERE id=?`;
        await db.query(sql, [name, description, price, image_url, category, is_featured, is_available, id]);
        res.json({ message: 'Product updated successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
};

// 刪除餐點 (給後台 Admin 用)
exports.deleteProduct = async (req, res) => {
    try {
        await db.query('DELETE FROM products WHERE id = ?', [req.params.id]);
        res.json({ message: 'Product deleted' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
};