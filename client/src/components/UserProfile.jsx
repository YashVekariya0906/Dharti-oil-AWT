import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FaDownload } from 'react-icons/fa';
import './UserProfile.css';
import { generateReceipt } from '../utils/receiptGenerator';
import { generateTaxInvoice } from '../utils/invoiceGenerator';

const UserProfile = ({ user, logoUrl, onClose, onUpdate }) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('profile');
  const [profileData, setProfileData] = useState(user || {});
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // OTP Modal
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpMessage, setOtpMessage] = useState('');
  const [emailChanged, setEmailChanged] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      if (!user || !user.user_id) {
        setLoadingProfile(false);
        return;
      }

      try {
        const res = await fetch(import.meta.env.VITE_API_URL + `/api/users/${user.user_id}`);
        if (!res.ok) {
          console.error('Failed to fetch user profile', res.status);
          setLoadingProfile(false);
          return;
        }

        const data = await res.json();
        setProfileData(data);
      } catch (err) {
        console.error('Error loading user profile:', err);
      } finally {
        setLoadingProfile(false);
      }
    };

    loadUser();
  }, [user]);

  const handleEditChange = (e) => {
    let { name, value } = e.target;
    if (name === 'moblie_no') {
      value = value.replace(/\D/g, '').slice(0, 10);
    } else if (name === 'pincode') {
      value = value.replace(/\D/g, '').slice(0, 6);
    }
    setProfileData({ ...profileData, [name]: value });
  };

  const handleSaveProfile = async () => {
    setLoading(true);
    setMessage('');

    // Check if email changed
    const emailHasChanged = profileData.emali && user?.emali !== profileData.emali;

    if (emailHasChanged) {
      setEmailChanged(true);
      // Trigger OTP to new email
      try {
        const res = await fetch(import.meta.env.VITE_API_URL + '/api/users/profile', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: user.user_id,
            username: profileData.username,
            emali: profileData.emali,
            moblie_no: profileData.moblie_no,
            address: profileData.address,
            pincode: profileData.pincode
          })
        });

        const result = await res.json();
        if (res.ok && result.email_changed) {
          setMessage('OTP sent to new email. Enter the code to verify.');
          setShowOtpModal(true);
        } else {
          setMessage(result.message || 'Failed to request email verification OTP.');
        }
      } catch (error) {
        setMessage('Failed to send OTP: ' + error.message);
      }
    } else {
      // No email change, update directly
      await updateProfile();
    }

    setLoading(false);
  };

  const updateProfile = async (verifiedOtp = null) => {
    try {
      const res = await fetch(import.meta.env.VITE_API_URL + '/api/users/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.user_id,
          username: profileData.username,
          emali: profileData.emali,
          moblie_no: profileData.moblie_no,
          address: profileData.address,
          pincode: profileData.pincode,
          otp_code: verifiedOtp
        })
      });

      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        data = { message: text };
      }

      if (res.ok) {
        setMessage('Profile updated successfully!');
        setIsEditing(false);
        setEmailChanged(false);

        const updatedUser = data.user ? {
          user_id: data.user.user_id,
          username: data.user.username,
          emali: data.user.emali,
          moblie_no: data.user.moblie_no,
          address: data.user.address,
          pincode: data.user.pincode,
          role: data.user.role || user.role
        } : {
          ...profileData,
          user_id: user.user_id,
          role: user.role
        };

        setProfileData(updatedUser);
        if (onUpdate) onUpdate(updatedUser);
      } else {
        setMessage(data.message || 'Update failed');
      }
    } catch (error) {
      setMessage('Error: ' + error.message);
    }
  };

  const verifyOtp = async () => {
    try {
      const res = await fetch(import.meta.env.VITE_API_URL + '/api/users/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.user_id,
          username: profileData.username,
          emali: profileData.emali,
          moblie_no: profileData.moblie_no,
          address: profileData.address,
          pincode: profileData.pincode,
          otp_code: otpCode
        })
      });

      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        data = { message: text };
      }

      if (res.ok) {
        setMessage(data.message || 'Email verified and profile updated successfully!');
        setIsEditing(false);
        setEmailChanged(false);
        setProfileData(data.user || profileData);
        if (onUpdate && data.user) onUpdate(data.user);
        setShowOtpModal(false);
        setOtpCode('');
      } else {
        setOtpMessage(data.message || 'Verification failed');
      }
    } catch (error) {
      setOtpMessage('Error: ' + error.message);
    }
  };

  return (
    <div className="user-profile-modal-overlay">
      <div className="user-profile-modal slide-up">
        <div className="user-profile-header">
          <h2>👤 {t('nav.profile')}</h2>
          <button onClick={onClose} className="close-btn">✕</button>
        </div>

        <div className="user-profile-tabs">
          <button
            className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            Profile Info
          </button>
          <button
            className={`tab-btn ${activeTab === 'selling' ? 'active' : ''}`}
            onClick={() => setActiveTab('selling')}
          >
            Selling Option
          </button>
          <button
            className={`tab-btn ${activeTab === 'security' ? 'active' : ''}`}
            onClick={() => setActiveTab('security')}
          >
            Security
          </button>
          <button
            className={`tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            My Orders
          </button>
          <button className={`tab-btn ${activeTab === 'oilcake' ? 'active' : ''}`} onClick={() => setActiveTab('oilcake')}>  Oil Cake</button>
        </div>

        <div className="user-profile-content fade-in">
          {loadingProfile ? (
            <div className="loading">Loading profile...</div>
          ) : activeTab === 'profile' ? (
            <div className="profile-tab">
              {message && (
                <div className={`msg ${message.includes('successfully') ? 'success' : 'error'}`}>
                  {message}
                </div>
              )}

              {!isEditing ? (
                <div className="profile-view">
                  <div className="profile-info-row">
                    <span className="label">Name:</span>
                    <span className="value">{profileData.username}</span>
                  </div>
                  <div className="profile-info-row">
                    <span className="label">Email:</span>
                    <span className="value">{profileData.emali}</span>
                  </div>
                  <div className="profile-info-row">
                    <span className="label">Mobile:</span>
                    <span className="value">{profileData.moblie_no}</span>
                  </div>
                  <div className="profile-info-row">
                    <span className="label">Address:</span>
                    <span className="value">{profileData.address}</span>
                  </div>
                  <div className="profile-info-row">
                    <span className="label">Pincode:</span>
                    <span className="value">{profileData.pincode}</span>
                  </div>
                  <button onClick={() => setIsEditing(true)} className="edit-btn">
                    ✏️ Edit Profile
                  </button>
                </div>
              ) : (
                <div className="profile-edit">
                  <div className="form-group">
                    <label>Name</label>
                    <input
                      type="text"
                      name="username"
                      value={profileData.username}
                      onChange={handleEditChange}
                      className="animated-input"
                    />
                  </div>
                  <div className="form-group">
                    <label>Email</label>
                    <input
                      type="email"
                      name="emali"
                      value={profileData.emali}
                      onChange={handleEditChange}
                      className="animated-input"
                    />
                  </div>
                  <div className="form-group">
                    <label>Mobile</label>
                    <input
                      type="text"
                      name="moblie_no"
                      value={profileData.moblie_no}
                      onChange={handleEditChange}
                      className="animated-input"
                      maxLength="10"
                      inputMode="numeric"
                      pattern="[0-9]*"
                    />
                  </div>
                  <div className="form-group">
                    <label>Address</label>
                    <textarea
                      name="address"
                      value={profileData.address}
                      onChange={handleEditChange}
                      className="animated-input"
                      rows="3"
                    />
                  </div>
                  <div className="form-group">
                    <label>Pincode</label>
                    <input
                      type="text"
                      name="pincode"
                      value={profileData.pincode}
                      onChange={handleEditChange}
                      className="animated-input"
                      maxLength="6"
                      inputMode="numeric"
                      pattern="[0-9]*"
                    />
                  </div>
                  <div className="button-group">
                    <button onClick={handleSaveProfile} className="save-btn" disabled={loading}>
                      {loading ? 'Saving...' : '✓ Save Changes'}
                    </button>
                    <button onClick={() => setIsEditing(false)} className="cancel-btn">
                      ✕ Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : null}

          {activeTab === 'selling' && (
            <div className="selling-tab fade-in">
              <div style={{ display: 'flex', gap: '20px', flexDirection: 'column' }}>
                <div style={{ background: '#f8f9fa', padding: '15px', borderRadius: '8px', border: '1px solid #e9ecef' }}>
                  <h3 style={{ marginTop: 0, color: '#2d5a27', fontSize: '18px' }}>Create New Request</h3>
                  <SellingRequestForm user={profileData} onSuccess={() => setActiveTab('profile')} />
                </div>
                <div style={{ background: '#fff', padding: '15px', borderRadius: '8px', border: '1px solid #e9ecef' }}>
                  <h3 style={{ marginTop: 0, color: '#2c3e50', fontSize: '18px' }}>Your Selling Requests</h3>
                  <UserSellingHistory user={profileData} />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="security-tab fade-in">
              <h3>Change Password</h3>
              <ChangePasswordForm user={profileData} onSuccess={() => setActiveTab('profile')} />
            </div>
          )}

          {activeTab === 'orders' && (
            <div className="orders-tab fade-in">
              <h3>Order History</h3>
              <UserOrdersList user={profileData} logoUrl={logoUrl} />
            </div>
          )}
          {activeTab === 'oilcake' && (
            <div className="fade-in">
              <OilCakePurchaseTab user={profileData} />
            </div>
          )}
        </div>

        {showOtpModal && (
          <div className="otp-modal-overlay">
            <div className="otp-modal slide-up">
              <h3>Verify Email</h3>
              <p>An OTP has been sent to <strong>{profileData.emali}</strong></p>
              {otpMessage && <p className="error-text">{otpMessage}</p>}
              <input
                type="text"
                placeholder="Enter 6-digit OTP"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="animated-input"
                maxLength="6"
                inputMode="numeric"
                pattern="[0-9]*"
              />
              <div className="otp-actions">
                <button onClick={verifyOtp} className="verify-btn">Verify OTP</button>
                <button onClick={() => setShowOtpModal(false)} className="cancel-btn">Cancel</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// SellingRequestForm Component
const SellingRequestForm = ({ user, onSuccess }) => {
  const [formData, setFormData] = useState({
    stock_per_mound: '',
    customer_price: '',
    our_price: 0,
    payment_method: 'Cash'
  });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchOurPrice();
  }, []);

  const fetchOurPrice = async () => {
    try {
      const res = await fetch(import.meta.env.VITE_API_URL + '/api/admin/global-price');
      const data = await res.json();
      setFormData(prev => ({ ...prev, our_price: data.current_price || 0 }));
    } catch (error) {
      console.error('Failed to fetch price');
    }
  };

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
    setLoading(true);

    try {
      const res = await fetch(import.meta.env.VITE_API_URL + '/api/users/selling-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.user_id,
          stock_per_mound: parseFloat(formData.stock_per_mound),
          customer_price: parseFloat(formData.customer_price),
          our_price: formData.our_price,
          payment_method: formData.payment_method
        })
      });

      const data = await res.json();
      if (res.ok) {
        setMessage('Request submitted successfully! Awaiting admin approval.');
        setFormData({ stock_per_mound: '', customer_price: '', our_price: formData.our_price, payment_method: 'Cash' });
      } else {
        setMessage(data.message || 'Failed to submit request');
      }
    } catch (error) {
      setMessage('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="selling-form">
      {message && (
        <div className={`msg ${message.includes('success') ? 'success' : 'error'}`}>
          {message}
        </div>
      )}

      <div className="form-row">
        <div className="form-group">
          <label>Stock per Mound</label>
          <input
            type="number"
            step="0.01"
            name="stock_per_mound"
            value={formData.stock_per_mound}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            min="0"
            required
            className="animated-input"
          />
        </div>
        <div className="form-group">
          <label>Our Price (₹)</label>
          <input
            type="text"
            value={formData.our_price}
            disabled
            className="animated-input disabled"
          />
          <small>Set by admin</small>
        </div>
      </div>

      <div className="form-group">
        <label>Your Price (₹)</label>
        <input
          type="number"
          step="0.01"
          name="customer_price"
          value={formData.customer_price}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          min="0"
          required
          className="animated-input"
        />
      </div>

      <div className="form-group">
        <label>Payment Method</label>
        <div style={{ display: 'flex', gap: '20px', marginTop: '10px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 'normal', color: '#555' }}>
            <input
              type="radio"
              name="payment_method"
              value="Cash"
              checked={formData.payment_method === 'Cash'}
              onChange={handleChange}
              style={{ width: '18px', height: '18px', cursor: 'pointer' }}
            />
            Cash
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 'normal', color: '#555' }}>
            <input
              type="radio"
              name="payment_method"
              value="Cheque"
              checked={formData.payment_method === 'Cheque'}
              onChange={handleChange}
              style={{ width: '18px', height: '18px', cursor: 'pointer' }}
            />
            Cheque
          </label>
        </div>
      </div>

      <button type="submit" className="submit-btn" disabled={loading}>
        {loading ? 'Submitting...' : '✓ Submit Selling Request'}
      </button>
    </form>
  );
};

// ChangePasswordForm Component
const ChangePasswordForm = ({ user, onSuccess }) => {
  const [formData, setFormData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const [isForgotMode, setIsForgotMode] = useState(false);
  const [forgotStep, setForgotStep] = useState(1);
  const [forgotData, setForgotData] = useState({ otp: '', newPassword: '', confirmPassword: '' });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleForgotChange = (e) => {
    setForgotData({ ...forgotData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.new_password !== formData.confirm_password) {
      setMessage('New passwords do not match');
      return;
    }
    setLoading(true);
    setMessage('');

    try {
      const res = await fetch(import.meta.env.VITE_API_URL + `/api/users/${user.user_id}/change-password`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          current_password: formData.current_password,
          new_password: formData.new_password
        })
      });

      const data = await res.json();
      if (res.ok) {
        setMessage('Password changed successfully!');
        setFormData({ current_password: '', new_password: '', confirm_password: '' });
      } else {
        setMessage(data.message || 'Failed to change password');
      }
    } catch (error) {
      setMessage('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const startForgotPassword = async () => {
    setIsForgotMode(true);
    setLoading(true);
    setMessage('');
    try {
      const res = await fetch(import.meta.env.VITE_API_URL + '/api/forgot-password/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.emali })
      });
      const data = await res.json();
      if (res.ok) {
        setMessage(data.message);
        setForgotStep(2);
      } else {
        setMessage(data.message || 'Failed to send OTP.');
        setIsForgotMode(false);
      }
    } catch (err) {
      setMessage('Error connecting to server.');
      setIsForgotMode(false);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (forgotData.newPassword !== forgotData.confirmPassword) {
      setMessage('Passwords do not match');
      return;
    }
    setLoading(true);
    setMessage('');
    try {
      const res = await fetch(import.meta.env.VITE_API_URL + '/api/forgot-password/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.emali,
          otp_code: forgotData.otp,
          new_password: forgotData.newPassword
        })
      });
      const data = await res.json();
      if (res.ok) {
        setMessage('Password reset successfully!');
        setTimeout(() => {
          setIsForgotMode(false);
          setForgotStep(1);
          setForgotData({ otp: '', newPassword: '', confirmPassword: '' });
          setMessage('');
        }, 3000);
      } else {
        setMessage(data.message || 'Failed to reset password.');
      }
    } catch (err) {
      setMessage('Error connecting to server.');
    } finally {
      setLoading(false);
    }
  };

  if (isForgotMode && forgotStep === 2) {
    return (
      <form onSubmit={handleResetPassword} className="selling-form">
        <div style={{ marginBottom: '15px' }}>
          <button type="button" onClick={() => { setIsForgotMode(false); setForgotStep(1); setMessage(''); }} style={{ background: 'none', border: 'none', color: '#4CAF50', cursor: 'pointer', padding: 0 }}>← Back to Change Password</button>
        </div>
        {message && (
          <div className={`msg ${message.toLowerCase().includes('success') ? 'success' : 'error'}`}>
            {message}
          </div>
        )}
        <div className="form-group">
          <label>OTP Code (Sent to {user.emali})</label>
          <input type="text" name="otp" value={forgotData.otp} onChange={handleForgotChange} maxLength="6" required className="animated-input" />
        </div>
        <div className="form-group">
          <label>New Password</label>
          <input type="password" name="newPassword" value={forgotData.newPassword} onChange={handleForgotChange} required minLength="6" className="animated-input" />
        </div>
        <div className="form-group">
          <label>Confirm New Password</label>
          <input type="password" name="confirmPassword" value={forgotData.confirmPassword} onChange={handleForgotChange} required minLength="6" className="animated-input" />
        </div>
        <button type="submit" className="submit-btn" disabled={loading}>
          {loading ? 'Resetting...' : '✓ Reset Password'}
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="selling-form">
      {message && (
        <div className={`msg ${message.toLowerCase().includes('success') ? 'success' : 'error'}`}>
          {message}
        </div>
      )}

      <div className="form-group">
        <label>Current Password</label>
        <input
          type="password"
          name="current_password"
          value={formData.current_password}
          onChange={handleChange}
          required
          className="animated-input"
        />
        <div style={{ textAlign: 'right', marginTop: '5px' }}>
          <button
            type="button"
            onClick={startForgotPassword}
            disabled={loading}
            style={{ background: 'none', border: 'none', color: '#4CAF50', cursor: loading ? 'not-allowed' : 'pointer', fontSize: '13px', padding: 0 }}
          >
            {loading && isForgotMode ? 'Sending OTP...' : 'Forgot Password?'}
          </button>
        </div>
      </div>

      <div className="form-group">
        <label>New Password</label>
        <input
          type="password"
          name="new_password"
          value={formData.new_password}
          onChange={handleChange}
          required
          minLength="6"
          className="animated-input"
        />
      </div>

      <div className="form-group">
        <label>Confirm New Password</label>
        <input
          type="password"
          name="confirm_password"
          value={formData.confirm_password}
          onChange={handleChange}
          required
          minLength="6"
          className="animated-input"
        />
      </div>

      <button type="submit" className="submit-btn" disabled={loading}>
        {loading && !isForgotMode ? 'Updating...' : '✓ Change Password'}
      </button>
    </form>
  );
};

// UserOrdersList Component
const UserOrdersList = ({ user, logoUrl }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await fetch(import.meta.env.VITE_API_URL + `/api/users/${user.user_id}/orders`);
      const data = await res.json();
      if (res.ok) setOrders(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading" style={{ textAlign: 'center', padding: '20px' }}>Loading orders...</div>;
  if (!orders || orders.length === 0) return <div style={{ textAlign: 'center', color: '#777', padding: '30px' }}>You haven't placed any orders yet.</div>;

  return (
    <>
      <div className="orders-tab-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
        <h3 style={{ margin: 0 }}>Order History</h3>
        <button 
          onClick={fetchOrders} 
          style={{ 
            padding: '8px 16px', 
            backgroundColor: '#4CAF50', 
            color: 'white', 
            border: 'none', 
            borderRadius: '6px', 
            cursor: 'pointer', 
            fontSize: '0.8rem',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontWeight: 'bold',
            boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
          }}
        >
          <span style={{ 
            backgroundColor: '#2196F3', 
            borderRadius: '4px', 
            width: '22px', 
            height: '22px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            fontSize: '12px'
          }}>🔄</span>
          Refresh
        </button>
      </div>
      <div className="orders-list" style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '10px' }}>
      {orders.map(order => (
        <div key={order.order_id} style={{ border: '1px solid #ececec', padding: '15px', borderRadius: '8px', background: 'white', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #eee', paddingBottom: '10px', marginBottom: '10px' }}>
            <strong style={{ color: '#2c3e50', fontSize: '1.1rem' }}>Order #{order.order_id}</strong>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span style={{
                padding: '4px 10px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold', textTransform: 'uppercase',
                backgroundColor: order.status === 'Pending' ? '#f39c12' : order.status === 'Delivered' ? '#27ae60' : order.status === 'Cancelled' ? '#e74c3c' : '#3498db',
                color: 'white',
                marginRight: '10px'
              }}>
                {order.status}
              </span>
              {order.status === 'Delivered' && (
                <button onClick={async (e) => {
                  e.stopPropagation();
                  try {
                    const res = await fetch(import.meta.env.VITE_API_URL + '/api/invoice-settings');
                    const settings = res.ok ? await res.json() : null;

                    const baseSubTotal = order.items.reduce((acc, i) => acc + (i.price_at_purchase * i.quantity), 0);
                    const isTaxIncluded = !order.cgst; // Fallback if old order
                    
                    const calculatedItems = order.items.map(i => {
                      const totalLineAmt = i.price_at_purchase * i.quantity;
                      const baseItemRate = isTaxIncluded ? (i.price_at_purchase / 1.05) : i.price_at_purchase;
                      return {
                        productName: i.product?.product_name || 'Groundnut Oil',
                        hsn: "1508",
                        qty: i.quantity,
                        rate: baseItemRate,
                        gstPercent: 5.00,
                        amount: baseItemRate * i.quantity
                      };
                    });

                    const subTotal = calculatedItems.reduce((acc, i) => acc + i.amount, 0);
                    const cgst = subTotal * 0.025;
                    const sgst = subTotal * 0.025;
                    const grandTotal = Number(order.total_amount);
                    const roundOff = grandTotal - (subTotal + cgst + sgst);

                    const invoiceData = {
                      type: "TAX INVOICE",
                      invoiceNo: `GT/EC-${order.order_id}`,
                      date: new Date(order.createdAt).toLocaleDateString('en-GB'),
                      customerName: user.username,
                      placeOfSupply: "24-Gujarat",
                      items: calculatedItems,
                      subTotal: subTotal,
                      cgst: cgst,
                      sgst: sgst,
                      roundOff: roundOff,
                      grandTotal: grandTotal
                    };
                    generateTaxInvoice(invoiceData, settings, true);
                  } catch (err) {
                    console.error("Error generating tax invoice", err);
                  }
                }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                    padding: '6px 14px', background: 'transparent',
                    color: '#2c3e50', border: '1px solid #2c3e50',
                    borderRadius: '20px', cursor: 'pointer', fontSize: '0.85rem',
                    fontWeight: 'bold', transition: 'all 0.2s', boxShadow: 'none'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = '#2c3e50'; e.currentTarget.style.color = 'white'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#2c3e50'; }}
                >
                  <FaDownload /> Tax Invoice
                </button>
              )}
            </div>
          </div>
          <div style={{ fontSize: '0.9rem', color: '#555', marginBottom: '15px', display: 'flex', justifyContent: 'space-between' }}>
            <span><strong>Date:</strong> {new Date(order.createdAt).toLocaleDateString()}</span>
            <span><strong>Total:</strong> <span style={{ color: '#e74c3c', fontWeight: 'bold' }}>₹{order.total_amount}</span></span>
          </div>
          <div style={{ backgroundColor: '#f9f9f9', padding: '10px', borderRadius: '6px' }}>
            <strong style={{ display: 'block', marginBottom: '10px', fontSize: '0.85rem', color: '#777', textTransform: 'uppercase' }}>Items ({order.items?.length || 0}):</strong>
            {order.items && order.items.map(item => (
              <div key={item.order_item_id} style={{ display: 'flex', alignItems: 'center', marginBottom: '8px', fontSize: '0.9rem' }}>
                <img src={item.product?.product_image || ''} alt={item.product?.product_name || "Product"} style={{ width: '35px', height: '35px', objectFit: 'cover', borderRadius: '4px', marginRight: '12px', border: '1px solid #eee' }} />
                <div style={{ flex: 1, color: '#333' }}>{item.product?.product_name || "Unknown Product"} <span style={{ color: '#999' }}>x{item.quantity}</span></div>
                <div style={{ fontWeight: '500' }}>₹{item.price_at_purchase * item.quantity}</div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
    </>
  );
};

// UserSellingHistory Component to show request history and rejections
const UserSellingHistory = ({ user }) => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await fetch(import.meta.env.VITE_API_URL + `/api/users/${user.user_id}/selling-requests`);
      const data = await res.json();
      if (res.ok) setRequests(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading" style={{ textAlign: 'center', padding: '10px' }}>Loading history...</div>;
  if (!requests || requests.length === 0) return <div style={{ textAlign: 'center', color: '#777', padding: '10px' }}>No selling requests yet.</div>;

  return (
    <>
      <div className="selling-history-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
        <h3 style={{ margin: 0 }}>Selling History</h3>
        <button 
          onClick={fetchHistory} 
          style={{ 
            padding: '8px 16px', 
            backgroundColor: '#4CAF50', 
            color: 'white', 
            border: 'none', 
            borderRadius: '6px', 
            cursor: 'pointer', 
            fontSize: '0.8rem',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontWeight: 'bold',
            boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
          }}
        >
          <span style={{ 
            backgroundColor: '#2196F3', 
            borderRadius: '4px', 
            width: '22px', 
            height: '22px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            fontSize: '12px'
          }}>🔄</span>
          Refresh
        </button>
      </div>
      <div className="user-selling-history">
      {requests.map(req => (
        <div key={req.request_id} style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '8px', marginBottom: '15px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #eee', paddingBottom: '10px', marginBottom: '10px' }}>
            <strong>Request #{req.request_id}</strong>
            <span style={{
              padding: '4px 10px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold',
              backgroundColor: req.status === 'Pending' ? '#fff3cd' : req.status === 'AdminRejected' || req.status === 'BrokerRejectionConfirmed' ? '#fdecea' : req.status === 'Completed' ? '#d4edda' : '#e3f2fd',
              color: req.status === 'AdminRejected' || req.status === 'BrokerRejectionConfirmed' ? '#c0392b' : req.status === 'Completed' ? '#155724' : '#333'
            }}>
              {req.status === 'AdminRejected' ? 'Rejected' : req.status === 'BrokerRejectionConfirmed' ? 'Rejected by Broker' : req.status}
            </span>
          </div>

          <div style={{ fontSize: '0.9rem', color: '#555' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
              <span><strong>Stock:</strong> {req.stock_per_mound} mound</span>
              <span><strong>Your Price:</strong> ₹{req.customer_price}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
              <span><strong>Our Price:</strong> ₹{req.our_price}</span>
              <span><strong>Date:</strong> {new Date(req.createdAt || req.created_at || Date.now()).toLocaleDateString()}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
              <span><strong>Payment Method:</strong> {req.payment_method || 'Cash'}</span>
            </div>

            {req.visit_day && req.visit_time && (
              <div style={{ background: '#e3f2fd', padding: '10px', marginTop: '10px', borderRadius: '4px', borderLeft: '4px solid #2196F3' }}>
                <strong style={{ color: '#1976D2', display: 'block', marginBottom: '5px' }}>📅 Broker Visit Scheduled</strong>
                <p style={{ margin: 0 }}><strong>Date:</strong> {new Date(req.visit_day).toLocaleDateString()} at <strong>{req.visit_time}</strong></p>
                <p style={{ margin: '5px 0 0 0', fontSize: '0.85rem' }}>Please be available at the scheduled time.</p>
              </div>
            )}
          </div>

          {req.status === 'AdminRejected' && (
            <div style={{ background: '#fdf3f2', borderLeft: '4px solid #e74c3c', padding: '10px', marginTop: '10px', borderRadius: '4px', fontSize: '0.9rem' }}>
              <strong style={{ color: '#c0392b', display: 'block', marginBottom: '5px' }}>🚫 Admin Rejected</strong>
              <p style={{ margin: '0 0 5px 0' }}><strong>Reason:</strong> {req.admin_reject_reason}</p>
              {req.admin_reject_comment && <p style={{ margin: 0 }}><strong>Comment:</strong> {req.admin_reject_comment}</p>}
            </div>
          )}

          {req.status === 'BrokerRejectionConfirmed' && (
            <div style={{ background: '#fdf3f2', borderLeft: '4px solid #e91e63', padding: '10px', marginTop: '10px', borderRadius: '4px', fontSize: '0.9rem' }}>
              <strong style={{ color: '#c0392b', display: 'block', marginBottom: '5px' }}>  Rejected After Visit</strong>
              <p style={{ margin: '0 0 5px 0' }}><strong>Reason:</strong> {req.broker_reject_reason}</p>
              {req.broker_reject_comment && <p style={{ margin: 0 }}><strong>Comment:</strong> {req.broker_reject_comment}</p>}
            </div>
          )}

          {req.is_visited && req.status === 'Completed' && (
            <div style={{ background: '#f9f9f9', borderLeft: '4px solid #4CAF50', padding: '15px', marginTop: '10px', borderRadius: '4px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <strong style={{ color: '#2e7d32' }}>  Request Completed</strong>
                <button onClick={async (e) => {
                  e.stopPropagation();
                  try {
                    const res = await fetch(import.meta.env.VITE_API_URL + '/api/invoice-settings');
                    const settings = res.ok ? await res.json() : null;

                    const totalAmt = Number(req.stock_per_mound) * Number(req.our_price);
                    const subTotal = totalAmt / 1.05;
                    const tax = subTotal * 0.025;
                    
                    const invoiceData = {
                      type: "Debit Memo",
                      invoiceNo: `GT/PR-${req.request_id}`,
                      date: new Date(req.createdAt || req.created_at || Date.now()).toLocaleDateString('en-GB'),
                      customerName: user?.username || 'Customer',
                      placeOfSupply: "24-Gujarat",
                      items: [{
                        productName: "RAW GROUND NUT (MOUND)",
                        hsn: "1202",
                        qty: Number(req.stock_per_mound),
                        rate: Number(req.our_price) / 1.05,
                        gstPercent: 5.00,
                        amount: subTotal
                      }],
                      subTotal: subTotal,
                      cgst: tax,
                      sgst: tax,
                      roundOff: totalAmt - (subTotal + tax + tax),
                      grandTotal: totalAmt
                    };
                    generateTaxInvoice(invoiceData, settings, true);
                  } catch (err) {
                    console.error("Error generating invoice:", err);
                  }
                }} style={{ padding: '6px 12px', background: '#2e7d32', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <FaDownload /> Download Memo
                </button>
              </div>
              {req.payment_method === 'Cheque' ? (
                req.payment_proof && (
                  <div>
                    <strong style={{ color: '#555' }}>💳 Payment Proof (Cheque):</strong>
                    <div style={{ marginTop: '8px' }}>
                      <a href={req.payment_proof} target="_blank" rel="noreferrer">
                        <img src={req.payment_proof} alt="Cheque Proof" style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #ddd' }} />
                      </a>
                    </div>
                  </div>
                )
              ) : (
                <div style={{ background: '#e8f5e9', padding: '10px', borderRadius: '4px', borderLeft: '4px solid #4CAF50', color: '#2e7d32' }}>
                  <strong>💵 {user?.username} want to Cash Transaction</strong>
                  <div style={{ fontSize: '0.85rem', marginTop: '5px' }}>Requested at: {new Date(req.createdAt || req.created_at).toLocaleString()}</div>
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
    </>
  );
};

export default UserProfile;

// ===== OIL CAKE PURCHASE TAB COMPONENT =====
const STATUS_STYLES = {
  Pending: { bg: '#fff3cd', color: '#856404', label: '⏳ Pending' },
  Confirmed: { bg: '#cce5ff', color: '#004085', label: '  Accepted' },
  Processing: { bg: '#d1ecf1', color: '#0c5460', label: '🔄 Processing' },
  Delivered: { bg: '#d4edda', color: '#155724', label: '🎉 Delivered' },
  Cancelled: { bg: '#f8d7da', color: '#721c24', label: '  Cancelled' },
  Rejected: { bg: '#f8d7da', color: '#721c24', label: '  Rejected' },
};

const OilCakePurchaseTab = ({ user }) => {
  const [priceInfo, setPriceInfo] = useState(null);
  const [pastOrders, setPastOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState({ text: '', type: '' });
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ quantity_kg: '', contact_number: user?.moblie_no || '', notes: '' });

  const loadData = async () => {
    if (!user?.user_id) return;
    setLoading(true);
    try {
      const [prRes, ordRes] = await Promise.all([
        fetch(import.meta.env.VITE_API_URL + '/api/oil-cake/price'),
        fetch(import.meta.env.VITE_API_URL + `/api/oil-cake/requests/user/${user.user_id}`)
      ]);
      if (prRes.ok) setPriceInfo(await prRes.json());
      if (ordRes.ok) setPastOrders(await ordRes.json());
    } catch { }
    setLoading(false);
  };

  useEffect(() => { loadData(); }, [user]);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const totalCost = priceInfo && form.quantity_kg ? (parseFloat(form.quantity_kg) * parseFloat(priceInfo.price_per_kg)).toFixed(2) : null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg({ text: '', type: '' });
    const qty = parseFloat(form.quantity_kg);
    const minQty = parseFloat(priceInfo?.min_quantity_kg) || 20;
    if (qty < minQty) {
      setMsg({ text: `Minimum order quantity is ${minQty} KG.`, type: 'error' });
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(import.meta.env.VITE_API_URL + '/api/oil-cake/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.user_id, ...form, quantity_kg: qty })
      });
      const data = await res.json();
      if (res.ok) {
        setMsg({ text: '  ' + data.message, type: 'success' });
        setShowForm(false);
        setForm({ quantity_kg: '', contact_number: user?.moblie_no || '', notes: '' });
        loadData();
      } else {
        setMsg({ text: '  ' + (data.message || 'Failed to submit request'), type: 'error' });
      }
    } catch (err) {
      setMsg({ text: '  ' + err.message, type: 'error' });
    }
    setSubmitting(false);
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '30px', color: '#666' }}>Loading...</div>;

  return (
    <div style={{ padding: '10px 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h3 style={{ margin: 0, color: '#2c3e50' }}>  Oil Cake Purchase</h3>
          <p style={{ margin: '4px 0 0', color: '#666', fontSize: '0.85rem' }}>High-quality oil cake available for bulk purchase</p>
        </div>
        {priceInfo?.is_available && (
          <button
            onClick={() => { setShowForm(!showForm); setMsg({ text: '', type: '' }); }}
            style={{ padding: '9px 20px', background: showForm ? '#e74c3c' : '#27ae60', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '700' }}
          >
            {showForm ? '✕ Cancel' : '+ New Request'}
          </button>
        )}
      </div>

      {/* Price Info Card */}
      {priceInfo && (
        <div style={{ background: priceInfo.is_available ? 'linear-gradient(135deg, #e8f5e9, #f1f8e9)' : '#f8d7da', borderRadius: '10px', padding: '16px 20px', marginBottom: '20px', borderLeft: `4px solid ${priceInfo.is_available ? '#27ae60' : '#e74c3c'}`, display: 'flex', gap: '30px', flexWrap: 'wrap', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '0.8rem', color: '#666', marginBottom: '2px' }}>Current Price</div>
            <div style={{ fontSize: '1.6rem', fontWeight: '800', color: '#27ae60' }}>₹{priceInfo.price_per_kg}<span style={{ fontSize: '0.9rem', color: '#555' }}>/kg</span></div>
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: '#666', marginBottom: '2px' }}>Minimum Order</div>
            <div style={{ fontSize: '1.2rem', fontWeight: '700', color: '#2c3e50' }}>{priceInfo.min_quantity_kg} KG</div>
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: '#666', marginBottom: '2px' }}>Availability</div>
            <div style={{ fontSize: '1rem', fontWeight: '700', color: priceInfo.is_available ? '#27ae60' : '#e74c3c' }}>
              {priceInfo.is_available ? '  Available' : '  Not Available'}
            </div>
          </div>
        </div>
      )}

      {!priceInfo?.is_available && (
        <div style={{ background: '#fff3cd', borderLeft: '4px solid #ffc107', padding: '14px', borderRadius: '6px', marginBottom: '20px', color: '#856404' }}>
          <strong>⚠️ Oil Cake is currently not available for purchase.</strong> Please check back later.
        </div>
      )}

      {/* Purchase Form */}
      {showForm && priceInfo?.is_available && (
        <form onSubmit={handleSubmit} style={{ background: 'white', borderRadius: '10px', padding: '24px', marginBottom: '24px', boxShadow: '0 2px 10px rgba(0,0,0,0.07)', border: '1px solid #e8f5e9' }}>
          <h4 style={{ marginTop: 0, marginBottom: '18px', color: '#2c3e50' }}>📋 Purchase Request</h4>

          {msg.text && (
            <div style={{ padding: '10px 14px', borderRadius: '6px', marginBottom: '16px', background: msg.type === 'success' ? '#d4edda' : '#f8d7da', color: msg.type === 'success' ? '#155724' : '#721c24', fontWeight: '500' }}>
              {msg.text}
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontWeight: '600', marginBottom: '6px', color: '#555', fontSize: '0.9rem' }}>
                Quantity (KG) <span style={{ color: 'red' }}>*</span>
                <span style={{ fontWeight: '400', color: '#888', marginLeft: '6px' }}>Min: {priceInfo.min_quantity_kg} KG</span>
              </label>
              <input
                type="number"
                name="quantity_kg"
                value={form.quantity_kg}
                onChange={handleChange}
                min={priceInfo.min_quantity_kg}
                step="1"
                required
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '1rem', boxSizing: 'border-box' }}
                placeholder={`Minimum ${priceInfo.min_quantity_kg} kg`}
              />
              {totalCost && (
                <div style={{ marginTop: '6px', color: '#27ae60', fontWeight: '700', fontSize: '0.95rem' }}>
                  Estimated Total: ₹{totalCost}
                </div>
              )}
            </div>

            <div>
              <label style={{ display: 'block', fontWeight: '600', marginBottom: '6px', color: '#555', fontSize: '0.9rem' }}>Contact Number <span style={{ color: 'red' }}>*</span></label>
              <input
                type="tel"
                name="contact_number"
                value={form.contact_number}
                onChange={handleChange}
                required
                maxLength="15"
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '1rem', boxSizing: 'border-box' }}
                placeholder="Your phone number"
              />
            </div>
          </div>

          <div style={{ marginTop: '16px' }}>
            <label style={{ display: 'block', fontWeight: '600', marginBottom: '6px', color: '#555', fontSize: '0.9rem' }}>Special Notes (Optional)</label>
            <textarea
              name="notes"
              value={form.notes}
              onChange={handleChange}
              rows={2}
              style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '0.95rem', resize: 'vertical', boxSizing: 'border-box' }}
              placeholder="Any special requirements..."
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            style={{ marginTop: '18px', padding: '11px 28px', background: '#27ae60', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '700', fontSize: '0.95rem' }}
          >
            {submitting ? 'Submitting...' : '  Submit Purchase Request'}
          </button>
        </form>
      )}

      {/* Past Orders */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <h4 style={{ color: '#2c3e50', margin: 0 }}> My Oil Cake Requests</h4>
        <button 
          onClick={loadData} 
          style={{ 
            padding: '6px 12px', 
            backgroundColor: '#4CAF50', 
            color: 'white', 
            border: 'none', 
            borderRadius: '6px', 
            cursor: 'pointer', 
            fontSize: '0.75rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontWeight: 'bold',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}
        >
          <span style={{ 
            backgroundColor: '#2196F3', 
            borderRadius: '3px', 
            width: '18px', 
            height: '18px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            fontSize: '10px'
          }}>🔄</span>
          Refresh
        </button>
      </div>
      {pastOrders.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '30px', background: 'white', borderRadius: '10px', color: '#999' }}>
          <div style={{ fontSize: '2rem' }}> </div>
          <p>No oil cake requests yet</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {pastOrders.map(req => {
            const st = STATUS_STYLES[req.status] || STATUS_STYLES.Pending;
            return (
              <div key={req.id} style={{ background: 'white', borderRadius: '10px', padding: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', border: '1px solid #f0f0f0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <div style={{display:'flex', alignItems: 'center', gap: '10px'}}>
                    <strong style={{ color: '#2c3e50' }}>Request #{req.id}</strong>
                    {req.status === 'Confirmed' && (
                      <button onClick={async (e) => {
                        e.stopPropagation();
                        try {
                          const res = await fetch(import.meta.env.VITE_API_URL + '/api/invoice-settings');
                          const settings = res.ok ? await res.json() : null;

                          const totalAmt = Number(req.total_amount);
                          const subTotal = totalAmt / 1.05;
                          const tax = subTotal * 0.025;
                          
                          const invoiceData = {
                            type: "TAX INVOICE",
                            invoiceNo: `GT/OC-${req.id}`,
                            date: new Date(req.created_at).toLocaleDateString('en-GB'),
                            customerName: user?.username || 'Customer',
                            placeOfSupply: "24-Gujarat",
                            items: [{
                              productName: "GROUND NUT OIL CAKE (KHOL)",
                              hsn: "2305",
                              qty: Number(req.quantity_kg),
                              rate: Number(req.price_per_kg) / 1.05,
                              gstPercent: 5.00,
                              amount: subTotal
                            }],
                            subTotal: subTotal,
                            cgst: tax,
                            sgst: tax,
                            roundOff: totalAmt - (subTotal + tax + tax),
                            grandTotal: totalAmt
                          };
                          generateTaxInvoice(invoiceData, settings, true);
                        } catch (err) {
                           console.error("Error generating invoice:", err);
                        }
                      }} style={{ padding: '4px 10px', background: '#3498db', color: '#fff', border: 'none', borderRadius: '20px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 'bold' }}>
                         Download INVOICE
                      </button>
                    )}
                  </div>
                  <span style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '700', background: st.bg, color: st.color }}>{st.label}</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '8px', fontSize: '0.9rem', color: '#555' }}>
                  <span><strong>Quantity:</strong> {req.quantity_kg} KG</span>
                  <span><strong>Rate:</strong> ₹{req.price_per_kg}/kg</span>
                  <span><strong>Total:</strong> <span style={{ color: '#27ae60', fontWeight: '700' }}>₹{req.total_amount}</span></span>
                  <span><strong>Date:</strong> {new Date(req.created_at).toLocaleDateString()}</span>
                </div>
                <div style={{ marginTop: '8px', fontSize: '0.85rem', color: '#777' }}>

                </div>
                {req.admin_note && (
                  <div style={{ marginTop: '5px', background: '#f5f5f5', padding: '8px 12px', borderRadius: '6px', borderLeft: '3px solid #666', fontSize: '0.85rem', color: '#333' }}>
                    <strong>  Admin Note:</strong> {req.admin_note}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

