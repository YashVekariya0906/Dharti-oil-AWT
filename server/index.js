const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Database connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'dharti_oil',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test DB Connection dynamically at startup
pool.getConnection()
  .then(connection => {
    console.log('Connected to MySQL database!');
    connection.release();
  })
  .catch(err => {
    console.error('Warning: MySQL connection failed. Please ensure the database is running and created.');
    console.error(err.message);
  });

// API endpoint to fetch website configuration (logo and text)
app.get('/api/config', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM navbar LIMIT 1');
    if (rows.length > 0) {
      res.json(rows[0]);
    } else {
      res.status(404).json({ message: 'Configuration not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// API endpoint to fetch all products
app.get('/api/products', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM products');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// API endpoint to fetch navbar data
app.get('/api/navbar', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM navbar LIMIT 1');
    if (rows.length > 0) {
      res.json(rows[0]);
    } else {
      res.status(404).json({ message: 'Navbar data not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// API endpoint to update navbar data
app.post('/api/navbar/update', async (req, res) => {
  try {
    const { logo, image1, image2, image3, image4, image5 } = req.body;
    
    const [rows] = await pool.query('SELECT id FROM navbar LIMIT 1');
    
    if (rows.length > 0) {
      // Update existing record
      const id = rows[0].id;
      await pool.query(
        'UPDATE navbar SET lnav_logo_path = ?, I1_path = ?, I2_path = ?, I3_path = ?, I4_path = ?, I5_path = ? WHERE id = ?',
        [logo || null, image1 || null, image2 || null, image3 || null, image4 || null, image5 || null, id]
      );
      res.json({ message: 'Navbar updated successfully', id });
    } else {
      // Insert new record if none exists
      await pool.query(
        'INSERT INTO navbar (lnav_logo_path, I1_path, I2_path, I3_path, I4_path, I5_path) VALUES (?, ?, ?, ?, ?, ?)',
        [logo || null, image1 || null, image2 || null, image3 || null, image4 || null, image5 || null]
      );
      res.json({ message: 'Navbar created successfully' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Catch-all route to test if server is alive
app.get('/', (req, res) => {
  res.send('Dharti Oil Backend API is running!');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
