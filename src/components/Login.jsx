import React, { useState } from 'react';
import './Login.css';

const Login = ({ onBack, onLogin, onSwitchToRegister }) => {
  const [formData, setFormData] = useState({ emali: '', password: '' });
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
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

  return (
    <div className="login-container">
      <div className="login-card">
        {onBack && <button className="login-back-btn" onClick={onBack}>← Back to Home</button>}
        <h2>Sign In</h2>
        {message && <div className={`login-msg ${message.includes('success') ? 'success' : 'error'}`}>{message}</div>}
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label>Email ID</label>
            <input type="email" name="emali" value={formData.emali} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" name="password" value={formData.password} onChange={handleChange} required />
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
