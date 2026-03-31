import React, { useState, useEffect } from 'react';
import './UserProfile.css';

const UserProfile = ({ user, onClose, onUpdate }) => {
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
        const res = await fetch(`http://localhost:5000/api/users/${user.user_id}`);
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
        const res = await fetch('http://localhost:5000/api/users/profile', {
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
      const res = await fetch('http://localhost:5000/api/users/profile', {
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
      const res = await fetch('http://localhost:5000/api/users/profile', {
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
          <h2>👤 My Profile</h2>
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
              <h3>Create Selling Request</h3>
              <SellingRequestForm user={profileData} onSuccess={() => setActiveTab('profile')} />
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
    our_price: 0
  });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchOurPrice();
  }, []);

  const fetchOurPrice = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/admin/global-price');
      const data = await res.json();
      setFormData(prev => ({...prev, our_price: data.current_price || 0}));
    } catch (error) {
      console.error('Failed to fetch price');
    }
  };

  const handleChange = (e) => {
    setFormData({...formData, [e.target.name]: e.target.value});
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
      const res = await fetch('http://localhost:5000/api/users/selling-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.user_id,
          stock_per_mound: parseFloat(formData.stock_per_mound),
          customer_price: parseFloat(formData.customer_price),
          our_price: formData.our_price
        })
      });

      const data = await res.json();
      if (res.ok) {
        setMessage('Request submitted successfully! Awaiting admin approval.');
        setFormData({ stock_per_mound: '', customer_price: '', our_price: formData.our_price });
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

      <button type="submit" className="submit-btn" disabled={loading}>
        {loading ? 'Submitting...' : '✓ Submit Selling Request'}
      </button>
    </form>
  );
};

export default UserProfile;
