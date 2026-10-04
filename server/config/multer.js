const multer = require('multer');
const path = require('path');

// Navbar upload
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

// Product upload
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

// Blog banner image upload
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

// About us upload
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

// Broker reject photo upload
const brokerRejectStorage = multer.diskStorage({
  destination: function (req, file, cb) { cb(null, 'uploads/broker/'); },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, `broker_reject_photo_${Date.now()}_${Math.floor(Math.random() * 1000)}${ext}`);
  }
});
const brokerRejectUpload = multer({ storage: brokerRejectStorage });

module.exports = {
  upload,
  navbarFields,
  productUpload,
  blogUpload,
  contactUpload,
  reportUpload,
  aboutUsUpload,
  aboutUsFields,
  brokerRejectUpload
};
