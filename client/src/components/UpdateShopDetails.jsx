import React, { useState, useEffect } from 'react';
import './UpdateShopDetails.css';

export default function UpdateShopDetails() {
  const [formData, setFormData] = useState({
    main_title: '', main_description: '', product_highlights: '',
    tin15_title: '', tin15_description: '',
    can15_title: '', can15_description: '',
    can5_title: '', can5_description: '',
    bottle1_title: '', bottle1_description: '',
    quality_description: '', usage_description: '', why_choose: ''
  });
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch(import.meta.env.VITE_API_URL + '/api/shop-details')
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data) {
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
      const res = await fetch(import.meta.env.VITE_API_URL + '/api/shop-details/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setMessage("Shop Info successfully updated!");
      } else {
        setMessage("Failed to update.");
      }
    } catch (err) {
      setMessage("Error updating data.");
    }
    setSubmitting(false);
  };

  return (
    <div className="updateshop-container">
      <h2>Shop Information Settings</h2>
      <p>Manage the descriptive information users see when clicking a product's Info button.</p>
      
      {message && (
        <div className={`updateshop-msg ${message.includes('successfully') ? 'success' : 'error'}`}>
          {message}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="updateshop-form">
        <h3>Main Description</h3>
        <label>Main Title</label>
        <input type="text" name="main_title" value={formData.main_title} onChange={handleChange} />
        
        <label>Main Description</label>
        <textarea name="main_description" value={formData.main_description} onChange={handleChange} rows="3" />
        
        <label>Product Highlights (Features)</label>
        <textarea name="product_highlights" value={formData.product_highlights} onChange={handleChange} rows="2" />

        <hr style={{margin: '20px 0', border: 'none', borderTop: '1px solid #eee'}} />
        
        <h3>15 Kg Tin Info</h3>
        <label>Title</label>
        <input type="text" name="tin15_title" value={formData.tin15_title} onChange={handleChange} />
        <label>Description</label>
        <textarea name="tin15_description" value={formData.tin15_description} onChange={handleChange} rows="2" />

        <h3>15 Kg Can Info</h3>
        <label>Title</label>
        <input type="text" name="can15_title" value={formData.can15_title} onChange={handleChange} />
        <label>Description</label>
        <textarea name="can15_description" value={formData.can15_description} onChange={handleChange} rows="2" />

        <h3>5 Kg Can Info</h3>
        <label>Title</label>
        <input type="text" name="can5_title" value={formData.can5_title} onChange={handleChange} />
        <label>Description</label>
        <textarea name="can5_description" value={formData.can5_description} onChange={handleChange} rows="2" />

        <h3>1 Kg Bottle Info</h3>
        <label>Title</label>
        <input type="text" name="bottle1_title" value={formData.bottle1_title} onChange={handleChange} />
        <label>Description</label>
        <textarea name="bottle1_description" value={formData.bottle1_description} onChange={handleChange} rows="2" />

        <hr style={{margin: '20px 0', border: 'none', borderTop: '1px solid #eee'}} />

        <h3>Extra Information</h3>
        <label>Quality Standards Description</label>
        <textarea name="quality_description" value={formData.quality_description} onChange={handleChange} rows="2" />
        <label>Usage (How to use)</label>
        <textarea name="usage_description" value={formData.usage_description} onChange={handleChange} rows="2" />
        <label>Why Choose Us?</label>
        <textarea name="why_choose" value={formData.why_choose} onChange={handleChange} rows="2" />

        <button type="submit" disabled={submitting} className="updateshop-submit-btn">
          {submitting ? 'Saving...' : 'Save Shop Information'}
        </button>
      </form>
    </div>
  );
}
