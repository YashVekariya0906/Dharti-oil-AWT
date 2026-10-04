import React from 'react';
import './WishlistDrawer.css';

const WishlistDrawer = ({ wishlist, setWishlist, onClose, onAddToCart }) => {
  const handleRemove = (product_id) => {
    setWishlist(wishlist.filter(item => item.product_id !== product_id));
  };

  return (
    <div className="wishlist-overlay" onClick={onClose}>
      <div className="wishlist-drawer fade-in-right" onClick={(e) => e.stopPropagation()}>
        <div className="wishlist-header">
          <h2>Wishlist</h2>
          <button className="close-drawer-btn" onClick={onClose}>&gt;</button>
        </div>
        <div className="wishlist-content">
          {wishlist.length === 0 ? (
            <p className="empty-msg">Your wishlist is currently empty.</p>
          ) : (
            wishlist.map(item => (
              <div key={item.product_id} className="wishlist-item">
                <div className="wishlist-item-img-container">
                  {item.product_image ? (
                    <img src={item.product_image} alt={item.product_name} />
                  ) : (
                    <div className="no-image-mini"></div>
                  )}
                </div>
                
                <div className="wishlist-item-details">
                  <div className="wishlist-item-top">
                    <h4>{item.product_name}</h4>
                    <button className="remove-item-btn" onClick={() => handleRemove(item.product_id)}>&times;</button>
                  </div>
                  
                  <div className="wishlist-price-row">
                    {item.product_discount > item.product_price && (
                      <span className="discount-price">₹{item.product_discount}</span>
                    )}
                    <span className="current-price">₹{item.product_price}</span>
                  </div>
                  
                  <button 
                    className="wishlist-add-cart-btn"
                    onClick={() => {
                      if (onAddToCart) {
                        onAddToCart(item);
                        handleRemove(item.product_id); // Optional: if added to cart, auto-remove from wishlist!
                      }
                    }}
                  >
                    ADD TO CART
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default WishlistDrawer;
