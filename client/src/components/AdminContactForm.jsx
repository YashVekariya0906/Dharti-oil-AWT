import React, { useState, useEffect } from 'react';

export default function AdminContactForm() {
  const [formData, setFormData] = useState({
    address: '',
    email: '',
    mobile: '',
    facebook_link: '',
    instagram_link: '',
    youtube_link: '',
    banner_image: null,
    existing_image: ''
  });
  
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    fetch(import.meta.env.VITE_API_URL + '/api/contact-details')
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data) {
          setFormData({
            address: data.address || '',
            email: data.email || '',
            mobile: data.mobile || '',
            facebook_link: data.facebook_link || '',
            instagram_link: data.instagram_link || '',
            youtube_link: data.youtube_link || '',
            banner_image: null,
            existing_image: data.banner_image || ''
          });
          if (data.banner_image) {
            setImagePreview(data.banner_image.startsWith('http') ? data.banner_image : import.meta.env.VITE_API_URL + `${data.banner_image}`);
          }
        }
      })
      .catch(console.error);
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFormData({ ...formData, banner_image: file });
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    const submitData = new FormData();
    Object.keys(formData).forEach(key => {
      if (formData[key] !== null) submitData.append(key, formData[key]);
    });

    try {
      const res = await fetch(import.meta.env.VITE_API_URL + '/api/contact-details/update', {
        method: 'POST',
        body: submitData
      });
      if (res.ok) {
        setMessage("Contact Details successfully updated!");
      } else {
        setMessage("Failed to update.");
      }
    } catch (err) {
      setMessage("Error updating data.");
    }
    setSubmitting(false);
  };

  const inputStyle = { width: '100%', padding: '10px', margin: '5px 0 15px', borderRadius: '4px', border: '1px solid #ddd' };

  return (
    <div style={{ background: 'white', padding: '30px', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
      <h2 style={{marginTop:0}}>Manage Contact Page Settings</h2>
      <p style={{ color: '#666', marginBottom: '20px' }}>Update the contact details and top banner image for the Contact Us page.</p>
      
      {message && <div style={{ padding: '10px', borderRadius: '4px', marginBottom: '20px', background: message.includes('success') ? '#d4edda' : '#f8d7da', color: message.includes('success') ? '#155724' : '#721c24' }}>{message}</div>}
      
      <form onSubmit={handleSubmit}>
        <h3 style={{color: '#4CAF50'}}>Top Banner Image</h3>
        <p style={{fontSize: '14px', color: '#555'}}>Upload a banner image (width 100%, height 300px recommended).</p>
        <input type="file" name="banner_image" accept="image/*" onChange={handleImageChange} style={inputStyle} />
        {imagePreview && (
          <img src={imagePreview} alt="Banner Preview" style={{ width: '100%', maxHeight: '300px', objectFit: 'cover', marginBottom: '20px', borderRadius: '8px', border: '1px solid #ddd' }} />
        )}

        <hr style={{margin: '20px 0', border: 'none', borderTop: '1px solid #eee'}} />
        
        <h3 style={{color: '#4CAF50'}}>Contact Details</h3>
        <label>Address</label>
        <textarea name="address" value={formData.address} onChange={handleChange} style={inputStyle} rows="3" placeholder="B-16, Privilon, Behind ISKCON Temple, Ambli-Bopal Road, Ahmedabad-380059, Gujarat, India." />
        
        <label>Email Address</label>
        <input type="email" name="email" value={formData.email} onChange={handleChange} style={inputStyle} placeholder="info@example.com" />
        
        <label>Mobile Number</label>
        <input type="text" name="mobile" value={formData.mobile} onChange={handleChange} style={inputStyle} placeholder="+91 1234567890" />

        <hr style={{margin: '20px 0', border: 'none', borderTop: '1px solid #eee'}} />

        <h3 style={{color: '#4CAF50'}}>Social Media Links</h3>
        <label>Facebook URL</label>
        <input type="url" name="facebook_link" value={formData.facebook_link} onChange={handleChange} style={inputStyle} placeholder="https://facebook.com/..." />
        
        <label>Instagram URL</label>
        <input type="url" name="instagram_link" value={formData.instagram_link} onChange={handleChange} style={inputStyle} placeholder="https://instagram.com/..." />
        
        <label>YouTube URL</label>
        <input type="url" name="youtube_link" value={formData.youtube_link} onChange={handleChange} style={inputStyle} placeholder="https://youtube.com/..." />

        <button type="submit" disabled={submitting} style={{ background: '#4CAF50', color: 'white', border: 'none', padding: '10px 20px', fontSize: '16px', borderRadius: '4px', cursor: 'pointer', marginTop: '10px' }}>
          {submitting ? 'Saving...' : 'Save Contact Settings'}
        </button>
      </form>
    </div>
  );
}
