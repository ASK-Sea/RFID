require('dotenv').config();
const mysql = require('mysql2');

const db = mysql.createPool({
  host: process.env.DB_HOST,  
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME
});

db.getConnection((err, connection) => {
  if (err) {
    console.error("DB connection failed:", err);
  } else {
    console.log("Connected to MySQL database");
    connection.release();
  }
});

db.query("SELECT DATABASE() AS db", (err, res) => {
  console.log("Connected DB:", res?.[0]?.db);
});

module.exports = db;
