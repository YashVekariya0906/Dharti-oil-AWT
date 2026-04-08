
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { SiteConfig, Navbar, Product, User, FooterSettings, ShopDetails, Blog, ContactDetails, ContactInquiry, SellingRequest, GlobalPrice, Order, OrderItem, DeliveryCharge, AboutUs, AboutUsMember, syncDatabase, sequelize } = require('./models');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/navbar/');
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
  { name: 'I5_path', maxCount: 1 },
  { name: 'intro_path', maxCount: 1 }
];

const productStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/products/');
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const safeName = (req.body.product_name || 'product').replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    cb(null, safeName + '_' + Date.now() + ext);
  }
});
const productUpload = multer({ storage: productStorage });

// Blog banner image upload configuration
const blogStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/blog/');
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const safeTitle = (req.body.title || 'blog').replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    cb(null, `blog_${safeTitle}_${Date.now()}${ext}`);
  }
});
const blogUpload = multer({ storage: blogStorage });

// Contact banner upload
const contactStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/contact/');
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, `contact_banner_${Date.now()}${ext}`);
  }
});
const contactUpload = multer({ storage: contactStorage });

// Visit Report photos upload
const reportStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/reports/');
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, `report_photo_${Date.now()}_${Math.floor(Math.random() * 1000)}${ext}`);
  }
});
const reportUpload = multer({ storage: reportStorage });

const app = express();

// Email configuration
let transporter;
if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
  console.log(' Real Gmail transporter configured for production use');
} else {
  // console.error(' ERROR: Real Gmail credentials not configured in .env file!');
  // console.error('Please set EMAIL_USER and EMAIL_PASS in your .env file');
  console.log(' Email functionality disabled - using test mode');
  // Email functionality will be disabled
}

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

async function ensureSellingRequestBrokerFk() {
  try {
    const [constraints] = await sequelize.query(`
      SELECT CONSTRAINT_NAME, REFERENCED_TABLE_NAME
      FROM information_schema.KEY_COLUMN_USAGE
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'selling_requests'
        AND COLUMN_NAME = 'broker_id'
    `);

    for (const row of constraints) {
      if (row.CONSTRAINT_NAME) {
        await sequelize.query(`ALTER TABLE selling_requests DROP FOREIGN KEY \`${row.CONSTRAINT_NAME}\``);
      }
    }
  } catch (error) {
    console.warn('Could not drop existing selling_requests.broker_id FK:', error.message);
  }

  try {
    await sequelize.query(`
      ALTER TABLE selling_requests
      ADD CONSTRAINT fk_selling_requests_broker_id_register
      FOREIGN KEY (broker_id) REFERENCES register(user_id)
      ON DELETE SET NULL
      ON UPDATE CASCADE
    `);
    console.log(' selling_requests.broker_id now references register.user_id');
  } catch (error) {
    console.warn('Could not create FK to register.user_id:', error.message);
  }
}

// Initialize database and sync tables
(async () => {
  await syncDatabase();
  await ensureSellingRequestBrokerFk();
  require('./migrate-all.js');
})();

