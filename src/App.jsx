import React, { useState, useEffect } from 'react'
import Navbar from './components/Navbar'
import NavUpdate from './admin_nav_update/nav_update'
import './App.css'

function App() {
  const [config, setConfig] = useState({
    logo_text: 'Dharti ',
    logo_highlight: 'Amrut',
    welcome_message: 'Welcome to Dharti Amrut',
    discover_text: 'Discover the purest and natural oils for your health and cooking needs.'
  });
  const [products, setProducts] = useState([
    { id: 1, name: 'Loading Product...', price: '0.00' }
  ]);
  const [loading, setLoading] = useState(true);
  const [showNavUpdate, setShowNavUpdate] = useState(false);

  useEffect(() => {
    // Fetch configuration and products from backend
    const fetchData = async () => {
      try {
        const [configRes, productsRes] = await Promise.all([
          fetch('http://localhost:5000/api/config'),
          fetch('http://localhost:5000/api/products')
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
      } catch (error) {
        console.error("Error fetching data from backend. Make sure the Node server is running on port 5000.", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="app-container">
      {!showNavUpdate ? (
        <>
          <Navbar logoText={config.logo_text} logoHighlight={config.logo_highlight} />
          
          {/* Admin Update Button */}
          <button 
            className="admin-toggle-btn" 
            onClick={() => setShowNavUpdate(true)}
            style={{
              position: 'fixed',
              top: '20px',
              right: '20px',
              padding: '8px 16px',
              background: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
              zIndex: 1000
            }}
          >
            Admin: Update Navbar
          </button>
          
          {/* Main Content */}
          <main className="main-content">
            <section className="hero-section">
              <h1>{config.welcome_message}</h1>
              <p>{config.discover_text}</p>
              <button className="cta-button">Shop Now</button>
            </section>
            
            <section className="features-section">
              <h2>Our Products</h2>
              {loading ? (
                <p style={{ textAlign: 'center' }}>Loading products from database...</p>
              ) : (
                <div className="product-grid">
                  {products.length > 0 ? (
                    products.map(item => (
                      <div key={item.id} className="product-card">
                        <div className="product-image-placeholder">
                          {item.image_url ? (
                            <img 
                              src={item.image_url} 
                              alt={item.name} 
                              style={{width: '100%', height: '100%', objectFit: 'cover', borderRadius: '4px'}} 
                            />
                          ) : null}
                        </div>
                        <h3>{item.name}</h3>
                        <p>₹{item.price}</p>
                      </div>
                    ))
                  ) : (
                    <p>No products found in the database.</p>
                  )}
                </div>
              )}
            </section>
          </main>
        </>
      ) : (
        <div style={{ position: 'relative' }}>
          <button 
            className="back-btn" 
            onClick={() => setShowNavUpdate(false)}
            style={{
              position: 'fixed',
              top: '20px',
              left: '20px',
              padding: '8px 16px',
              background: '#666',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
              zIndex: 1000
            }}
          >
            Back to Home
          </button>
          <NavUpdate />
        </div>
      )}
    </div>
  )
}

export default App
