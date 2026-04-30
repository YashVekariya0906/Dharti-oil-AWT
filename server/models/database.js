const mysql = require('mysql2');
require('dotenv').config();

// Create direct MySQL connection using Railway environment variables
const db = mysql.createConnection({
  host: process.env.MYSQLHOST,
  user: process.env.MYSQLUSER,
  password: process.env.MYSQLPASSWORD,
  database: process.env.MYSQLDATABASE
});

// Connect and log result
db.connect((err) => {
  if (err) {
    console.error('Unable to connect to the database:', err);
  } else {
    console.log('Connected to MySQL database!');
  }
});

module.exports = db;