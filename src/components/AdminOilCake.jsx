import React, { useState, useEffect } from 'react';
import './AdminSellingRequests.css';

const STATUS_COLORS = {
  Pending: { bg: '#fff3cd', color: '#856404' },
  Confirmed: { bg: '#cce5ff', color: '#004085', label: 'Accepted' },
  Processing: { bg: '#d1ecf1', color: '#0c5460' },
  Delivered: { bg: '#d4edda', color: '#155724' },
  Cancelled: { bg: '#f8d7da', color: '#721c24' },
  Rejected: { bg: '#f8d7da', color: '#721c24' },
};

const AdminOilCake = () => {
  const [priceData, setPriceData] = useState({ price_per_kg: '', min_quantity_kg: 20, is_available: true });
  const [priceMsg, setPriceMsg] = useState('');
  const [savingPrice, setSavingPrice] = useState(false);

  const [requests, setRequests] = useState([]);
  const [loadingReqs, setLoadingReqs] = useState(true);
  const [reqError, setReqError] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  const [adminNotes, setAdminNotes] = useState({});
  const [updatingId, setUpdatingId] = useState(null);
  const [requestModes, setRequestModes] = useState({}); // { id: 'accepting' | 'rejecting' }

  const [activeSection, setActiveSection] = useState('price');

  // --- fetch price ---
  useEffect(() => {
    fetch('http://localhost:5000/api/oil-cake/price')
      .then(r => r.json())
      .then(d => setPriceData({
        price_per_kg: d.price_per_kg ?? '',
        min_quantity_kg: d.min_quantity_kg ?? 20,
        is_available: d.is_available ?? true
      }))
      .catch(() => { });
  }, []);

  // --- fetch requests ---
  const fetchRequests = () => {
    setLoadingReqs(true);
    fetch('http://localhost:5000/api/admin/oil-cake/requests')
      .then(r => r.json())
      .then(d => { setRequests(d); setReqError(''); })
      .catch(e => setReqError(e.message))
      .finally(() => setLoadingReqs(false));
  };
  useEffect(fetchRequests, []);

  const handleSavePrice = async () => {
    setSavingPrice(true);
    setPriceMsg('');
    try {
      const priceVal = parseFloat(priceData.price_per_kg);
      const minQtyVal = parseFloat(priceData.min_quantity_kg);

      if (isNaN(priceVal)) {
        setPriceMsg('  Please enter a valid price.');
        setSavingPrice(false);
        return;
      }

      const res = await fetch('http://localhost:5000/api/admin/oil-cake/price', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          price_per_kg: priceVal,
          min_quantity_kg: isNaN(minQtyVal) ? 20 : minQtyVal,
          is_available: priceData.is_available
        })
      });

      const contentType = res.headers.get("content-type");
      if (contentType && contentType.indexOf("application/json") !== -1) {
        const data = await res.json();
        setPriceMsg(res.ok ? '  ' + data.message : '  ' + (data.message || 'Error saving price'));
      } else {
        const text = await res.text();
        console.error("Server returned non-JSON response:", text);
        setPriceMsg('  Server error: Received unexpected response format.');
      }
    } catch (e) {
      setPriceMsg('  ' + e.message);
    } finally {
      setSavingPrice(false);
    }
  };

  const handleStatusUpdate = async (id, newStatus) => {
    setUpdatingId(id);
    try {
      const res = await fetch(`http://localhost:5000/api/admin/oil-cake/requests/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, admin_note: adminNotes[id] || '' })
      });
      if (res.ok) {
        setRequests(prev => prev.map(r => r.id === id ? { ...r, status: newStatus, admin_note: adminNotes[id] || r.admin_note } : r));
      }
    } catch { }
    setUpdatingId(null);
  };

  const handleSaveNote = async (id) => {
    handleStatusUpdate(id, requests.find(r => r.id === id)?.status);
  };

  const statusCount = (st) => requests.filter(r => r.status === st).length;

  return (
    <div className="admin-wrapper" style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h2 style={{ margin: 0, color: '#2c3e50' }}>  Oil Cake Management</h2>
          <p style={{ margin: '4px 0 0', color: '#666', fontSize: '0.9rem' }}>Set price and manage customer purchase requests</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => setActiveSection('price')}
            style={{ padding: '8px 18px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: '600', background: activeSection === 'price' ? '#2c3e50' : '#ecf0f1', color: activeSection === 'price' ? 'white' : '#2c3e50' }}
          >
            Price Settings
          </button>
          <button
            onClick={() => setActiveSection('orders')}
            style={{ padding: '8px 18px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: '600', background: activeSection === 'orders' ? '#2c3e50' : '#ecf0f1', color: activeSection === 'orders' ? 'white' : '#2c3e50' }}
          >
            Purchase Requests ({requests.length})
          </button>
        </div>
      </div>

      {/* ===== PRICE SETTINGS ===== */}
      {activeSection === 'price' && (
        <div style={{ background: 'white', borderRadius: '10px', padding: '30px', boxShadow: '0 2px 12px rgba(0,0,0,0.07)', maxWidth: '520px' }}>
          <h3 style={{ marginTop: 0, marginBottom: '20px', color: '#2c3e50', borderBottom: '2px solid #f0f0f0', paddingBottom: '10px' }}>
            Oil Cake Price Configuration
          </h3>

          {priceMsg && (
            <div style={{ padding: '10px 14px', borderRadius: '6px', marginBottom: '16px', background: priceMsg.includes(' ') ? '#d4edda' : '#f8d7da', color: priceMsg.includes(' ') ? '#155724' : '#721c24', fontWeight: '500' }}>
              {priceMsg}
            </div>
          )}

          <div style={{ marginBottom: '18px' }}>
            <label style={{ display: 'block', fontWeight: '600', marginBottom: '6px', color: '#555' }}>Price per KG (₹) <span style={{ color: 'red' }}>*</span></label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={priceData.price_per_kg}
              onChange={e => setPriceData({ ...priceData, price_per_kg: e.target.value })}
              className="animated-input"
              style={{ width: '100%', padding: '10px 14px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '1rem', boxSizing: 'border-box' }}
              placeholder="e.g. 25.00"
            />
          </div>

          <div style={{ marginBottom: '18px' }}>
            <label style={{ display: 'block', fontWeight: '600', marginBottom: '6px', color: '#555' }}>Minimum Order Quantity (KG)</label>
            <input
              type="number"
              min="1"
              step="1"
              value={priceData.min_quantity_kg}
              onChange={e => setPriceData({ ...priceData, min_quantity_kg: e.target.value })}
              className="animated-input"
              style={{ width: '100%', padding: '10px 14px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '1rem', boxSizing: 'border-box' }}
              placeholder="Minimum 20"
            />
            <small style={{ color: '#888' }}>Default minimum is 20 KG per order</small>
          </div>

          <div style={{ marginBottom: '22px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <label style={{ fontWeight: '600', color: '#555' }}>Availability:</label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={!!priceData.is_available}
                onChange={e => setPriceData({ ...priceData, is_available: e.target.checked })}
                style={{ width: '18px', height: '18px' }}
              />
              <span style={{ fontWeight: '500', color: priceData.is_available ? '#27ae60' : '#e74c3c' }}>
                {priceData.is_available ? '  Available for Purchase' : '  Currently Unavailable'}
              </span>
            </label>
          </div>

          <button
            onClick={handleSavePrice}
            disabled={savingPrice || !priceData.price_per_kg}
            style={{ padding: '11px 28px', background: '#27ae60', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '700', fontSize: '0.95rem' }}
          >
            {savingPrice ? 'Saving...' : ' Save Price Settings'}
          </button>
        </div>
      )}

      {/* ===== PURCHASE REQUESTS ===== */}
      {activeSection === 'orders' && (
        <div>
          {/* Summary Stats */}
          <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
            {Object.entries(STATUS_COLORS).map(([st, { bg, color }]) => (
              <div key={st} style={{ background: bg, color, padding: '10px 18px', borderRadius: '8px', fontWeight: '600', fontSize: '0.9rem' }}>
                {st}: {statusCount(st)}
              </div>
            ))}
          </div>

          {loadingReqs ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>Loading requests...</div>
          ) : reqError ? (
            <div style={{ background: '#f8d7da', color: '#721c24', padding: '14px', borderRadius: '6px' }}>Error: {reqError}</div>
          ) : requests.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#999', background: 'white', borderRadius: '10px' }}>
              <div style={{ fontSize: '2.5rem' }}> </div>
              <p>No oil cake purchase requests yet.</p>
            </div>
          ) : (
            <div style={{ background: 'white', borderRadius: '10px', overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.07)' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead style={{ background: '#f4f6f8' }}>
                  <tr>
                    {['ID', 'Customer', 'Qty (KG)', 'Rate', 'Total', 'Date', 'Status', 'Actions'].map(h => (
                      <th key={h} style={{ padding: '12px 16px', textAlign: 'left', borderBottom: '2px solid #e9ecef', fontSize: '0.85rem', color: '#555', fontWeight: '600' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {requests.map(req => (
                    <React.Fragment key={req.id}>
                      <tr style={{ borderBottom: '1px solid #f0f0f0', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = '#fafbfc'} onMouseLeave={e => e.currentTarget.style.background = 'white'}>
                        <td style={{ padding: '12px 16px', fontWeight: '600' }}>#{req.id}</td>
                        <td style={{ padding: '12px 16px' }}>
                          <div style={{ fontWeight: '600' }}>{req.user?.username || 'N/A'}</div>
                          <div style={{ fontSize: '0.8rem', color: '#888' }}>{req.user?.moblie_no || ''}</div>
                        </td>
                        <td style={{ padding: '12px 16px', fontWeight: '600' }}>{req.quantity_kg} KG</td>
                        <td style={{ padding: '12px 16px' }}>₹{req.price_per_kg}/kg</td>
                        <td style={{ padding: '12px 16px', fontWeight: '700', color: '#27ae60' }}>₹{req.total_amount}</td>
                        <td style={{ padding: '12px 16px', fontSize: '0.85rem', color: '#666' }}>{new Date(req.created_at).toLocaleDateString()}</td>
                        <td style={{ padding: '12px 16px' }}>
                          {req.status === 'Pending' ? (
                            <div style={{ display: 'flex', gap: '8px' }}>
                              <button
                                onClick={() => setRequestModes({ ...requestModes, [req.id]: 'accepting' })}
                                style={{ padding: '6px 12px', background: requestModes[req.id] === 'accepting' ? '#2ecc71' : '#ecf0f1', color: requestModes[req.id] === 'accepting' ? 'white' : '#27ae60', border: '1px solid #27ae60', borderRadius: '4px', cursor: 'pointer', fontWeight: '600', fontSize: '0.8rem' }}
                              >
                                Accept
                              </button>
                              <button
                                onClick={() => {
                                  setRequestModes({ ...requestModes, [req.id]: 'rejecting' });
                                  setExpandedId(req.id); // Show note field immediately for reject
                                }}
                                style={{ padding: '6px 12px', background: requestModes[req.id] === 'rejecting' ? '#e74c3c' : '#ecf0f1', color: requestModes[req.id] === 'rejecting' ? 'white' : '#c0392b', border: '1px solid #c0392b', borderRadius: '4px', cursor: 'pointer', fontWeight: '600', fontSize: '0.8rem' }}
                              >
                                Reject
                              </button>
                            </div>
                          ) : (
                            <span style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '700', background: STATUS_COLORS[req.status]?.bg || '#eee', color: STATUS_COLORS[req.status]?.color || '#333' }}>
                              {req.status === 'Confirmed' ? 'Accepted' : (STATUS_COLORS[req.status]?.label || req.status)}
                            </span>
                          )}
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          {req.status === 'Pending' && requestModes[req.id] === 'accepting' ? (
                            <button
                              onClick={() => setExpandedId(expandedId === req.id ? null : req.id)}
                              style={{ padding: '6px 12px', background: '#3498db', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem' }}
                            >
                              {expandedId === req.id ? 'Hide Details' : 'Details'}
                            </button>
                          ) : (
                            req.status !== 'Pending' && (
                              <button
                                onClick={() => setExpandedId(expandedId === req.id ? null : req.id)}
                                style={{ padding: '6px 12px', background: '#3498db', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem' }}
                              >
                                {expandedId === req.id ? 'Hide' : 'View'}
                              </button>
                            )
                          )}
                        </td>
                      </tr>

                      {expandedId === req.id && (
                        <tr style={{ background: '#f8f9fa' }}>
                          <td colSpan="8" style={{ padding: '20px 24px', borderBottom: '2px solid #e9ecef' }}>
                            <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap' }}>
                              <div style={{ flex: 1, minWidth: '240px' }}>
                                <h4 style={{ marginTop: 0, color: '#2c3e50', borderBottom: '1px solid #ddd', paddingBottom: '8px' }}>📋 Order Details</h4>
                                <p style={{ margin: '5px 0', fontSize: '0.9rem' }}><strong>Customer:</strong> {req.user?.username}</p>
                                <p style={{ margin: '5px 0', fontSize: '0.9rem' }}><strong>Email:</strong> {req.user?.emali}</p>
                                <p style={{ margin: '5px 0', fontSize: '0.9rem' }}><strong>Phone:</strong> {req.contact_number}</p>
                                <p style={{ margin: '5px 0', fontSize: '0.9rem' }}><strong>Delivery Address:</strong> {req.delivery_address}</p>
                                {req.notes && <p style={{ margin: '5px 0', fontSize: '0.9rem' }}><strong>Notes:</strong> {req.notes}</p>}
                                <p style={{ margin: '5px 0', fontSize: '0.9rem' }}><strong>Requested At:</strong> {new Date(req.created_at).toLocaleString()}</p>
                              </div>
                              <div style={{ flex: 1, minWidth: '240px' }}>
                                <h4 style={{ marginTop: 0, color: '#2c3e50', borderBottom: '1px solid #ddd', paddingBottom: '8px' }}>  Pricing</h4>
                                <p style={{ margin: '5px 0', fontSize: '0.9rem' }}><strong>Quantity:</strong> {req.quantity_kg} KG</p>
                                <p style={{ margin: '5px 0', fontSize: '0.9rem' }}><strong>Rate at Order:</strong> ₹{req.price_per_kg}/kg</p>
                                <p style={{ margin: '5px 0', fontSize: '1.05rem', color: '#27ae60' }}><strong>Total Amount:</strong> ₹{req.total_amount}</p>

                                <h4 style={{ color: '#2c3e50', borderBottom: '1px solid #ddd', paddingBottom: '8px' }}>  {requestModes[req.id] === 'rejecting' ? 'Rejection Reason' : 'Admin Note'}</h4>
                                <textarea
                                  rows={3}
                                  placeholder={requestModes[req.id] === 'rejecting' ? "Enter reason for rejection..." : "Add a note for this order (optional)..."}
                                  value={adminNotes[req.id] !== undefined ? adminNotes[req.id] : (req.admin_note || '')}
                                  onChange={e => setAdminNotes(prev => ({ ...prev, [req.id]: e.target.value }))}
                                  style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc', resize: 'vertical', fontSize: '0.9rem', boxSizing: 'border-box' }}
                                />
                                {req.status === 'Pending' ? (
                                  <button
                                    onClick={() => handleStatusUpdate(req.id, requestModes[req.id] === 'accepting' ? 'Confirmed' : 'Rejected')}
                                    disabled={updatingId === req.id}
                                    style={{ marginTop: '8px', padding: '8px 20px', background: requestModes[req.id] === 'accepting' ? '#27ae60' : '#e74c3c', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: '700' }}
                                  >
                                    {updatingId === req.id ? 'Saving...' : (requestModes[req.id] === 'accepting' ? '💾 Save Note & Accept' : '  Save & Reject')}
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => handleSaveNote(req.id)}
                                    style={{ marginTop: '8px', padding: '7px 16px', background: '#27ae60', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: '600' }}
                                  >
                                    💾 Save Note
                                  </button>
                                )}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminOilCake;
