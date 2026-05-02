import React, { useState, useEffect } from 'react';
import { FaHeart, FaRegHeart, FaShoppingCart } from 'react-icons/fa';
import './InfoPage.css';

export default function InfoPage({ product, onBack, onAddToCart, onBuyNow, onWishlistToggle, isWishlisted }) {
  const [info, setInfo] = useState(null);
  
  useEffect(() => {
    fetch(import.meta.env.VITE_API_URL + '/api/shop-details')
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data && data.id) setInfo(data);
      })
      .catch(console.error);
  }, []);

  return (
    <div className="info-page-container">
      <button className="back-btn" onClick={onBack}>&larr; Back to Products</button>
      
      <div className="info-grid">
        <div className="info-left">
          {info ? (
            <div className="info-content-wrapper">
              <h1 className="main-title">{info.main_title || 'About Our Products'}</h1>
              <p className="main-desc">{info.main_description}</p>
              
              {info.product_highlights && (
                <div className="info-section">
                  <h3>Product Highlights</h3>
                  <p>{info.product_highlights}</p>
                </div>
              )}
              
              <div className="info-row">
                {info.quality_description && (
                  <div className="info-section highlight-box">
                    <h3>Quality Standards</h3>
                    <p>{info.quality_description}</p>
                  </div>
                )}
                
                {info.usage_description && (
                  <div className="info-section highlight-box">
                    <h3>Usage & Storage</h3>
                    <p>{info.usage_description}</p>
                  </div>
                )}
              </div>
              
              {info.why_choose && (
                <div className="info-section">
                  <h3>Why Choose Us?</h3>
                  <p>{info.why_choose}</p>
                </div>
              )}

              {(() => {
                const name = (product?.product_name || '').toLowerCase();
                const isTin = name.includes('tin');
                const isCan = name.includes('can');
                const isBottle = name.includes('bottle') || name.includes('pouch');
                
                const showCan5 = isCan && name.includes('5');
                const showCan15 = isCan && !name.includes('5');
                const showTin15 = isTin;
                const showBottle1 = isBottle;

                const hasAny = (showTin15 && info.tin15_title) || 
                               (showCan15 && info.can15_title) || 
                               (showCan5 && info.can5_title) || 
                               (showBottle1 && info.bottle1_title);

                if (!hasAny) return null;

                return (
                  <div className="packaging-options">
                    <h2>Package Information</h2>
                    
                    {showTin15 && info.tin15_title && (
                      <div className="pkg-option">
                        <h4>{info.tin15_title}</h4>
                        <p>{info.tin15_description}</p>
                      </div>
                    )}
                    
                    {showCan15 && info.can15_title && (
                      <div className="pkg-option">
                        <h4>{info.can15_title}</h4>
                        <p>{info.can15_description}</p>
                      </div>
                    )}

                    {showCan5 && info.can5_title && (
                      <div className="pkg-option">
                        <h4>{info.can5_title}</h4>
                        <p>{info.can5_description}</p>
                      </div>
                    )}

                    {showBottle1 && info.bottle1_title && (
                      <div className="pkg-option">
                        <h4>{info.bottle1_title}</h4>
                        <p>{info.bottle1_description}</p>
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          ) : (
            <div style={{padding: '50px', textAlign: 'center'}}>
               <h3>Loading Shop Details...</h3>
            </div>
          )}
        </div>

        <div className="info-right">
          <div className="info-product-card sticky-card">
             {product?.product_discount > product?.product_price && (
               <span className="discount-badge" style={{ position: 'absolute', top: 10, left: 10, backgroundColor: '#e74c3c', color: 'white', padding: '4px 10px', borderRadius: '4px', fontWeight: 'bold', zIndex: 1 }}>
                 -{Math.round(((product.product_discount - product.product_price) / product.product_discount) * 100)}%
               </span>
             )}
             
             {product?.product_image ? (
               <div className="prod-img-wrapper" style={{ position: 'relative' }}>
                 <img src={product.product_image} alt={product.product_name} style={{ width: '100%', borderRadius: '8px' }} />
               </div>
             ) : (
               <div className="info-placeholder">No Image Available</div>
             )}
             
             <h2 className="selected-prod-title" style={{ marginTop: '15px' }}>{product?.product_name}</h2>
             
             <p className="price-container" style={{ fontSize: '1.5rem', margin: '15px 0' }}>
               {product?.product_discount > product?.product_price && (
                 <span className="before-price" style={{ textDecoration: 'line-through', color: '#999', marginRight: '10px', fontSize: '1.1rem' }}>
                   ₹{product.product_discount}
                 </span>
               )}
               <span className="current-price" style={{ color: '#27ae60', fontWeight: 'bold' }}>₹{product?.product_price}</span>
             </p>

             <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
               <button 
                 onClick={() => onAddToCart && onAddToCart(product)}
                 style={{ 
                   flex: 1, 
                   display: 'flex', 
                   justifyContent: 'center', 
                   alignItems: 'center', 
                   gap: '10px', 
                   padding: '12px', 
                   backgroundColor: '#2c3e50', 
                   color: 'white', 
                   border: 'none', 
                   borderRadius: '4px', 
                   fontSize: '1rem', 
                   fontWeight: 'bold', 
                   cursor: 'pointer' 
                 }}
               >
                 <FaShoppingCart /> Add to Cart
               </button>

               <button 
                 onClick={() => onBuyNow && onBuyNow(product)}
                 style={{ 
                   flex: 1, 
                   display: 'flex', 
                   justifyContent: 'center', 
                   alignItems: 'center', 
                   gap: '10px', 
                   padding: '12px', 
                   backgroundColor: '#e74c3c', 
                   color: 'white', 
                   border: 'none', 
                   borderRadius: '4px', 
                   fontSize: '1rem', 
                   fontWeight: 'bold', 
                   cursor: 'pointer' 
                 }}
               >
                 Buy Now
               </button>
               
               <button 
                 onClick={() => onWishlistToggle && onWishlistToggle(product)}
                 style={{ 
                   display: 'flex', 
                   justifyContent: 'center', 
                   alignItems: 'center', 
                   width: '50px', 
                   backgroundColor: isWishlisted ? '#27ae60' : '#f4f6f8', 
                   color: isWishlisted ? 'white' : '#7f8c8d', 
                   border: '1px solid ' + (isWishlisted ? '#27ae60' : '#bdc3c7'), 
                   borderRadius: '4px', 
                   cursor: 'pointer',
                   fontSize: '1.2rem',
                   transition: 'all 0.3s'
                 }}
                 title="Add to Wishlist"
               >
                 {isWishlisted ? <FaHeart /> : <FaRegHeart />}
               </button>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
