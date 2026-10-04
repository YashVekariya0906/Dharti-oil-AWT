import React, { useState, useEffect } from 'react';
import { confirmAction } from '../utils/confirmAlert';
import './UpdateNavbar.css';

export default function UpdateNavbar() {
  const [viewMode, setViewMode] = useState('list');
  const [formData, setFormData] = useState({
    nav_logo_path: '', I1_path: '', I2_path: '', I3_path: '', I4_path: '', I5_path: '', intro_path: ''
  });
  const [fileInputs, setFileInputs] = useState({});
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);

  const fetchData = () => {
    fetch(import.meta.env.VITE_API_URL + '/api/navbar')
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if(data) setFormData(data);
      })
      .catch(console.error);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleFileChange = (e, field) => {
    if(e.target.files[0]) {
      setFileInputs(prev => ({ ...prev, [field]: e.target.files[0] }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const formDataToSend = new FormData();
      Object.entries(formData).forEach(([key, val]) => {
        if(val) formDataToSend.append(key, val);
      });
      Object.entries(fileInputs).forEach(([key, file]) => {
        if(file) formDataToSend.set(key, file); 
      });

      const res = await fetch(import.meta.env.VITE_API_URL + '/api/navbar/update', {
        method: 'POST',
        body: formDataToSend
      });
      if(res.ok) {
        setMessage("Navbar & Slides successfully updated!");
        setFileInputs({});
        fetchData();
        setViewMode('list');
      } else {
        setMessage("Failed to update Navbar.");
      }
    } catch(err) {
      setMessage("Error uploading data.");
    }
    setSubmitting(false);
  };

  const handleCheckbox = (field) => {
    setSelectedItems(prev => prev.includes(field) ? prev.filter(f => f !== field) : [...prev, field]);
  };

  const handleDelete = async () => {
    const isConfirmed = await confirmAction("Are you sure you want to delete these selected images? This action cannot be undone.");
    if (!isConfirmed) return;

    if(selectedItems.length === 0) return;
    try {
      const res = await fetch(import.meta.env.VITE_API_URL + '/api/navbar/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fields: selectedItems })
      });
      if(res.ok) {
        setMessage("Selected images permanently deleted!");
        setSelectedItems([]);
        fetchData();
      } else {
        setMessage("Failed to delete images.");
      }
    } catch(err) {
      setMessage("Error deleting data.");
    }
  };

  const fieldsConfig = [
    { key: 'nav_logo_path', label: 'Logo Image' },
    { key: 'I1_path', label: 'Slideshow Image 1' },
    { key: 'I2_path', label: 'Slideshow Image 2' },
    { key: 'I3_path', label: 'Slideshow Image 3' },
    { key: 'I4_path', label: 'Slideshow Image 4' },
    { key: 'I5_path', label: 'Slideshow Image 5' },
    { key: 'intro_path', label: 'Intro Image' }
  ];

  if (viewMode === 'list') {
    return (
      <div className="updatenav-container list-view">
        <h2>Active Store Images</h2>
        <p style={{color:'#666'}}>Manage the logo and slideshow files currently active on your storefront.</p>
        
        {message && <div className={`updatenav-msg ${message.includes('success') ? 'success' : 'error'}`}>{message}</div>}
        
        <div className="action-row">
          <button className="primary-btn" onClick={() => {setMessage(''); setViewMode('form')}}>+ Add/Update Images</button>
          <button className="danger-btn" onClick={handleDelete} disabled={selectedItems.length === 0}>
            Delete Selected ({selectedItems.length})
          </button>
        </div>

        <div className="image-grid">
           {fieldsConfig.map(f => (
             <div key={f.key} className={`image-card ${selectedItems.includes(f.key) ? 'selected' : ''}`}>
               <input 
                 type="checkbox" 
                 checked={selectedItems.includes(f.key)} 
                 onChange={() => handleCheckbox(f.key)} 
                 disabled={!formData[f.key]}
                 className="select-box"
               />
               <div className="img-preview">
                 {formData[f.key] ? (
                   <img src={formData[f.key]} alt={f.label} />
                 ) : (
                   <div className="img-placeholder">No Image</div>
                 )}
               </div>
               <div className="img-info">
                  <h4>{f.label}</h4>
                  <span className={`status-badge ${formData[f.key] ? 'active' : 'empty'}`}>
                    {formData[f.key] ? 'Active' : 'Empty'}
                  </span>
               </div>
             </div>
           ))}
        </div>
      </div>
    );
  }

  return (
    <div className="updatenav-container">
      <h2>Upload New Images</h2>
      <p style={{color:'#666'}}>Select files to push to your public storefront display.</p>
      {message && <div className={`updatenav-msg ${message.includes('success') ? 'success' : 'error'}`}>{message}</div>}
      
      <form onSubmit={handleSubmit} className="updatenav-form">
        <label>Logo Image (Left side of Navbar)</label>
        <div className="form-group flex-row">
          <input type="file" accept="image/*" onChange={e => handleFileChange(e, 'nav_logo_path')} />
          {formData.nav_logo_path && <span className="existing-tag">Currently Active</span>}
        </div>

        <label>Slideshow Image 1</label>
        <div className="form-group flex-row">
          <input type="file" accept="image/*" onChange={e => handleFileChange(e, 'I1_path')} />
          {formData.I1_path && <span className="existing-tag">Currently Active</span>}
        </div>

        <label>Slideshow Image 2</label>
        <div className="form-group flex-row">
          <input type="file" accept="image/*" onChange={e => handleFileChange(e, 'I2_path')} />
          {formData.I2_path && <span className="existing-tag">Currently Active</span>}
        </div>

        <label>Slideshow Image 3</label>
        <div className="form-group flex-row">
          <input type="file" accept="image/*" onChange={e => handleFileChange(e, 'I3_path')} />
          {formData.I3_path && <span className="existing-tag">Currently Active</span>}
        </div>

        <label>Slideshow Image 4</label>
        <div className="form-group flex-row">
          <input type="file" accept="image/*" onChange={e => handleFileChange(e, 'I4_path')} />
          {formData.I4_path && <span className="existing-tag">Currently Active</span>}
        </div>

        <label>Slideshow Image 5</label>
        <div className="form-group flex-row">
          <input type="file" accept="image/*" onChange={e => handleFileChange(e, 'I5_path')} />
          {formData.I5_path && <span className="existing-tag">Currently Active</span>}
        </div>

        <label>Intro Image (Under our products)</label>
        <div className="form-group flex-row">
          <input type="file" accept="image/*" onChange={e => handleFileChange(e, 'intro_path')} />
          {formData.intro_path && <span className="existing-tag">Currently Active</span>}
        </div>

        <div className="action-row" style={{marginTop: '20px'}}>
          <button type="button" className="cancel-btn" onClick={() => {setMessage(''); setViewMode('list')}}>Cancel</button>
          <button type="submit" className="save-btn" disabled={submitting}>
            {submitting ? 'Uploading Data...' : 'Submit All Profiles'}
          </button>
        </div>
      </form>
    </div>
  );
}
