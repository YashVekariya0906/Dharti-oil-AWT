import React, { useState } from 'react';
import './AddProduct.css';

export default function AddProduct() {
  const [formData, setFormData] = useState({
    product_name: '',
    product_quantity: '',
    product_description: '',
    product_price: '',
    product_discount: ''
  });
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleKeyDown = (e) => {
    if (['e', 'E', '+', '-'].includes(e.key)) {
      e.preventDefault();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage('');
    
    try {
      const response = await fetch('http://localhost:5000/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (response.ok) {
        setMessage('Product added successfully!');
        setFormData({
          product_name: '', product_quantity: '', product_description: '', product_price: '', product_discount: ''
        });
      } else {
        const errorData = await response.json();
        setMessage(errorData.message || errorData.error || 'Failed to add product');
      }
    } catch (err) {
      setMessage('Error connecting to server.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="add-product-container">
      <div className="add-product-form-wrapper">
        <h2>Add New Product</h2>
        <p style={{color:'#666', marginBottom:'20px'}}>Publish a new item directly to the store inventory.</p>
        
        {message && <div className={`message ${message.includes('successfully') ? 'success' : 'error'}`}>{message}</div>}
        
        <form onSubmit={handleSubmit} className="add-product-form">
          <div className="form-group">
            <label>Product Name</label>
            <input type="text" name="product_name" value={formData.product_name} onChange={handleChange} required />
          </div>
          
          <div className="form-group row">
            <div className="form-half">
              <label>Price (₹)</label>
              <input type="number" name="product_price" value={formData.product_price} onChange={handleChange} onKeyDown={handleKeyDown} min="0" required />
            </div>
            <div className="form-half">
              <label>Discount Amount (₹)</label>
              <input type="number" name="product_discount" value={formData.product_discount} onChange={handleChange} onKeyDown={handleKeyDown} min="0" />
            </div>
          </div>

          <div className="form-group">
            <label>Quantity in Stock</label>
            <input type="number" name="product_quantity" value={formData.product_quantity} onChange={handleChange} onKeyDown={handleKeyDown} min="0" required />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea name="product_description" value={formData.product_description} onChange={handleChange} required rows={5}></textarea>
          </div>
          
          <button type="submit" className="submit-btn" disabled={submitting}>
            {submitting ? 'Adding Product...' : 'Save Product'}
          </button>
        </form>
      </div>
    </div>
  );
}
