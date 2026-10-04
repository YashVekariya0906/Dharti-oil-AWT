import React, { useState, useEffect } from 'react';

export default function AdminContactInquiries() {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(import.meta.env.VITE_API_URL + '/api/admin/contact-inquiries')
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch inquiries");
        return res.json();
      })
      .then(data => {
        setInquiries(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Loading inquiries...</div>;
  if (error) return <div style={{ color: 'red' }}>Error: {error}</div>;

  return (
    <div style={{ background: 'white', padding: '30px', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
      <h2 style={{ marginTop: 0 }}>User Contact Inquiries</h2>
      <p style={{ color: '#666', marginBottom: '20px' }}>Messages submitted by users via the Contact Us page.</p>

      {inquiries.length === 0 ? (
        <div style={{ padding: '20px', background: '#f8f9fa', borderRadius: '8px', textAlign: 'center', color: '#666' }}>
          No inquiries found.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {inquiries.map(inquiry => (
            <div key={inquiry.id} style={{ padding: '20px', border: '1px solid #eee', borderRadius: '8px', background: '#fafafa' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <h3 style={{ margin: 0, color: '#333', fontSize: '18px' }}>
                  {inquiry.first_name} {inquiry.last_name}
                </h3>
                <span style={{ fontSize: '12px', color: '#888' }}>
                  {new Date(inquiry.createdAt || inquiry.created_at).toLocaleString()}
                </span>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', marginBottom: '15px', fontSize: '14px', color: '#555' }}>
                <div><strong>Email:</strong> {inquiry.email}</div>
                <div><strong>Phone:</strong> {inquiry.phone}</div>
                <div><strong>User ID:</strong> {inquiry.user ? inquiry.user.user_id : 'N/A'}</div>
                <div><strong>User Name:</strong> {inquiry.user ? inquiry.user.username : 'N/A'}</div>
              </div>
              <div style={{ background: 'white', padding: '15px', borderRadius: '4px', borderLeft: '4px solid #4CAF50', fontSize: '15px', color: '#444', lineHeight: '1.5', whiteSpace: 'pre-wrap' }}>
                {inquiry.message || <em style={{ color: '#aaa' }}>No message body...</em>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
