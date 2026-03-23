const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { SiteConfig, Navbar, Product, User, FooterSettings, ShopDetails, Blog, ContactDetails, ContactInquiry, syncDatabase } = require('./models');
require('dotenv').config({ path: path.join(__dirname, '.env') });

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
  { name: 'I5_path', maxCount: 1 },
  { name: 'intro_path', maxCount: 1 }
];

const productStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
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
    cb(null, 'uploads/');
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
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, `contact_banner_${Date.now()}${ext}`);
  }
});
const contactUpload = multer({ storage: contactStorage });

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
  console.log('✅ Real Gmail transporter configured for production use');
} else {
  // console.error('❌ ERROR: Real Gmail credentials not configured in .env file!');
  // console.error('Please set EMAIL_USER and EMAIL_PASS in your .env file');
  console.log('⚠️ Email functionality disabled - using test mode');
  // Email functionality will be disabled
}

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Initialize database and sync tables
(async () => {
  await syncDatabase();
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

    const product_image = req.file ? ('http://localhost:5000/uploads/' + req.file.filename) : null;

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

    const product_image = req.file ? ('http://localhost:5000/uploads/' + req.file.filename) : (existing_image || null);

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
             const filepath = path.join(__dirname, 'uploads', filename);
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
             const filepath = path.join(__dirname, 'uploads', filename);
             if (fs.existsSync(filepath)) fs.unlinkSync(filepath);
          }
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
    const { username, moblie_no, emali, address, pincode, password, role } = req.body;

    // Validate required fields
    if (!username || !moblie_no || !emali || !address || !pincode || !password) {
      return res.status(400).json({ message: 'All fields are required!' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      where: {
        [require('sequelize').Op.or]: [
          { emali: emali },
          { moblie_no: moblie_no }
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

      console.log(`✅ [EMAIL SENT] OTP sent successfully to ${emali}`);

    } catch (emailError) {
      console.error('❌ [EMAIL FAILED] Could not send OTP to:', emali, emailError.message);
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

      console.log(`✅ [OTP RESENT] New OTP sent to ${emali}`);

      res.status(200).json({
        message: 'New verification code sent to your email.',
        email: emali
      });

    } catch (emailError) {
      console.error('❌ [EMAIL FAILED] Could not resend OTP to:', emali, emailError.message);
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

    console.log(`✅ [OTP VERIFIED] User ${emali} successfully verified`);

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
    const { emali, password } = req.body;

    if (!emali || !password) {
      return res.status(400).json({ message: 'Email and password are required!' });
    }

    // Check if user exists
    const user = await User.findOne({
      where: { emali: emali }
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

    // Verify password
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ message: 'Incorrect password.' });
    }

    const userResponse = {
      user_id: user.user_id,
      username: user.username,
      emali: user.emali,
      role: user.role
    };

    console.log(`✅ [LOGIN SUCCESS] User ${emali} logged in successfully`);

    res.status(200).json({
      message: 'Login successful!',
      user: userResponse
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed. Please try again.' });
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

    const banner_image = req.file ? ('http://localhost:5000/uploads/' + req.file.filename) : null;

    const blog = await Blog.create({
      title,
      slug,
      content,
      banner_image,
      author: author || 'Dharti Oil Team',
      status: status || 'published'
    });

    console.log(`✅ [BLOG CREATED] "${title}" created by admin`);

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

    const banner_image = req.file ? ('http://localhost:5000/uploads/' + req.file.filename) : (existing_image || blog.banner_image);

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

    console.log(`✅ [BLOG UPDATED] "${title || blog.title}" updated by admin`);

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
      const filepath = path.join(__dirname, 'uploads', filename);
      if (fs.existsSync(filepath)) {
        fs.unlinkSync(filepath);
      }
    }

    await Blog.destroy({ where: { id: id } });

    console.log(`✅ [BLOG DELETED] "${blog.title}" deleted by admin`);

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
    
    const banner_image = req.file ? ('http://localhost:5000/uploads/' + req.file.filename) : (existing_image || null);
    
    const existingContact = await ContactDetails.findOne();
    if (existingContact) {
      // Clean up old image if a new one was uploaded
      if (req.file && existingContact.banner_image && existingContact.banner_image.includes('/uploads/')) {
        const oldFilename = existingContact.banner_image.split('/').pop();
        const oldFilepath = path.join(__dirname, 'uploads', oldFilename);
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
      order: [['created_at', 'DESC']]
    });
    res.json(inquiries);
  } catch (error) {
    console.error('Error fetching inquiries:', error);
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
