import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';

const AdminDeliveryCharge = () => {
  const [formData, setFormData] = useState({
    charge_360001: 0,
    charge_360002: 0,
    charge_360003: 0,
    charge_360004: 0,
    upi_id: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchDeliveryConfig();
  }, []);

  const fetchDeliveryConfig = async () => {
    try {
      setLoading(true);
      const res = await fetch(import.meta.env.VITE_API_URL + '/api/delivery-charge');
      if (res.ok) {
        const data = await res.json();
        setFormData({
          charge_360001: data.charge_360001 || 0,
          charge_360002: data.charge_360002 || 0,
          charge_360003: data.charge_360003 || 0,
          charge_360004: data.charge_360004 || 0,
          upi_id: data.upi_id || ''
        });
      }
    } catch (error) {
      console.error('Error fetching delivery config:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      const res = await fetch(import.meta.env.VITE_API_URL + '/api/admin/delivery-charge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await res.json();
      if (res.ok) {
        Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: 'Delivery configurations updated successfully.',
          timer: 2000,
          showConfirmButton: false
        });
      } else {
        Swal.fire('Error', data.message || 'Failed to update configuration', 'error');
      }
    } catch (error) {
      console.error('Submit error:', error);
      Swal.fire('Error', 'Network error. Please try again.', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>Loading configuration...</div>;
  }

  return (
    <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}>
      <h2 style={{ marginTop: 0, marginBottom: '20px', color: '#333' }}>Delivery & Payment Configuration</h2>
      <p style={{ color: '#666', marginBottom: '30px' }}>
        Set the exact delivery charge per specific supported pincode. If a user outside these bounds attempts an order, the system will prevent it or you can manage custom handling. Also set your generic UPI Payment address here.
      </p>

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#444' }}>360001 Delivery Charge (₹)</label>
            <input 
              type="number" 
              name="charge_360001"
              value={formData.charge_360001}
              onChange={handleChange}
              style={{ width: '100%', padding: '12px', border: '2px solid #e0e0e0', borderRadius: '8px', boxSizing: 'border-box' }}
              min="0"
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#444' }}>360002 Delivery Charge (₹)</label>
            <input 
              type="number" 
              name="charge_360002"
              value={formData.charge_360002}
              onChange={handleChange}
              style={{ width: '100%', padding: '12px', border: '2px solid #e0e0e0', borderRadius: '8px', boxSizing: 'border-box' }}
              min="0"
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#444' }}>360003 Delivery Charge (₹)</label>
            <input 
              type="number" 
              name="charge_360003"
              value={formData.charge_360003}
              onChange={handleChange}
              style={{ width: '100%', padding: '12px', border: '2px solid #e0e0e0', borderRadius: '8px', boxSizing: 'border-box' }}
              min="0"
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#444' }}>360004 Delivery Charge (₹)</label>
            <input 
              type="number" 
              name="charge_360004"
              value={formData.charge_360004}
              onChange={handleChange}
              style={{ width: '100%', padding: '12px', border: '2px solid #e0e0e0', borderRadius: '8px', boxSizing: 'border-box' }}
              min="0"
            />
          </div>
        </div>

        <div style={{ marginBottom: '30px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#444' }}>UPI ID (For Orders Payment)</label>
          <input 
            type="text" 
            name="upi_id"
            value={formData.upi_id}
            onChange={handleChange}
            placeholder="e.g. yourname@ybl or 9876543210@paytm"
            style={{ width: '100%', padding: '12px', border: '2px solid #e0e0e0', borderRadius: '8px', boxSizing: 'border-box' }}
            required
          />
          <small style={{ display: 'block', marginTop: '6px', color: '#888' }}>
            This URI is automatically fed into dynamic QR codes upon user checkout to collect funds smoothly.
          </small>
        </div>

        <button 
          type="submit" 
          disabled={saving}
          style={{
            padding: '12px 24px',
            backgroundColor: '#4caf50',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: saving ? 'not-allowed' : 'pointer',
            fontSize: '16px',
            fontWeight: '600',
            width: '100%',
            transition: 'background 0.3s'
          }}
        >
          {saving ? 'Saving...' : 'Save Configuration'}
        </button>
      </form>
    </div>
  );
};

export default AdminDeliveryCharge;
