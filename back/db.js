/* back/db.js */
const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,          // mysql-14773086-xxx.aivencloud.com
  port: Number(process.env.DB_PORT),  // 10250
  user: process.env.DB_USER,          // avnadmin
  password: process.env.DB_PASSWORD,  // Aiven 給的密碼
  database: process.env.DB_NAME,      // defaultdb

  ssl: {
    rejectUnauthorized: true          // Aiven 要求 SSL
  },

  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  connectTimeout: 10000
});

module.exports = pool;
