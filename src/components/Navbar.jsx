import React, { useState } from 'react';
import './Navbar.css';
import { FiShoppingCart, FiSearch } from 'react-icons/fi';
import { FaRegHeart, FaBars, FaTimes } from 'react-icons/fa';

const Navbar = ({ logoData, logoText = 'Dharti ', logoHighlight = 'Amrut', user, onLoginClick, onRegisterClick, onBrokerLoginClick, onLogoutClick, onProfileClick, products = [], onProductSelect, onHomeClick, onBlogClick, onContactClick, activePage = 'home' }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(3);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header className="navbar-container">
      {/* Top Row */}
      <div className="navbar-top-row">
        <div className="navbar-top-content">
          {user ? (
            <>
              <span style={{ color: '#555', fontSize: '14px', marginRight: '10px' }}>Welcome, {user.username}</span>
              {user.role === 'user' && onProfileClick && (
                <button 
                  className="navbar-btn profile-btn" 
                  onClick={() => {
                    console.log('🔵 Profile button clicked');
                    onProfileClick();
                  }}
                  style={{ cursor: 'pointer' }}
                >
                  👤 Profile
                </button>
              )}
              <button className="navbar-btn login-btn" onClick={onLogoutClick}>Logout</button>
            </>
          ) : (
            <>
              <button className="navbar-btn login-btn" onClick={onLoginClick}>Login</button>
              <span className="navbar-divider">|</span>
              <button className="navbar-btn register-btn" onClick={onRegisterClick}>Register</button>
            </>
          )}
        </div>
      </div>

      {/* Second Row */}
      <div className="navbar-bottom-row">
        <div className="navbar-bottom-content">
          {/* Logo */}
          <div className="navbar-logo">
            <a href="/" onClick={onHomeClick} style={{ display: 'flex', alignItems: 'center' }}>
              {logoData && <img src={logoData} alt="Logo" style={{ maxHeight: '40px', marginRight: '10px' }} />}
              {logoText}{' '}<span>{logoHighlight}</span>
            </a>
          </div>

          {/* Desktop Navigation */}
          <nav className="navbar-nav desktop-nav">
            <ul className="nav-links">
              <li className="nav-item">
                <a href="#home" className={`nav-link ${activePage === 'home' ? 'active' : ''}`} onClick={onHomeClick}>Home</a>
              </li>
              <li className="nav-item dropdown">
                <a href="#shop" className={`nav-link ${activePage === 'shop' ? 'active' : ''}`}>Shop</a>
                <ul className="dropdown-menu">
                  {products.length > 0 ? (
                    products.map(item => (
                      <li key={item.product_id}>
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
              <li className="nav-item">
                <a href="#about" className="nav-link">About Us</a>
              </li>
              <li className="nav-item">
                <a href="#blog" className={`nav-link ${activePage === 'blog' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); onBlogClick(); }}>Blog</a>
              </li>
              <li className="nav-item">
                <a href="#contact" className={`nav-link ${activePage === 'contact' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); if (onContactClick) onContactClick(); }}>Contact</a>
              </li>
            </ul>
          </nav>

          {/* Icons Context */}
          <div className="navbar-icons desktop-icons">
            <div className="icon-wrapper search-icon">
              <FiSearch />
            </div>
            <div className="icon-wrapper wishlist-icon">
              <FaRegHeart />
            </div>
            <div className="icon-wrapper cart-icon">
              <FiShoppingCart />
              {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
            </div>
          </div>

          {/* Mobile Menu Toggle & Cart (Visible on Mobile) */}
          <div className="mobile-actions">
            <div className="icon-wrapper cart-icon mobile-cart">
              <FiShoppingCart />
              {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
            </div>
            <div className="mobile-menu-toggle" onClick={toggleMobileMenu}>
              {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className={`mobile-nav ${isMobileMenuOpen ? 'open' : ''}`}>
        <ul className="mobile-nav-links">
          <li>
            <a href="#home" className={activePage === 'home' ? 'active' : ''} onClick={(e) => { 
              toggleMobileMenu(); 
              if(onHomeClick) onHomeClick(e); 
            }}>
              Home
            </a>
          </li>
          <li className="mobile-dropdown-parent">
            <a href="#shop" className={activePage === 'shop' ? 'active' : ''}>Shop</a>
            <ul className="mobile-dropdown">
              {products.length > 0 ? (
                products.map(item => (
                  <li key={item.product_id}>
                    <a 
                      href="#shop" 
                      onClick={(e) => {
                        e.preventDefault();
                        if(onProductSelect && item.product_name !== 'Loading Product...') {
                          onProductSelect(item);
                        }
                        toggleMobileMenu();
                      }}
                    >
                      {item.product_name}
                    </a>
                  </li>
                ))
              ) : (
                <li><a href="#shop" onClick={toggleMobileMenu}>No Products</a></li>
              )}
            </ul>
          </li>
          <li><a href="#about" onClick={toggleMobileMenu}>About Us</a></li>
          <li><a href="#blog" className={activePage === 'blog' ? 'active' : ''} onClick={(e) => { e.preventDefault(); onBlogClick(); toggleMobileMenu(); }}>Blog</a></li>
          <li><a href="#contact" className={activePage === 'contact' ? 'active' : ''} onClick={(e) => { e.preventDefault(); if (onContactClick) onContactClick(); toggleMobileMenu(); }}>Contact</a></li>

          <li className="mobile-bonus-icons">
            <div className="icon-wrapper search-icon">
              <FiSearch /> <span>Search</span>
            </div>
            <div className="icon-wrapper wishlist-icon">
              <FaRegHeart /> <span>Wishlist</span>
            </div>
          </li>
        </ul>
      </div>
    </header>
  );
};
export default Navbar;
