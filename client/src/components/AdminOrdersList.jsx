import React, { useState, useEffect } from 'react';
import { confirmAction } from '../utils/confirmAlert';
import { generateTaxInvoice } from '../utils/invoiceGenerator';
import { FaDownload } from 'react-icons/fa';
import './AdminSellingRequests.css'; 

const AdminOrdersList = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedOrder, setExpandedOrder] = useState(null);

  const fetchOrders = async () => {
    try {
      const res = await fetch(import.meta.env.VITE_API_URL + '/api/admin/orders');
      if (!res.ok) throw new Error('Failed to fetch orders');
      const data = await res.json();
      setOrders(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const updateStatus = async (orderId, newStatus) => {
    const isConfirmed = await confirmAction(`Are you sure you want to change the status of Order #${orderId} to ${newStatus}?`);
    if (!isConfirmed) {
      // Re-fetch to reset the UI select element if they cancelled the prompt
      fetchOrders();
      return;
    }
    
    try {
      const res = await fetch(import.meta.env.VITE_API_URL + `/api/admin/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (!res.ok) throw new Error('Failed to update status');
      
      setOrders(orders.map(order => 
        order.order_id === orderId ? { ...order, status: newStatus } : order
      ));
    } catch (err) {
      alert(err.message);
    }
  };

  const toggleExpand = (orderId) => {
    if (expandedOrder === orderId) setExpandedOrder(null);
    else setExpandedOrder(orderId);
  };

  if (loading) return <div className="admin-wrapper">Loading orders...</div>;
  if (error) return <div className="admin-wrapper error">{error}</div>;

  return (
    <div className="admin-wrapper" style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ margin: 0 }}>E-Commerce Orders Management</h2>
        <button 
          onClick={fetchOrders} 
          style={{ 
            padding: '8px 16px', 
            backgroundColor: '#4CAF50', 
            color: 'white', 
            border: 'none', 
            borderRadius: '6px', 
            cursor: 'pointer', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '10px',
            fontSize: '0.9rem',
            fontWeight: 'bold',
            boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
          }}
        >
          <span style={{ 
            backgroundColor: '#2196F3', 
            borderRadius: '4px', 
            width: '24px', 
            height: '24px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            fontSize: '14px'
          }}>🔄</span>
          Refresh
        </button>
      </div>
      <div className="table-responsive" style={{ overflowX: 'auto', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
        <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ backgroundColor: '#f4f6f8' }}>
            <tr>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Order ID</th>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Customer</th>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Amount</th>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Date</th>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Status</th>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '20px' }}>No orders found.</td>
              </tr>
            ) : (
              orders.map(order => (
                <React.Fragment key={order.order_id}>
                  <tr style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '12px' }}>#{order.order_id}</td>
                    <td style={{ padding: '12px' }}>
                      <div style={{ fontWeight: 'bold' }}>{order.user?.username || 'Unknown'}</div>
                      <div style={{ fontSize: '0.85rem', color: '#666' }}>{order.user?.moblie_no || 'No Number'}</div>
                    </td>
                    <td style={{ padding: '12px', fontWeight: 'bold', color: '#27ae60' }}>₹{order.total_amount}</td>
                    <td style={{ padding: '12px', fontSize: '0.9rem' }}>{new Date(order.createdAt).toLocaleDateString()}</td>
                    <td style={{ padding: '12px' }}>
                      <select 
                        value={order.status}
                        onChange={(e) => updateStatus(order.order_id, e.target.value)}
                        style={{
                          padding: '6px 10px',
                          borderRadius: '4px',
                          border: '1px solid #ccc',
                          backgroundColor: order.status === 'Pending' ? '#fff3cd' : order.status === 'Delivered' ? '#d4edda' : order.status === 'Cancelled' ? '#f8d7da' : '#cce5ff',
                          color: '#333',
                          outline: 'none',
                          cursor: 'pointer'
                        }}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Processing">Processing</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td style={{ padding: '12px' }}>
                      <div style={{ display: 'flex', gap: '5px' }}>
                        <button 
                          onClick={() => toggleExpand(order.order_id)}
                          style={{ padding: '6px 12px', backgroundColor: '#3498db', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                        >
                          {expandedOrder === order.order_id ? 'Hide Details' : 'View Details'}
                        </button>
                        {order.status === 'Delivered' && (
                          <button 
                            onClick={async (e) => {
                              e.stopPropagation();
                              try {
                                const res = await fetch(import.meta.env.VITE_API_URL + '/api/invoice-settings');
                                const settings = res.ok ? await res.json() : null;
                                
                                const isTaxIncluded = !order.cgst; // Fallback if old order
                                
                                const calculatedItems = order.items.map(i => {
                                  const baseItemRate = isTaxIncluded ? (i.price_at_purchase / 1.05) : i.price_at_purchase;
                                  return {
                                    productName: i.product?.product_name || 'Groundnut Oil',
                                    hsn: "1508",
                                    qty: i.quantity,
                                    rate: baseItemRate,
                                    gstPercent: 5.00,
                                    amount: baseItemRate * i.quantity
                                  };
                                });

                                const subTotal = calculatedItems.reduce((acc, i) => acc + i.amount, 0);
                                const cgst = subTotal * 0.025;
                                const sgst = subTotal * 0.025;
                                const grandTotal = Number(order.total_amount);
                                const roundOff = grandTotal - (subTotal + cgst + sgst);

                                const invoiceData = {
                                  type: "TAX INVOICE",
                                  invoiceNo: `GT/EC-${order.order_id}`,
                                  date: new Date(order.createdAt).toLocaleDateString('en-GB'),
                                  customerName: order.user?.username || 'Customer',
                                  placeOfSupply: "24-Gujarat",
                                  items: calculatedItems,
                                  subTotal: subTotal,
                                  cgst: cgst,
                                  sgst: sgst,
                                  roundOff: roundOff,
                                  grandTotal: grandTotal
                                };
                                generateTaxInvoice(invoiceData, settings, true);
                              } catch (err) {
                                console.error("Error generating tax invoice:", err);
                              }
                            }}
                            style={{ padding: '6px 10px', backgroundColor: '#2c3e50', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}
                          >
                            <FaDownload /> INVOICE
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                  {expandedOrder === order.order_id && (
                    <tr style={{ backgroundColor: '#fafbfc' }}>
                      <td colSpan="6" style={{ padding: '20px', borderBottom: '2px solid #ddd' }}>
                        <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap' }}>
                          <div style={{ flex: '1', minWidth: '300px' }}>
                            <h4 style={{ marginBottom: '10px', color: '#2c3e50', borderBottom: '1px solid #ccc', paddingBottom: '5px' }}>Shipping Information</h4>
                            <p style={{ margin: '5px 0', fontSize: '0.9rem' }}><strong>Email:</strong> {order.user?.emali || 'N/A'}</p>
                            <p style={{ margin: '5px 0', fontSize: '0.9rem' }}><strong>Contact:</strong> {order.contact_number || 'N/A'}</p>
                            <p style={{ margin: '5px 0', fontSize: '0.9rem' }}><strong>Address:</strong> {order.shipping_address || 'N/A'}</p>
                          </div>
                          <div style={{ flex: '2', minWidth: '300px' }}>
                            <h4 style={{ marginBottom: '10px', color: '#2c3e50', borderBottom: '1px solid #ccc', paddingBottom: '5px' }}>Order Items ({order.items?.length || 0})</h4>
                            <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                              {order.items?.map(item => (
                                <div key={item.order_item_id} style={{ display: 'flex', alignItems: 'center', marginBottom: '10px', background: 'white', padding: '10px', borderRadius: '4px', border: '1px solid #eee' }}>
                                  <img src={item.product?.product_image} alt={item.product?.product_name || 'Product'} style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px', marginRight: '15px' }} />
                                  <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>{item.product?.product_name || 'Deleted Product'}</div>
                                    <div style={{ fontSize: '0.8rem', color: '#666' }}>₹{item.price_at_purchase} x {item.quantity}</div>
                                  </div>
                                  <div style={{ fontWeight: 'bold', fontSize: '0.95rem' }}>₹{item.price_at_purchase * item.quantity}</div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminOrdersList;
