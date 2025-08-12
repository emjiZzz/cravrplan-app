import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './AdminPage.module.css';
import { userDatabase } from '../utils/userDatabase';
import { useAuth } from '../context/AuthContext';

const AdminPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [exportData, setExportData] = useState('');

  useEffect(() => {
    // Check if user is admin (for demo, we'll use a simple check)
    if (!user || user.email !== 'admin@cravrplan.com') {
      navigate('/');
      return;
    }

    loadUsers();
    loadStats();
  }, [user, navigate]);

  const loadUsers = () => {
    const allUsers = userDatabase.getAllUsers();
    setUsers(allUsers);
  };

  const loadStats = () => {
    const userStats = userDatabase.getUserStats();
    setStats(userStats);
  };

  const handleDeleteUser = (userId: string) => {
    const userToDelete = users.find(u => u.id === userId);
    setSelectedUser(userToDelete);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteUser = () => {
    if (selectedUser) {
      // For demo purposes, we'll use a simple password
      const result = userDatabase.deleteUser(selectedUser.id, 'admin123');
      if (result.success) {
        loadUsers();
        loadStats();
        setShowDeleteConfirm(false);
        setSelectedUser(null);
      } else {
        alert('Failed to delete user: ' + result.error);
      }
    }
  };

  const exportDatabase = () => {
    const data = userDatabase.exportDatabase();
    setExportData(data);
  };

  const importDatabase = () => {
    if (exportData) {
      const result = userDatabase.importDatabase(exportData);
      if (result.success) {
        loadUsers();
        loadStats();
        alert('Database imported successfully!');
      } else {
        alert('Failed to import database: ' + result.error);
      }
    }
  };

  const clearAllData = () => {
    if (window.confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
      userDatabase.clearAllData();
      loadUsers();
      loadStats();
      alert('All data cleared successfully!');
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  if (!user || user.email !== 'admin@cravrplan.com') {
    return null;
  }

  return (
    <div className={styles.adminPageContainer}>
      <div className={styles.header}>
        <h1>Admin Panel</h1>
        <button onClick={() => navigate('/')} className={styles.backButton}>
          ← Back to App
        </button>
      </div>

      <div className={styles.content}>
        {/* Statistics */}
        <div className={styles.statsSection}>
          <h2>User Statistics</h2>
          {stats && (
            <div className={styles.statsGrid}>
              <div className={styles.statCard}>
                <h3>Total Users</h3>
                <p className={styles.statNumber}>{stats.totalUsers}</p>
              </div>
              <div className={styles.statCard}>
                <h3>Active Users (30 days)</h3>
                <p className={styles.statNumber}>{stats.activeUsers}</p>
              </div>
            </div>
          )}
        </div>

        {/* User Management */}
        <div className={styles.usersSection}>
          <div className={styles.sectionHeader}>
            <h2>User Management</h2>
            <div className={styles.adminActions}>
              <button onClick={exportDatabase} className={styles.actionButton}>
                Export Database
              </button>
              <button onClick={clearAllData} className={styles.dangerButton}>
                Clear All Data
              </button>
            </div>
          </div>

          <div className={styles.usersTable}>
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Created</th>
                  <th>Last Login</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td>{user.id}</td>
                    <td>{user.fullName}</td>
                    <td>{user.email}</td>
                    <td>{formatDate(user.createdAt)}</td>
                    <td>{formatDate(user.lastLogin)}</td>
                    <td>
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className={styles.deleteButton}
                        disabled={user.email === 'admin@cravrplan.com'}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Database Export/Import */}
        <div className={styles.databaseSection}>
          <h2>Database Management</h2>
          <div className={styles.databaseActions}>
            <div className={styles.exportSection}>
              <h3>Export Database</h3>
              <button onClick={exportDatabase} className={styles.actionButton}>
                Export
              </button>
              {exportData && (
                <textarea
                  value={exportData}
                  readOnly
                  className={styles.exportTextarea}
                  placeholder="Database export will appear here..."
                />
              )}
            </div>
            <div className={styles.importSection}>
              <h3>Import Database</h3>
              <textarea
                value={exportData}
                onChange={(e) => setExportData(e.target.value)}
                className={styles.importTextarea}
                placeholder="Paste database JSON here..."
              />
              <button onClick={importDatabase} className={styles.actionButton}>
                Import
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h3>Confirm Delete</h3>
            <p>Are you sure you want to delete user "{selectedUser?.fullName}" ({selectedUser?.email})?</p>
            <p>This action cannot be undone.</p>
            <div className={styles.modalActions}>
              <button onClick={() => setShowDeleteConfirm(false)} className={styles.cancelButton}>
                Cancel
              </button>
              <button onClick={confirmDeleteUser} className={styles.confirmButton}>
                Delete User
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPage;
