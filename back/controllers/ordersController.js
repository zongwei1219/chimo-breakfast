/* back/controllers/ordersController.js */
const db = require('../db');

// 1. 建立新訂單 (前端結帳時呼叫)
exports.createOrder = async (req, res) => {
    // 從前端接收資料：桌號, 取餐時間, 備註, 總金額, 購買項目陣列
    // 新增接收 user_id (若前端沒傳則為 undefined/null)
    const { table_number, pickup_time, customer_note, total_amount, items, user_id } = req.body;
    
    // items 預期格式: [{ product_id: 1, quantity: 2, price: 50, options: "加蛋, 半熟" }, ...]

    let connection;
    try {
        // 取得一個資料庫連線並開始交易
        connection = await db.getConnection();
        await connection.beginTransaction();

        // A. 寫入訂單主表 (Orders)
        // 修改 SQL 加入 user_id
        const orderSql = `INSERT INTO orders (user_id, table_number, pickup_time, customer_note, total_amount) VALUES (?, ?, ?, ?, ?)`;
        // 注意參數順序
        const [orderResult] = await connection.query(orderSql, [user_id || null, table_number, pickup_time, customer_note, total_amount]);
        const orderId = orderResult.insertId;

        // B. 寫入訂單項目表 (Order Items)
        if (items && items.length > 0) {
            const itemSql = `INSERT INTO order_items (order_id, product_id, quantity, price_at_time, custom_options) VALUES ?`;
            
            // 整理資料格式以符合 SQL 批量寫入 [order_id, product_id, quantity, price, options]
            const itemValues = items.map(item => [
                orderId,
                item.product_id,
                item.quantity,
                item.price,      // 記錄當下價格
                item.options || '' // 客製化字串 (如: "加起司")
            ]);

            await connection.query(itemSql, [itemValues]);
        }

        // C. 提交交易 (確認寫入)
        await connection.commit();

        res.status(201).json({ message: 'Order created successfully', orderId: orderId });

    } catch (err) {
        // 若發生錯誤，回滾交易 (取消所有變更)
        if (connection) await connection.rollback();
        console.error(err);
        res.status(500).json({ message: 'Failed to create order' });
    } finally {
        // 釋放連線回連線池
        if (connection) connection.release();
    }
};

// 2. 取得所有訂單 (優化版：包含 items)
exports.getAllOrders = async (req, res) => {
    try {
        // 使用 LEFT JOIN 連結 orders, order_items 和 products
        // 這樣可以一次拿到訂單資訊以及詳細的餐點資訊
        const sql = `
            SELECT 
                o.*, 
                oi.id AS item_id, oi.product_id, oi.quantity, oi.price_at_time, oi.custom_options,
                p.name AS product_name
            FROM orders o
            LEFT JOIN order_items oi ON o.id = oi.order_id
            LEFT JOIN products p ON oi.product_id = p.id
            ORDER BY o.created_at DESC
        `;

        const [rows] = await db.query(sql);

        // 資料轉換：將扁平的 SQL 結果轉換為巢狀物件 (Order -> Items)
        const ordersMap = new Map();

        for (const row of rows) {
            // 如果這張訂單還沒被記錄到 Map 中，先建立主檔結構
            if (!ordersMap.has(row.id)) {
                ordersMap.set(row.id, {
                    id: row.id,
                    user_id: row.user_id,
                    table_number: row.table_number,
                    status: row.status,
                    total_amount: row.total_amount,
                    pickup_time: row.pickup_time,
                    customer_note: row.customer_note,
                    created_at: row.created_at,
                    items: [] // 準備放餐點的陣列
                });
            }

            // 如果這行資料包含餐點資訊 (因為是 LEFT JOIN，有些訂單可能沒餐點或是 null)，則加入 items
            if (row.item_id) {
                ordersMap.get(row.id).items.push({
                    id: row.item_id,
                    product_id: row.product_id,
                    product_name: row.product_name, // 來自 products 表
                    quantity: row.quantity,
                    price: row.price_at_time,
                    custom_options: row.custom_options
                });
            }
        }

        // 將 Map 的 values 轉回 Array 回傳
        const result = Array.from(ordersMap.values());
        
        res.json(result);

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
};

// 3. 取得單一訂單詳情 (包含購買的餐點項目)
exports.getOrderById = async (req, res) => {
    try {
        const orderId = req.params.id;

        // 查詢訂單資訊
        const [orderRows] = await db.query('SELECT * FROM orders WHERE id = ?', [orderId]);
        if (orderRows.length === 0) return res.status(404).json({ message: 'Order not found' });

        // 查詢該訂單的品項 (並 Join products 表取得餐點名稱)
        const itemSql = `
            SELECT oi.*, p.name as product_name 
            FROM order_items oi
            JOIN products p ON oi.product_id = p.id
            WHERE oi.order_id = ?
        `;
        const [itemRows] = await db.query(itemSql, [orderId]);

        // 組合回傳資料
        const result = {
            ...orderRows[0],
            items: itemRows
        };

        res.json(result);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
};

// 4. 更新訂單狀態 (廚房接單、出餐用)
exports.updateOrderStatus = async (req, res) => {
    const { status } = req.body; // status: 'preparing', 'completed', 'cancelled'
    const { id } = req.params;

    try {
        await db.query('UPDATE orders SET status = ? WHERE id = ?', [status, id]);
        res.json({ message: `Order status updated to ${status}` });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
};