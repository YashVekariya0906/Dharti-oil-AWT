import React, { useState, useEffect } from 'react';
import { confirmAction } from '../utils/confirmAlert';
import './AddProduct.css';

export default function AddProduct() {
  const [products, setProducts] = useState([]);
  const [formData, setFormData] = useState({
    product_name: '',
    product_quantity: '',
    product_description: '',
    product_price: '',
    product_discount: ''
  });
  const [imageFile, setImageFile] = useState(null);
  const [existingImage, setExistingImage] = useState(null);
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [editId, setEditId] = useState(null);
  
  const fetchProducts = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/products');
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
      }
    } catch (error) {
      console.error("Failed to fetch products:", error);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

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
      const formDataToSend = new FormData();
      Object.entries(formData).forEach(([k, v]) => formDataToSend.append(k, v));
      if (imageFile) {
        formDataToSend.append('product_image', imageFile);
      }
      if (editId && existingImage && !imageFile) {
        formDataToSend.append('existing_image', existingImage);
      }

      const url = editId ? `http://localhost:5000/api/products/${editId}` : 'http://localhost:5000/api/products';
      const method = editId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        body: formDataToSend
      });
      
      if (response.ok) {
        setMessage(editId ? 'Product updated successfully!' : 'Product added successfully!');
        resetForm();
        fetchProducts();
      } else {
        const errorData = await response.json();
        setMessage(errorData.message || errorData.error || 'Failed to save product');
      }
    } catch (err) {
      setMessage('Error connecting to server.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (prod) => {
    setEditId(prod.product_id);
    setFormData({
      product_name: prod.product_name || '',
      product_quantity: prod.product_quantity || 0,
      product_description: prod.product_description || '',
      product_price: prod.product_price || 0,
      product_discount: prod.product_discount || 0
    });
    setExistingImage(prod.product_image);
    setImageFile(null);
    setMessage('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    const isConfirmed = await confirmAction("Are you sure you want to delete this product?");
    if (!isConfirmed) return;
    try {
      const res = await fetch(`http://localhost:5000/api/products/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchProducts();
        if (editId === id) resetForm();
      } else {
        alert("Failed to delete product.");
      }
    } catch (error) {
      alert("Error connecting to server.");
    }
  };

  const resetForm = () => {
    setEditId(null);
    setFormData({
      product_name: '', product_quantity: '', product_description: '', product_price: '', product_discount: ''
    });
    setExistingImage(null);
    setImageFile(null);
  };

  return (
    <div className="add-product-container">
      <div className="add-product-form-wrapper">
        <h2>{editId ? 'Edit Product' : 'Add New Product'}</h2>
        <p style={{color:'#666', marginBottom:'20px'}}>{editId ? 'Update existing item in your store inventory.' : 'Publish a new item directly to the store inventory.'}</p>
        
        {message && <div className={`message ${message.includes('success') ? 'success' : 'error'}`}>{message}</div>}
        
        <form onSubmit={handleSubmit} className="add-product-form">
          <div className="form-group">
            <label>Product Image (File)</label>
            <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files[0])} required={!editId && !existingImage} />
            {editId && existingImage && !imageFile && (
              <p style={{fontSize: '12px', color: '#666', marginTop: '5px'}}>Current image will be kept unless you upload a new one.</p>
            )}
          </div>

          <div className="form-group">
            <label>Product Name</label>
            <input type="text" name="product_name" value={formData.product_name} onChange={handleChange} required />
          </div>
          
          <div className="form-group row">
            <div className="form-half">
              <label>Current Price (₹)</label>
              <input type="number" name="product_price" value={formData.product_price} onChange={handleChange} onKeyDown={handleKeyDown} min="0" required />
            </div>
            <div className="form-half">
              <label>Before Price (MRP) (₹)</label>
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
          
          <div style={{ display: 'flex', gap: '10px' }}>
            <button type="submit" className="submit-btn" disabled={submitting}>
              {submitting ? 'Saving...' : (editId ? 'Update Product' : 'Save Product')}
            </button>
            {editId && (
              <button type="button" className="submit-btn" style={{background: '#999'}} onClick={resetForm}>
                Cancel Edit
              </button>
            )}
          </div>
        </form>

        <hr style={{margin: '40px 0', border: 'none', borderTop: '1px solid #ddd'}} />
        
        <h2>Manage Existing Products</h2>
        <div className="manage-products-list">
          {products.length > 0 ? (
            <table className="products-table" style={{width: '100%', borderCollapse: 'collapse'}}>
              <thead>
                <tr style={{background: '#f1f1f1', textAlign: 'left'}}>
                  <th style={{padding: '10px'}}>Image</th>
                  <th style={{padding: '10px'}}>Name</th>
                  <th style={{padding: '10px'}}>Current ₹</th>
                  <th style={{padding: '10px'}}>MRP ₹</th>
                  <th style={{padding: '10px'}}>Stock</th>
                  <th style={{padding: '10px'}}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map(p => (
                  <tr key={p.product_id} style={{borderBottom: '1px solid #ddd'}}>
                    <td style={{padding: '10px'}}>
                      {p.product_image ? <img src={p.product_image} alt={p.product_name} style={{width:'40px', height:'40px', objectFit:'cover', borderRadius:'4px'}} /> : 'N/A'}
                    </td>
                    <td style={{padding: '10px'}}>{p.product_name}</td>
                    <td style={{padding: '10px', color: '#e74c3c'}}>{p.product_price}</td>
                    <td style={{padding: '10px', textDecoration: 'line-through'}}>{p.product_discount > 0 ? p.product_discount : '-'}</td>
                    <td style={{padding: '10px'}}>{p.product_quantity}</td>
                    <td style={{padding: '10px'}}>
                      <button onClick={() => handleEdit(p)} style={{marginRight: '10px', background: '#3498db', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer'}}>Edit</button>
                      <button onClick={() => handleDelete(p.product_id)} style={{background: '#e74c3c', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer'}}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No products available.</p>
          )}
        </div>
      </div>
    </div>
  );
}
