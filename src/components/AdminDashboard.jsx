import React, { useState } from 'react';
import AddProduct from './AddProduct';
import UpdateNavbar from './UpdateNavbar';
import UpdateFooter from './UpdateFooter';
import UpdateShopDetails from './UpdateShopDetails';
import AdminBlogForm from './AdminBlogForm';
import AdminContactForm from './AdminContactForm';
import AdminContactInquiries from './AdminContactInquiries';
import AdminBrokerForm from './AdminBrokerForm';
import AdminGlobalPrice from './AdminGlobalPrice';
import AdminSellingRequests from './AdminSellingRequests';
import AdminUsersList from './AdminUsersList';
import AdminOrdersList from './AdminOrdersList';
import './AdminDashboard.css';

const AdminDashboard = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <h2 className="admin-title">Dharti Admin</h2>
        <ul className="admin-nav-list">
          <li className="nav-section-title">Dashboard</li>
          <li 
            className={activeTab === 'dashboard' ? 'active' : ''} 
            onClick={() => setActiveTab('dashboard')}
          >
            Dashboard Home
          </li>

          <li className="nav-section-title">User Management</li>
          <li 
            className={activeTab === 'usersList' ? 'active' : ''} 
            onClick={() => setActiveTab('usersList')}
          >
            User Management
          </li>
          <li 
            className={activeTab === 'brokers' ? 'active' : ''} 
            onClick={() => setActiveTab('brokers')}
          >
            Broker Management
          </li>

          <li className="nav-section-title">Selling System</li>
          <li 
            className={activeTab === 'globalPrice' ? 'active' : ''} 
            onClick={() => setActiveTab('globalPrice')}
          >
            Global Selling Price
          </li>
          <li 
            className={activeTab === 'sellingRequests' ? 'active' : ''} 
            onClick={() => setActiveTab('sellingRequests')}
          >
            Selling Requests
          </li>
          <li 
            className={activeTab === 'ordersList' ? 'active' : ''} 
            onClick={() => setActiveTab('ordersList')}
          >
            E-Commerce Orders
          </li>

          <li className="nav-section-title">Products & Content</li>
          <li 
            className={activeTab === 'addProduct' ? 'active' : ''} 
            onClick={() => setActiveTab('addProduct')}
          >
            Add Product
          </li>
          <li 
            className={activeTab === 'blogManagement' ? 'active' : ''} 
            onClick={() => setActiveTab('blogManagement')}
          >
            Blog Management
          </li>

          <li className="nav-section-title">Website Settings</li>
          <li 
            className={activeTab === 'navUpdate' ? 'active' : ''} 
            onClick={() => setActiveTab('navUpdate')}
          >
            Update Home Page Images
          </li>
          <li 
            className={activeTab === 'updateShopDetails' ? 'active' : ''} 
            onClick={() => setActiveTab('updateShopDetails')}
          >
            Update Shop Info
          </li>
          <li 
            className={activeTab === 'updateContact' ? 'active' : ''} 
            onClick={() => setActiveTab('updateContact')}
          >
            Update Contact Page
          </li>
          <li 
            className={activeTab === 'updateFooter' ? 'active' : ''} 
            onClick={() => setActiveTab('updateFooter')}
          >
            Update Footer
          </li>

          <li className="nav-section-title">Support</li>
          <li 
            className={activeTab === 'contactInquiries' ? 'active' : ''} 
            onClick={() => setActiveTab('contactInquiries')}
          >
            Contact Inquiries
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
          ) : activeTab === 'blogManagement' ? (
             <AdminBlogForm />
          ) : activeTab === 'updateFooter' ? (
             <UpdateFooter />
          ) : activeTab === 'updateShopDetails' ? (
             <UpdateShopDetails />
          ) : activeTab === 'updateContact' ? (
             <AdminContactForm />
          ) : activeTab === 'contactInquiries' ? (
             <AdminContactInquiries />
          ) : activeTab === 'brokers' ? (
             <AdminBrokerForm />
          ) : activeTab === 'globalPrice' ? (
             <AdminGlobalPrice />
          ) : activeTab === 'sellingRequests' ? (
             <AdminSellingRequests />
          ) : activeTab === 'ordersList' ? (
             <AdminOrdersList />
          ) : activeTab === 'usersList' ? (
             <AdminUsersList />
          ) : null}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
