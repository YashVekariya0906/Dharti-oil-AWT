import React, { useState, useEffect } from 'react';
import './InfoPage.css';

export default function InfoPage({ product, onBack }) {
  const [info, setInfo] = useState(null);
  
  useEffect(() => {
    fetch('http://localhost:5000/api/shop-details')
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
             {product?.product_image ? (
               <div className="prod-img-wrapper">
                 <img src={product.product_image} alt={product.product_name} />
               </div>
             ) : (
               <div className="info-placeholder">No Image Available</div>
             )}
             <h2 className="selected-prod-title">{product?.product_name}</h2>
             <p className="selected-prod-price">₹{product?.product_price}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
