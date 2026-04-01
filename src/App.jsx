import React, { useState, useEffect } from 'react'
import Navbar from './components/Navbar'
import Register from './components/Register'
import Login from './components/Login'
import AdminDashboard from './components/AdminDashboard'
import BrokerDashboard from './components/BrokerDashboard'
import UserProfile from './components/UserProfile'
import ImageSlider from './components/ImageSlider'
import Footer from './components/Footer'
import InfoPage from './components/InfoPage'
import Blog from './components/Blog'
import ContactUs from './components/ContactUs'
import WishlistDrawer from './components/WishlistDrawer'
import CartDrawer from './components/CartDrawer'
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
  const [showBlog, setShowBlog] = useState(false);
  const [showContact, setShowContact] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [wishlist, setWishlist] = useState([]);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const handleAddToCart = (product) => {
    if (!user) {
      localStorage.setItem('pendingCartAdd', JSON.stringify(product));
      setShowLogin(true);
      return;
    }

    setCart(prev => {
      const existing = prev.find(item => item.product_id === product.product_id);
      if (existing) {
        return prev.map(item => item.product_id === product.product_id 
          ? { ...item, quantity: item.quantity + 1 } 
          : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const toggleWishlist = (product) => {
    if (!user) {
      localStorage.setItem('pendingWishlistAdd', JSON.stringify(product));
      setShowLogin(true);
      return;
    }

    if (wishlist.find(item => item.product_id === product.product_id)) {
      setWishlist(wishlist.filter(item => item.product_id !== product.product_id));
    } else {
      setWishlist([...wishlist, product]);
    }
  };

  const handleLogin = (userData) => {
    console.log('🟢 User logged in:', userData);
    setUser(userData);
    setShowLogin(false);
    setShowRegister(false);
    setShowProfile(false);
    
    // Check if we need to redirect to Contact page
    if (localStorage.getItem('redirectAfterAuth') === 'contact') {
      localStorage.removeItem('redirectAfterAuth');
      setShowContact(true);
      setShowBlog(false);
      setSelectedProductInfo(null);
    }
    
    // Check if there is a pending wishlist add
    const pendingWishlistStr = localStorage.getItem('pendingWishlistAdd');
    if (pendingWishlistStr) {
      try {
        const product = JSON.parse(pendingWishlistStr);
        setWishlist(prev => {
          if (!prev.find(item => item.product_id === product.product_id)) {
            return [...prev, product];
          }
          return prev;
        });
        setIsWishlistOpen(true);
      } catch (e) {
        console.error("Error parsing pending wishlist item", e);
      }
      localStorage.removeItem('pendingWishlistAdd');
      setIsWishlistOpen(true);
    }

    // Check if there is a pending cart add
    const pendingCartStr = localStorage.getItem('pendingCartAdd');
    if (pendingCartStr) {
      try {
        const product = JSON.parse(pendingCartStr);
        setCart(prev => {
          const existing = prev.find(item => item.product_id === product.product_id);
          if (existing) {
            return prev.map(item => item.product_id === product.product_id 
              ? { ...item, quantity: item.quantity + 1 } 
              : item
            );
          }
          return [...prev, { ...product, quantity: 1 }];
        });
        setIsCartOpen(true);
      } catch (e) {
        console.error("Error parsing pending cart item", e);
      }
      localStorage.removeItem('pendingCartAdd');
    }
  };

  const handleLogout = () => {
    console.log('🔴 User logged out');
    setUser(null);
    setShowProfile(false);
  };

  const handleHomeClick = (e) => {
    if (e) e.preventDefault();
    setSelectedProductInfo(null);
    setShowLogin(false);
    setShowRegister(false);
    setShowBlog(false);
    setShowContact(false);
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

  // Broker Routing
  if (user && user.role === 'broker') {
    return <BrokerDashboard user={user} onLogout={handleLogout} />;
  }

  // Public/User Routing
  let activePage = 'home';
  if (showLogin || showRegister) {
    activePage = '';
  } else if (selectedProductInfo) {
    activePage = 'shop';
  } else if (showBlog) {
    activePage = 'blog';
  } else if (showContact) {
    activePage = 'contact';
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
            onProfileClick={() => setShowProfile(true)}
            onWishlistClick={() => {
              if (!user) {
                setShowLogin(true);
              } else {
                setIsWishlistOpen(true);
              }
            }}
            wishlistCount={user ? wishlist.length : 0}
            onCartClick={() => {
              if (!user) {
                setShowLogin(true);
              } else {
                setIsCartOpen(true);
              }
            }}
            cartCount={user ? cart.reduce((total, item) => total + item.quantity, 0) : 0}
            products={products}
            onProductSelect={(item) => {
              setSelectedProductInfo(item);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onHomeClick={handleHomeClick}
            onBlogClick={() => {
              setShowBlog(true);
              setShowContact(false);
              setSelectedProductInfo(null);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onContactClick={() => {
              setShowContact(true);
              setShowBlog(false);
              setSelectedProductInfo(null);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            activePage={activePage}
          />
          
          {isWishlistOpen && (
            <WishlistDrawer 
              wishlist={wishlist} 
              setWishlist={setWishlist} 
              onClose={() => setIsWishlistOpen(false)} 
              onAddToCart={handleAddToCart}
            />
          )}

          {isCartOpen && (
            <CartDrawer 
              cart={cart} 
              setCart={setCart} 
              onClose={() => setIsCartOpen(false)} 
              user={user}
            />
          )}

          {/* Main Content */}
          <main className="main-content">
            {selectedProductInfo ? (
              <InfoPage product={selectedProductInfo} onBack={() => setSelectedProductInfo(null)} />
            ) : showBlog ? (
              <Blog />
            ) : showContact ? (
              <ContactUs user={user} onRequireLogin={() => setShowLogin(true)} />
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
                          <div 
                            className={`favorite-icon ${wishlist.some(w => w.product_id === item.product_id) ? 'active' : ''}`}
                            onClick={() => toggleWishlist(item)}
                          >
                            <FaHeart />
                          </div>

                          {item.product_image ? (
                            <img 
                              src={item.product_image} 
                              alt={item.product_name} 
                              className="product-img"
                            />
                          ) : <div className="no-image-placeholder"></div>}
                          
                          <div className="hover-actions">
                             <button className="hover-action-btn" title="Add to Cart" onClick={() => handleAddToCart(item)}>
                               <FaShoppingBag />
                             </button>
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
          
          {/* User Profile Modal */}
          {showProfile && user && user.role === 'user' && (
            <>
              {console.log('✅ Rendering UserProfile modal for user:', user)}
              <UserProfile 
                user={user} 
                onClose={() => {
                  console.log('🔵 Profile modal closed');
                  setShowProfile(false);
                }}
                onUpdate={(updatedUser) => {
                  setUser(updatedUser);
                }}
              />
            </>
          )}
          {showProfile && user && user.role !== 'user' && (
            console.log('❌ showProfile=true but user.role is not "user":', user.role)
          )}
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
