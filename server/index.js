const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '_' + Date.now() + ext);
  }
});
const upload = multer({ storage });
const navbarFields = [
  { name: 'nav_logo_path', maxCount: 1 },
  { name: 'I1_path', maxCount: 1 },
  { name: 'I2_path', maxCount: 1 },
  { name: 'I3_path', maxCount: 1 },
  { name: 'I4_path', maxCount: 1 },
  { name: 'I5_path', maxCount: 1 }
];

const app = express();

let transporter;
(async () => {
  if (process.env.EMAIL_USER && process.env.EMAIL_USER !== 'your_email@gmail.com' && process.env.EMAIL_PASS) {
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  } else {
    console.log("Notice: Generating temporary Ethereal mock email account for testing...");
    let testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      }
    });
    console.log("Mock Email configured! Check the console for Preview URLs when registering.");
  }
})();

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

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
    const [rows] = await pool.query('SELECT * FROM site_config LIMIT 1');
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

// API endpoint to add a new product
app.post('/api/products', async (req, res) => {
  try {
    const { product_name, product_quantity, product_description, product_price, product_discount } = req.body;
    
    // Convert to numbers explicitly for safety if they came as empty strings
    const qty = product_quantity ? parseInt(product_quantity) : 0;
    const price = product_price ? parseFloat(product_price) : 0;
    const discount = product_discount ? parseFloat(product_discount) : 0;

    const [result] = await pool.query(
      'INSERT INTO products (product_name, product_quantity, product_description, product_price, product_discount) VALUES (?, ?, ?, ?, ?)',
      [product_name || '', qty, product_description || '', price, discount]
    );
    res.status(201).json({ message: 'Product added successfully', product_id: result.insertId });
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

// API endpoint to delete navbar data files
app.post('/api/navbar/delete', async (req, res) => {
  try {
    const { fields } = req.body; 
    if (!fields || !fields.length) return res.status(400).json({ message: 'No fields provided' });

    const [rows] = await pool.query('SELECT * FROM navbar LIMIT 1');
    if (rows.length === 0) return res.status(404).json({ message: 'Navbar data not found' });
    
    const row = rows[0];
    let updates = [];
    
    for (const field of fields) {
       const allowedFields = ['nav_logo_path', 'I1_path', 'I2_path', 'I3_path', 'I4_path', 'I5_path'];
       if (allowedFields.includes(field)) {
          updates.push(`${field} = NULL`);
          if (row[field]) {
             const filename = row[field].split('/').pop();
             const filepath = path.join(__dirname, 'uploads', filename);
             if (fs.existsSync(filepath)) fs.unlinkSync(filepath);
          }
       }
    }
    
    if (updates.length > 0) {
      const updateQuery = `UPDATE navbar SET ${updates.join(', ')} WHERE nav_id = ?`;
      await pool.query(updateQuery, [row.nav_id]);
    }
    
    res.json({ message: 'Images deleted successfully!' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// API endpoint to update navbar data
app.post('/api/navbar/update', upload.fields(navbarFields), async (req, res) => {
  try {
    const constructPath = (field) => {
       if (req.files && req.files[field]) {
          return 'http://localhost:5000/uploads/' + req.files[field][0].filename;
       }
       return req.body[field] || null;
    };

    const nav_logo_path = constructPath('nav_logo_path');
    const I1_path = constructPath('I1_path');
    const I2_path = constructPath('I2_path');
    const I3_path = constructPath('I3_path');
    const I4_path = constructPath('I4_path');
    const I5_path = constructPath('I5_path');
    
    const [rows] = await pool.query('SELECT nav_id FROM navbar LIMIT 1');
    
    if (rows.length > 0) {
      const nav_id = rows[0].nav_id;
      await pool.query(
        'UPDATE navbar SET nav_logo_path = ?, I1_path = ?, I2_path = ?, I3_path = ?, I4_path = ?, I5_path = ? WHERE nav_id = ?',
        [nav_logo_path, I1_path, I2_path, I3_path, I4_path, I5_path, nav_id]
      );
      res.json({ message: 'Navbar updated successfully', nav_id });
    } else {
      await pool.query(
        'INSERT INTO navbar (nav_logo_path, I1_path, I2_path, I3_path, I4_path, I5_path) VALUES (?, ?, ?, ?, ?, ?)',
        [nav_logo_path, I1_path, I2_path, I3_path, I4_path, I5_path]
      );
      res.json({ message: 'Navbar created successfully' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});



// API endpoint for user registration
app.post('/api/register', async (req, res) => {
  try {
    const { username, moblie_no, emali, address, pincode, password, role } = req.body;
    
    // Check if user already exists
    const [existingUsers] = await pool.query(
      'SELECT user_id FROM register WHERE emali = ? OR moblie_no = ?',
      [emali, moblie_no]
    );

    if (existingUsers.length > 0) {
      return res.status(409).json({ message: 'User with this Email or Mobile Number already exists!' });
    }

    // Hash the password securely
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Generate 6-digit OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    console.log(`\n[DEVELOPMENT] OTP Code generated for ${emali}: ${otpCode}\n`);

    // Store in database using DATE_ADD for 10 min expiry logic
    // We already assume 'otp_code' and 'otp_expiry' columns are present per user instructions
    const [result] = await pool.query(
      'INSERT INTO register (username, moblie_no, emali, address, pincode, password, role, otp_code, otp_expiry) VALUES (?, ?, ?, ?, ?, ?, ?, ?, DATE_ADD(NOW(), INTERVAL 10 MINUTE))',
      [username, moblie_no, emali, address, pincode, hashedPassword, role || 'user', otpCode]
    );
    
    // Attempt sending OTP via whatever transporter is configured
    try {
      const info = await transporter.sendMail({
        from: '"Dharti Oil App" <noreply@dhartioil.com>',
        to: emali,
        subject: 'Registration OTP Code',
        text: `Your 6-digit registration code is: ${otpCode}. It is valid for 10 minutes.`
      });
      
      console.log(`[EMAIL DISPATCHED] Registration code sent to ${emali}`);
      
      // If it's a test ethereal email, it will have a preview URL:
      const previewUrl = nodemailer.getTestMessageUrl(info);
      if (previewUrl) {
        console.log(`\n===========================================`);
        console.log(`📬 VIEW YOUR OTP EMAIL HERE -> ${previewUrl}`);
        console.log(`===========================================\n`);
      }
    } catch (err) {
      console.error('Email failed to send: ', err);
      // Wait to delete the row if email strictly fails? For now we just log it.
    }

    res.status(201).json({ message: 'User initiated! Check your terminal or email for OTP.', user_id: result.insertId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// API endpoint for validating registration OTP
app.post('/api/verify-otp', async (req, res) => {
  try {
    const { emali, otp_code } = req.body;
    
    // Validate from DB via exact custom query to ensure it's not expired
    const [rows] = await pool.query(
      `SELECT * FROM register WHERE emali = ? AND otp_code = ? AND otp_expiry >= NOW()`,
      [emali, otp_code]
    );

    if (rows.length > 0) {
      // It's verified, clear the OTP to prevent reuse
      await pool.query(
        `UPDATE register SET otp_code = NULL, otp_expiry = NULL WHERE user_id = ?`,
        [rows[0].user_id]
      );
      
      const user = {
        user_id: rows[0].user_id,
        username: rows[0].username,
        emali: rows[0].emali,
        role: rows[0].role
      };
      
      res.status(200).json({ message: 'Verified successfully!', user });
    } else {
      res.status(400).json({ message: 'Invalid or expired 6-digit code.' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// API endpoint for user login
app.post('/api/login', async (req, res) => {
  try {
    const { emali, password } = req.body;
    
    // Check if user exists
    const [users] = await pool.query('SELECT * FROM register WHERE emali = ?', [emali]);
    
    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found with this email.' });
    }
    
    const userRow = users[0];
    
    // Check if the user is verified (otp_code is NULL implies they verified if we strictly required it)
    // For now we just verify password since OTP validates them initially
    
    const passwordMatch = await bcrypt.compare(password, userRow.password);
    
    if (!passwordMatch) {
      return res.status(401).json({ message: 'Incorrect password.' });
    }
    
    const user = {
      user_id: userRow.user_id,
      username: userRow.username,
      emali: userRow.emali,
      role: userRow.role
    };
    
    res.status(200).json({ message: 'Login successful!', user });
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
