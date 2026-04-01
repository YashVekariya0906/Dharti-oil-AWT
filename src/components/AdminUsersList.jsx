import React, { useState, useEffect } from 'react';
import { confirmAction } from '../utils/confirmAlert';
import './AdminUsersList.css';

const AdminUsersList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch('http://localhost:5000/api/admin/users');
      const data = await res.json();
      if (res.ok) {
        setUsers(data);
      } else {
        console.error('API Error:', data.message || data.error);
        setUsers([]);
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    const isConfirmed = await confirmAction(`Are you sure you want to change this user's role to ${newRole.toUpperCase()}?`);
    if (!isConfirmed) {
      // We need to fetch users again to revert the select field UI if they cancelled
      fetchUsers();
      return;
    }
    
    try {
      const res = await fetch(`http://localhost:5000/api/admin/users/${userId}/role`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole })
      });
      const data = await res.json();
      if (res.ok) {
        setMessage(data.message);
        fetchUsers();
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage(data.message || 'Failed to update role');
      }
    } catch (error) {
      setMessage('Error updating role: ' + error.message);
    }
  };

  const filteredUsers = users.filter((user) => {
    const term = searchTerm.toLowerCase();
    const searchMatch = 
      (user.username && user.username.toLowerCase().includes(term)) ||
      (user.emali && user.emali.toLowerCase().includes(term)) ||
      (user.moblie_no && String(user.moblie_no).toLowerCase().includes(term)) ||
      (user.pincode && String(user.pincode).toLowerCase().includes(term));
      
    const roleMatch = roleFilter === 'all' || user.role === roleFilter;

    return searchMatch && roleMatch;
  });

  return (
    <div className="admin-users-container fade-in">
      <div className="admin-users-header">
        <h2> User Management</h2>
        <button onClick={fetchUsers} className="refresh-btn">🔄 Refresh</button>
      </div>

      {message && <div className="msg success">{message}</div>}

      <div className="users-controls">
        <input 
          type="text" 
          placeholder="Search by name, email, mobile, or pincode..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input animated-input"
        />
        
        <select 
          value={roleFilter} 
          onChange={(e) => setRoleFilter(e.target.value)}
          className="role-filter"
        >
          <option value="all">Total Users ({users.length})</option>
          <option value="user">Users Only ({users.filter(u => u.role === 'user').length})</option>
          <option value="broker">Brokers Only ({users.filter(u => u.role === 'broker').length})</option>
          <option value="admin">Admins Only ({users.filter(u => u.role === 'admin').length})</option>
        </select>
      </div>

      <div className="users-table-container">
        {loading ? (
          <p className="loading">Loading users...</p>
        ) : filteredUsers.length === 0 ? (
          <p className="no-data">No users match your search criteria</p>
        ) : (
          <table className="users-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Mobile</th>
                <th>City / Locality</th>
                <th>Pincode</th>
                <th>Role</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(user => (
                <tr key={user.user_id}>
                  <td>{user.user_id}</td>
                  <td><strong>{user.username}</strong></td>
                  <td>{user.emali}</td>
                  <td>{user.moblie_no}</td>
                  <td>{user.address || 'N/A'}</td>
                  <td>{user.pincode || 'N/A'}</td>
                  <td>
                    <select 
                      value={user.role} 
                      onChange={(e) => handleRoleChange(user.user_id, e.target.value)}
                      className={`role-select role-${user.role}`}
                      disabled={user.role === 'admin'} // Prevent accidentally downgrading admin logically
                    >
                      <option value="user">User</option>
                      <option value="broker">Broker</option>
                      <option value="admin" disabled>Admin</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AdminUsersList;
