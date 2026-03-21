import React, { useState } from 'react';
import AddProduct from './AddProduct';
import UpdateNavbar from './UpdateNavbar';
import UpdateFooter from './UpdateFooter';
import UpdateShopDetails from './UpdateShopDetails';
import './AdminDashboard.css';

const AdminDashboard = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <h2 className="admin-title">Dharti Admin</h2>
        <ul className="admin-nav-list">
          <li 
            className={activeTab === 'dashboard' ? 'active' : ''} 
            onClick={() => setActiveTab('dashboard')}
          >
            Dashboard Home
          </li>
          <li 
            className={activeTab === 'navUpdate' ? 'active' : ''} 
            onClick={() => setActiveTab('navUpdate')}
          >
            Update Home Page Images
          </li>
          <li 
            className={activeTab === 'addProduct' ? 'active' : ''} 
            onClick={() => setActiveTab('addProduct')}
          >
            Add Product
          </li>
          <li 
            className={activeTab === 'updateFooter' ? 'active' : ''} 
            onClick={() => setActiveTab('updateFooter')}
          >
            Update Footer
          </li>
          <li 
            className={activeTab === 'updateShopDetails' ? 'active' : ''} 
            onClick={() => setActiveTab('updateShopDetails')}
          >
            Update Shop Info
          </li>
        </ul>
        <button onClick={onLogout} className="admin-logout-btn">Logout</button>
      </aside>
      
      <main className="admin-main-content">
        <header className="admin-header">
          Welcome back, {user?.username || 'Admin'}!
        </header>
        <div className="admin-body">
          {activeTab === 'dashboard' ? (
            <div className="admin-welcome-card">
              <h3>Dashboard Overview</h3>
              <p>Select a setting from the sidebar to modify your application.</p>
              <p>You are logged in with the <strong>{user?.role}</strong> role.</p>
            </div>
          ) : activeTab === 'navUpdate' ? (
             <UpdateNavbar />
          ) : activeTab === 'addProduct' ? (
             <AddProduct />
          ) : activeTab === 'updateFooter' ? (
             <UpdateFooter />
          ) : activeTab === 'updateShopDetails' ? (
             <UpdateShopDetails />
          ) : null}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
