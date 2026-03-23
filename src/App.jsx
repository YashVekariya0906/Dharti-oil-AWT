import React, { useState, useEffect } from 'react'
import Navbar from './components/Navbar'
import Register from './components/Register'
import Login from './components/Login'
import AdminDashboard from './components/AdminDashboard'
import ImageSlider from './components/ImageSlider'
import Footer from './components/Footer'
import InfoPage from './components/InfoPage'
import { FaHeart, FaShoppingBag, FaInfoCircle } from 'react-icons/fa';
import './App.css'

function App() {
  const [config, setConfig] = useState({
    logo_text: 'Dharti',
    logo_highlight: 'Amrut',
    welcome_message: 'Welcome to Dharti Amrut',
    discover_text: 'Discover the purest and natural oils for your health and cooking needs.'
  });
  const [navbarData, setNavbarData] = useState({});
  const [products, setProducts] = useState([
    { product_id: 1, product_name: 'Loading Product...', product_price: '0.00' }
  ]);
  const [loading, setLoading] = useState(true);
  const [showRegister, setShowRegister] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [user, setUser] = useState(null);
  const [selectedProductInfo, setSelectedProductInfo] = useState(null);

  const handleLogin = (userData) => {
    setUser(userData);
    setShowLogin(false);
    setShowRegister(false);
  };

  const handleLogout = () => {
    setUser(null);
  };

  const handleHomeClick = (e) => {
    if (e) e.preventDefault();
    setSelectedProductInfo(null);
    setShowLogin(false);
    setShowRegister(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    // Fetch configuration and products from backend
    const fetchData = async () => {
      try {
        const [configRes, productsRes, navbarRes] = await Promise.all([
          fetch('http://localhost:5000/api/config'),
          fetch('http://localhost:5000/api/products'),
          fetch('http://localhost:5000/api/navbar')
        ]);
        
        if (configRes.ok) {
          const configData = await configRes.json();
          setConfig(configData);
        } else {
          console.warn("Failed to fetch config, using defaults.");
        }
        
        if (productsRes.ok) {
          const productsData = await productsRes.json();
          setProducts(productsData);
        } else {
          console.warn("Failed to fetch products, using defaults.");
        }

        if (navbarRes.ok) {
          const navD = await navbarRes.json();
          setNavbarData(navD);
        }
      } catch (error) {
        console.error("Error fetching data from backend. Make sure the Node server is running on port 5000.", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Admin Routing
  if (user && user.role === 'admin') {
    return <AdminDashboard user={user} onLogout={handleLogout} />;
  }

  // Public/User Routing
  let activePage = 'home';
  if (showLogin || showRegister) {
    activePage = '';
  } else if (selectedProductInfo) {
    activePage = 'shop';
  }

  return (
    <div className="app-container">
      {!showRegister && !showLogin ? (
        <>
          <Navbar 
            logoData={navbarData.nav_logo_path}
            logoText={config.logo_text} 
            logoHighlight={config.logo_highlight} 
            user={user}
            onLoginClick={() => setShowLogin(true)}
            onRegisterClick={() => setShowRegister(true)} 
            onLogoutClick={handleLogout}
            products={products}
            onProductSelect={(item) => {
              setSelectedProductInfo(item);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onHomeClick={handleHomeClick}
            activePage={activePage}
          />
          
          {/* Main Content */}
          <main className="main-content">
            {selectedProductInfo ? (
              <InfoPage product={selectedProductInfo} onBack={() => setSelectedProductInfo(null)} />
            ) : (
              <>
                <ImageSlider images={[navbarData.I1_path, navbarData.I2_path, navbarData.I3_path, navbarData.I4_path, navbarData.I5_path].filter(Boolean)} />
                
                <section className="features-section">
              <h2>Our Products</h2>
              {loading ? (
                <p style={{ textAlign: 'center' }}>Loading products from database...</p>
              ) : (
                <div className="product-grid">
                  {products.length > 0 ? (
                    products.map(item => (
                      <div key={item.product_id} className="product-card">
                        <div className="product-image-container">
                          {item.product_discount > item.product_price && (
                             <span className="discount-badge">
                               -{Math.round(((item.product_discount - item.product_price) / item.product_discount) * 100)}%
                             </span>
                          )}
                          <div className="favorite-icon"><FaHeart /></div>

                          {item.product_image ? (
                            <img 
                              src={item.product_image} 
                              alt={item.product_name} 
                              className="product-img"
                            />
                          ) : <div className="no-image-placeholder"></div>}
                          
                          <div className="hover-actions">
                             <button className="hover-action-btn" title="Add to Cart"><FaShoppingBag /></button>
                             <button className="hover-action-btn" title="More Info" onClick={() => {
                               setSelectedProductInfo(item);
                               window.scrollTo({ top: 0, behavior: 'smooth' });
                             }}><FaInfoCircle /></button>
                          </div>
                        </div>

                        <h3>{item.product_name}</h3>
                        <p className="price-container">
                          {item.product_discount > item.product_price && (
                             <span className="before-price">₹{item.product_discount}</span>
                          )}
                          <span className="current-price">₹{item.product_price}</span>
                        </p>
                      </div>
                    ))
                  ) : (
                    <p>No products found in the database.</p>
                  )}
                </div>
              )}
            </section>
            
            {navbarData.intro_path && (
              <img 
                src={navbarData.intro_path} 
                alt="Intro" 
                style={{ width: '100%', height: '250px', objectFit: 'cover' }} 
              />
            )}
              </>
            )}
          </main>
          
          <Footer 
            logoData={navbarData.nav_logo_path} 
            onHomeClick={handleHomeClick} 
            products={products}
            onProductSelect={(item) => {
              setSelectedProductInfo(item);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        </>
      ) : showRegister ? (
        <div style={{ position: 'relative' }}>
          <Register 
            onBack={() => setShowRegister(false)} 
            onLogin={handleLogin} 
            onSwitchToLogin={() => { setShowRegister(false); setShowLogin(true); }}
          />
        </div>
      ) : showLogin ? (
        <div style={{ position: 'relative' }}>
          <Login 
            onBack={() => setShowLogin(false)} 
            onLogin={handleLogin} 
            onSwitchToRegister={() => { setShowLogin(false); setShowRegister(true); }}
          />
        </div>
      ) : null}
    </div>
  )
}

export default App
