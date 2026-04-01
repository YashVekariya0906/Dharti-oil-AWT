import React, { useState } from 'react';
import './Login.css';

const Login = ({ onBack, onLogin, onSwitchToRegister }) => {
  const [formData, setFormData] = useState({ emali: '', password: '' });
  const [message, setMessage] = useState('');
  
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [forgotStep, setForgotStep] = useState(1);
  const [forgotData, setForgotData] = useState({ email: '', otp: '', newPassword: '', confirmPassword: '' });
  const [forgotMessage, setForgotMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  
  const handleForgotChange = (e) => {
    setForgotData({ ...forgotData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await response.json();
      
      if (response.ok) {
        setMessage('Login successful!');
        if (onLogin) onLogin(data.user);
      } else {
        setMessage(data.message || data.error || 'Login failed');
      }
    } catch (err) {
      setMessage('Error connecting to server.');
    }
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setForgotMessage('');
    try {
      const res = await fetch('http://localhost:5000/api/forgot-password/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotData.email })
      });
      const data = await res.json();
      if (res.ok) {
        setForgotMessage(data.message);
        setForgotStep(2);
      } else {
        setForgotMessage(data.message || 'Failed to send OTP.');
      }
    } catch (err) {
      setForgotMessage('Error connecting to server.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (forgotData.newPassword !== forgotData.confirmPassword) {
      setForgotMessage('Passwords do not match.');
      return;
    }
    setLoading(true);
    setForgotMessage('');
    try {
      const res = await fetch('http://localhost:5000/api/forgot-password/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: forgotData.email,
          otp_code: forgotData.otp,
          new_password: forgotData.newPassword
        })
      });
      const data = await res.json();
      if (res.ok) {
        setForgotMessage(data.message);
        setTimeout(() => {
          setIsForgotPassword(false);
          setForgotStep(1);
          setForgotData({ email: '', otp: '', newPassword: '', confirmPassword: '' });
          setForgotMessage('');
        }, 3000);
      } else {
        setForgotMessage(data.message || 'Failed to reset password.');
      }
    } catch (err) {
      setForgotMessage('Error connecting to server.');
    } finally {
      setLoading(false);
    }
  };

  if (isForgotPassword) {
    return (
      <div className="login-container">
        <div className="login-card">
          <button className="login-back-btn" onClick={() => { setIsForgotPassword(false); setForgotStep(1); setForgotMessage(''); }}>← Back to Login</button>
          <h2>Forgot Password</h2>
          {forgotMessage && <div className={`login-msg ${forgotMessage.toLowerCase().includes('success') ? 'success' : 'error'}`}>{forgotMessage}</div>}
          
          {forgotStep === 1 ? (
            <form onSubmit={handleSendOtp} className="login-form">
              <div className="form-group">
                <label>Email ID</label>
                <input type="email" name="email" value={forgotData.email} onChange={handleForgotChange} required />
              </div>
              <button type="submit" className="login-submit-btn" disabled={loading}>
                {loading ? 'Sending...' : 'Send OTP'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleResetPassword} className="login-form">
              <div className="form-group">
                <label>OTP Code</label>
                <input type="text" name="otp" value={forgotData.otp} onChange={handleForgotChange} maxLength="6" required />
              </div>
              <div className="form-group">
                <label>New Password</label>
                <input type="password" name="newPassword" value={forgotData.newPassword} onChange={handleForgotChange} required minLength="6" />
              </div>
              <div className="form-group">
                <label>Confirm Password</label>
                <input type="password" name="confirmPassword" value={forgotData.confirmPassword} onChange={handleForgotChange} required minLength="6" />
              </div>
              <button type="submit" className="login-submit-btn" disabled={loading}>
                {loading ? 'Resetting...' : 'Reset Password'}
              </button>
            </form>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="login-container">
      <div className="login-card">
        {onBack && <button className="login-back-btn" onClick={onBack}>← Back to Home</button>}
        <h2>Sign In</h2>
        {message && <div className={`login-msg ${message.toLowerCase().includes('success') ? 'success' : 'error'}`}>{message}</div>}
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label>Email ID</label>
            <input type="email" name="emali" value={formData.emali} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" name="password" value={formData.password} onChange={handleChange} required />
          </div>
          <div style={{ textAlign: 'right', marginBottom: '15px' }}>
            <button 
              type="button" 
              onClick={() => setIsForgotPassword(true)} 
              style={{ background: 'none', border: 'none', color: '#4CAF50', cursor: 'pointer', fontSize: '14px', padding: 0 }}
            >
              Forgot Password?
            </button>
          </div>
          <button type="submit" className="login-submit-btn">Login</button>
        </form>
        
        <div style={{ marginTop: '15px', textAlign: 'center' }}>
          <span style={{ color: '#666', fontSize: '14px' }}>Don't have an account? </span>
          <button 
            type="button" 
            onClick={onSwitchToRegister} 
            style={{ background: 'none', border: 'none', color: '#4CAF50', cursor: 'pointer', textDecoration: 'underline', padding: 0, fontSize: '14px' }}
          >
            Go to Registration
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
