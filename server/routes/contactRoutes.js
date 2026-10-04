const express = require('express');
const router = express.Router();
const { getContactDetails, updateContactDetails, submitContactInquiry, getAdminContactInquiries } = require('../controllers/contactController');
const { contactUpload } = require('../config/multer');

// GET /api/contact-details
router.get('/contact-details', getContactDetails);

// POST /api/contact-details/update
router.post('/contact-details/update', contactUpload.single('banner_image'), updateContactDetails);

// POST /api/contact-inquiry
router.post('/contact-inquiry', submitContactInquiry);

// GET /api/admin/contact-inquiries
router.get('/admin/contact-inquiries', getAdminContactInquiries);

module.exports = router;
