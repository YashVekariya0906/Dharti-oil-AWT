import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
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
import AdminDeliveryCharge from './AdminDeliveryCharge';
import AdminAboutUs from './AdminAboutUs';
import AdminOilCake from './AdminOilCake';
import AdminInvoiceSettings from './AdminInvoiceSettings';
import './AdminDashboard.css';

const AdminDashboard = ({ user, onLogout }) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    const saved = localStorage.getItem('adminSidebarOpen');
    return saved !== null ? JSON.parse(saved) : false;
  });

  useEffect(() => {
    localStorage.setItem('adminSidebarOpen', JSON.stringify(isSidebarOpen));
  }, [isSidebarOpen]);

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    setIsSidebarOpen(false); // Close sidebar on selection in mobile
  };

  return (
    <div className="admin-layout">
      <div 
        className={`admin-sidebar-overlay ${isSidebarOpen ? 'show' : ''}`} 
        onClick={() => setIsSidebarOpen(false)}
      ></div>
      <aside className={`admin-sidebar ${isSidebarOpen ? 'mobile-open' : ''}`}>
        <h2 className="admin-title">Dharti Admin</h2>
        <ul className="admin-nav-list">
          <li className="nav-section-title">{t('dashboard.dashboard')}</li>
          <li
            className={activeTab === 'dashboard' ? 'active' : ''}
            onClick={() => handleTabClick('dashboard')}
          >
            Dashboard Home
          </li>

          <li className="nav-section-title">User Management</li>
          <li
            className={activeTab === 'usersList' ? 'active' : ''}
            onClick={() => handleTabClick('usersList')}
          >
            User Management
          </li>
          <li
            className={activeTab === 'brokers' ? 'active' : ''}
            onClick={() => handleTabClick('brokers')}
          >
            Broker Management
          </li>

          <li className="nav-section-title">Selling System</li>
          <li
            className={activeTab === 'globalPrice' ? 'active' : ''}
            onClick={() => handleTabClick('globalPrice')}
          >
            Global Selling Price
          </li>
          <li
            className={activeTab === 'sellingRequests' ? 'active' : ''}
            onClick={() => handleTabClick('sellingRequests')}
          >
            Selling Requests
          </li>
          <li
            className={activeTab === 'ordersList' ? 'active' : ''}
            onClick={() => handleTabClick('ordersList')}
          >
            E-Commerce Orders
          </li>
          <li
            className={activeTab === 'oilCake' ? 'active' : ''}
            onClick={() => handleTabClick('oilCake')}
          >
            Oil Cake Selling
          </li>

          <li className="nav-section-title">Products & Content</li>
          <li
            className={activeTab === 'addProduct' ? 'active' : ''}
            onClick={() => handleTabClick('addProduct')}
          >
            Add Product
          </li>
          <li
            className={activeTab === 'blogManagement' ? 'active' : ''}
            onClick={() => handleTabClick('blogManagement')}
          >
            Blog Management
          </li>

          <li className="nav-section-title">Website Settings</li>
          <li
            className={activeTab === 'navUpdate' ? 'active' : ''}
            onClick={() => handleTabClick('navUpdate')}
          >
            Update Home Page Images
          </li>
          <li
            className={activeTab === 'deliveryCharge' ? 'active' : ''}
            onClick={() => handleTabClick('deliveryCharge')}
          >
            Delivery & Payment Settings
          </li>
          <li
            className={activeTab === 'invoiceSettings' ? 'active' : ''}
            onClick={() => handleTabClick('invoiceSettings')}
          >
            Invoice Configuration
          </li>
          <li
            className={activeTab === 'updateShopDetails' ? 'active' : ''}
            onClick={() => handleTabClick('updateShopDetails')}
          >
            Update Shop Info
          </li>
          <li
            className={activeTab === 'updateContact' ? 'active' : ''}
            onClick={() => handleTabClick('updateContact')}
          >
            Update Contact Page
          </li>
          <li
            className={activeTab === 'updateFooter' ? 'active' : ''}
            onClick={() => handleTabClick('updateFooter')}
          >
            Update Footer
          </li>
          <li
            className={activeTab === 'aboutUs' ? 'active' : ''}
            onClick={() => handleTabClick('aboutUs')}
          >
            About Us Page
          </li>

          <li className="nav-section-title">Support</li>
          <li
            className={activeTab === 'contactInquiries' ? 'active' : ''}
            onClick={() => handleTabClick('contactInquiries')}
          >
            Contact Inquiries
          </li>
        </ul>
        <button onClick={onLogout} className="admin-logout-btn">{t('nav.logout')}</button>
      </aside>

      <main className="admin-main-content">
        <header className="admin-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <button 
              className="admin-hamburger" 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              style={{ 
                background: 'none', 
                border: 'none', 
                fontSize: '1.5rem', 
                cursor: 'pointer',
                display: 'none', // Shown via media query in CSS
                color: '#2c3e50'
              }}
            >
              ☰
            </button>
            <span>{t('dashboard.admin_welcome')} {user?.username || 'Admin'}!</span>
          </div>
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
          ) : activeTab === 'deliveryCharge' ? (
            <AdminDeliveryCharge />
          ) : activeTab === 'invoiceSettings' ? (
            <AdminInvoiceSettings />
          ) : activeTab === 'brokers' ? (
            <AdminBrokerForm />
          ) : activeTab === 'globalPrice' ? (
            <AdminGlobalPrice />
          ) : activeTab === 'sellingRequests' ? (
            <AdminSellingRequests />
          ) : activeTab === 'ordersList' ? (
            <AdminOrdersList />
          ) : activeTab === 'oilCake' ? (
            <AdminOilCake />
          ) : activeTab === 'usersList' ? (
            <AdminUsersList />
          ) : activeTab === 'aboutUs' ? (
            <AdminAboutUs />
          ) : null}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