// API endpoint to fetch website configuration (logo and text)
app.get('/api/config', async (req, res) => {
  try {
    const config = await SiteConfig.findOne();
    if (config) {
      res.json(config.toJSON());
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
    const products = await Product.findAll();
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// API endpoint to add a new product
app.post('/api/products', productUpload.single('product_image'), async (req, res) => {
  try {
    const { product_name, product_quantity, product_description, product_price, product_discount } = req.body;

    // Convert to numbers explicitly for safety if they came as empty strings
    const qty = product_quantity ? parseInt(product_quantity) : 0;
    const price = product_price ? parseFloat(product_price) : 0;
    const discount = product_discount ? parseFloat(product_discount) : 0;

    const product_image = req.file ? ('http://localhost:5000/uploads/products/' + req.file.filename) : null;

    const product = await Product.create({
      product_name: product_name || '',
      product_quantity: qty,
      product_description: product_description || '',
      product_price: price,
      product_discount: discount,
      product_image: product_image
    });

    res.status(201).json({ message: 'Product added successfully', product_id: product.product_id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// API endpoint to update a product
app.put('/api/products/:id', productUpload.single('product_image'), async (req, res) => {
  try {
    const { id } = req.params;
    const { product_name, product_quantity, product_description, product_price, product_discount, existing_image } = req.body;

    const qty = product_quantity ? parseInt(product_quantity) : 0;
    const price = product_price ? parseFloat(product_price) : 0;
    const discount = product_discount ? parseFloat(product_discount) : 0;

    const product_image = req.file ? ('http://localhost:5000/uploads/products/' + req.file.filename) : (existing_image || null);

    await Product.update({
      product_name: product_name || '',
      product_quantity: qty,
      product_description: product_description || '',
      product_price: price,
      product_discount: discount,
      product_image: product_image
    }, {
      where: { product_id: id }
    });

    res.status(200).json({ message: 'Product updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// API endpoint to delete a product
app.delete('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await Product.destroy({
      where: { product_id: id }
    });
    res.status(200).json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// API endpoint to fetch navbar data
app.get('/api/navbar', async (req, res) => {
  try {
    const navbar = await Navbar.findOne();
    if (navbar) {
      res.json(navbar.toJSON());
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

    const navbar = await Navbar.findOne();
    if (!navbar) return res.status(404).json({ message: 'Navbar data not found' });

    const updates = {};

    for (const field of fields) {
      const allowedFields = ['nav_logo_path', 'I1_path', 'I2_path', 'I3_path', 'I4_path', 'I5_path', 'intro_path'];
      if (allowedFields.includes(field)) {
        updates[field] = null;
        if (navbar[field]) {
          const filename = navbar[field].split('/').pop();
          const filepath = path.join(__dirname, 'uploads', 'navbar', filename);
          if (fs.existsSync(filepath)) fs.unlinkSync(filepath);
        }
      }
    }

    if (Object.keys(updates).length > 0) {
      await Navbar.update(updates, { where: { nav_id: navbar.nav_id } });
    }

    res.json({ message: 'Images deleted successfully!' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// API endpoint to update navbar data
app.post('/api/navbar/update', upload.fields(navbarFields), async (req, res) => {
  try {
    const existingNavbar = await Navbar.findOne();

    const constructPath = (field) => {
      if (req.files && req.files[field]) {
        if (existingNavbar && existingNavbar[field]) {
          const filename = existingNavbar[field].split('/').pop();
          const filepath = path.join(__dirname, 'uploads', 'navbar', filename);
          if (fs.existsSync(filepath)) fs.unlinkSync(filepath);
        }
        return 'http://localhost:5000/uploads/navbar/' + req.files[field][0].filename;
      }
      return req.body[field] || null;
    };

    const nav_logo_path = constructPath('nav_logo_path');
    const I1_path = constructPath('I1_path');
    const I2_path = constructPath('I2_path');
    const I3_path = constructPath('I3_path');
    const I4_path = constructPath('I4_path');
    const I5_path = constructPath('I5_path');
    const intro_path = constructPath('intro_path');

    if (existingNavbar) {
      await Navbar.update({
        nav_logo_path, I1_path, I2_path, I3_path, I4_path, I5_path, intro_path
      }, {
        where: { nav_id: existingNavbar.nav_id }
      });
      res.json({ message: 'Navbar updated successfully', nav_id: existingNavbar.nav_id });
    } else {
      const newNavbar = await Navbar.create({
        nav_logo_path, I1_path, I2_path, I3_path, I4_path, I5_path, intro_path
      });
      res.json({ message: 'Navbar created successfully', nav_id: newNavbar.nav_id });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});



// API endpoint to fetch shop details
app.get('/api/shop-details', async (req, res) => {
  try {
    const shopDetails = await ShopDetails.findOne();
    if (shopDetails) {
      res.json(shopDetails.toJSON());
    } else {
      res.status(404).json({ message: 'Shop details not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// API endpoint to update shop details
app.post('/api/shop-details/update', async (req, res) => {
  try {
    const {
      main_title, main_description, product_highlights,
      tin15_title, tin15_description, can15_title, can15_description,
      can5_title, can5_description, bottle1_title, bottle1_description,
      quality_description, usage_description, why_choose
    } = req.body;

    const existingShopDetails = await ShopDetails.findOne();

    if (existingShopDetails) {
      await ShopDetails.update({
        main_title, main_description, product_highlights,
        tin15_title, tin15_description, can15_title, can15_description,
        can5_title, can5_description, bottle1_title, bottle1_description,
        quality_description, usage_description, why_choose
      }, {
        where: { id: existingShopDetails.id }
      });
      res.json({ message: 'Shop details updated successfully', id: existingShopDetails.id });
    } else {
      const newShopDetails = await ShopDetails.create({
        main_title, main_description, product_highlights,
        tin15_title, tin15_description, can15_title, can15_description,
        can5_title, can5_description, bottle1_title, bottle1_description,
        quality_description, usage_description, why_choose
      });
      res.json({ message: 'Shop details created successfully', id: newShopDetails.id });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// API endpoint to fetch footer data
app.get('/api/footer', async (req, res) => {
  try {
    const footer = await FooterSettings.findOne();
    if (footer) {
      res.json(footer.toJSON());
    } else {
      res.status(404).json({ message: 'Footer config not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// API endpoint to update footer data
app.post('/api/footer/update', async (req, res) => {
  try {
    const {
      company_name, address, phone, email, facebook_link, instagram_link, home_link, shop_link, about_link, contact_link, blog_link, privacy_policy_link, return_exchange_link, working_days, working_hours
    } = req.body;

    const existingFooter = await FooterSettings.findOne();

    if (existingFooter) {
      await FooterSettings.update({
        company_name, address, phone, email, facebook_link, instagram_link, home_link, shop_link, about_link, contact_link, blog_link, privacy_policy_link, return_exchange_link, working_days, working_hours
      }, {
        where: { id: existingFooter.id }
      });
      res.json({ message: 'Footer updated successfully', id: existingFooter.id });
    } else {
      const newFooter = await FooterSettings.create({
        company_name, address, phone, email, facebook_link, instagram_link, home_link, shop_link, about_link, contact_link, blog_link, privacy_policy_link, return_exchange_link, working_days, working_hours
      });
      res.json({ message: 'Footer created successfully', id: newFooter.id });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// API endpoint for user registration
app.post('/api/register', async (req, res) => {
  try {
    const username = (req.body.username || '').trim();
    const moblie_no = (req.body.moblie_no || '').trim();
    const emali = (req.body.emali || '').trim().toLowerCase();
    const address = (req.body.address || '').trim();
    const pincode = (req.body.pincode || '').trim();
    const password = (req.body.password || '').trim();
    const role = req.body.role || 'user';

    // Validate required fields
    if (!username || !moblie_no || !emali || !address || !pincode || !password) {
      return res.status(400).json({ message: 'All fields are required!' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      where: {
        [require('sequelize').Op.or]: [
          { emali },
          { moblie_no }
        ]
      }
    });

    if (existingUser) {
      return res.status(409).json({ message: 'User with this Email or Mobile Number already exists!' });
    }

    // Hash the password securely
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Generate 6-digit OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    console.log(`\n[OTP GENERATED] Code for ${emali}: ${otpCode}\n`);

    // Create user with Sequelize (unverified - has OTP)
    const user = await User.create({
      username,
      moblie_no,
      emali,
      address,
      pincode,
      password: hashedPassword,
      role: role || 'user',
      otp_code: otpCode,
      otp_expiry: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes from now
    });

    // Send OTP to user's real email
    try {
      const info = await transporter.sendMail({
        from: `"Dharti Oil App" <${process.env.EMAIL_USER}>`,
        to: emali,
        subject: 'Verify Your Email - Dharti Oil Registration',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2d5a27;">Welcome to Dharti Oil!</h2>
            <p>Thank you for registering with us. To complete your registration, please verify your email address.</p>
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; text-align: center; margin: 20px 0;">
              <h3 style="color: #2d5a27; margin: 0;">Your Verification Code</h3>
              <p style="font-size: 32px; font-weight: bold; color: #2d5a27; margin: 10px 0; letter-spacing: 5px;">${otpCode}</p>
              <p style="color: #666; margin: 0;">This code will expire in 10 minutes</p>
            </div>
            <p>If you didn't request this registration, please ignore this email.</p>
            <p>Best regards,<br>Dharti Oil Team</p>
          </div>
        `,
        text: `Welcome to Dharti Oil! Your verification code is: ${otpCode}. This code will expire in 10 minutes.`
      });

      console.log(` [EMAIL SENT] OTP sent successfully to ${emali}`);

    } catch (emailError) {
      console.error(' [EMAIL FAILED] Could not send OTP to:', emali, emailError.message);
      // Delete the user if email fails
      await User.destroy({ where: { user_id: user.user_id } });
      return res.status(500).json({ message: 'Failed to send verification email. Please try again.' });
    }

    res.status(201).json({
      message: 'Registration successful! Please check your email for verification code.',
      email: emali,
      requires_verification: true
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: error.message });
  }
});

// API endpoint to resend OTP
app.post('/api/resend-otp', async (req, res) => {
  try {
    const { emali } = req.body;

    if (!emali) {
      return res.status(400).json({ message: 'Email is required!' });
    }

    // Find user with unverified account (has OTP)
    const user = await User.findOne({
      where: {
        emali: emali,
        otp_code: {
          [require('sequelize').Op.ne]: null
        }
      }
    });

    if (!user) {
      return res.status(404).json({ message: 'No unverified account found with this email.' });
    }

    // Generate new OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    console.log(`\n[OTP REGENERATED] New code for ${emali}: ${otpCode}\n`);

    // Update user with new OTP
    await User.update({
      otp_code: otpCode,
      otp_expiry: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes from now
    }, {
      where: { user_id: user.user_id }
    });

    // Send new OTP email
    try {
      await transporter.sendMail({
        from: `"Dharti Oil App" <${process.env.EMAIL_USER}>`,
        to: emali,
        subject: 'New Verification Code - Dharti Oil Registration',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2d5a27;">Dharti Oil - New Verification Code</h2>
            <p>You requested a new verification code. Here it is:</p>
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; text-align: center; margin: 20px 0;">
              <h3 style="color: #2d5a27; margin: 0;">Your New Verification Code</h3>
              <p style="font-size: 32px; font-weight: bold; color: #2d5a27; margin: 10px 0; letter-spacing: 5px;">${otpCode}</p>
              <p style="color: #666; margin: 0;">This code will expire in 10 minutes</p>
            </div>
            <p>If you didn't request this, please ignore this email.</p>
            <p>Best regards,<br>Dharti Oil Team</p>
          </div>
        `,
        text: `Your new verification code is: ${otpCode}. This code will expire in 10 minutes.`
      });

      console.log(` [OTP RESENT] New OTP sent to ${emali}`);

      res.status(200).json({
        message: 'New verification code sent to your email.',
        email: emali
      });

    } catch (emailError) {
      console.error(' [EMAIL FAILED] Could not resend OTP to:', emali, emailError.message);
      return res.status(500).json({ message: 'Failed to send email. Please try again.' });
    }

  } catch (error) {
    console.error('Resend OTP error:', error);
    res.status(500).json({ error: 'Failed to resend verification code.' });
  }
});

// API endpoint for validating registration OTP
app.post('/api/verify-otp', async (req, res) => {
  try {
    const { emali, otp_code } = req.body;

    if (!emali || !otp_code) {
      return res.status(400).json({ message: 'Email and OTP code are required!' });
    }

    // Find user with valid OTP
    const user = await User.findOne({
      where: {
        emali: emali,
        otp_code: otp_code,
        otp_expiry: {
          [require('sequelize').Op.gte]: new Date()
        }
      }
    });

    if (!user) {
      return res.status(400).json({
        message: 'Invalid or expired verification code. Please request a new one.'
      });
    }

    // Mark user as verified by clearing OTP fields
    await User.update({
      otp_code: null,
      otp_expiry: null
    }, {
      where: { user_id: user.user_id }
    });

    console.log(` [OTP VERIFIED] User ${emali} successfully verified`);

    res.status(200).json({
      message: 'Email verified successfully! You can now login.',
      verified: true,
      email: emali
    });

  } catch (error) {
    console.error('OTP verification error:', error);
    res.status(500).json({ error: 'Verification failed. Please try again.' });
  }
});

// API endpoint for user login
app.post('/api/login', async (req, res) => {
  try {
    const emaliRaw = (req.body.emali || '').trim();
    const password = (req.body.password || '').trim();
    const emali = emaliRaw.toLowerCase();

    if (!emali || !password) {
      return res.status(400).json({ message: 'Email and password are required!' });
    }

    // Check if user exists
    const user = await User.findOne({
      where: { emali }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found with this email.' });
    }

    // Check if user is verified (otp_code should be null)
    if (user.otp_code !== null) {
      return res.status(403).json({
        message: 'Please verify your email first before logging in.',
        requires_verification: true,
        email: emali
      });
    }

    // Check if broker is active
    if (user.role === 'broker' && user.status !== 'Active') {
      return res.status(403).json({ message: 'Broker account is inactive.' });
    }

    // Verify password
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ message: 'Incorrect password.' });
    }

    const userResponse = {
      user_id: user.user_id,
      username: user.username,
      emali: user.emali,
      moblie_no: user.moblie_no,
      address: user.address,
      pincode: user.pincode,
      role: user.role,
      commission_percent: user.commission_percent || 0,
      status: user.status || 'Active'
    };

    console.log(` [LOGIN SUCCESS] User ${emali} logged in successfully`);

    res.status(200).json({
      message: 'Login successful!',
      user: userResponse
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed. Please try again.' });
  }
});

// GET user profile by ID
app.get('/api/users/:id', async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.status(200).json({
      user_id: user.user_id,
      username: user.username,
      emali: user.emali,
      moblie_no: user.moblie_no,
      address: user.address,
      pincode: user.pincode,
      role: user.role
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// In-memory store for broker details waiting for OTP confirmation (never touches DB until verified)
const pendingBrokers = new Map();

// Broker Endpoints
app.post('/api/admin/brokers', async (req, res) => {
  try {
    const username = (req.body.username || '').trim();
    const moblie_no = (req.body.moblie_no || '').trim();
    const address = (req.body.address || '').trim();
    const password = (req.body.password || '').trim();
    const emali = (req.body.emali || '').trim().toLowerCase();
    const pincode = (req.body.pincode || '').trim();
    const commission_percent = req.body.commission_percent;

    // Validate required fields
    if (!username || !moblie_no || !address || !password || !emali || !pincode) {
      console.log(' Missing required fields:', { username, moblie_no, address, password, emali, pincode });
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check if broker exists
    const existingBroker = await User.findOne({ where: { emali, role: 'broker' } });
    if (existingBroker) {
      console.log(` Broker with email ${emali} already exists`);
      return res.status(409).json({ message: 'Broker with this email already exists!' });
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Generate OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = Date.now() + 10 * 60 * 1000; // 10 min timestamp

    // ✅ Save ONLY in memory — NO DB record yet
    pendingBrokers.set(emali, {
      username,
      moblie_no,
      address,
      pincode,
      emali,
      password: hashedPassword,
      commission_percent: commission_percent || 0,
      otpCode,
      otpExpiry
    });

    console.log(`📋 Broker [${emali}] stored in memory, waiting for OTP verification`);

    // Send OTP email
    try {
      if (transporter) {
        await transporter.sendMail({
          from: `"Dharti Amrut" <${process.env.EMAIL_USER}>`,
          to: emali,
          subject: 'Broker Verification OTP - Dharti Amrut',
          html: `<p>Your broker account verification code is <strong>${otpCode}</strong>. This code expires in 10 minutes.</p>`
        });
      } else {
        // Dev fallback — print OTP to console
        console.log(`📧 [DEV MODE] OTP for ${emali} → ${otpCode}`);
      }
    } catch (emailError) {
      console.error('⚠️ Failed to send broker OTP email:', emailError.message);
    }

    res.status(201).json({
      message: 'OTP sent to broker email. Verify OTP to complete broker registration.',
      emali
    });
  } catch (error) {
    console.error('Error during broker pre-registration:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/admin/brokers', async (req, res) => {
  try {
    // return all brokers for admin view (active + inactive)
    const brokers = await User.findAll({ where: { role: 'broker' }, order: [['user_id', 'DESC']] });
    res.json(brokers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/admin/brokers/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const broker = await User.findByPk(id);
    if (!broker || broker.role !== 'broker') {
      return res.status(404).json({ message: 'Broker not found' });
    }
    await User.destroy({ where: { user_id: id } });
    res.json({ message: 'Broker deleted successfully' });
  } catch (error) {
    console.error(' Error deleting broker:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/admin/brokers/verify-otp', async (req, res) => {
  try {
    const { emali, otp_code } = req.body;
    if (!emali || !otp_code) {
      return res.status(400).json({ message: 'Email and OTP are required' });
    }

    const normalizedEmail = (emali || '').trim().toLowerCase();
    const pending = pendingBrokers.get(normalizedEmail);

    if (!pending) {
      return res.status(400).json({ message: 'No pending registration found for this email. Please fill in the broker form again.' });
    }

    if (pending.otpCode !== (otp_code || '').trim()) {
      return res.status(400).json({ message: 'Invalid OTP code. Please try again.' });
    }

    if (Date.now() > pending.otpExpiry) {
      pendingBrokers.delete(normalizedEmail);
      return res.status(400).json({ message: 'OTP has expired. Please refill the broker form to get a new OTP.' });
    }

    // ✅ OTP verified — NOW create the broker record in DB as Active
    const broker = await User.create({
      username: pending.username,
      moblie_no: pending.moblie_no,
      emali: pending.emali,
      address: pending.address,
      pincode: pending.pincode,
      password: pending.password,
      role: 'broker',
      commission_percent: pending.commission_percent,
      status: 'Active'
    });

    pendingBrokers.delete(normalizedEmail); // clean up memory

    console.log(`✅ Broker ${broker.username} (${broker.emali}) successfully added to DB after OTP verification.`);
    res.status(200).json({ message: 'Broker verified and added successfully!', broker });
  } catch (error) {
    console.error('Error verifying broker OTP:', error);
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/admin/brokers/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { username, moblie_no, address, pincode, commission_percent, status, password, emali } = req.body;

    const broker = await User.findByPk(id);
    if (!broker || broker.role !== 'broker') {
      return res.status(404).json({ message: 'Broker not found' });
    }

    const updates = {
      username: username ? username.trim() : broker.username,
      moblie_no: moblie_no ? moblie_no.trim() : broker.moblie_no,
      address: address ? address.trim() : broker.address,
      pincode: pincode ? pincode.trim() : broker.pincode,
      commission_percent: commission_percent != null ? commission_percent : broker.commission_percent,
      status: status || broker.status
    };

    if (emali) {
      updates.emali = emali.trim().toLowerCase();
    }

    if (password && password.trim()) {
      const saltRounds = 10;
      updates.password = await bcrypt.hash(password.trim(), saltRounds);
    }

    await User.update(updates, { where: { user_id: id } });

    const updatedBroker = await User.findByPk(id);
    res.status(200).json({ message: 'Broker updated successfully', broker: updatedBroker });
  } catch (error) {
    console.error(' Error updating broker:', error);
    res.status(500).json({ error: error.message });
  }
});

// Global Price Endpoints
app.get('/api/admin/global-price', async (req, res) => {
  try {
    let globalPrice = await GlobalPrice.findOne();
    if (!globalPrice) {
      globalPrice = await GlobalPrice.create({ current_price: 0 });
    }
    res.json(globalPrice);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/admin/global-price', async (req, res) => {
  try {
    const { current_price } = req.body;

    if (!current_price && current_price !== 0) {
      console.log(' Current price is required');
      return res.status(400).json({ message: 'Current price is required' });
    }

    console.log('📝 Updating global price to:', current_price);

    let globalPrice = await GlobalPrice.findOne();
    if (globalPrice) {
      await GlobalPrice.update({ current_price }, { where: { id: globalPrice.id } });
      console.log(' Global price updated');
    } else {
      globalPrice = await GlobalPrice.create({ current_price });
      console.log(' Global price created');
    }

    const updated = await GlobalPrice.findOne();
    res.json({ message: 'Global Price updated successfully!', globalPrice: updated });
  } catch (error) {
    console.error(' Error updating global price:', error);
    res.status(500).json({ error: error.message });
  }
});

// Selling Request Endpoints
app.post('/api/users/selling-requests', async (req, res) => {
  try {
    const { user_id, stock_per_mound, customer_price, payment_method } = req.body;
    const globalPrice = await GlobalPrice.findOne();
    const our_price = globalPrice ? globalPrice.current_price : 0;

    const request = await SellingRequest.create({
      user_id, stock_per_mound, our_price, customer_price, payment_method: payment_method || 'Cash'
    });
    res.status(201).json({ message: 'Selling Request created successfully!', request });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/admin/selling-requests', async (req, res) => {
  try {
    const requests = await SellingRequest.findAll({
      include: [
        { model: User, as: 'user' },
        { model: User, as: 'broker' }
      ],
      order: [['created_at', 'DESC']]
    });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/admin/selling-requests/:id/accept', async (req, res) => {
  try {
    const { id } = req.params;
    const { broker_id } = req.body;

    await SellingRequest.update({ broker_id, status: 'Accepted' }, { where: { request_id: id } });
    res.json({ message: 'Selling request accepted and broker assigned.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/brokers/:broker_id/selling-requests', async (req, res) => {
  try {
    const { broker_id } = req.params;
    const requests = await SellingRequest.findAll({
      where: { broker_id },
      include: [{ model: User, as: 'user' }],
      order: [['created_at', 'DESC']]
    });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/brokers/selling-requests/:id/schedule', async (req, res) => {
  try {
    const { id } = req.params;
    const { visit_day, visit_time } = req.body;

    await SellingRequest.update({ visit_day, visit_time, status: 'Scheduled' }, { where: { request_id: id } });
    res.json({ message: 'Visit scheduled successfully.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/brokers/selling-requests/:id/reached', async (req, res) => {
  try {
    const { id } = req.params;
    await SellingRequest.update({ status: 'Reached', reached_at: new Date() }, { where: { request_id: id } });
    res.json({ message: 'Marked as Reached successfully.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/brokers/selling-requests/:id/report', reportUpload.fields([{ name: 'sample_photos', maxCount: 5 }, { name: 'payment_proof', maxCount: 1 }]), async (req, res) => {
  try {
    const { id } = req.params;
    const { delivered_quantity, broker_comments, final_price } = req.body;

    const request = await SellingRequest.findByPk(id);
    if (!request) {
      return res.status(404).json({ message: 'Selling request not found' });
    }

    // Process uploaded photos
    let samplePhotos = [];
    if (request.sample_photos) {
      try {
        samplePhotos = JSON.parse(request.sample_photos);
      } catch (e) {
        samplePhotos = [];
      }
    }

    if (req.files && req.files.sample_photos) {
      const newPhotos = req.files.sample_photos.map(file => 'http://localhost:5000/uploads/reports/' + file.filename);
      samplePhotos = [...samplePhotos, ...newPhotos];
    }
    
    let paymentProofUrl = request.payment_proof || null;
    if (req.files && req.files.payment_proof && req.files.payment_proof.length > 0) {
      paymentProofUrl = 'http://localhost:5000/uploads/reports/' + req.files.payment_proof[0].filename;
    }

    await SellingRequest.update({
      delivered_quantity: delivered_quantity != null ? parseFloat(delivered_quantity) : request.delivered_quantity,
      broker_comments: broker_comments != null ? broker_comments : request.broker_comments,
      final_price: final_price != null ? parseFloat(final_price) : request.final_price,
      sample_photos: JSON.stringify(samplePhotos),
      payment_proof: paymentProofUrl,
      is_visited: true,
      status: 'Completed'
    }, { where: { request_id: id } });

    res.json({ message: 'Visit report submitted successfully.' });
  } catch (error) {
    console.error('Error submitting report:', error);
    res.status(500).json({ error: error.message });
  }
});

// Admin reject a pending selling request
app.put('/api/admin/selling-requests/:id/reject', async (req, res) => {
  try {
    const { id } = req.params;
    const { admin_reject_reason, admin_reject_comment } = req.body;

    if (!admin_reject_reason) {
      return res.status(400).json({ message: 'Rejection reason is required.' });
    }

    const request = await SellingRequest.findByPk(id);
    if (!request) return res.status(404).json({ message: 'Selling request not found.' });

    await SellingRequest.update({
      status: 'AdminRejected',
      admin_reject_reason,
      admin_reject_comment: admin_reject_comment || ''
    }, { where: { request_id: id } });

    res.json({ message: 'Selling request rejected by admin.' });
  } catch (error) {
    console.error('Error rejecting selling request:', error);
    res.status(500).json({ error: error.message });
  }
});

// Broker rejects product at user location (after Reached)
const brokerRejectStorage = multer.diskStorage({
  destination: function (req, file, cb) { cb(null, 'uploads/broker/'); },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, `broker_reject_photo_${Date.now()}_${Math.floor(Math.random() * 1000)}${ext}`);
  }
});
const brokerRejectUpload = multer({ storage: brokerRejectStorage });

app.put('/api/brokers/selling-requests/:id/broker-reject', brokerRejectUpload.array('broker_reject_photos', 5), async (req, res) => {
  try {
    const { id } = req.params;
    const { broker_reject_reason, broker_reject_comment } = req.body;

    if (!broker_reject_reason) {
      return res.status(400).json({ message: 'Rejection reason is required.' });
    }

    const request = await SellingRequest.findByPk(id);
    if (!request) return res.status(404).json({ message: 'Selling request not found.' });

    let photos = [];
    if (req.files && req.files.length > 0) {
      photos = req.files.map(f => 'http://localhost:5000/uploads/broker/' + f.filename);
    }

    await SellingRequest.update({
      status: 'BrokerRejected',
      broker_reject_reason,
      broker_reject_comment: broker_reject_comment || '',
      broker_reject_photos: JSON.stringify(photos)
    }, { where: { request_id: id } });

    res.json({ message: 'Broker rejection submitted. Awaiting admin review.' });
  } catch (error) {
    console.error('Error submitting broker rejection:', error);
    res.status(500).json({ error: error.message });
  }
});

// Admin confirms broker rejection → forwards to user
app.put('/api/admin/selling-requests/:id/confirm-broker-rejection', async (req, res) => {
  try {
    const { id } = req.params;
    const request = await SellingRequest.findByPk(id);
    if (!request) return res.status(404).json({ message: 'Selling request not found.' });

    await SellingRequest.update({
      status: 'BrokerRejectionConfirmed'
    }, { where: { request_id: id } });

    res.json({ message: 'Broker rejection confirmed and forwarded to user.' });
  } catch (error) {
    console.error('Error confirming broker rejection:', error);
    res.status(500).json({ error: error.message });
  }
});

// Admin overrides broker rejection: reset request to assign another broker
app.put('/api/admin/selling-requests/:id/override-broker-rejection', async (req, res) => {
  try {
    const { id } = req.params;
    const request = await SellingRequest.findByPk(id);
    if (!request) return res.status(404).json({ message: 'Selling request not found.' });

    await SellingRequest.update({
      status: 'Pending',
      broker_id: null,
      broker_reject_reason: null,
      broker_reject_comment: null,
      broker_reject_photos: null,
      visit_day: null,
      visit_time: null,
      reached_at: null
    }, { where: { request_id: id } });

    res.json({ message: 'Request reset. You can now assign another broker.' });
  } catch (error) {
    console.error('Error overriding broker rejection:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get user's own selling requests (for user profile)
app.get('/api/users/:id/selling-requests', async (req, res) => {
  try {
    const { id } = req.params;
    const requests = await SellingRequest.findAll({
      where: { user_id: id },
      include: [{ model: User, as: 'broker' }],
      order: [['created_at', 'DESC']]
    });
    res.json(requests);
  } catch (error) {
    console.error('Error fetching user selling requests:', error);
    res.status(500).json({ error: error.message });
  }
});

// User Profile Endpoints
app.get('/api/users/:id/profile', async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/users/:id/profile', async (req, res) => {
  try {
    const { id } = req.params;
    const { username, moblie_no, address, pincode, new_emali } = req.body;

    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (new_emali && new_emali !== user.emali) {
      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
      console.log(`\n[OTP GENERATED] Code for email change ${new_emali}: ${otpCode}\n`);

      await User.update({
        username: username || user.username,
        moblie_no: moblie_no || user.moblie_no,
        address: address || user.address,
        pincode: pincode || user.pincode,
        otp_code: otpCode,
        otp_expiry: new Date(Date.now() + 10 * 60 * 1000)
      }, { where: { user_id: id } });

      try {
        if (transporter) {
          await transporter.sendMail({
            from: `"Dharti Oil App" <${process.env.EMAIL_USER}>`,
            to: new_emali,
            subject: 'Verify Your New Email - Dharti Oil',
            html: `<p>Your verification code is: ${otpCode}</p>`
          });
        }
      } catch (e) {
        console.error('Failed to send email:', e);
      }
      return res.status(200).json({ message: 'Profile updated. OTP sent to verify new email.', email_changed: true, new_emali });
    } else {
      await User.update({
        username: username || user.username,
        moblie_no: moblie_no || user.moblie_no,
        address: address || user.address,
        pincode: pincode || user.pincode
      }, { where: { user_id: id } });
      return res.status(200).json({ message: 'Profile updated successfully!', email_changed: false });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/users/:id/verify-email', async (req, res) => {
  try {
    const { id } = req.params;
    const { new_emali, otp_code } = req.body;

    const user = await User.findOne({ where: { user_id: id, otp_code, otp_expiry: { [require('sequelize').Op.gte]: new Date() } } });
    if (!user) return res.status(400).json({ message: 'Invalid or expired OTP.' });

    await User.update({ emali: new_emali, otp_code: null, otp_expiry: null }, { where: { user_id: id } });
    res.status(200).json({ message: 'Email updated successfully!' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// API endpoint to get all published blog posts
app.get('/api/blogs', async (req, res) => {
  try {
    const blogs = await Blog.findAll({
      where: { status: 'published' },
      order: [['created_at', 'DESC']]
    });
    res.json(blogs);
  } catch (error) {
    console.error('Error fetching blogs:', error);
    res.status(500).json({ error: error.message });
  }
});

// API endpoint to get a specific blog post by slug
app.get('/api/blogs/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const blog = await Blog.findOne({
      where: { slug: slug, status: 'published' }
    });

    if (!blog) {
      return res.status(404).json({ message: 'Blog post not found' });
    }

    res.json(blog);
  } catch (error) {
    console.error('Error fetching blog:', error);
    res.status(500).json({ error: error.message });
  }
});

// API endpoint to create a new blog post (admin)
app.post('/api/blogs', blogUpload.single('banner_image'), async (req, res) => {
  try {
    const { title, slug, content, author, status } = req.body;

    if (!title || !slug || !content) {
      return res.status(400).json({ message: 'Title, slug, and content are required!' });
    }

    // Check if slug already exists
    const existingBlog = await Blog.findOne({ where: { slug } });
    if (existingBlog) {
      return res.status(409).json({ message: 'Blog with this slug already exists!' });
    }

    const banner_image = req.file ? ('http://localhost:5000/uploads/blog/' + req.file.filename) : null;

    const blog = await Blog.create({
      title,
      slug,
      content,
      banner_image,
      author: author || 'Dharti Oil Team',
      status: status || 'published'
    });

    console.log(` [BLOG CREATED] "${title}" created by admin`);

    res.status(201).json({
      message: 'Blog post created successfully!',
      blog: blog
    });
  } catch (error) {
    console.error('Error creating blog:', error);
    res.status(500).json({ error: error.message });
  }
});

// API endpoint to update a blog post (admin)
app.put('/api/blogs/:id', blogUpload.single('banner_image'), async (req, res) => {
  try {
    const { id } = req.params;
    const { title, slug, content, author, status, existing_image } = req.body;

    const blog = await Blog.findByPk(id);
    if (!blog) {
      return res.status(404).json({ message: 'Blog post not found' });
    }

    // Check if new slug conflicts with existing blogs (excluding current one)
    if (slug && slug !== blog.slug) {
      const existingBlog = await Blog.findOne({
        where: { slug, id: { [require('sequelize').Op.ne]: id } }
      });
      if (existingBlog) {
        return res.status(409).json({ message: 'Blog with this slug already exists!' });
      }
    }

    const banner_image = req.file ? ('http://localhost:5000/uploads/blog/' + req.file.filename) : (existing_image || blog.banner_image);

    await Blog.update({
      title: title || blog.title,
      slug: slug || blog.slug,
      content: content || blog.content,
      banner_image,
      author: author || blog.author,
      status: status || blog.status
    }, {
      where: { id: id }
    });

    console.log(` [BLOG UPDATED] "${title || blog.title}" updated by admin`);

    res.status(200).json({
      message: 'Blog post updated successfully!'
    });
  } catch (error) {
    console.error('Error updating blog:', error);
    res.status(500).json({ error: error.message });
  }
});

// API endpoint to delete a blog post (admin)
app.delete('/api/blogs/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const blog = await Blog.findByPk(id);
    if (!blog) {
      return res.status(404).json({ message: 'Blog post not found' });
    }

    // Delete banner image file if exists
    if (blog.banner_image) {
      const filename = blog.banner_image.split('/').pop();
      const filepath = path.join(__dirname, 'uploads', 'blog', filename);
      if (fs.existsSync(filepath)) {
        fs.unlinkSync(filepath);
      }
    }

    await Blog.destroy({ where: { id: id } });

    console.log(` [BLOG DELETED] "${blog.title}" deleted by admin`);

    res.status(200).json({
      message: 'Blog post deleted successfully!'
    });
  } catch (error) {
    console.error('Error deleting blog:', error);
    res.status(500).json({ error: error.message });
  }
});

// API endpoint to get all blog posts for admin (including drafts)
app.get('/api/admin/blogs', async (req, res) => {
  try {
    const blogs = await Blog.findAll({
      order: [['created_at', 'DESC']]
    });
    res.json(blogs);
  } catch (error) {
    console.error('Error fetching admin blogs:', error);
    res.status(500).json({ error: error.message });
  }
});

// API endpoint to fetch contact details
app.get('/api/contact-details', async (req, res) => {
  try {
    const contact = await ContactDetails.findOne();
    if (contact) {
      res.json(contact.toJSON());
    } else {
      res.status(404).json({ message: 'Contact details not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// API endpoint to update contact details (admin)
app.post('/api/contact-details/update', contactUpload.single('banner_image'), async (req, res) => {
  try {
    const { address, email, mobile, facebook_link, instagram_link, youtube_link, existing_image } = req.body;

    const banner_image = req.file ? ('http://localhost:5000/uploads/contact/' + req.file.filename) : (existing_image || null);

    const existingContact = await ContactDetails.findOne();
    if (existingContact) {
      // Clean up old image if a new one was uploaded
      if (req.file && existingContact.banner_image && existingContact.banner_image.includes('/uploads/')) {
        const oldFilename = existingContact.banner_image.split('/').pop();
        const oldFilepath = path.join(__dirname, 'uploads', 'contact', oldFilename);
        if (fs.existsSync(oldFilepath)) fs.unlinkSync(oldFilepath);
      }

      await ContactDetails.update({
        address, email, mobile, facebook_link, instagram_link, youtube_link, banner_image
      }, {
        where: { id: existingContact.id }
      });
      res.json({ message: 'Contact details updated successfully' });
    } else {
      await ContactDetails.create({
        address, email, mobile, facebook_link, instagram_link, youtube_link, banner_image
      });
      res.status(201).json({ message: 'Contact details created successfully' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// API endpoint to submit a contact inquiry
app.post('/api/contact-inquiry', async (req, res) => {
  try {
    const { first_name, last_name, phone, email, message, user_id } = req.body;

    if (!first_name || !last_name || !phone || !email || !user_id) {
      return res.status(400).json({ message: 'All required fields must be provided' });
    }

    const inquiry = await ContactInquiry.create({
      first_name, last_name, phone, email, message, user_id
    });

    res.status(201).json({ message: 'Inquiry submitted successfully', inquiry_id: inquiry.id });
  } catch (error) {
    console.error('Error submitting inquiry:', error);
    res.status(500).json({ error: error.message });
  }
});

// API endpoint to fetch all contact inquiries (admin)
app.get('/api/admin/contact-inquiries', async (req, res) => {
  try {
    const inquiries = await ContactInquiry.findAll({
      order: [['created_at', 'DESC']],
      include: [{ model: User, as: 'user', attributes: ['user_id', 'username'] }]
    });
    res.json(inquiries);
  } catch (error) {
    console.error('Error fetching inquiries:', error);
    res.status(500).json({ error: error.message });
  }
});

// User Profile Update Endpoint
app.put('/api/users/profile', async (req, res) => {
  try {
    const { user_id, username, emali, moblie_no, address, pincode, otp_code } = req.body;

    if (!user_id) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    const user = await User.findByPk(user_id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // If OTP code provided, finalize email verification + update profile
    if (otp_code) {
      if (!user.otp_code || user.otp_code !== otp_code || user.otp_expiry < new Date()) {
        return res.status(400).json({ message: 'Invalid or expired OTP.' });
      }

      await User.update({
        username: username || user.username,
        emali: emali || user.emali,
        moblie_no: moblie_no || user.moblie_no,
        address: address || user.address,
        pincode: pincode || user.pincode,
        otp_code: null,
        otp_expiry: null
      }, { where: { user_id } });

      const updatedUser = await User.findByPk(user_id);
      return res.status(200).json({
        message: 'Email verified and profile updated successfully!',
        email_changed: true,
        user: {
          user_id: updatedUser.user_id,
          username: updatedUser.username,
          emali: updatedUser.emali,
          moblie_no: updatedUser.moblie_no,
          address: updatedUser.address,
          pincode: updatedUser.pincode,
          role: updatedUser.role
        }
      });
    }

    // Check if email is changing
    const emailHasChanged = emali && emali !== user.emali;

    if (emailHasChanged) {
      // Generate OTP for email change
      const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
      console.log(`\n[OTP GENERATED] Code for email change ${emali}: ${generatedOtp}\n`);

      await User.update({
        username: username || user.username,
        moblie_no: moblie_no || user.moblie_no,
        address: address || user.address,
        pincode: pincode || user.pincode,
        otp_code: generatedOtp,
        otp_expiry: new Date(Date.now() + 10 * 60 * 1000)
      }, { where: { user_id } });

      // Send OTP email
      try {
        if (transporter) {
          await transporter.sendMail({
            from: `"Dharti Oil App" <${process.env.EMAIL_USER}>`,
            to: emali,
            subject: 'Verify Your New Email - Dharti Oil',
            html: `<p>Your verification code is: <strong>${generatedOtp}</strong></p><p>This code will expire in 10 minutes.</p>`
          });
        }
      } catch (emailError) {
        console.error('⚠️ Failed to send OTP:', emailError.message);
      }

      return res.status(200).json({
        message: 'Profile updated. OTP sent to verify new email.',
        email_changed: true,
        new_email: emali
      });
    } else {
      // No email change, just update profile
      await User.update({
        username: username || user.username,
        moblie_no: moblie_no || user.moblie_no,
        address: address || user.address,
        pincode: pincode || user.pincode
      }, { where: { user_id } });

      const updatedUser = await User.findByPk(user_id);
      return res.status(200).json({
        message: 'Profile updated successfully!',
        email_changed: false,
        user: {
          user_id: updatedUser.user_id,
          username: updatedUser.username,
          emali: updatedUser.emali,
          moblie_no: updatedUser.moblie_no,
          address: updatedUser.address,
          pincode: updatedUser.pincode,
          role: updatedUser.role
        }
      });
    }
  } catch (error) {
    console.error(' Error updating profile:', error);
    res.status(500).json({ error: error.message });
  }
});

// User Password Change Endpoint
app.put('/api/users/:id/change-password', async (req, res) => {
  try {
    const { id } = req.params;
    const { current_password, new_password } = req.body;

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const passwordMatch = await bcrypt.compare(current_password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: 'Incorrect current password' });
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(new_password, saltRounds);

    await User.update({ password: hashedPassword }, { where: { user_id: id } });

    res.status(200).json({ message: 'Password updated successfully!' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Forgot Password - Send OTP
app.post('/api/forgot-password/send-otp', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });

    const user = await User.findOne({ where: { emali: email.toLowerCase(), role: 'user' } });
    if (!user) {
      return res.status(404).json({ message: 'User not found or not eligible for this feature.' });
    }

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    console.log(`\n[FORGOT PASSWORD OTP] Code for ${email}: ${otpCode}\n`);

    await User.update({
      otp_code: otpCode,
      otp_expiry: new Date(Date.now() + 10 * 60 * 1000)
    }, { where: { user_id: user.user_id } });

    try {
      if (transporter) {
        await transporter.sendMail({
          from: `"Dharti Oil App" <${process.env.EMAIL_USER}>`,
          to: email,
          subject: 'Password Reset Verification - Dharti Oil',
          html: `<p>Your password reset verification code is: <strong>${otpCode}</strong></p><p>This code will expire in 10 minutes.</p>`
        });
      }
    } catch (e) {
      console.error('Failed to send reset OTP email:', e);
    }

    res.status(200).json({ message: 'OTP sent successfully to your email.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Forgot Password - Reset Password
app.post('/api/forgot-password/reset', async (req, res) => {
  try {
    const { email, otp_code, new_password } = req.body;
    if (!email || !otp_code || !new_password) {
      return res.status(400).json({ message: 'Email, OTP, and new password are required' });
    }

    const user = await User.findOne({
      where: {
        emali: email.toLowerCase(),
        role: 'user',
        otp_code,
        otp_expiry: { [require('sequelize').Op.gte]: new Date() }
      }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired OTP.' });
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(new_password, saltRounds);

    await User.update({
      password: hashedPassword,
      otp_code: null,
      otp_expiry: null
    }, { where: { user_id: user.user_id } });

    res.status(200).json({ message: 'Password reset successfully!' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// User OTP Verification for Email Change (Send OTP)
app.post('/api/users/send-otp', async (req, res) => {
  try {
    const { email, user_id } = req.body;

    if (!email || !user_id) {
      return res.status(400).json({ message: 'Email and user ID are required' });
    }

    const user = await User.findByPk(user_id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    console.log(`\n[OTP GENERATED] Code for ${email}: ${otpCode}\n`);

    await User.update({
      otp_code: otpCode,
      otp_expiry: new Date(Date.now() + 10 * 60 * 1000)
    }, { where: { user_id } });

    try {
      if (transporter) {
        await transporter.sendMail({
          from: `"Dharti Oil App" <${process.env.EMAIL_USER}>`,
          to: email,
          subject: 'Verify Your New Email - Dharti Oil',
          html: `<p>Your verification code is: <strong>${otpCode}</strong></p><p>This code will expire in 10 minutes.</p>`
        });
      }
    } catch (emailError) {
      console.error('⚠️ Failed to send OTP:', emailError.message);
    }

    res.status(200).json({ message: 'OTP sent successfully', email });
  } catch (error) {
    console.error(' Error sending OTP:', error);
    res.status(500).json({ error: error.message });
  }
});

// User OTP Verification for Email Change (Verify OTP)
app.post('/api/users/verify-otp', async (req, res) => {
  try {
    const { email, otp_code, user_id } = req.body;

    if (!email || !otp_code || !user_id) {
      return res.status(400).json({ message: 'Email, OTP, and user ID are required' });
    }

    const user = await User.findOne({
      where: {
        user_id,
        otp_code,
        otp_expiry: { [require('sequelize').Op.gte]: new Date() }
      }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    // Update email and clear OTP
    await User.update({
      emali: email,
      otp_code: null,
      otp_expiry: null
    }, { where: { user_id } });

    console.log(` [OTP VERIFIED] User ${user_id} email changed to ${email}`);

    res.status(200).json({ message: 'Email verified and updated successfully!' });
  } catch (error) {
    console.error(' Error verifying OTP:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get all selling requests with user and broker details (for admin)
app.get('/api/admin/selling-requests-full', async (req, res) => {
  try {
    const requests = await SellingRequest.findAll({
      include: [
        { model: User, as: 'user' },
        { model: User, as: 'broker' }
      ],
      order: [['created_at', 'DESC']]
    });
    res.json(requests);
  } catch (error) {
    console.error('Error fetching selling requests:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get brokers by pincode
app.get('/api/brokers/by-pincode/:pincode', async (req, res) => {
  try {
    const { pincode } = req.params;
    const brokers = await User.findAll({
      where: {
        pincode,
        role: 'broker',
        status: 'Active',
        otp_code: null
      },
      attributes: ['user_id', 'username', 'emali', 'moblie_no', 'address', 'pincode', 'commission_percent', 'status']
    });
    res.json(brokers);
  } catch (error) {
    console.error('Error fetching brokers:', error);
    res.status(500).json({ error: error.message });
  }
});

// Admin endpoints for User Management
app.get('/api/admin/users', async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password'] },
      order: [['user_id', 'DESC']]
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/admin/users/:id/role', async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!['user', 'broker', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role provided' });
    }

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await User.update({ role }, { where: { user_id: id } });
    res.json({ message: `User role successfully updated to ${role}` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ====== DELIVERY CHARGE API ======
app.get('/api/delivery-charge', async (req, res) => {
  try {
    let charges = await DeliveryCharge.findOne();
    if (!charges) {
      charges = await DeliveryCharge.create({});
    }
    res.json(charges);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/admin/delivery-charge', async (req, res) => {
  try {
    const { charge_360001, charge_360002, charge_360003, charge_360004, upi_id } = req.body;
    let charges = await DeliveryCharge.findOne();
    if (charges) {
      await DeliveryCharge.update({
        charge_360001: charge_360001 || 0,
        charge_360002: charge_360002 || 0,
        charge_360003: charge_360003 || 0,
        charge_360004: charge_360004 || 0,
        upi_id: upi_id || ''
      }, { where: { id: charges.id } });
    } else {
      await DeliveryCharge.create({
        charge_360001: charge_360001 || 0,
        charge_360002: charge_360002 || 0,
        charge_360003: charge_360003 || 0,
        charge_360004: charge_360004 || 0,
        upi_id: upi_id || ''
      });
    }
    const updated = await DeliveryCharge.findOne();
    res.json({ message: 'Delivery properties updated successfully!', charges: updated });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ====== ORDERS API ======
// Place a new order
app.post('/api/orders', async (req, res) => {
  try {
    const { user_id, items, total_amount, shipping_address, contact_number, payment_method, delivery_charge, cgst, sgst } = req.body;

    if (!user_id || !items || items.length === 0 || !total_amount) {
      return res.status(400).json({ message: 'Missing required order details' });
    }

    const order = await Order.create({
      user_id,
      total_amount,
      shipping_address: shipping_address || '',
      contact_number: contact_number || '',
      payment_method: payment_method || 'COD',
      delivery_charge: delivery_charge || 0,
      cgst: cgst || 0,
      sgst: sgst || 0
    });

    const orderItemsData = items.map(item => ({
      order_id: order.order_id,
      product_id: item.product_id,
      quantity: item.quantity,
      price_at_purchase: item.product_price
    }));

    await OrderItem.bulkCreate(orderItemsData);

    res.status(201).json({ message: 'Order placed successfully!', order_id: order.order_id });
  } catch (error) {
    console.error('Error placing order:', error);
    res.status(500).json({ error: error.message });
  }
});

// Admin get all orders
app.get('/api/admin/orders', async (req, res) => {
  try {
    const orders = await Order.findAll({
      include: [
        { model: User, as: 'user', attributes: { exclude: ['password'] } },
        {
          model: OrderItem,
          as: 'items',
          include: [{ model: Product, as: 'product' }]
        }
      ],
      order: [['createdAt', 'DESC']]
    });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin update order status
app.put('/api/admin/orders/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    await Order.update({ status }, { where: { order_id: id } });
    res.json({ message: `Order status updated to ${status}` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// User get their orders
app.get('/api/users/:id/orders', async (req, res) => {
  try {
    const orders = await Order.findAll({
      where: { user_id: req.params.id },
      include: [
        {
          model: OrderItem,
          as: 'items',
          include: [{ model: Product, as: 'product' }]
        }
      ],
      order: [['createdAt', 'DESC']]
    });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ========================================
// ABOUT US API ROUTES
// ========================================

// Setup multer for about us images
const aboutUsStorage = multer.diskStorage({
  destination: function (req, file, cb) { cb(null, 'uploads/about/'); },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, `about_${file.fieldname}_${Date.now()}${ext}`);
  }
});
const aboutUsUpload = multer({ storage: aboutUsStorage });

const aboutUsFields = [
  { name: 'about_banner_image', maxCount: 1 },
  { name: 'about_intro_image', maxCount: 1 },
  { name: 'infra_image_1', maxCount: 1 },
  { name: 'infra_image_2', maxCount: 1 },
  { name: 'infra_image_3', maxCount: 1 },
  { name: 'infra_image_4', maxCount: 1 },
  { name: 'infra_image_5', maxCount: 1 },
  { name: 'infra_image_6', maxCount: 1 }
];

// GET about us data
app.get('/api/about-us', async (req, res) => {
  try {
    let aboutUs = await AboutUs.findOne();
    if (!aboutUs) {
      aboutUs = await AboutUs.create({
        company_intro: '',
        infra_title: 'Infrastructure',
        infra_description: '',
        mgmt_title: 'Management Behind Dharti Amrut',
        faq_data: '[]'
      });
    }
    const raw = aboutUs.toJSON();
    // parse faq_data if it's a string
    if (typeof raw.faq_data === 'string') {
      try { raw.faq_data = JSON.parse(raw.faq_data); } catch { raw.faq_data = []; }
    }
    res.json(raw);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST update about us (banner + infra images)
app.post('/api/about-us/update', aboutUsUpload.fields(aboutUsFields), async (req, res) => {
  try {
    let aboutUs = await AboutUs.findOne();
    let oldData = aboutUs ? aboutUs.toJSON() : null;

    const buildUrl = (fieldName) => {
      if (req.files && req.files[fieldName]) {
        if (oldData && oldData[fieldName] && typeof oldData[fieldName] === 'string' && oldData[fieldName].includes('/uploads/')) {
          const oldFilename = oldData[fieldName].split('/').pop();
          const oldFilepath = path.join(__dirname, 'uploads', 'about', oldFilename);
          if (fs.existsSync(oldFilepath)) fs.unlinkSync(oldFilepath);
        }
        return 'http://localhost:5000/uploads/about/' + req.files[fieldName][0].filename;
      }
      return req.body[fieldName] || null;
    };

    const data = {
      company_intro: req.body.company_intro || '',
      about_banner_image: buildUrl('about_banner_image'),
      about_intro_image: buildUrl('about_intro_image'),
      infra_title: req.body.infra_title || 'Infrastructure',
      infra_description: req.body.infra_description || '',
      infra_image_1: buildUrl('infra_image_1'),
      infra_image_2: buildUrl('infra_image_2'),
      infra_image_3: buildUrl('infra_image_3'),
      infra_image_4: buildUrl('infra_image_4'),
      infra_image_5: buildUrl('infra_image_5'),
      infra_image_6: buildUrl('infra_image_6'),
      mgmt_title: req.body.mgmt_title || 'Management Behind Dharti Amrut',
      faq_data: req.body.faq_data || '[]'
    };

    if (aboutUs) {
      await AboutUs.update(data, { where: { id: aboutUs.id } });
      res.json({ message: 'About Us updated successfully' });
    } else {
      await AboutUs.create(data);
      res.json({ message: 'About Us created successfully' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE a specific infra image
app.post('/api/about-us/delete-image', async (req, res) => {
  try {
    const { field } = req.body;
    const allowed = ['about_banner_image', 'about_intro_image', 'infra_image_1', 'infra_image_2', 'infra_image_3', 'infra_image_4', 'infra_image_5', 'infra_image_6'];
    if (!allowed.includes(field)) return res.status(400).json({ message: 'Invalid field' });
    const aboutUsDoc = await AboutUs.findOne();
    if (!aboutUsDoc) return res.status(404).json({ message: 'Not found' });
    const aboutUs = aboutUsDoc.toJSON();
    if (aboutUs[field] && typeof aboutUs[field] === 'string' && aboutUs[field].includes('/uploads/')) {
      const filename = aboutUs[field].split('/').pop();
      const filepath = path.join(__dirname, 'uploads', 'about', filename);
      if (fs.existsSync(filepath)) fs.unlinkSync(filepath);
    }
    await AboutUs.update({ [field]: null }, { where: { id: aboutUsDoc.id } });
    res.json({ message: 'Image deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET management members
app.get('/api/about-us/members', async (req, res) => {
  try {
    const members = await AboutUsMember.findAll({ order: [['sort_order', 'ASC'], ['id', 'ASC']] });
    res.json(members);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST add management member
app.post('/api/about-us/members', aboutUsUpload.single('member_image'), async (req, res) => {
  try {
    const { name, designation, bio, sort_order } = req.body;
    if (!name || !designation) return res.status(400).json({ message: 'Name and designation are required' });
    const member_image = req.file ? 'http://localhost:5000/uploads/about/' + req.file.filename : null;
    const member = await AboutUsMember.create({
      name,
      designation,
      bio: bio || '',
      member_image,
      sort_order: sort_order ? parseInt(sort_order) : 0
    });
    res.status(201).json({ message: 'Member added', member });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT update management member
app.put('/api/about-us/members/:id', aboutUsUpload.single('member_image'), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, designation, bio, sort_order, existing_image } = req.body;
    let member_image = existing_image || null;
    if (req.file) {
      const memberDoc = await AboutUsMember.findByPk(id);
      const member = memberDoc ? memberDoc.toJSON() : null;
      if (member && member.member_image && typeof member.member_image === 'string' && member.member_image.includes('/uploads/')) {
        const oldFilename = member.member_image.split('/').pop();
        const oldFilepath = path.join(__dirname, 'uploads', 'about', oldFilename);
        if (fs.existsSync(oldFilepath)) fs.unlinkSync(oldFilepath);
      }
      member_image = 'http://localhost:5000/uploads/about/' + req.file.filename;
    }
    await AboutUsMember.update(
      { name, designation, bio: bio || '', member_image, sort_order: sort_order ? parseInt(sort_order) : 0 },
      { where: { id } }
    );
    res.json({ message: 'Member updated' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE management member
app.delete('/api/about-us/members/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const memberDoc = await AboutUsMember.findByPk(id);
    const member = memberDoc ? memberDoc.toJSON() : null;
    if (member && member.member_image && typeof member.member_image === 'string' && member.member_image.includes('/uploads/')) {
      const filename = member.member_image.split('/').pop();
      const filepath = path.join(__dirname, 'uploads', 'about', filename);
      if (fs.existsSync(filepath)) fs.unlinkSync(filepath);
    }
    await AboutUsMember.destroy({ where: { id } });
    res.json({ message: 'Member deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Catch-all route to test if server is alive
app.get('/', (req, res) => {
  res.send('Dharti Oil Backend API is running!');
});

const PORT = process.env.PORT || 5000;
console.log(`Using PORT: ${PORT}`);
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
