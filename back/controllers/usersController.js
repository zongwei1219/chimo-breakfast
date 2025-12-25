/* back/controllers/usersController.js */
const db = require('../db');

exports.login = async (req, res) => {
    const { username, password } = req.body;
    try {
        const [rows] = await db.query('SELECT * FROM users WHERE username = ?', [username]);
        
        if (rows.length === 0) {
            return res.status(401).json({ message: '無此使用者' });
        }

        const user = rows[0];
        // 注意：正式環境請使用 bcrypt.compare(password, user.password_hash)
        if (password === user.password_hash) {
            // 登入成功，回傳基本資訊 (這裡簡化，不實作 JWT Token)
            res.json({ 
                message: 'Login successful', 
                user: { id: user.id, username: user.username, role: user.role } 
            });
        } else {
            res.status(401).json({ message: '密碼錯誤' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
};

// 註冊 (通用，預設為 customer)
exports.register = async (req, res) => {
    const { username, password, phone, address } = req.body;
    // 預設 role 為 'customer'
    const role = 'customer'; 

    try {
        // 檢查帳號是否重複
        const [exists] = await db.query('SELECT id FROM users WHERE username = ?', [username]);
        if (exists.length > 0) return res.status(400).json({ message: '此帳號已被註冊' });

        const sql = 'INSERT INTO users (username, password_hash, role, phone, address) VALUES (?, ?, ?, ?, ?)';
        await db.query(sql, [username, password, role, phone || '', address || '']);
        
        res.status(201).json({ message: '註冊成功' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: '註冊失敗，請稍後再試' });
    }
};

// 取得會員歷史訂單
exports.getUserHistory = async (req, res) => {
    const userId = req.params.id; // 從路由參數取得 user_id
    try {
        // 這裡我們只抓最近 10 筆，並按時間倒序
        const sql = `
            SELECT * FROM orders 
            WHERE user_id = ? 
            ORDER BY created_at DESC 
            LIMIT 10
        `;
        const [rows] = await db.query(sql, [userId]);
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
};

// 註冊一個初始管理員 (可透過 Postman 呼叫一次來建立帳號)
exports.register = async (req, res) => {
    const { username, password } = req.body; // password 應為 password_hash
    try {
        await db.query('INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)', [username, password, 'admin']);
        res.status(201).json({ message: 'User created' });
    } catch (err) {
        res.status(500).json({ message: 'Error creating user' });
    }
};