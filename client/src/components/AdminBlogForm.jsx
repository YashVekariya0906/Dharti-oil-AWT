import React, { useState, useEffect } from 'react';
import { confirmAction } from '../utils/confirmAlert';
import './AdminBlogForm.css';

const AdminBlogForm = () => {
  const [blogs, setBlogs] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    content: '',
    banner_image: null,
    author: 'Dharti Oil Team',
    status: 'draft'
  });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [previewImage, setPreviewImage] = useState(null);

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      const response = await fetch(import.meta.env.VITE_API_URL + '/api/admin/blogs');
      if (response.ok) {
        const data = await response.json();
        setBlogs(data);
      }
    } catch (error) {
      console.error('Error fetching blogs:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Auto-generate slug from title
    if (name === 'title') {
      const slug = value
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
      setFormData(prev => ({
        ...prev,
        slug: slug
      }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        banner_image: file
      }));

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewImage(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('slug', formData.slug);
      formDataToSend.append('content', formData.content);
      formDataToSend.append('author', formData.author);
      formDataToSend.append('status', formData.status);

      if (formData.banner_image) {
        formDataToSend.append('banner_image', formData.banner_image);
      }

      const url = editingId
        ? import.meta.env.VITE_API_URL + `/api/blogs/${editingId}`
        : import.meta.env.VITE_API_URL + '/api/blogs';

      const method = editingId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method: method,
        body: formDataToSend
      });

      if (response.ok) {
        const result = await response.json();
        setMessage(editingId ? 'Blog updated successfully!' : 'Blog created successfully!');
        resetForm();
        fetchBlogs();
      } else {
        const error = await response.json();
        setMessage(error.message || 'Error saving blog');
      }
    } catch (error) {
      console.error('Error saving blog:', error);
      setMessage('Error saving blog');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (blog) => {
    setFormData({
      title: blog.title,
      slug: blog.slug,
      content: blog.content,
      banner_image: null,
      author: blog.author,
      status: blog.status
    });
    setEditingId(blog.id);
    setPreviewImage(blog.banner_image ? import.meta.env.VITE_API_URL + `${blog.banner_image}` : null);
    setMessage('');
  };

  const handleDelete = async (id) => {
    const isConfirmed = await confirmAction('Are you sure you want to delete this blog post?');
    if (!isConfirmed) {
      return;
    }

    try {
      const response = await fetch(import.meta.env.VITE_API_URL + `/api/blogs/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setMessage('Blog deleted successfully!');
        fetchBlogs();
      } else {
        setMessage('Error deleting blog');
      }
    } catch (error) {
      console.error('Error deleting blog:', error);
      setMessage('Error deleting blog');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      slug: '',
      content: '',
      banner_image: null,
      author: 'Dharti Oil Team',
      status: 'draft'
    });
    setEditingId(null);
    setPreviewImage(null);
  };

  return (
    <div className="admin-blog-form">
      <h2>{editingId ? 'Edit Blog Post' : 'Create New Blog Post'}</h2>

      {message && (
        <div className={`message ${message.includes('Error') ? 'error' : 'success'}`}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="blog-form">
        <div className="form-group">
          <label htmlFor="title">Title *</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            required
            placeholder="Enter blog title"
          />
        </div>

        <div className="form-group">
          <label htmlFor="slug">Slug *</label>
          <input
            type="text"
            id="slug"
            name="slug"
            value={formData.slug}
            onChange={handleInputChange}
            required
            placeholder="url-friendly-slug"
          />
        </div>

        <div className="form-group">
          <label htmlFor="author">Author</label>
          <input
            type="text"
            id="author"
            name="author"
            value={formData.author}
            onChange={handleInputChange}
            placeholder="Author name"
          />
        </div>

        <div className="form-group">
          <label htmlFor="status">Status</label>
          <select
            id="status"
            name="status"
            value={formData.status}
            onChange={handleInputChange}
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="banner_image">Banner Image</label>
          <input
            type="file"
            id="banner_image"
            name="banner_image"
            onChange={handleImageChange}
            accept="image/*"
          />
          {previewImage && (
            <div className="image-preview">
              <img src={previewImage} alt="Banner preview" />
            </div>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="content">Content *</label>
          <textarea
            id="content"
            name="content"
            value={formData.content}
            onChange={handleInputChange}
            required
            rows="15"
            placeholder="Write your blog content here..."
          />
        </div>

        <div className="form-actions">
          <button type="submit" disabled={loading} className="submit-btn">
            {loading ? 'Saving...' : (editingId ? 'Update Blog' : 'Create Blog')}
          </button>
          {editingId && (
            <button type="button" onClick={resetForm} className="cancel-btn">
              Cancel Edit
            </button>
          )}
        </div>
      </form>

      <div className="blog-list-section">
        <h3>Existing Blog Posts</h3>
        <div className="blog-list">
          {blogs.map(blog => (
            <div key={blog.id} className="blog-item">
              <div className="blog-info">
                <h4>{blog.title}</h4>
                <p>Status: <span className={`status ${blog.status}`}>{blog.status}</span></p>
                <p>Author: {blog.author}</p>
                <p>Created: {new Date(blog.createdAt).toLocaleDateString()}</p>
              </div>
              <div className="blog-actions">
                <button onClick={() => handleEdit(blog)} className="edit-btn">Edit</button>
                <button onClick={() => handleDelete(blog.id)} className="delete-btn">Delete</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminBlogForm;