import React, { useState, useEffect } from 'react';
import { confirmAction } from '../utils/confirmAlert';
import './AdminSellingRequests.css';

const AdminSellingRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [brokersByPincode, setBrokersByPincode] = useState([]);
  const [otherActiveBrokers, setOtherActiveBrokers] = useState([]);
  const [selectedBroker, setSelectedBroker] = useState(null);
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState('pending');

  // Admin Reject modal state
  const [rejectModalRequestId, setRejectModalRequestId] = useState(null);
  const [rejectForm, setRejectForm] = useState({ reason: '', comment: '' });
  const [rejectLoading, setRejectLoading] = useState(false);
  const [rejectMsg, setRejectMsg] = useState('');

  useEffect(() => {
    fetchSellingRequests();
  }, []);

  const fetchSellingRequests = async () => {
    try {
      setLoading(true);
      const res = await fetch('http://localhost:5000/api/admin/selling-requests');
      const data = await res.json();
      setRequests(data);
    } catch (error) {
      console.error('Failed to fetch requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchActiveBrokers = async (pincode) => {
    try {
      const res = await fetch('http://localhost:5000/api/admin/brokers');
      const data = await res.json();
      const activeBrokers = data.filter(b => b.status === 'Active');
      const matching = activeBrokers.filter(b => b.pincode === pincode);
      const others = activeBrokers.filter(b => b.pincode !== pincode);
      setBrokersByPincode(matching);
      setOtherActiveBrokers(others);
    } catch (error) {
      console.error('Failed to fetch brokers:', error);
      setBrokersByPincode([]);
      setOtherActiveBrokers([]);
    }
  };

  const handleSelectRequest = (request) => {
    setSelectedRequest(request);
    setSelectedBroker(null);
    setBrokersByPincode([]);
    setOtherActiveBrokers([]);
    setMessage('');
    fetchActiveBrokers(request.user.pincode);
  };

  const handleAssignBroker = async (brokerParam) => {
    const broker = brokerParam || selectedBroker;
    if (!broker) { setMessage('Please choose a broker first.'); return; }
    if (!selectedRequest) { setMessage('Please select a selling request before assigning.'); return; }
    const isConfirmed = await confirmAction(`Are you sure you want to assign broker ${broker.username || broker.broker_name || 'selected'} to this request?`);
    if (!isConfirmed) return;

    try {
      setMessage('Assigning broker...');
      const res = await fetch(`http://localhost:5000/api/admin/selling-requests/${selectedRequest.request_id}/accept`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ broker_id: broker.user_id || broker.broker_id })
      });
      const data = await res.json();
      if (res.ok) {
        setMessage('✅ Broker assigned successfully!');
        setSelectedBroker(broker);
        setTimeout(() => {
          fetchSellingRequests();
          setSelectedRequest(null);
          setSelectedBroker(null);
          setMessage('');
        }, 1500);
      } else {
        setMessage('❌ ' + (data?.message || data?.error || 'Failed to assign broker'));
      }
    } catch (error) {
      setMessage('❌ Assignment error: ' + error.message);
    }
  };

  // ---- Admin Reject ----
  const openRejectModal = (requestId) => {
    setRejectModalRequestId(requestId);
    setRejectForm({ reason: '', comment: '' });
    setRejectMsg('');
  };

  const handleAdminReject = async () => {
    if (!rejectForm.reason.trim()) {
      setRejectMsg('Please enter a rejection reason.');
      return;
    }
    setRejectLoading(true);
    setRejectMsg('');
    try {
      const res = await fetch(`http://localhost:5000/api/admin/selling-requests/${rejectModalRequestId}/reject`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          admin_reject_reason: rejectForm.reason.trim(),
          admin_reject_comment: rejectForm.comment.trim()
        })
      });
      const data = await res.json();
      if (res.ok) {
        setRejectMsg('✅ Request rejected successfully.');
        setTimeout(() => {
          setRejectModalRequestId(null);
          fetchSellingRequests();
        }, 1200);
      } else {
        setRejectMsg('❌ ' + (data.message || 'Failed to reject.'));
      }
    } catch (err) {
      setRejectMsg('❌ Error: ' + err.message);
    } finally {
      setRejectLoading(false);
    }
  };

  // ---- Admin: Confirm broker rejection → forward to user ----
  const handleConfirmBrokerRejection = async (requestId) => {
    const ok = await confirmAction('Confirm broker rejection and notify user?');
    if (!ok) return;
    try {
      const res = await fetch(`http://localhost:5000/api/admin/selling-requests/${requestId}/confirm-broker-rejection`, {
        method: 'PUT'
      });
      const data = await res.json();
      if (res.ok) {
        fetchSellingRequests();
      } else {
        alert(data.message || 'Failed.');
      }
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  // ---- Admin: Override broker rejection → reset & assign another broker ----
  const [overrideRequestId, setOverrideRequestId] = useState(null);

  const handleOverrideBrokerRejection = async (req) => {
    const ok = await confirmAction("Override broker rejection? The request will be reset to 'Pending' so you can assign another broker.");
    if (!ok) return;
    try {
      const res = await fetch(`http://localhost:5000/api/admin/selling-requests/${req.request_id}/override-broker-rejection`, {
        method: 'PUT'
      });
      const data = await res.json();
      if (res.ok) {
        fetchSellingRequests();
      } else {
        alert(data.message || 'Failed to override.');
      }
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  const filteredRequests = requests.filter(req => {
    if (activeTab === 'pending') return ['Pending', 'Accepted'].includes(req.status);
    if (activeTab === 'scheduled') return ['Scheduled', 'Reached'].includes(req.status);
    if (activeTab === 'completed') return ['Completed'].includes(req.status);
    if (activeTab === 'rejected') return ['AdminRejected', 'BrokerRejected', 'BrokerRejectionConfirmed'].includes(req.status);
    return true;
  });

  const formatDateTime = (dt) => {
    if (!dt) return null;
    return new Date(dt).toLocaleString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit', hour12: true
    });
  };

  return (
    <div className="admin-selling-container fade-in">
      <div className="admin-selling-header">
        <h2>📦 Selling Requests Management</h2>
        <button onClick={fetchSellingRequests} className="refresh-btn">🔄 Refresh</button>
      </div>

      <div className="selling-tabs" style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
        <button className={`tab-btn ${activeTab === 'pending' ? 'active' : ''}`} onClick={() => setActiveTab('pending')}>
          ⏳ Pending ({requests.filter(r => ['Pending', 'Accepted'].includes(r.status)).length})
        </button>
        <button className={`tab-btn ${activeTab === 'scheduled' ? 'active' : ''}`} onClick={() => setActiveTab('scheduled')}>
          📅 Scheduled ({requests.filter(r => ['Scheduled', 'Reached'].includes(r.status)).length})
        </button>
        <button className={`tab-btn ${activeTab === 'completed' ? 'active' : ''}`} onClick={() => setActiveTab('completed')}>
          ✅ Completed ({requests.filter(r => ['Completed'].includes(r.status)).length})
        </button>
        <button className={`tab-btn ${activeTab === 'rejected' ? 'active' : ''}`} onClick={() => setActiveTab('rejected')}>
          🚫 Rejected ({requests.filter(r => ['AdminRejected', 'BrokerRejected', 'BrokerRejectionConfirmed'].includes(r.status)).length})
        </button>
      </div>

      <div className="admin-selling-content fade-in">
        {loading ? (
          <p className="loading">Loading requests...</p>
        ) : filteredRequests.length === 0 ? (
          <p className="no-data">No {activeTab} requests</p>
        ) : (
          <div className="requests-grid">
            {filteredRequests.map((req) => (
              <div key={req.request_id} className={`request-card slide-up ${selectedRequest?.request_id === req.request_id ? 'active' : ''}`}>
                <div className="card-header">
                  <div>
                    <h3>{req.user?.username}</h3>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                    {req.status === 'Pending' ? (
                      <>
                        <button
                          className="select-btn"
                          onClick={() => handleSelectRequest(req)}
                        >
                          {selectedRequest?.request_id === req.request_id ? '✓ Selected' : 'Select'}
                        </button>
                        <button
                          className="admin-reject-btn"
                          onClick={() => openRejectModal(req.request_id)}
                        >
                          ✕ Reject
                        </button>
                      </>
                    ) : (
                      <span className={`status-badge status-${req.status?.toLowerCase().replace(/[^a-z]/g, '-')}`} style={{ margin: 0 }}>
                        {req.status === 'AdminRejected' ? '🚫 Admin Rejected'
                          : req.status === 'BrokerRejected' ? '⚠️ Broker Rejected'
                            : req.status === 'BrokerRejectionConfirmed' ? '❌ Rejection Confirmed'
                              : req.status}
                      </span>
                    )}
                  </div>
                </div>

                <div className="request-info">
                  <div className="info-row">
                    <span className="label">📧 Email:</span>
                    <span className="value">{req.user?.emali}</span>
                  </div>
                  <div className="info-row">
                    <span className="label">📱 Mobile:</span>
                    <span className="value">{req.user?.moblie_no}</span>
                  </div>
                  <div className="info-row">
                    <span className="label">📍 Address:</span>
                    <span className="value">{req.user?.address}</span>
                  </div>
                  <div className="info-row">
                    <span className="label">📮 Pincode:</span>
                    <span className="value highlight">{req.user?.pincode}</span>
                  </div>
                  <div className="divider"></div>
                  <div className="info-row">
                    <span className="label">📦 Stock (mound):</span>
                    <span className="value">{req.stock_per_mound}</span>
                  </div>
                  <div className="info-row">
                    <span className="label">💳 Payment:</span>
                    <span className="value">{req.payment_method || 'Cash'}</span>
                  </div>
                  <div className="info-row">
                    <span className="label">💰 Customer Price:</span>
                    <span className="value">₹{req.customer_price}</span>
                  </div>
                  <div className="info-row">
                    <span className="label">Our Price:</span>
                    <span className="value">₹{req.our_price}</span>
                  </div>

                  {/* Admin Rejection Info */}
                  {req.status === 'AdminRejected' && (
                    <div className="rejection-info-box admin-rejection-box">
                      <strong>🚫 Admin Rejected</strong>
                      <p><span className="rj-label">Reason:</span> {req.admin_reject_reason}</p>
                      {req.admin_reject_comment && (
                        <p><span className="rj-label">Comment:</span> {req.admin_reject_comment}</p>
                      )}
                    </div>
                  )}

                  {req.broker && (
                    <>
                      <div className="divider"></div>
                      <div className="info-row">
                        <span className="label">🤝 Assigned Broker:</span>
                        <span className="value dark-value font-bold">{req.broker.username}</span>
                      </div>
                    </>
                  )}

                  {/* Schedule info */}
                  {req.visit_day && req.visit_time && (
                    <div className="schedule-box">
                      <strong>📅 Visit Scheduled:</strong>
                      <p>{new Date(req.visit_day).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })} at {req.visit_time}</p>
                    </div>
                  )}

                  {/* Reached timestamp */}
                  {req.reached_at && (
                    <div className="reached-box">
                      <strong>📍 Broker Reached:</strong>
                      <p>{formatDateTime(req.reached_at)}</p>
                    </div>
                  )}

                  {/* Broker Rejection Panel — admin review */}
                  {req.status === 'BrokerRejected' && (
                    <div className="broker-rejection-review-box">
                      <strong>⚠️ Broker Rejected Product</strong>
                      <p><span className="rj-label">Reason:</span> {req.broker_reject_reason}</p>
                      {req.broker_reject_comment && (
                        <p><span className="rj-label">Comment:</span> {req.broker_reject_comment}</p>
                      )}
                      {req.broker_reject_photos && (() => {
                        try {
                          const photos = JSON.parse(req.broker_reject_photos);
                          if (photos.length > 0) return (
                            <div className="reject-photos">
                              <strong>Sample Photos:</strong>
                              <div className="photos-grid">
                                {photos.map((p, i) => (
                                  <a key={i} href={p} target="_blank" rel="noreferrer">
                                    <img src={p} alt={`Rejection ${i + 1}`} />
                                  </a>
                                ))}
                              </div>
                            </div>
                          );
                        } catch { return null; }
                        return null;
                      })()}
                      <div className="broker-rejection-actions">
                        <button
                          className="confirm-reject-btn"
                          onClick={() => handleConfirmBrokerRejection(req.request_id)}
                        >
                          ✓ Confirm & Notify User
                        </button>
                        <button
                          className="override-reject-btn"
                          onClick={() => handleOverrideBrokerRejection(req)}
                        >
                          🔄 Assign Another Broker
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Broker Rejection Confirmed Info */}
                  {req.status === 'BrokerRejectionConfirmed' && (
                    <div className="rejection-info-box broker-confirmed-box">
                      <strong>❌ Rejection Forwarded to User</strong>
                      <p><span className="rj-label">Broker Reason:</span> {req.broker_reject_reason}</p>
                      {req.broker_reject_comment && (
                        <p><span className="rj-label">Comment:</span> {req.broker_reject_comment}</p>
                      )}
                    </div>
                  )}

                  {/* Completed visit report */}
                  {req.is_visited && req.status === 'Completed' && (
                    <div className="visit-report-box">
                      <strong>📝 Visit Report</strong>
                      <p><strong>Final Deal Price:</strong> ₹{req.final_price ?? 'N/A'}</p>
                      <p><strong>Delivered:</strong> {req.delivered_quantity ?? 'N/A'}</p>
                      <p><strong>Broker note:</strong> {req.broker_comments || 'No remarks'}</p>
                      {req.sample_photos && (() => {
                        try {
                          const photos = JSON.parse(req.sample_photos);
                          if (photos.length > 0) return (
                            <div style={{ marginTop: '10px' }}>
                              <strong>Sample Photos:</strong>
                              <div style={{ display: 'flex', gap: '10px', marginTop: '5px', flexWrap: 'wrap' }}>
                                {photos.map((photo, i) => (
                                  <a key={i} href={photo} target="_blank" rel="noreferrer">
                                    <img src={photo} alt={`Sample ${i + 1}`} style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #ddd' }} />
                                  </a>
                                ))}
                              </div>
                            </div>
                          );
                        } catch { return null; }
                        return null;
                      })()}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ===== Admin Reject Modal ===== */}
      {rejectModalRequestId && (
        <div className="admin-reject-modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setRejectModalRequestId(null); }}>
          <div className="admin-reject-modal slide-up">
            <div className="modal-header">
              <h3>🚫 Reject Selling Request</h3>
              <button className="close-modal-btn" onClick={() => setRejectModalRequestId(null)}>✕</button>
            </div>
            <p className="modal-subtitle">Please provide a reason for rejecting this request. The user will see this message.</p>
            {rejectMsg && (
              <div className={`msg ${rejectMsg.includes('✅') ? 'success' : 'error'}`}>{rejectMsg}</div>
            )}
            <div className="form-group">
              <label>Reason <span style={{ color: 'red' }}>*</span></label>
              <input
                type="text"
                className="animated-input"
                placeholder="e.g. Price too high, Stock quantity mismatch..."
                value={rejectForm.reason}
                onChange={(e) => setRejectForm({ ...rejectForm, reason: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Additional Comment</label>
              <textarea
                className="animated-input"
                placeholder="Optional: add more detail..."
                rows={3}
                value={rejectForm.comment}
                onChange={(e) => setRejectForm({ ...rejectForm, comment: e.target.value })}
              />
            </div>
            <div className="modal-actions">
              <button
                className="confirm-reject-btn"
                onClick={handleAdminReject}
                disabled={rejectLoading}
              >
                {rejectLoading ? 'Rejecting...' : '🚫 Reject Request'}
              </button>
              <button className="cancel-btn" onClick={() => setRejectModalRequestId(null)}>
                ✕ Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== Broker Assignment Panel ===== */}
      {selectedRequest && (
        <div className="broker-selection-panel slide-up-panel">
          <div className="panel-header">
            <h3>🤝 Assign Broker to {selectedRequest.user?.username}</h3>
            <button onClick={() => setSelectedRequest(null)} className="close-panel">✕</button>
          </div>

          {message && (
            <div className={`msg ${message.includes('✅') ? 'success' : 'error'}`}>{message}</div>
          )}

          <div className="broker-search-info">
            <p>📮 Searching brokers for pincode: <strong>{selectedRequest.user?.pincode}</strong></p>
          </div>

          {brokersByPincode.length === 0 ? (
            <div className="no-brokers">
              <p>❌ No verified brokers found for pincode {selectedRequest.user?.pincode}</p>
            </div>
          ) : (
            <div className="brokers-list">
              <h4>Brokers in Pincode {selectedRequest.user?.pincode}:</h4>
              {brokersByPincode.map((broker) => (
                <div
                  key={broker.user_id || broker.broker_id}
                  className={`broker-option ${(selectedBroker?.user_id || selectedBroker?.broker_id) === (broker.user_id || broker.broker_id) ? 'selected' : ''}`}
                  onClick={() => { setSelectedBroker(broker); setMessage(''); }}
                >
                  <div className="broker-radio">
                    <input type="radio" name="broker" checked={(selectedBroker?.user_id || selectedBroker?.broker_id) === (broker.user_id || broker.broker_id)} readOnly />
                  </div>
                  <div className="broker-details">
                    <h4>{broker.username || broker.name}</h4>
                    <p>📧 {broker.emali || broker.email}</p>
                    <p>📱 {broker.moblie_no || broker.mobile_no} | 📮 {broker.pincode}</p>
                    <p>💼 Commission: {broker.commission_percent}%</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {otherActiveBrokers.length > 0 && (
            <div className="brokers-list" style={{ marginTop: '20px' }}>
              <h4>Other Active Brokers (Alternative Options):</h4>
              {otherActiveBrokers.map((broker) => (
                <div
                  key={broker.user_id || broker.broker_id}
                  className={`broker-option ${(selectedBroker?.user_id || selectedBroker?.broker_id) === (broker.user_id || broker.broker_id) ? 'selected' : ''}`}
                  onClick={() => { setSelectedBroker(broker); setMessage(''); }}
                >
                  <div className="broker-radio">
                    <input type="radio" name="broker" checked={(selectedBroker?.user_id || selectedBroker?.broker_id) === (broker.user_id || broker.broker_id)} readOnly />
                  </div>
                  <div className="broker-details">
                    <h4>{broker.username || broker.name}</h4>
                    <p>📧 {broker.emali || broker.email}</p>
                    <p>📱 {broker.moblie_no || broker.mobile_no} | 📮 {broker.pincode}</p>
                    <p>💼 Commission: {broker.commission_percent}%</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="panel-actions">
            <button onClick={() => handleAssignBroker()} className="assign-btn" disabled={!selectedBroker || !selectedRequest}>
              ✓ Assign Broker
            </button>
            <button onClick={() => setSelectedRequest(null)} className="cancel-btn">
              ✕ Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSellingRequests;
