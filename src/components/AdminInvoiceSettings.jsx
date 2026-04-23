import React, { useState, useEffect } from 'react';

export default function AdminInvoiceSettings() {
  const [formData, setFormData] = useState({
    companyName: '',
    addressLine1: '',
    addressLine2: '',
    gstin: '',
    bankName: '',
    accountNo: '',
    ifscCode: '',
    terms1: '',
    terms2: '',
    terms3: '',
    terms4: ''
  });
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch('http://localhost:5000/api/invoice-settings')
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data) {
          setFormData(data);
        }
      })
      .catch(console.error);
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('http://localhost:5000/api/admin/invoice-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setMessage("Invoice settings successfully updated!");
      } else {
        setMessage("Failed to update settings.");
      }
    } catch (err) {
      setMessage("Error updating data.");
    }
    setSubmitting(false);
  };

  const inputStyle = { width: '100%', padding: '10px', margin: '5px 0 15px', borderRadius: '4px', border: '1px solid #ddd' };

  return (
    <div style={{ background: 'white', padding: '30px', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
      <h2 style={{marginTop:0}}>Invoice Formatting & Data Management</h2>
      <p style={{ color: '#666', marginBottom: '20px' }}>Manage the Business details printed on all downloaded Customer Invoices and Purchase Memos.</p>
      
      {message && <div style={{ padding: '10px', borderRadius: '4px', marginBottom: '20px', background: message.includes('success') ? '#d4edda' : '#f8d7da', color: message.includes('success') ? '#155724' : '#721c24' }}>{message}</div>}
      
      <form onSubmit={handleSubmit}>
        
        <h3 style={{color: '#2c3e50'}}>Company Header Info</h3>
        <label>Company/Store Name</label>
        <input type="text" name="companyName" value={formData.companyName} onChange={handleChange} style={inputStyle} required />
        <label>Address Line 1</label>
        <input type="text" name="addressLine1" value={formData.addressLine1} onChange={handleChange} style={inputStyle} />
        <label>Address Line 2 (City, State, Pincode)</label>
        <input type="text" name="addressLine2" value={formData.addressLine2} onChange={handleChange} style={inputStyle} />
        <label>GSTIN Number</label>
        <input type="text" name="gstin" value={formData.gstin} onChange={handleChange} style={inputStyle} />

        <hr style={{margin: '20px 0', border: 'none', borderTop: '1px solid #eee'}} />

        <h3 style={{color: '#2c3e50'}}>Bank Details (For Payments)</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
          <div>
            <label>Bank Name</label>
            <input type="text" name="bankName" value={formData.bankName} onChange={handleChange} style={inputStyle} />
          </div>
          <div>
            <label>RTGS / IFSC Code</label>
            <input type="text" name="ifscCode" value={formData.ifscCode} onChange={handleChange} style={inputStyle} />
          </div>
        </div>
        <label>Bank Account Number</label>
        <input type="text" name="accountNo" value={formData.accountNo} onChange={handleChange} style={inputStyle} />

        <hr style={{margin: '20px 0', border: 'none', borderTop: '1px solid #eee'}} />
        
        <h3 style={{color: '#2c3e50'}}>Legal Terms & Conditions</h3>
        <label>Term 1</label>
        <input type="text" name="terms1" value={formData.terms1} onChange={handleChange} style={inputStyle} />
        <label>Term 2</label>
        <input type="text" name="terms2" value={formData.terms2} onChange={handleChange} style={inputStyle} />
        <label>Term 3</label>
        <input type="text" name="terms3" value={formData.terms3} onChange={handleChange} style={inputStyle} />
        <label>Term 4</label>
        <input type="text" name="terms4" value={formData.terms4} onChange={handleChange} style={inputStyle} />

        <button type="submit" disabled={submitting} style={{ background: '#3498db', color: 'white', border: 'none', padding: '12px 24px', fontSize: '16px', borderRadius: '4px', cursor: 'pointer', marginTop: '10px', fontWeight: 'bold' }}>
          {submitting ? 'Saving...' : 'Save Invoice Configuration'}
        </button>
      </form>
    </div>
  );
}
