import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import './Navbar.css';
import { FiShoppingCart, FiSearch, FiChevronDown } from 'react-icons/fi';
import { FaRegHeart, FaBars, FaTimes } from 'react-icons/fa';

const Navbar = ({ logoData, logoText = 'Dharti ', logoHighlight = 'Amrut', user, onLoginClick, onRegisterClick, onBrokerLoginClick, onLogoutClick, onProfileClick, onWishlistClick, wishlistCount = 0, onCartClick, cartCount = 0, products = [], onProductSelect, onHomeClick, onBlogClick, onContactClick, onAboutClick, activePage = 'home' }) => {
  const { t, i18n } = useTranslation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLangOpen, setIsLangOpen] = useState(false);
  const langRef = useRef(null);



  // Suppress Google Translate bar injected at top of page
  useEffect(() => {
    const suppressGoogleBar = () => {
      // Hide the Google translate top frame
      const gtFrame = document.querySelector('.goog-te-banner-frame, #goog-gt-tt, .skiptranslate > iframe');
      if (gtFrame) {
        gtFrame.style.display = 'none';
        gtFrame.style.visibility = 'hidden';
      }
      // Forcefully reset body top pushed by Google translate
      if (document.body.style.top) {
        document.body.style.top = '0px';
      }
    };
    suppressGoogleBar();
    const observer = new MutationObserver(suppressGoogleBar);
    observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['style'] });
    return () => observer.disconnect();
  }, []);

  // Close lang dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (langRef.current && !langRef.current.contains(e.target)) {
        setIsLangOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    document.cookie = `googtrans=/en/${lng}; path=/`;
    setIsLangOpen(false);
    window.location.reload();
  };

  const languages = [
    { code: 'en', label: 'English', flag: '🇬🇧' },
    { code: 'gu', label: 'ગુજરાતી', flag: '🇮🇳' },
  ];
  const currentLang = languages.find(l => l.code === (i18n.language || 'en')) || languages[0];

  const filteredProducts = products.filter(p => 
    p.product_name && p.product_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header className="navbar-container">
      {/* Top Row */}
      <div className="navbar-top-row">
        <div className="navbar-top-content">
          <div id="google_translate_element" style={{ display: 'none' }}></div>
          <div className="language-dropdown-container" ref={langRef}>
            <button
              className={`lang-trigger ${isLangOpen ? 'open' : ''}`}
              onClick={() => setIsLangOpen(!isLangOpen)}
              aria-haspopup="listbox"
              aria-expanded={isLangOpen}
            >
              <span className="lang-flag">{currentLang.flag}</span>
              <span className="lang-label">{currentLang.label}</span>
              <FiChevronDown className="lang-chevron" />
            </button>
            {isLangOpen && (
              <ul className="lang-menu" role="listbox">
                {languages.map((lang) => (
                  <li
                    key={lang.code}
                    role="option"
                    aria-selected={lang.code === currentLang.code}
                    className={`lang-option ${lang.code === currentLang.code ? 'active' : ''}`}
                    onClick={() => changeLanguage(lang.code)}
                  >
                    <span className="lang-flag">{lang.flag}</span>
                    <span>{lang.label}</span>
                    {lang.code === currentLang.code && <span className="lang-check">✓</span>}
                  </li>
                ))}
              </ul>
            )}
          </div>
          {user ? (
            <>
              <span style={{ color: '#555', fontSize: '14px', marginRight: '10px' }}>{t('nav.welcome')}, {user.username}</span>
              {user.role === 'user' && onProfileClick && (
                <button 
                  className="navbar-btn profile-btn" 
                  onClick={() => {
                    console.log('🔵 Profile button clicked');
                    onProfileClick();
                  }}
                  style={{ cursor: 'pointer' }}
                >
                  👤 {t('nav.profile')}
                </button>
              )}
              <button className="navbar-btn login-btn" onClick={onLogoutClick}>{t('nav.logout')}</button>
            </>
          ) : (
            <>
              <button className="navbar-btn login-btn" onClick={onLoginClick}>{t('nav.login')}</button>
              <span className="navbar-divider">|</span>
              <button className="navbar-btn register-btn" onClick={onRegisterClick}>{t('nav.register')}</button>
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
                <a href="#home" className={`nav-link ${activePage === 'home' ? 'active' : ''}`} onClick={onHomeClick}>{t('nav.home')}</a>
              </li>
              <li className="nav-item dropdown">
                <a href="#shop" className={`nav-link ${activePage === 'shop' ? 'active' : ''}`}>{t('nav.shop')}</a>
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
                    <li><a href="#shop">{t('app.no_products')}</a></li>
                  )}
                </ul>
              </li>
              <li className="nav-item">
                <a href="#about" className={`nav-link ${activePage === 'about' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); if(onAboutClick) onAboutClick(); }}>{t('nav.about')}</a>
              </li>
              <li className="nav-item">
                <a href="#blog" className={`nav-link ${activePage === 'blog' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); onBlogClick(); }}>{t('nav.blog')}</a>
              </li>
              <li className="nav-item">
                <a href="#contact" className={`nav-link ${activePage === 'contact' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); if (onContactClick) onContactClick(); }}>{t('nav.contact')}</a>
              </li>
            </ul>
          </nav>

          {/* Icons Context */}
          <div className="navbar-icons desktop-icons">
            <div className="icon-wrapper search-icon" style={{ position: 'relative' }}>
              <FiSearch onClick={() => setIsSearchOpen(!isSearchOpen)} />
              {isSearchOpen && (
                <div className="navbar-search-dropdown">
                  <input 
                    type="text" 
                    placeholder={t('nav.search_placeholder')}
                    className="navbar-search-input"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    autoFocus
                  />
                  {searchQuery && (
                    <ul className="navbar-search-results">
                      {filteredProducts.length > 0 ? (
                        filteredProducts.map(item => (
                          <li key={item.product_id} onClick={() => {
                            if (onProductSelect) onProductSelect(item);
                            setIsSearchOpen(false);
                            setSearchQuery('');
                          }}>
                            {item.product_name}
                          </li>
                        ))
                      ) : (
                        <li className="no-m">No products found</li>
                      )}
                    </ul>
                  )}
                </div>
              )}
            </div>
            <div className="icon-wrapper wishlist-icon" onClick={onWishlistClick}>
              <FaRegHeart />
              {wishlistCount > 0 && <span className="cart-badge" style={{backgroundColor:'#0073e6'}}>{wishlistCount}</span>}
            </div>
            <div className="icon-wrapper cart-icon" onClick={onCartClick}>
              <FiShoppingCart />
              {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
            </div>
          </div>

          {/* Mobile Menu Toggle & Cart (Visible on Mobile) */}
          <div className="mobile-actions">
            <div className="icon-wrapper cart-icon mobile-cart" onClick={onCartClick}>
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
              {t('nav.home')}
            </a>
          </li>
          <li className="mobile-dropdown-parent">
            <a href="#shop" className={activePage === 'shop' ? 'active' : ''}>{t('nav.shop')}</a>
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
                <li><a href="#shop" onClick={toggleMobileMenu}>{t('app.no_products')}</a></li>
              )}
            </ul>
          </li>
          <li><a href="#about" className={activePage === 'about' ? 'active' : ''} onClick={(e) => { e.preventDefault(); if(onAboutClick) onAboutClick(); toggleMobileMenu(); }}>{t('nav.about')}</a></li>
          <li><a href="#blog" className={activePage === 'blog' ? 'active' : ''} onClick={(e) => { e.preventDefault(); onBlogClick(); toggleMobileMenu(); }}>{t('nav.blog')}</a></li>
          <li><a href="#contact" className={activePage === 'contact' ? 'active' : ''} onClick={(e) => { e.preventDefault(); if (onContactClick) onContactClick(); toggleMobileMenu(); }}>{t('nav.contact')}</a></li>

          <li className="mobile-bonus-icons">
            <div className="icon-wrapper search-icon" onClick={() => setIsSearchOpen(!isSearchOpen)}>
              <FiSearch /> <span>{t('nav.search')}</span>
            </div>
            <div className="icon-wrapper wishlist-icon" onClick={() => { if(onWishlistClick) onWishlistClick(); toggleMobileMenu(); }}>
              <FaRegHeart /> <span>{t('nav.wishlist')} {wishlistCount > 0 && `(${wishlistCount})`}</span>
            </div>
          </li>
          
          {isSearchOpen && (
            <li className="mobile-search-area">
              <input 
                 type="text" 
                 placeholder={t('nav.search_placeholder')}
                 className="navbar-search-input mobile-input"
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
                 autoFocus
              />
              {searchQuery && (
                <ul className="navbar-search-results mobile-results">
                  {filteredProducts.length > 0 ? (
                    filteredProducts.map(item => (
                      <li key={item.product_id} onClick={() => {
                        if (onProductSelect) onProductSelect(item);
                        setIsSearchOpen(false);
                        setSearchQuery('');
                        toggleMobileMenu();
                      }}>
                        {item.product_name}
                      </li>
                    ))
                  ) : (
                    <li className="no-m">No products found</li>
                  )}
                </ul>
              )}
            </li>
          )}
        </ul>
      </div>
    </header>
  );
};
export default Navbar;
