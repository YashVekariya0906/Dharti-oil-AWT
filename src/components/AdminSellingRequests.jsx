import React, { useState, useEffect } from 'react';
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
      // Filter only Active brokers
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
    // Fetch all active brokers and separate by pincode match
    fetchActiveBrokers(request.user.pincode);
  };

  const handleAssignBroker = async (brokerParam) => {
    const broker = brokerParam || selectedBroker;
    if (!broker) {
      setMessage('Please choose a broker first.');
      return;
    }
    if (!selectedRequest) {
      setMessage('Please select a selling request before assigning.');
      return;
    }

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
        const errMsg = data?.message || data?.error || 'Failed to assign broker';
        setMessage('❌ ' + errMsg);
      }
    } catch (error) {
      setMessage('❌ Assignment error: ' + error.message);
    }
  };

  const filteredRequests = requests.filter(req => {
    if (activeTab === 'pending') return req.status === 'Pending';
    if (activeTab === 'accepted') return req.status === 'Accepted';
    if (activeTab === 'scheduled') return req.status === 'Scheduled';
    return true;
  });

  return (
    <div className="admin-selling-container fade-in">
      <div className="admin-selling-header">
        <h2>📦 Selling Requests Management</h2>
        <button onClick={fetchSellingRequests} className="refresh-btn">🔄 Refresh</button>
      </div>

      <div className="selling-tabs">
        <button 
          className={`tab-btn ${activeTab === 'pending' ? 'active' : ''}`}
          onClick={() => setActiveTab('pending')}
        >
          ⏳ Pending ({requests.filter(r => r.status === 'Pending').length})
        </button>
        <button 
          className={`tab-btn ${activeTab === 'accepted' ? 'active' : ''}`}
          onClick={() => setActiveTab('accepted')}
        >
          ✅ Accepted ({requests.filter(r => r.status === 'Accepted').length})
        </button>
        <button 
          className={`tab-btn ${activeTab === 'scheduled' ? 'active' : ''}`}
          onClick={() => setActiveTab('scheduled')}
        >
          📅 Scheduled ({requests.filter(r => r.status === 'Scheduled').length})
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
                    <span className={`status-badge ${req.status?.toLowerCase()}`}>{req.status}</span>
                  </div>
                  <button 
                    className="select-btn"
                    onClick={() => handleSelectRequest(req)}
                  >
                    {selectedRequest?.request_id === req.request_id ? '✓ Selected' : 'Select'}
                  </button>
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
                    <span className="label">💰 Customer Price:</span>
                    <span className="value">₹{req.customer_price}</span>
                  </div>
                  <div className="info-row">
                    <span className="label">Our Price:</span>
                    <span className="value">₹{req.our_price}</span>
                  </div>

                  {req.broker && (
                    <>
                      <div className="divider"></div>
                      <div className="info-row">
                        <span className="label">🤝 Assigned Broker:</span>
                        <span className="value">{req.broker.name}</span>
                      </div>
                    </>
                  )}

                  {req.visit_date && req.visit_time && (
                    <div className="schedule-box">
                      <strong>📅 Visit Scheduled:</strong>
                      <p>{new Date(req.visit_date).toLocaleDateString()} at {req.visit_time}</p>
                    </div>
                  )}

                  {req.is_visited && (
                    <div className="visit-report-box">
                      <strong>📝 Visit Report</strong>
                      <p><strong>Delivered:</strong> {req.delivered_quantity ?? 'N/A'}</p>
                      <p><strong>Broker note:</strong> {req.broker_comments || 'No remarks'}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedRequest && (
        <div className="broker-selection-panel slide-up-panel">
          <div className="panel-header">
            <h3>🤝 Assign Broker to {selectedRequest.user?.username}</h3>
            <button onClick={() => setSelectedRequest(null)} className="close-panel">✕</button>
          </div>

          {message && (
            <div className={`msg ${message.includes('✅') ? 'success' : 'error'}`}>
              {message}
            </div>
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
                  onClick={() => {
                    setSelectedBroker(broker);
                    setMessage('');
                  }}
                >
                  <div className="broker-radio">
                    <input 
                      type="radio" 
                      name="broker"
                      checked={(selectedBroker?.user_id || selectedBroker?.broker_id) === (broker.user_id || broker.broker_id)}
                      readOnly
                    />
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
                  onClick={() => {
                    setSelectedBroker(broker);
                    setMessage('');
                  }}
                >
                  <div className="broker-radio">
                    <input 
                      type="radio" 
                      name="broker"
                      checked={(selectedBroker?.user_id || selectedBroker?.broker_id) === (broker.user_id || broker.broker_id)}
                      readOnly
                    />
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
            <button 
              onClick={() => handleAssignBroker()} 
              className="assign-btn"
              disabled={!selectedBroker || !selectedRequest}
            >
              ✓ Assign Broker
            </button>
            <button 
              onClick={() => setSelectedRequest(null)} 
              className="cancel-btn"
            >
              ✕ Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSellingRequests;
