const express = require('express');
const router = express.Router();
const { getNavbar, deleteNavbarImages, updateNavbar } = require('../controllers/navbarController');
const { upload, navbarFields } = require('../config/multer');

// GET /api/navbar
router.get('/', getNavbar);

// POST /api/navbar/delete
router.post('/delete', deleteNavbarImages);

// POST /api/navbar/update
router.post('/update', upload.fields(navbarFields), updateNavbar);

module.exports = router;
