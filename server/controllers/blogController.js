const { Blog } = require('../models');
const { Op } = require('sequelize');
const path = require('path');
const fs = require('fs');

// GET all published blogs (public)
const getAllBlogs = async (req, res) => {
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
};

// GET blog by slug (public)
const getBlogBySlug = async (req, res) => {
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
};

// POST create blog (admin)
const createBlog = async (req, res) => {
  try {
    const { title, slug, content, author, status } = req.body;

    if (!title || !slug || !content) {
      return res.status(400).json({ message: 'Title, slug, and content are required!' });
    }

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

    res.status(201).json({ message: 'Blog post created successfully!', blog: blog });
  } catch (error) {
    console.error('Error creating blog:', error);
    res.status(500).json({ error: error.message });
  }
};

// PUT update blog (admin)
const updateBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, slug, content, author, status, existing_image } = req.body;

    const blog = await Blog.findByPk(id);
    if (!blog) {
      return res.status(404).json({ message: 'Blog post not found' });
    }

    if (slug && slug !== blog.slug) {
      const existingBlog = await Blog.findOne({
        where: { slug, id: { [Op.ne]: id } }
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

    res.status(200).json({ message: 'Blog post updated successfully!' });
  } catch (error) {
    console.error('Error updating blog:', error);
    res.status(500).json({ error: error.message });
  }
};

// DELETE blog (admin)
const deleteBlog = async (req, res) => {
  try {
    const { id } = req.params;

    const blog = await Blog.findByPk(id);
    if (!blog) {
      return res.status(404).json({ message: 'Blog post not found' });
    }

    if (blog.banner_image) {
      const filename = blog.banner_image.split('/').pop();
      const filepath = path.join(__dirname, '..', 'uploads', 'blog', filename);
      if (fs.existsSync(filepath)) {
        fs.unlinkSync(filepath);
      }
    }

    await Blog.destroy({ where: { id: id } });

    console.log(` [BLOG DELETED] "${blog.title}" deleted by admin`);

    res.status(200).json({ message: 'Blog post deleted successfully!' });
  } catch (error) {
    console.error('Error deleting blog:', error);
    res.status(500).json({ error: error.message });
  }
};

// GET all blogs including drafts (admin)
const getAdminBlogs = async (req, res) => {
  try {
    const blogs = await Blog.findAll({
      order: [['created_at', 'DESC']]
    });
    res.json(blogs);
  } catch (error) {
    console.error('Error fetching admin blogs:', error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getAllBlogs, getBlogBySlug, createBlog, updateBlog, deleteBlog, getAdminBlogs };
