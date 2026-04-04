import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import './WishlistDrawer.css';

const CartDrawer = ({ cart, setCart, onClose, user, directCheckout }) => {
  const [isCheckingOut, setIsCheckingOut] = useState(directCheckout || false);
  const [shippingAddress, setShippingAddress] = useState(user?.address ? `${user.address}, ${user.pincode}` : '');
  const [contactNumber, setContactNumber] = useState(user?.moblie_no || '');
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);

  // New states for billing setup
  const [deliveryConfig, setDeliveryConfig] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('COD'); // 'COD' or 'ONLINE'

  const cartTotal = cart.reduce((total, item) => total + (item.product_price * item.quantity), 0);

  useEffect(() => {
    if (isCheckingOut) {
      fetchDeliveryConfig();
    }
  }, [isCheckingOut]);

  const fetchDeliveryConfig = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/delivery-charge');
      if (res.ok) {
        const data = await res.json();
        setDeliveryConfig(data);
      }
    } catch (error) {
      console.error('Error fetching delivery config:', error);
    }
  };

  const updateQuantity = (product_id, delta) => {
    setCart(cart.map(item => {
      if (item.product_id === product_id) {
        const newQty = item.quantity + delta;
        return { ...item, quantity: newQty > 0 ? newQty : 1 };
      }
      return item;
    }));
  };

  const handleRemove = (product_id) => {
    setCart(cart.filter(item => item.product_id !== product_id));
    if (cart.length === 1) setIsCheckingOut(false);
  };

  // Derive computations
  const cgstAmount = Number((cartTotal * 0.025).toFixed(2));
  const sgstAmount = Number((cartTotal * 0.025).toFixed(2));

  let deliveryChargeAmount = 0;
  if (deliveryConfig && user?.pincode) {
    const pin = String(user.pincode).trim();
    if (pin === '360001') deliveryChargeAmount = Number(deliveryConfig.charge_360001);
    else if (pin === '360002') deliveryChargeAmount = Number(deliveryConfig.charge_360002);
    else if (pin === '360003') deliveryChargeAmount = Number(deliveryConfig.charge_360003);
    else if (pin === '360004') deliveryChargeAmount = Number(deliveryConfig.charge_360004);
  }

  const finalTotalAmount = cartTotal + cgstAmount + sgstAmount + deliveryChargeAmount;

  // Setup UPI payload
  const upiId = deliveryConfig?.upi_id || '';
  const upiString = `upi://pay?pa=${upiId}&pn=Dharti%20Oil&am=${finalTotalAmount}&cu=INR`;

  const placeOrder = async () => {
    if (!shippingAddress.trim() || !contactNumber.trim()) {
      alert("Please provide a shipping address and contact number.");
      return;
    }
    
    if (paymentMethod === 'ONLINE' && !upiId) {
      alert("Online payment is not configured by the admin yet. Please select Cash on Delivery.");
      return;
    }

    try {
      setIsPlacingOrder(true);
      const res = await fetch('http://localhost:5000/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          user_id: user.user_id,
          items: cart,
          total_amount: finalTotalAmount,
          shipping_address: shippingAddress,
          contact_number: contactNumber,
          payment_method: paymentMethod,
          delivery_charge: deliveryChargeAmount,
          cgst: cgstAmount,
          sgst: sgstAmount
        })
      });

      const data = await res.json();
      if (res.ok) {
        setCart([]);
        setOrderSuccess(true);
      } else {
        alert(data.error || data.message || "Failed to place order.");
      }
    } catch (error) {
      console.error("Order error", error);
      alert("Network error while placing the order.");
    } finally {
      setIsPlacingOrder(false);
    }
  };

  return (
    <div className="wishlist-overlay" onClick={onClose}>
      <div className="wishlist-drawer fade-in-right" onClick={(e) => e.stopPropagation()}>
        <div className="wishlist-header" style={{ backgroundColor: '#2c3e50' }}>
          <h2>{isCheckingOut ? 'Checkout' : 'Shopping Cart'}</h2>
          <button className="close-drawer-btn" onClick={onClose}>&gt;</button>
        </div>

        {orderSuccess ? (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px', textAlign: 'center' }}>
            <h2 style={{ color: '#27ae60', fontSize: '2rem', marginBottom: '10px' }}>✓ Success!</h2>
            <p style={{ fontSize: '1.1rem', color: '#555', marginBottom: '20px' }}>Your order has been placed successfully. Thank you for shopping with Dharti Amrut!</p>
            <button onClick={onClose} style={{ padding: '10px 20px', backgroundColor: '#2c3e50', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '1rem' }}>
              Continue Shopping
            </button>
          </div>
        ) : (
          <div className="wishlist-content" style={{ display: 'flex', flexDirection: 'column' }}>
            {!isCheckingOut ? (
              <>
                <div style={{ flex: 1, overflowY: 'auto' }}>
                  {cart.length === 0 ? (
                    <p className="empty-msg">Your cart is currently empty.</p>
                  ) : (
                    cart.map(item => (
                      <div key={item.product_id} className="wishlist-item" style={{ position: 'relative' }}>
                        <div className="wishlist-item-img-container" style={{ width: 70, height: 70 }}>
                          {item.product_image ? (
                            <img src={item.product_image} alt={item.product_name} />
                          ) : (
                            <div className="no-image-mini"></div>
                          )}
                        </div>
                        
                        <div className="wishlist-item-details">
                          <div className="wishlist-item-top">
                            <h4 style={{ fontSize: '0.9rem' }}>{item.product_name}</h4>
                            <button className="remove-item-btn" onClick={() => handleRemove(item.product_id)}>&times;</button>
                          </div>
                          
                          <div className="wishlist-price-row" style={{ marginBottom: 8 }}>
                            <span className="current-price">₹{item.product_price}</span>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <button onClick={() => updateQuantity(item.product_id, -1)} style={qtyBtn}>-</button>
                            <span style={{ fontWeight: 'bold' }}>{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.product_id, 1)} style={qtyBtn}>+</button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                {cart.length > 0 && (
                  <div style={{ padding: '20px', borderTop: '1px solid #eee', backgroundColor: '#f9f9f9' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '15px' }}>
                      <span>Subtotal:</span>
                      <span>₹{cartTotal.toLocaleString()}</span>
                    </div>
                    <button 
                      onClick={() => setIsCheckingOut(true)}
                      style={{ width: '100%', padding: '12px', backgroundColor: '#27ae60', color: 'white', border: 'none', borderRadius: '4px', fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer' }}
                    >
                      PROCEED TO CHECKOUT
                    </button>
                  </div>
                )}
              </>
            ) : (
              // Checkout Form
              <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
                <button 
                  onClick={() => setIsCheckingOut(false)} 
                  style={{ background: 'none', border: 'none', color: '#0073e6', cursor: 'pointer', marginBottom: '20px', textAlign: 'left', fontWeight: 'bold', padding: 0 }}
                >
                  &larr; Back to Cart
                </button>
                
                <h3 style={{ marginBottom: '15px', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>Shipping Details</h3>
                
                <div style={{ marginBottom: '10px' }}>
                  <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '5px', color: '#555' }}>Contact Number</label>
                  <input 
                    type="text" 
                    value={contactNumber}
                    onChange={(e) => setContactNumber(e.target.value)}
                    style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}
                    placeholder="Enter mobile number"
                  />
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '5px', color: '#555' }}>Shipping Address</label>
                  <textarea 
                    value={shippingAddress}
                    onChange={(e) => setShippingAddress(e.target.value)}
                    rows="3"
                    style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px', resize: 'vertical' }}
                    placeholder="Enter full shipping address"
                  />
                </div>

                <h3 style={{ marginBottom: '15px', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>Payment Method</h3>
                <div style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}>
                    <input 
                      type="radio" 
                      value="COD" 
                      checked={paymentMethod === 'COD'} 
                      onChange={() => setPaymentMethod('COD')} 
                    />
                    Cash on Delivery
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}>
                    <input 
                      type="radio" 
                      value="ONLINE" 
                      checked={paymentMethod === 'ONLINE'} 
                      onChange={() => setPaymentMethod('ONLINE')} 
                    />
                    Online Payment
                  </label>
                </div>

                {paymentMethod === 'ONLINE' && (
                  <div style={{ backgroundColor: '#fff', border: '2px dashed #4caf50', borderRadius: '8px', padding: '15px', marginBottom: '20px', textAlign: 'center' }}>
                    <h4 style={{ margin: '0 0 10px 0', color: '#2e7d32' }}>Scan to Pay with UPI</h4>
                    <p style={{ fontSize: '0.85rem', color: '#666', marginBottom: '15px' }}>
                      Open Google Pay, PhonePe, or Paytm and scan the code below. The amount will be pre-filled automatically!
                    </p>
                    {upiId ? (
                      <div style={{ padding: '10px', background: 'white', display: 'inline-block', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
                         <QRCodeSVG value={upiString} size={150} level="H" />
                         <div style={{ marginTop: '10px', fontWeight: 'bold', color: '#333' }}>₹{finalTotalAmount.toFixed(2)}</div>
                      </div>
                    ) : (
                      <p style={{ color: 'red' }}>Online Payment is temporarily unavailable (UPI ID missing).</p>
                    )}
                  </div>
                )}

                <div style={{ marginTop: 'auto', backgroundColor: '#f9f9f9', padding: '15px', borderRadius: '6px', border: '1px solid #eee' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px', color: '#555', fontSize: '0.9rem' }}>
                    <span>Subtotal ({cart.length} items):</span>
                    <span>₹{cartTotal.toFixed(2)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px', color: '#555', fontSize: '0.9rem' }}>
                    <span>CGST (2.5%):</span>
                    <span>₹{cgstAmount.toFixed(2)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px', color: '#555', fontSize: '0.9rem' }}>
                    <span>SGST (2.5%):</span>
                    <span>₹{sgstAmount.toFixed(2)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', color: '#555', fontSize: '0.9rem' }}>
                    <span>Delivery Charge:</span>
                    <span>₹{deliveryChargeAmount.toFixed(2)}</span>
                  </div>
                  <div style={{ borderTop: '1px solid #ddd', margin: '10px 0' }}></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', fontSize: '1.2rem', fontWeight: 'bold', color: '#333' }}>
                    <span>Total Amount:</span>
                    <span style={{ color: '#27ae60' }}>₹{finalTotalAmount.toFixed(2)}</span>
                  </div>
                  <button 
                    onClick={placeOrder}
                    disabled={isPlacingOrder}
                    style={{ width: '100%', padding: '14px', backgroundColor: isPlacingOrder ? '#95a5a6' : '#27ae60', color: 'white', border: 'none', borderRadius: '4px', fontSize: '1rem', fontWeight: 'bold', cursor: isPlacingOrder ? 'not-allowed' : 'pointer', transition: 'background 0.3s' }}
                  >
                    {isPlacingOrder ? 'PROCESSING...' : 'CONFIRM & PLACE ORDER'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const qtyBtn = {
  width: '24px', 
  height: '24px', 
  borderRadius: '4px', 
  border: '1px solid #ddd', 
  background: 'white', 
  cursor: 'pointer', 
  display: 'flex', 
  justifyContent: 'center', 
  alignItems: 'center', 
  fontWeight: 'bold'
};

export default CartDrawer;
