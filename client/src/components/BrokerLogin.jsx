import React, { useState } from 'react';
import './BrokerLogin.css';

const BrokerLogin = ({ onBack, onLogin }) => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      console.log('📨 Broker login attempt:', formData);

      const response = await fetch(import.meta.env.VITE_API_URL + '/api/broker/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      console.log('📥 Response:', data);

      if (response.ok) {
        setMessage('Login successful! Redirecting to dashboard...');
        setTimeout(() => {
          if (onLogin) onLogin(data.user);
        }, 1000);
      } else {
        setMessage(data.message || data.error || 'Login failed');
      }
    } catch (err) {
      console.error('🔴 Error:', err);
      setMessage('Error connecting to server: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="broker-login-container fade-in">
      <div className="broker-login-card slide-up">
        {onBack && <button className="broker-login-back-btn" onClick={onBack}>← Back to Home</button>}
        <div className="broker-login-header">
          <h2>🤝 Broker Portal</h2>
          <p>Enter your credentials to access your dashboard</p>
        </div>
        {message && (
          <div className={`broker-login-msg ${message.includes('successful') ? 'success' : 'error'}`}>
            {message}
          </div>
        )}
        <form onSubmit={handleSubmit} className="broker-login-form">
          <div className="form-group">
            <label>Email Address</label>
            <input 
              type="email" 
              name="email" 
              value={formData.email} 
              onChange={handleChange} 
              required 
              className="animated-input"
              placeholder="Enter your email"
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input 
              type="password" 
              name="password" 
              value={formData.password} 
              onChange={handleChange} 
              required 
              className="animated-input"
              placeholder="Enter your password"
            />
          </div>
          <button type="submit" className="broker-login-submit-btn pulse-hover" disabled={loading}>
            {loading ? '🔄 Logging in...' : '✓ Login as Broker'}
          </button>
        </form>

        <div className="broker-login-info">
          <p>Don't have an account yet? Contact your administrator to create a broker account.</p>
        </div>
      </div>
    </div>
  );
};

export default BrokerLogin;
