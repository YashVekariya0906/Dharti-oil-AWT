import React, { useState, useEffect } from 'react';
import './BrokerDashboard.css';

const BrokerDashboard = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState('requests');
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [scheduleData, setScheduleData] = useState({ visit_date: '', visit_time: '' });
  const [reportModeRequestId, setReportModeRequestId] = useState(null);
  const [reportData, setReportData] = useState({ delivered_quantity: '', broker_comments: '' });
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (user) {
      fetchAssignedRequests();
    }
  }, [user]);

  const fetchAssignedRequests = async () => {
    try {
      setLoading(true);
      const res = await fetch(`http://localhost:5000/api/brokers/${user.user_id}/selling-requests`);
      const data = await res.json();
      setRequests(data);
    } catch (error) {
      console.error('Failed to fetch requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleScheduleSubmit = async (requestId) => {
    if (!scheduleData.visit_date || !scheduleData.visit_time) {
      setMessage('Please fill in all fields');
      return;
    }

    try {
      const res = await fetch(`http://localhost:5000/api/brokers/selling-requests/${requestId}/schedule`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          broker_id: user.user_id,
          visit_day: scheduleData.visit_date,
          visit_time: scheduleData.visit_time
        })
      });

      const data = await res.json();
      if (res.ok) {
        setMessage('Schedule updated successfully!');
        setScheduleData({ visit_date: '', visit_time: '' });
        setSelectedRequest(null);
        fetchAssignedRequests();
      } else {
        setMessage(data.message || 'Failed to update schedule');
      }
    } catch (error) {
      setMessage('Error: ' + error.message);
    }
  };

  const handleReportSubmit = async (requestId) => {
    if (!reportData.delivered_quantity) {
      setMessage('Please fill delivered quantity before submitting report');
      return;
    }

    try {
      const res = await fetch(`http://localhost:5000/api/brokers/selling-requests/${requestId}/report`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          delivered_quantity: parseFloat(reportData.delivered_quantity),
          broker_comments: reportData.broker_comments
        })
      });

      const data = await res.json();
      if (res.ok) {
        setMessage('Visit report submitted successfully!');
        setReportData({ delivered_quantity: '', broker_comments: '' });
        setReportModeRequestId(null);
        fetchAssignedRequests();
      } else {
        setMessage(data.message || 'Failed to submit report');
      }
    } catch (error) {
      setMessage('Error: ' + error.message);
    }
  };
  return (
    <div className="broker-dashboard-container">
      <div className="broker-dashboard-header">
        <div className="broker-header-content">
          <h1>🤝 Broker Dashboard</h1>
          <p>Welcome, <strong>{user?.username}</strong></p>
        </div>
        <button onClick={onLogout} className="broker-logout-btn">Logout</button>
      </div>

      <div className="broker-dashboard-tabs">
        <button 
          className={`tab-btn ${activeTab === 'requests' ? 'active' : ''}`}
          onClick={() => setActiveTab('requests')}
        >
          📋 My Assignments
        </button>
        <button 
          className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          👤 Profile
        </button>
      </div>

      <div className="broker-dashboard-content fade-in">
        {activeTab === 'requests' && (
          <div className="requests-section">
            <h2>Assigned Selling Requests</h2>
            {message && <div className={`msg ${message.includes('success') ? 'success' : 'error'}`}>{message}</div>}
            
            {loading ? (
              <p className="loading">Loading...</p>
            ) : requests.length === 0 ? (
              <p className="no-data">No assigned requests yet</p>
            ) : (
              <div className="requests-list">
                {requests.map((req) => (
                  <div key={req.request_id} className="request-card slide-up">
                    <div className="request-header">
                      <h3>{req.user?.username}</h3>
                      <span className={`status-badge ${req.status?.toLowerCase()}`}>{req.status}</span>
                    </div>
                    
                    <div className="request-details">
                      <div className="detail-row">
                        <span className="label">📧 Email:</span>
                        <span className="value">{req.user?.emali}</span>
                      </div>
                      <div className="detail-row">
                        <span className="label">📱 Mobile:</span>
                        <span className="value">{req.user?.moblie_no}</span>
                      </div>
                      <div className="detail-row">
                        <span className="label">📍 Address:</span>
                        <span className="value">{req.user?.address}</span>
                      </div>
                      <div className="detail-row">
                        <span className="label">📮 Pincode:</span>
                        <span className="value">{req.user?.pincode}</span>
                      </div>
                      <div className="detail-row">
                        <span className="label">📦 Stock (mound):</span>
                        <span className="value">{req.stock_per_mound}</span>
                      </div>
                      <div className="detail-row">
                        <span className="label">💰 Customer Price:</span>
                        <span className="value">₹{req.customer_price}</span>
                      </div>
                      <div className="detail-row">
                        <span className="label">Our Price:</span>
                        <span className="value">₹{req.our_price}</span>
                      </div>
                    </div>

                    {req.visit_date && req.visit_time ? (
                      <div className="schedule-info">
                        <p>✅ Visit Scheduled:</p>
                        <p><strong>Date:</strong> {new Date(req.visit_date).toLocaleDateString()}</p>
                        <p><strong>Time:</strong> {req.visit_time}</p>
                      </div>
                    ) : (
                      <button 
                        className="schedule-btn"
                        onClick={() => setSelectedRequest(req.request_id)}
                      >
                        📅 Schedule Visit
                      </button>
                    )}

                    {!req.is_visited && (req.status === 'Accepted' || req.status === 'Scheduled') && (
                      <button
                        className="report-btn"
                        onClick={() => {
                          setReportModeRequestId(req.request_id);
                          setMessage('');
                        }}
                      >
                        📝 Report Visit
                      </button>
                    )}

                    {req.is_visited && (
                      <div className="visit-report-box">
                        <p>🟢 Visit completed. Delivered: {req.delivered_quantity ?? 'N/A'}</p>
                        <p>📌 Broker notes: {req.broker_comments || 'No comments'}</p>
                      </div>
                    )}

                    {reportModeRequestId === req.request_id && (
                      <div className="report-form slide-up">
                        <div className="form-group">
                          <label>Delivered Quantity</label>
                          <input
                            type="number"
                            step="0.01"
                            value={reportData.delivered_quantity}
                            onChange={(e) => setReportData({ ...reportData, delivered_quantity: e.target.value })}
                            className="animated-input"
                          />
                        </div>
                        <div className="form-group">
                          <label>Broker Comments</label>
                          <textarea
                            value={reportData.broker_comments}
                            onChange={(e) => setReportData({ ...reportData, broker_comments: e.target.value })}
                            className="animated-input"
                            rows={3}
                          />
                        </div>
                        <div className="form-actions">
                          <button
                            onClick={() => handleReportSubmit(req.request_id)}
                            className="save-btn"
                          >
                            ✓ Submit Report
                          </button>
                          <button
                            onClick={() => {
                              setReportModeRequestId(null);
                              setReportData({ delivered_quantity: '', broker_comments: '' });
                            }}
                            className="cancel-btn"
                          >
                            ✕ Cancel
                          </button>
                        </div>
                      </div>
                    )}

                    {selectedRequest === req.request_id && (
                      <div className="schedule-form slide-up">
                        <div className="form-group">
                          <label>Visit Date</label>
                          <input 
                            type="date" 
                            value={scheduleData.visit_date}
                            onChange={(e) => setScheduleData({...scheduleData, visit_date: e.target.value})}
                            className="animated-input"
                          />
                        </div>
                        <div className="form-group">
                          <label>Visit Time</label>
                          <input 
                            type="time" 
                            value={scheduleData.visit_time}
                            onChange={(e) => setScheduleData({...scheduleData, visit_time: e.target.value})}
                            className="animated-input"
                          />
                        </div>
                        <div className="form-actions">
                          <button 
                            onClick={() => handleScheduleSubmit(req.request_id)}
                            className="save-btn"
                          >
                            ✓ Confirm Schedule
                          </button>
                          <button 
                            onClick={() => {
                              setSelectedRequest(null);
                              setScheduleData({ visit_date: '', visit_time: '' });
                            }}
                            className="cancel-btn"
                          >
                            ✕ Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="profile-section fade-in">
            <h2>Your Profile</h2>
            <div className="profile-card">
              <div className="profile-row">
                <span className="label">Name:</span>
                <span className="value">{user?.username}</span>
              </div>
              <div className="profile-row">
                <span className="label">Email:</span>
                <span className="value">{user?.emali}</span>
              </div>
              <div className="profile-row">
                <span className="label">Mobile:</span>
                <span className="value">{user?.moblie_no}</span>
              </div>
              <div className="profile-row">
                <span className="label">Address:</span>
                <span className="value">{user?.address}</span>
              </div>
              <div className="profile-row">
                <span className="label">Pincode:</span>
                <span className="value">{user?.pincode}</span>
              </div>
              <div className="profile-row">
                <span className="label">Commission %:</span>
                <span className="value">{user?.commission_percent ?? 'N/A'}</span>
              </div>
              <div className="profile-row">
                <span className="label">Role:</span>
                <span className="value">{user?.role}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BrokerDashboard;
