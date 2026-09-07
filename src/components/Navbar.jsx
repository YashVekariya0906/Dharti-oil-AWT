import React, { useState } from 'react';
import './Navbar.css';
import { FiShoppingCart, FiSearch } from 'react-icons/fi';
import { FaRegHeart, FaBars, FaTimes } from 'react-icons/fa';

const Navbar = ({ logoText = 'Dharti', logoHighlight = 'Oil' }) => {
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
          <button className="navbar-btn login-btn">Login</button>
          <span className="navbar-divider">|</span>
          <button className="navbar-btn register-btn">Register</button>
        </div>
      </div>

      {/* Second Row */}
      <div className="navbar-bottom-row">
        <div className="navbar-bottom-content">
          {/* Logo */}
          <div className="navbar-logo">
            <a href="/">{logoText} <span>{logoHighlight}</span></a>
          </div>

          {/* Desktop Navigation */}
          <nav className="navbar-nav desktop-nav">
            <ul className="nav-links">
              <li className="nav-item">
                <a href="#home" className="nav-link">Home</a>
              </li>
              <li className="nav-item dropdown">
                <a href="#shop" className="nav-link">Shop</a>
                <ul className="dropdown-menu">
                  <li><a href="#men">Men's Clothing</a></li>
                  <li><a href="#women">Women's Clothing</a></li>
                  <li><a href="#accessories">Accessories</a></li>
                  <li><a href="#shoes">Shoes</a></li>
                </ul>
              </li>
              <li className="nav-item">
                <a href="#about" className="nav-link">About Us</a>
              </li>
              <li className="nav-item">
                <a href="#blog" className="nav-link">Blog</a>
              </li>
              <li className="nav-item">
                <a href="#contact" className="nav-link">Contact</a>
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
          <li><a href="#home" onClick={toggleMobileMenu}>Home</a></li>
          <li className="mobile-dropdown-parent">
            <a href="#shop">Shop</a>
            <ul className="mobile-dropdown">
              <li><a href="#men" onClick={toggleMobileMenu}>Men's Clothing</a></li>
              <li><a href="#women" onClick={toggleMobileMenu}>Women's Clothing</a></li>
              <li><a href="#accessories" onClick={toggleMobileMenu}>Accessories</a></li>
              <li><a href="#shoes" onClick={toggleMobileMenu}>Shoes</a></li>
            </ul>
          </li>
          <li><a href="#about" onClick={toggleMobileMenu}>About Us</a></li>
          <li><a href="#blog" onClick={toggleMobileMenu}>Blog</a></li>
          <li><a href="#contact" onClick={toggleMobileMenu}>Contact</a></li>
          
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
