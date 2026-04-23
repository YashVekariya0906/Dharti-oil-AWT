import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import './Register.css';

const Register = ({ onBack, onLogin, onSwitchToLogin }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    username: '',
    moblie_no: '',
    emali: '',
    address: '',
    pincode: '',
    password: '',
    confirmPassword: '',
    role: 'user'
  });
  
  const [otpMode, setOtpMode] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    let { name, value } = e.target;
    
    if (name === 'moblie_no') {
      value = value.replace(/\D/g, '').slice(0, 10);
    } else if (name === 'pincode') {
      value = value.replace(/\D/g, '').slice(0, 6);
    }
    
    setFormData({ ...formData, [name]: value });
  };

  const handleOtpChange = (e) => {
    setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6));
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setMessage('Password and Confirm Password do not match!');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      if (response.ok) {
        setMessage('Registration code sent to your email. Valid for 10 minutes.');
        setOtpMode(true);
      } else {
        setMessage(data.message || data.error || 'Registration failed');
      }
    } catch (err) {
      setMessage('Error connecting to server.');
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emali: formData.emali, otp_code: otpCode })
      });
      
      const data = await response.json();
      if (response.ok) {
        setMessage('Registration fully successful and verified!');
        setOtpMode(false);
        setFormData({ username: '', moblie_no: '', emali: '', address: '', pincode: '', password: '', confirmPassword: '', role: 'user' });
        // Automatically log them in:
        if (onLogin && data.user) onLogin(data.user);
      } else {
        setMessage(data.message || data.error || 'OTP Verification failed');
      }
    } catch (err) {
      setMessage('Error connecting to server.');
    }
  };

  return (
    <div className="register-container">
      <div className="register-card">
        {onBack && <button className="register-back-btn" onClick={onBack}>← Back to Home</button>}
        <h2>{t('auth.register_title')}</h2>
        {message && <div className={`register-msg ${message.includes('success') ? 'success' : 'error'}`}>{message}</div>}
        
        {!otpMode ? (
          <>
            <form onSubmit={handleRegisterSubmit} className="register-form">
            <div className="form-group">
              <label>Username</label>
              <input type="text" name="username" value={formData.username} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Mobile Number</label>
              <input type="text" name="moblie_no" value={formData.moblie_no} onChange={handleChange} minLength="10" maxLength="10" placeholder="10-digit number" inputMode="numeric" pattern="[0-9]*" required />
            </div>
            <div className="form-group">
              <label>Email ID</label>
              <input type="email" name="emali" value={formData.emali} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Address</label>
              <textarea name="address" value={formData.address} onChange={handleChange} required></textarea>
            </div>
            <div className="form-group">
              <label>Pincode</label>
              <input type="text" name="pincode" value={formData.pincode} onChange={handleChange} minLength="6" maxLength="6" placeholder="6-digit code" inputMode="numeric" pattern="[0-9]*" required />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input type="password" name="password" value={formData.password} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Confirm Password</label>
              <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required />
            </div>
            <button type="submit" className="register-submit-btn">{t('auth.submit_register')}</button>
          </form>
          
          <div style={{ marginTop: '15px', textAlign: 'center' }}>
            <button 
              type="button" 
              onClick={onSwitchToLogin} 
              style={{ background: 'none', border: 'none', color: '#4CAF50', cursor: 'pointer', textDecoration: 'underline', padding: 0, fontSize: '14px' }}
            >
              {t('auth.have_account')}
            </button>
          </div>
          </>
        ) : (
          <form onSubmit={handleOtpSubmit} className="register-form">
            <div className="form-group">
              <label>Enter 6-digit code sent to {formData.emali}</label>
              <input 
                type="text" 
                minLength="6"
                maxLength="6" 
                value={otpCode} 
                onChange={handleOtpChange} 
                required 
                inputMode="numeric"
                pattern="[0-9]*"
                style={{ textAlign: 'center', letterSpacing: '4px', fontSize: '1.2em' }}
              />
            </div>
            <button type="submit" className="register-submit-btn">Verify and Complete</button>
            <button type="button" className="register-back-btn" onClick={() => setOtpMode(false)} style={{ marginTop: '10px' }}>
              Cancel
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Register;
