import React, { useState, useEffect } from 'react';
import { confirmAction } from '../utils/confirmAlert';
import './AdminBrokerForm.css';

const AdminBrokerForm = () => {
  const [brokers, setBrokers] = useState([]);
  const [formData, setFormData] = useState({
    username: '', moblie_no: '', address: '', password: '', 
    emali: '', pincode: '', commission_percent: '', status: 'Active'
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [editingBrokerId, setEditingBrokerId] = useState(null);
  const [otpPending, setOtpPending] = useState(false);
  const [otpEmail, setOtpEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpMessage, setOtpMessage] = useState('');

  useEffect(() => {
    fetchBrokers();
  }, []);

  const fetchBrokers = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/admin/brokers');
      const data = await res.json();
      setBrokers(data);
    } catch (error) {
      console.error('Failed to fetch brokers:', error);
    }
  };

  const handleInputChange = (e) => {
    let { name, value } = e.target;
    if (name === 'moblie_no') value = value.replace(/\D/g, '').slice(0, 10);
    else if (name === 'pincode') value = value.replace(/\D/g, '').slice(0, 6);
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    // Validate required fields
    if (!formData.username || !formData.emali || !formData.moblie_no ||
        (editingBrokerId ? false : !formData.password) ||
        !formData.pincode || !formData.address) {
      setMessage('Error: All fields are required (password required for new broker).');
      setLoading(false);
      return;
    }

    try {
      const body = {
        username: formData.username,
        moblie_no: formData.moblie_no,
        address: formData.address,
        emali: formData.emali,
        pincode: formData.pincode,
        commission_percent: parseFloat(formData.commission_percent) || 0,
        status: formData.status
      };
      if (!editingBrokerId || formData.password) {
        body.password = formData.password;
      }

      const url = editingBrokerId
        ? `http://localhost:5000/api/admin/brokers/${editingBrokerId}`
        : 'http://localhost:5000/api/admin/brokers';
      const method = editingBrokerId ? 'PUT' : 'POST';

      console.log('📨 Sending broker data:', body, 'method:', method);

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const data = await res.json();
      console.log('📥 Response:', res.status, data);

      if (res.ok) {
        if (editingBrokerId) {
          setMessage('Broker updated successfully.');
          setEditingBrokerId(null);
        } else {
          setMessage('Broker created successfully! OTP mailed to broker email; verify OTP to activate.');
          setOtpPending(true);
          setOtpEmail(formData.emali);
          setOtpMessage('');
        }

        setFormData({
          username: '', moblie_no: '', address: '', password: '', 
          emali: '', pincode: '', commission_percent: '', status: 'Active'
        });
        fetchBrokers();
      } else {
        setMessage(`Error: ${data.message || data.error || 'Unable to save broker'}`);
      }
    } catch (error) {
      console.error('🔴 Error details:', error);
      setMessage(`Failed to save broker: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleEditBroker = (broker) => {
    setEditingBrokerId(broker.user_id);
    setFormData({
      username: broker.username || '',
      moblie_no: broker.moblie_no || '',
      address: broker.address || '',
      password: '',
      emali: broker.emali || '',
      pincode: broker.pincode || '',
      commission_percent: broker.commission_percent || '',
      status: broker.status || 'Active'
    });
    setMessage('Editing broker. Change details, then Save.');
    setOtpPending(false);
    setOtpMessage('');
  };

  const handleDeleteBroker = async (brokerId) => {
    const isConfirmed = await confirmAction("Are you sure you want to delete this broker account? This action is permanent and cannot be undone.");
    if (!isConfirmed) return;

    try {
      setLoading(true);
      const res = await fetch(`http://localhost:5000/api/admin/brokers/${brokerId}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (res.ok) {
        setMessage('Broker deleted successfully.');
        if (editingBrokerId === brokerId) {
          setEditingBrokerId(null);
          setFormData({
            username: '', moblie_no: '', address: '', password: '',
            emali: '', pincode: '', commission_percent: '', status: 'Active'
          });
        }
        fetchBrokers();
      } else {
        setMessage(`Error deleting broker: ${data.message || data.error}`);
      }
    } catch (error) {
      setMessage('Error deleting broker: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    if (!otpCode || !otpEmail) {
      setOtpMessage('Please enter the OTP code');
      return;
    }

    try {
      setLoading(true);
      const res = await fetch('http://localhost:5000/api/admin/brokers/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emali: otpEmail, otp_code: otpCode })
      });

      let data;
      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        data = await res.json();
      } else {
        const text = await res.text();
        throw new Error(`Unexpected server response (not JSON): ${text}`);
      }

      if (res.ok) {
        setOtpMessage('Broker verified and activated successfully!');
        setOtpPending(false);
        setOtpCode('');
        setMessage('Broker activated successfully and added to list.');
        fetchBrokers();
      } else {
        setOtpMessage(data.message || 'OTP verification failed');
      }
    } catch (error) {
      setOtpMessage('Error verifying OTP: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-broker-container fade-in">
      <h2>Add New Broker</h2>
      {message && <div className={`message ${message.includes('Error') ? 'error' : 'success'}`}>{message}</div>}
      
      <form onSubmit={handleSubmit} className="admin-broker-form">
        <div className="form-grid slide-up">
          <div className="form-group">
            <label>Name</label>
            <input type="text" name="username" value={formData.username} onChange={handleInputChange} required className="animated-input" />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input type="email" name="emali" value={formData.emali} onChange={handleInputChange} required className="animated-input" />
          </div>
          <div className="form-group">
            <label>Mobile Number</label>
            <input type="text" name="moblie_no" value={formData.moblie_no} onChange={handleInputChange} required className="animated-input" minLength="10" maxLength="10" inputMode="numeric" pattern="[0-9]*" />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" name="password" value={formData.password} onChange={handleInputChange} required className="animated-input" />
          </div>
          <div className="form-group">
            <label>Pincode</label>
            <input type="text" name="pincode" value={formData.pincode} onChange={handleInputChange} required className="animated-input" minLength="6" maxLength="6" inputMode="numeric" pattern="[0-9]*" />
          </div>
          <div className="form-group">
            <label>Commission (%)</label>
            <input type="number" step="0.01" name="commission_percent" value={formData.commission_percent} onChange={handleInputChange} required className="animated-input" />
          </div>
          <div className="form-group full-width">
            <label>Address</label>
            <textarea name="address" value={formData.address} onChange={handleInputChange} required className="animated-input" rows="3"></textarea>
          </div>
          <div className="form-group">
            <label>Status</label>
            <select name="status" value={formData.status} onChange={handleInputChange} className="animated-input">
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>
        <div className="form-actions">
          <button type="submit" disabled={loading} className="save-btn pulse-hover">
            {loading ? 'Saving...' : editingBrokerId ? 'Update Broker' : 'Save Broker'}
          </button>
          {editingBrokerId && (
            <button
              type="button"
              onClick={() => {
                setEditingBrokerId(null);
                setFormData({
                  username: '', moblie_no: '', address: '', password: '',
                  emali: '', pincode: '', commission_percent: '', status: 'Active'
                });
                setOtpPending(false);
                setOtpMessage('');
                setMessage('');
              }}
              className="cancel-btn"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      {otpPending && (
        <div className="otp-verify-section">
          <h3>Verify Broker OTP</h3>
          <p>OTP sent to {otpEmail}. Enter it here to activate broker.</p>
          {otpMessage && (
        <div className={`message ${/verified|success/i.test(otpMessage) ? 'success' : 'error'}`}>
          {otpMessage}
        </div>
      )}
          <div className="form-grid" style={{ alignItems: 'flex-end' }}>
            <div className="form-group">
              <label>OTP Code</label>
              <input type="text" value={otpCode} onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))} className="animated-input" maxLength="6" inputMode="numeric" pattern="[0-9]*" />
            </div>
            <div className="form-group" style={{ marginTop: '0' }}>
              <button onClick={verifyOtp} className="save-btn" style={{ width: '100%' }}>Verify OTP</button>
            </div>
          </div>
        </div>
      )}

      <div className="broker-list-section slide-up-delayed">
        <h3>Broker List</h3>
        <div className="table-responsive">
          <table className="broker-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Mobile</th>
                <th>Pincode</th>
                <th>Status</th>
                <th>Commission</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {brokers.length > 0 ? brokers.map(b => (
                <tr key={b.user_id}>
                  <td>{b.username}</td>
                  <td>{b.emali}</td>
                  <td>{b.moblie_no}</td>
                  <td>{b.pincode}</td>
                  <td><span className={`status-badge ${b.status.toLowerCase()}`}>{b.status}</span></td>
                  <td>{b.commission_percent}%</td>
                  <td>
                    <button className="table-action-btn edit" onClick={() => handleEditBroker(b)}>Edit</button>
                    <button className="table-action-btn delete" onClick={() => handleDeleteBroker(b.user_id)}>Delete</button>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan="6" style={{textAlign: 'center'}}>No brokers found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminBrokerForm;
