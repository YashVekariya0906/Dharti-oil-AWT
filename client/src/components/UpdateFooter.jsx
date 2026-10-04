import React, { useState, useEffect } from 'react';
import './UpdateFooter.css';

export default function UpdateFooter() {
  const [formData, setFormData] = useState({
    company_name: '', address: '', phone: '', email: '',
    facebook_link: '', instagram_link: '',
    home_link: '', shop_link: '', about_link: '', contact_link: '', blog_link: '',
    privacy_policy_link: '', return_exchange_link: '',
    working_days: '', working_hours: ''
  });
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch(import.meta.env.VITE_API_URL + '/api/footer')
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data) {
          // Fill missing with empty string
          const safeData = {};
          Object.keys(formData).forEach(k => {
            safeData[k] = data[k] || '';
          });
          setFormData(safeData);
        }
      })
      .catch(console.error);
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch(import.meta.env.VITE_API_URL + '/api/footer/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setMessage("Footer successfully updated!");
      } else {
        setMessage("Failed to update Footer.");
      }
    } catch (err) {
      setMessage("Error updating data.");
    }
    setSubmitting(false);
  };

  return (
    <div className="updatefooter-container">
      <h2>Footer Settings</h2>
      <p style={{ color: '#666' }}>Manage footer links and information.</p>
      
      {message && <div className={`updatefooter-msg ${message.includes('success') ? 'success' : 'error'}`}>{message}</div>}
      
      <form onSubmit={handleSubmit} className="updatefooter-form">
        
        <h3>Company Info</h3>
        <div className="form-group">
          <label>Company Name</label>
          <input type="text" name="company_name" value={formData.company_name} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label>Address</label>
          <textarea name="address" value={formData.address} onChange={handleChange} rows="3" />
        </div>
        <div className="form-group">
          <label>Phone Number</label>
          <input type="text" name="phone" value={formData.phone} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label>Email</label>
          <input type="email" name="email" value={formData.email} onChange={handleChange} />
        </div>
        
        <hr/>
        <h3>Social Media Links</h3>
        <div className="form-group">
          <label>Facebook Link</label>
          <input type="text" name="facebook_link" value={formData.facebook_link} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label>Instagram Link</label>
          <input type="text" name="instagram_link" value={formData.instagram_link} onChange={handleChange} />
        </div>

        <hr/>
        <h3>Navigation Links</h3>
        <div className="form-group">
          <label>Home Link</label>
          <input type="text" name="home_link" value={formData.home_link} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label>Shop Link</label>
          <input type="text" name="shop_link" value={formData.shop_link} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label>About Us Link</label>
          <input type="text" name="about_link" value={formData.about_link} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label>Contact Us Link</label>
          <input type="text" name="contact_link" value={formData.contact_link} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label>Blog Link</label>
          <input type="text" name="blog_link" value={formData.blog_link} onChange={handleChange} />
        </div>

        <hr/>
        <h3>Policies & Info Links</h3>
        <div className="form-group">
          <label>Privacy Policy Link</label>
          <input type="text" name="privacy_policy_link" value={formData.privacy_policy_link} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label>Return and Exchange Link</label>
          <input type="text" name="return_exchange_link" value={formData.return_exchange_link} onChange={handleChange} />
        </div>

        <hr/>
        <h3>Timing</h3>
        <div className="form-group">
          <label>Working Days</label>
          <input type="text" name="working_days" value={formData.working_days} onChange={handleChange} placeholder="e.g. Monday - Sunday" />
        </div>
        <div className="form-group">
          <label>Working Hours</label>
          <input type="text" name="working_hours" value={formData.working_hours} onChange={handleChange} placeholder="e.g. 9:00AM - 8:00PM" />
        </div>

        <div className="action-row" style={{ marginTop: '20px' }}>
          <button type="submit" className="save-btn" disabled={submitting}>
            {submitting ? 'Saving...' : 'Save Footer Settings'}
          </button>
        </div>
      </form>
    </div>
  );
}
