/* sql/schema.sql */

CREATE DATABASE IF NOT EXISTS chimo_db;
USE chimo_db;

-- 1. 用戶表 (用於後台管理員登入)
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('admin', 'staff') DEFAULT 'admin',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. 產品表 (包含熱門餐點標記)
CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price INT NOT NULL,
    image_url VARCHAR(255),
    category VARCHAR(50), -- 例如: 蛋餅類, 飲料類
    is_featured BOOLEAN DEFAULT FALSE, -- 用於「熱門餐點橫幅」
    is_available BOOLEAN DEFAULT TRUE, -- 用於上下架
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. 訂單表 (包含桌號、取餐時間、總備註)
CREATE TABLE IF NOT EXISTS orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NULL, -- NULL 代表訪客，有值代表會員
    table_number VARCHAR(10),
    pickup_time VARCHAR(50),
    customer_note TEXT,
    total_amount INT NOT NULL,
    status ENUM('pending', 'preparing', 'completed', 'cancelled') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- 4. 訂單項目表 (紀錄具體買了什麼，包含客製化選項)
CREATE TABLE IF NOT EXISTS order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL,
    price_at_time INT NOT NULL, -- 紀錄當下單價，避免產品後續漲價影響舊訂單
    custom_options TEXT, -- 儲存客製化字串，例如: "加起司, 蛋半熟"
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id)
);

/* sql/schema.sql (請更新或執行以下 ALTER 指令) */

-- 1. 修改 users 表 (因已存在，使用 ALTER)
ALTER TABLE users ADD COLUMN phone VARCHAR(20);
ALTER TABLE users ADD COLUMN address VARCHAR(255);
ALTER TABLE users MODIFY COLUMN role ENUM('admin', 'staff', 'customer') DEFAULT 'customer';
