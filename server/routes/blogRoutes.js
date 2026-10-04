const express = require('express');
const router = express.Router();
const { getAllBlogs, getBlogBySlug, createBlog, updateBlog, deleteBlog, getAdminBlogs } = require('../controllers/blogController');
const { blogUpload } = require('../config/multer');

// GET /api/blogs - all published blogs
router.get('/', getAllBlogs);

// GET /api/admin/blogs - all blogs including drafts
router.get('/admin', getAdminBlogs);

// GET /api/blogs/:slug
router.get('/:slug', getBlogBySlug);

// POST /api/blogs
router.post('/', blogUpload.single('banner_image'), createBlog);

// PUT /api/blogs/:id
router.put('/:id', blogUpload.single('banner_image'), updateBlog);

// DELETE /api/blogs/:id
router.delete('/:id', deleteBlog);

module.exports = router;
