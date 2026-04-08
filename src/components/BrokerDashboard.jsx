import React, { useState, useEffect } from 'react';
import './BrokerDashboard.css';

const BrokerDashboard = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState('requests');
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [scheduleData, setScheduleData] = useState({ visit_date: '', visit_time: '' });
  const [reportModeRequestId, setReportModeRequestId] = useState(null);
  const [reportData, setReportData] = useState({ delivered_quantity: '', broker_comments: '', final_price: '', sample_photos: [], payment_proof: null });
  const [message, setMessage] = useState('');

  // Broker reject mode
  const [brokerRejectModeId, setBrokerRejectModeId] = useState(null);
  const [brokerRejectData, setBrokerRejectData] = useState({ reason: '', comment: '', photos: [] });
  const [brokerRejectLoading, setBrokerRejectLoading] = useState(false);

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

  const handleKeyDown = (e) => {
    if (['e', 'E', '+', '-'].includes(e.key)) {
      e.preventDefault();
    }
  };

  const handleReached = async (requestId) => {
    try {
      const res = await fetch(`http://localhost:5000/api/brokers/selling-requests/${requestId}/reached`, {
        method: 'PUT',
      });
      const data = await res.json();
      if (res.ok) {
        setMessage('Marked as Reached successfully!');
        fetchAssignedRequests();
      } else {
        setMessage(data.message || 'Failed to mark as reached');
      }
    } catch (error) {
      setMessage('Error: ' + error.message);
    }
  };

  const handleReportSubmit = async (requestId) => {
    if (!reportData.delivered_quantity || !reportData.final_price) {
      setMessage('Please fill in required fields (Delivered Quantity & Final Price)');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('delivered_quantity', parseFloat(reportData.delivered_quantity));
      formData.append('broker_comments', reportData.broker_comments);
      formData.append('final_price', parseFloat(reportData.final_price));

      Array.from(reportData.sample_photos).forEach(file => {
        formData.append('sample_photos', file);
      });
      if (reportData.payment_proof) {
        formData.append('payment_proof', reportData.payment_proof);
      }

      const res = await fetch(`http://localhost:5000/api/brokers/selling-requests/${requestId}/report`, {
        method: 'PUT',
        body: formData
      });

      const data = await res.json();
      if (res.ok) {
        setMessage('Visit report submitted successfully!');
        setReportData({ delivered_quantity: '', broker_comments: '', final_price: '', sample_photos: [], payment_proof: null });
        setReportModeRequestId(null);
        fetchAssignedRequests();
      } else {
        setMessage(data.message || 'Failed to submit report');
      }
    } catch (error) {
      setMessage('Error: ' + error.message);
    }
  };

  // Broker Reject submit
  const handleBrokerRejectSubmit = async (requestId) => {
    if (!brokerRejectData.reason.trim()) {
      setMessage('Please enter a rejection reason.');
      return;
    }
    setBrokerRejectLoading(true);
    try {
      const formData = new FormData();
      formData.append('broker_reject_reason', brokerRejectData.reason.trim());
      formData.append('broker_reject_comment', brokerRejectData.comment.trim());
      Array.from(brokerRejectData.photos).forEach(file => {
        formData.append('broker_reject_photos', file);
      });

      const res = await fetch(`http://localhost:5000/api/brokers/selling-requests/${requestId}/broker-reject`, {
        method: 'PUT',
        body: formData
      });

      const data = await res.json();
      if (res.ok) {
        setMessage('✅ Rejection submitted. Admin will review.');
        setBrokerRejectModeId(null);
        setBrokerRejectData({ reason: '', comment: '', photos: [] });
        fetchAssignedRequests();
      } else {
        setMessage('❌ ' + (data.message || 'Failed to submit rejection.'));
      }
    } catch (err) {
      setMessage('❌ Error: ' + err.message);
    } finally {
      setBrokerRejectLoading(false);
    }
  };

  const formatDateTime = (dt) => {
    if (!dt) return 'N/A';
    return new Date(dt).toLocaleString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit', hour12: true
    });
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
          📋 New Requests
        </button>
        <button
          className={`tab-btn ${activeTab === 'completed' ? 'active' : ''}`}
          onClick={() => setActiveTab('completed')}
        >
          ✅ Completed
        </button>
        <button
          className={`tab-btn ${activeTab === 'rejected' ? 'active' : ''}`}
          onClick={() => setActiveTab('rejected')}
        >
          🚫 Rejected
        </button>
        <button
          className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          👤 Profile
        </button>
      </div>

      <div className="broker-dashboard-content fade-in">
        {(activeTab === 'requests' || activeTab === 'completed' || activeTab === 'rejected') && (
          <div className="requests-section">
            <h2>{activeTab === 'requests' ? 'Assigned Selling Requests' : activeTab === 'completed' ? 'Completed Requests' : 'Rejected Requests'}</h2>
            {message && <div className={`msg ${message.includes('✅') || message.includes('success') ? 'success' : 'error'}`}>{message}</div>}

            {loading ? (
              <p className="loading">Loading...</p>
            ) : requests.filter(r => {
              if (activeTab === 'completed') return r.status === 'Completed';
              if (activeTab === 'rejected') return ['BrokerRejected', 'BrokerRejectionConfirmed', 'AdminRejected'].includes(r.status);
              return !['Completed', 'BrokerRejected', 'BrokerRejectionConfirmed', 'AdminRejected'].includes(r.status);
            }).length === 0 ? (
              <p className="no-data">No {activeTab} requests yet</p>
            ) : (
              <div className="requests-list">
                {requests
                  .filter(r => {
                    if (activeTab === 'completed') return r.status === 'Completed';
                    if (activeTab === 'rejected') return ['BrokerRejected', 'BrokerRejectionConfirmed', 'AdminRejected'].includes(r.status);
                    return !['Completed', 'BrokerRejected', 'BrokerRejectionConfirmed', 'AdminRejected'].includes(r.status);
                  })
                  .map((req) => (
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
                          <span className="label">💳 Payment Method:</span>
                          <span className="value">{req.payment_method || 'Cash'}</span>
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

                      {/* Schedule info */}
                      {req.visit_day && req.visit_time && (
                        <div className="schedule-info">
                          <p>📅 <strong>Visit Scheduled:</strong></p>
                          <p><strong>Date:</strong> {new Date(req.visit_day).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                          <p><strong>Time:</strong> {req.visit_time}</p>
                        </div>
                      )}

                      {/* Reached timestamp */}
                      {req.reached_at && (
                        <div className="broker-reached-info">
                          <strong>📍 You reached at:</strong>
                          <p>{formatDateTime(req.reached_at)}</p>
                        </div>
                      )}

                      {/* Button: Schedule Visit */}
                      {req.status === 'Accepted' && !req.visit_day && (
                        <button
                          className="schedule-btn"
                          onClick={() => setSelectedRequest(req.request_id)}
                        >
                          📅 Schedule Visit
                        </button>
                      )}

                      {/* Button: Reached */}
                      {req.status === 'Scheduled' && (
                        <button
                          className="schedule-btn"
                          style={{ backgroundColor: '#2196F3' }}
                          onClick={() => handleReached(req.request_id)}
                        >
                          📍 Reached
                        </button>
                      )}

                      {/* Buttons after Reached: Report Visit + Reject */}
                      {req.status === 'Reached' && !req.is_visited && (
                        <div className="reached-action-buttons">
                          <button
                            className="report-btn"
                            onClick={() => {
                              setReportModeRequestId(req.request_id);
                              setBrokerRejectModeId(null);
                              setMessage('');
                            }}
                          >
                            📝 Report Visit
                          </button>
                          <button
                            className="broker-reject-trigger-btn"
                            onClick={() => {
                              setBrokerRejectModeId(req.request_id);
                              setReportModeRequestId(null);
                              setBrokerRejectData({ reason: '', comment: '', photos: [] });
                              setMessage('');
                            }}
                          >
                            ✕ Reject Product
                          </button>
                        </div>
                      )}

                      {/* Broker Rejection Form */}
                      {brokerRejectModeId === req.request_id && (
                        <div className="broker-reject-form slide-up">
                          <h4 style={{ color: '#c0392b', marginBottom: '12px' }}>🚫 Reject Product</h4>
                          <p style={{ fontSize: '13px', color: '#666', marginBottom: '12px' }}>
                            Describe why you are rejecting this request. Admin will review with your photos.
                          </p>
                          <div className="form-group">
                            <label>Reason <span style={{ color: 'red' }}>*</span></label>
                            <input
                              type="text"
                              className="animated-input"
                              placeholder="e.g. Product quality issue, quantity mismatch..."
                              value={brokerRejectData.reason}
                              onChange={(e) => setBrokerRejectData({ ...brokerRejectData, reason: e.target.value })}
                            />
                          </div>
                          <div className="form-group">
                            <label>Comment</label>
                            <textarea
                              className="animated-input"
                              placeholder="Additional details..."
                              rows={3}
                              value={brokerRejectData.comment}
                              onChange={(e) => setBrokerRejectData({ ...brokerRejectData, comment: e.target.value })}
                            />
                          </div>
                          <div className="form-group">
                            <label>Sample Photos (proof)</label>
                            <input
                              type="file"
                              multiple
                              className="animated-input"
                              onChange={(e) => setBrokerRejectData({ ...brokerRejectData, photos: e.target.files })}
                            />
                            <small>Upload photos showing the issue</small>
                          </div>
                          <div className="form-actions">
                            <button
                              className="broker-reject-save-btn"
                              onClick={() => handleBrokerRejectSubmit(req.request_id)}
                              disabled={brokerRejectLoading}
                            >
                              {brokerRejectLoading ? 'Submitting...' : '✓ Submit Rejection'}
                            </button>
                            <button
                              className="cancel-btn"
                              onClick={() => {
                                setBrokerRejectModeId(null);
                                setBrokerRejectData({ reason: '', comment: '', photos: [] });
                              }}
                            >
                              ✕ Cancel
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Broker Rejected — awaiting admin */}
                      {req.status === 'BrokerRejected' && (
                        <div className="broker-rejected-status-box">
                          <strong>⏳ Rejection Submitted — Awaiting Admin Review</strong>
                          <p><span className="rj-lbl">Reason:</span> {req.broker_reject_reason}</p>
                          {req.broker_reject_comment && (
                            <p><span className="rj-lbl">Comment:</span> {req.broker_reject_comment}</p>
                          )}
                        </div>
                      )}

                      {/* Completed visit report */}
                      {req.is_visited && req.status === 'Completed' && (
                        <div className="visit-report-box">
                          <p>🟢 Visit completed. Delivered: {req.delivered_quantity ?? 'N/A'}</p>
                          <p>💰 Final Price: ₹{req.final_price ?? 'N/A'}</p>
                          <p>📌 Broker notes: {req.broker_comments || 'No comments'}</p>
                        </div>
                      )}

                      {/* Report Visit Form */}
                      {reportModeRequestId === req.request_id && (
                        <div className="report-form slide-up">
                          <div className="detail-row" style={{ marginBottom: '10px' }}>
                            <span className="label">Admin Given Price:</span>
                            <span className="value">₹{req.our_price}</span>
                          </div>
                          <div className="detail-row" style={{ marginBottom: '15px' }}>
                            <span className="label">User Requested Price:</span>
                            <span className="value">₹{req.customer_price}</span>
                          </div>

                          <div className="form-group">
                            <label>Final Deal Price (₹)</label>
                            <input
                              type="number"
                              step="0.01"
                              value={reportData.final_price}
                              onChange={(e) => setReportData({ ...reportData, final_price: e.target.value })}
                              onKeyDown={handleKeyDown}
                              min="0"
                              className="animated-input"
                              required
                            />
                          </div>
                          <div className="form-group">
                            <label>Sample Photos</label>
                            <input
                              type="file"
                              multiple
                              onChange={(e) => setReportData({ ...reportData, sample_photos: e.target.files })}
                              className="animated-input"
                            />
                            <small>You can select multiple photos.</small>
                          </div>
                          
                          {req.payment_method === 'Cheque' ? (
                            <div className="form-group" style={{ background: '#f8f9fa', padding: '10px', borderRadius: '5px', borderLeft: '4px solid #3498db' }}>
                              <label style={{ color: '#2c3e50' }}>Payment Proof (Cheque Photo) <span style={{ color: 'red' }}>*</span></label>
                              <input
                                type="file"
                                onChange={(e) => setReportData({ ...reportData, payment_proof: e.target.files[0] })}
                                className="animated-input"
                                required
                              />
                              <small>Required because User requested Cheque transaction.</small>
                            </div>
                          ) : (
                            <div className="form-group" style={{ background: '#f8f9fa', padding: '10px', borderRadius: '5px', borderLeft: '4px solid #f39c12' }}>
                              <strong>User want the Cash Transaction</strong>
                              <p style={{ fontSize: '0.85rem', color: '#666', margin: '5px 0 0 0' }}>Please collect/provide exact cash manually. No proof upload needed.</p>
                            </div>
                          )}

                          <div className="form-group">
                            <label>Delivered Quantity</label>
                            <input
                              type="number"
                              step="0.01"
                              value={reportData.delivered_quantity}
                              onChange={(e) => setReportData({ ...reportData, delivered_quantity: e.target.value })}
                              onKeyDown={handleKeyDown}
                              min="0"
                              className="animated-input"
                              required
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
                                setReportData({ delivered_quantity: '', broker_comments: '', final_price: '', sample_photos: [] });
                              }}
                              className="cancel-btn"
                            >
                              ✕ Cancel
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Schedule Form */}
                      {selectedRequest === req.request_id && (
                        <div className="schedule-form slide-up">
                          <div className="form-group">
                            <label>Visit Date</label>
                            <input
                              type="date"
                              value={scheduleData.visit_date}
                              onChange={(e) => setScheduleData({ ...scheduleData, visit_date: e.target.value })}
                              className="animated-input"
                            />
                          </div>
                          <div className="form-group">
                            <label>Visit Time</label>
                            <input
                              type="time"
                              value={scheduleData.visit_time}
                              onChange={(e) => setScheduleData({ ...scheduleData, visit_time: e.target.value })}
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
