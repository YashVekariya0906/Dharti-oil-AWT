import React, { useState, useEffect } from 'react';
import './AdminGlobalPrice.css';

const AdminGlobalPrice = () => {
  const [currentPrice, setCurrentPrice] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchPrice();
  }, []);

  const fetchPrice = async () => {
    try {
      const res = await fetch(import.meta.env.VITE_API_URL + '/api/admin/global-price');
      const data = await res.json();
      setCurrentPrice(data.current_price || 0);
    } catch (error) {
      console.error('Failed to fetch global price:', error);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      // Ensure currentPrice is a number
      const priceValue = parseFloat(currentPrice);
      if (isNaN(priceValue)) {
        setMessage('Error: Please enter a valid price');
        setLoading(false);
        return;
      }

      console.log('📨 Sending API request:', { current_price: priceValue });

      const res = await fetch(import.meta.env.VITE_API_URL + '/api/admin/global-price', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ current_price: priceValue })
      });

      console.log('📥 Response status:', res.status);

      const data = await res.json();
      console.log('📥 Response data:', data);

      if (res.ok) {
        setMessage('Global Price updated successfully!');
        setCurrentPrice(priceValue);
      } else {
        setMessage(`Error: ${data.message || data.error}`);
      }
    } catch (error) {
      console.error('🔴 Error details:', error);
      setMessage(`Failed to update global price: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (['e', 'E', '+', '-'].includes(e.key)) {
      e.preventDefault();
    }
  };

  return (
    <div className="admin-global-price-container fade-in">
      <h2>Manage Global Selling Price (Our Price)</h2>
      {message && <div className={`message ${message.includes('Error') ? 'error' : 'success'}`}>{message}</div>}
      
      <form onSubmit={handleUpdate} className="admin-price-form">
        <div className="form-group slide-up">
          <label>Our Price (₹ per mound):</label>
          <input 
            type="number" 
            step="0.01"
            value={currentPrice} 
            onChange={(e) => setCurrentPrice(e.target.value)} 
            onKeyDown={handleKeyDown}
            min="0"
            required
            className="animated-input"
          />
        </div>
        <button type="submit" disabled={loading} className="save-btn pulse-hover">
          {loading ? 'Saving...' : 'Update Price'}
        </button>
      </form>
    </div>
  );
};

export default AdminGlobalPrice;
