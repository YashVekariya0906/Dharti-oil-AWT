import React, { useState } from 'react';
import './WishlistDrawer.css';

const CartDrawer = ({ cart, setCart, onClose, user, directCheckout }) => {
  const [isCheckingOut, setIsCheckingOut] = useState(directCheckout || false);
  const [shippingAddress, setShippingAddress] = useState(user?.address ? `${user.address}, ${user.pincode}` : '');
  const [contactNumber, setContactNumber] = useState(user?.moblie_no || '');
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);

  const cartTotal = cart.reduce((total, item) => total + (item.product_price * item.quantity), 0);

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

  const placeOrder = async () => {
    if (!shippingAddress.trim() || !contactNumber.trim()) {
      alert("Please provide a shipping address and contact number.");
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
          total_amount: cartTotal,
          shipping_address: shippingAddress,
          contact_number: contactNumber
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
              <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <button 
                  onClick={() => setIsCheckingOut(false)} 
                  style={{ background: 'none', border: 'none', color: '#0073e6', cursor: 'pointer', marginBottom: '20px', textAlign: 'left', fontWeight: 'bold', padding: 0 }}
                >
                  &larr; Back to Cart
                </button>
                
                <h3 style={{ marginBottom: '15px', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>Shipping Details</h3>
                
                <div style={{ marginBottom: '15px' }}>
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

                <div style={{ marginTop: 'auto', backgroundColor: '#f9f9f9', padding: '15px', borderRadius: '6px', border: '1px solid #eee' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', color: '#555' }}>
                    <span>Items ({cart.length}):</span>
                    <span>₹{cartTotal.toLocaleString()}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', fontSize: '1.2rem', fontWeight: 'bold', color: '#333' }}>
                    <span>Total:</span>
                    <span>₹{cartTotal.toLocaleString()}</span>
                  </div>
                  <button 
                    onClick={placeOrder}
                    disabled={isPlacingOrder}
                    style={{ width: '100%', padding: '14px', backgroundColor: isPlacingOrder ? '#95a5a6' : '#e74c3c', color: 'white', border: 'none', borderRadius: '4px', fontSize: '1rem', fontWeight: 'bold', cursor: isPlacingOrder ? 'not-allowed' : 'pointer' }}
                  >
                    {isPlacingOrder ? 'PLACING ORDER...' : 'CONFIRM & PLACE ORDER'}
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
