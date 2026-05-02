import React, { useState, useEffect } from 'react';
import { FaFacebookF, FaInstagram } from 'react-icons/fa';
import './Footer.css';

export default function Footer({ logoData, onHomeClick, products = [], onProductSelect, onReturnPolicyClick }) {
  const [data, setData] = useState({
    company_name: 'Dharti Oil',
    address: 'B-16, Privilon, Behind ISKCON Temple, Ambli-Bopal Road, Ahmedabad-380059.',
    phone: '+91 6359891941',
    email: 'info@dhartioil.com',
    facebook_link: '',
    instagram_link: '',
    home_link: '', shop_link: '', about_link: '', contact_link: '', blog_link: '',
    privacy_policy_link: '', return_exchange_link: '',
    working_days: 'Monday - Sunday',
    working_hours: '9:00AM - 8:00PM'
  });

  useEffect(() => {
    fetch(import.meta.env.VITE_API_URL + '/api/footer')
      .then(res => res.ok ? res.json() : null)
      .then(d => {
        if(d && d.id) {
          setData(prev => ({ ...prev, ...d }));
        }
      })
      .catch(console.error);
  }, []);

  return (
    <footer className="site-footer">
      <div className="footer-container">
        {/* Column 1: Company Info */}
        <div className="footer-col brand-col">
          {logoData ? (
            <img src={logoData} alt="Logo" className="footer-logo" />
          ) : (
            <h2 className="footer-brand-text">{data.company_name}</h2>
          )}
          <p className="footer-address">{data.address}</p>
          <p className="footer-contact"><strong>Phone:</strong> {data.phone}</p>
          <p className="footer-contact"><strong>Email:</strong> {data.email}</p>
          
          <div className="social-icons" style={{marginTop: '25px'}}>
            {data.facebook_link && <a href={data.facebook_link} target="_blank" rel="noopener noreferrer"><FaFacebookF /></a>}
            {data.instagram_link && <a href={data.instagram_link} target="_blank" rel="noopener noreferrer"><FaInstagram /></a>}
          </div>
        </div>
        
        {/* Column 2: Navigation Links */}
        <div className="footer-col links-col">
          <h3 className="footer-heading">Quick Links</h3>
          <ul className="footer-links">
            <li><a href={data.home_link || '#'} onClick={onHomeClick}>Home</a></li>
            <li><a href="#shop" style={{ cursor: 'default', fontWeight: 'bold' }}>Shop Products</a>
              <ul className="footer-links" style={{ paddingLeft: '15px', marginTop: '10px', marginBottom: '10px' }}>
                {products.length > 0 ? (
                  products.map(item => (
                    <li key={item.product_id} style={{marginBottom: '5px'}}>
                      <a 
                        href="#shop" 
                        onClick={(e) => {
                          e.preventDefault();
                          if(onProductSelect && item.product_name !== 'Loading Product...') {
                            onProductSelect(item);
                          }
                        }}
                      >
                        {item.product_name}
                      </a>
                    </li>
                  ))
                ) : (
                  <li><a href="#shop">No Products</a></li>
                )}
              </ul>
            </li>
            <li><a href={data.about_link || '#'}>About Us</a></li>
            <li><a href={data.contact_link || '#'}>Contact Us</a></li>
            <li><a href={data.blog_link || '#'}>Blogs</a></li>
          </ul>
        </div>
        
        {/* Column 3: Policy Links & Timing */}
        <div className="footer-col policy-col">
          <h3 className="footer-heading">Support & Info</h3>
          <ul className="footer-links" style={{marginBottom: '25px'}}>
            <li><a href={data.privacy_policy_link || '#'}>Privacy Policy</a></li>
            <li>
              <a 
                href={data.return_exchange_link || '#'} 
                onClick={(e) => {
                  if (onReturnPolicyClick) {
                    e.preventDefault();
                    onReturnPolicyClick();
                  }
                }}
              >
                Return and Exchange
              </a>
            </li>
          </ul>

          <h3 className="footer-heading">Operating Hours</h3>
          <div className="timing-box">
             <span className="timing-days">{data.working_days}</span>
             <span className="timing-hours">{data.working_hours}</span>
          </div>
        </div>
      </div>
      
      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} {data.company_name}. All Rights Reserved.</p>
      </div>
    </footer>
  );
}
