import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AdminPanel from './pages/AdminPanel';
import ClientPortal from './pages/ClientPortal';
import './App.css';

function App() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  const API_URL = 'http://localhost:5000/api';

  // Initialize dark mode from localStorage
  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    setIsDarkMode(savedDarkMode);
    if (savedDarkMode) {
      document.body.classList.add('dark-mode');
    }
  }, []);

  // Toggle dark mode
  const toggleDarkMode = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    localStorage.setItem('darkMode', newDarkMode);
    if (newDarkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  };

  // Handle admin login
  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    try {
      const response = await axios.post(`${API_URL}/admin/login`, {
        username: loginUsername,
        password: loginPassword,
      });
      if (response.data.success) {
        setIsAdmin(true);
        setAdminPassword(loginPassword);
        setShowLoginModal(false);
        setLoginUsername('');
        setLoginPassword('');
      }
    } catch (error) {
      setLoginError('Invalid credentials');
    }
  };

  // Handle logout
  const handleLogout = () => {
    setIsAdmin(false);
    setAdminPassword('');
  };

  return (
    <div className={`app ${isDarkMode ? 'dark-mode' : ''}`}>
      <header className="app-header">
        <div className="header-container">
          <h1 className="logo">📚 Notes Platform</h1>
          <div className="header-actions">
            <button 
              className="theme-toggle"
              onClick={toggleDarkMode}
              title={isDarkMode ? 'Light mode' : 'Dark mode'}
            >
              {isDarkMode ? '☀️' : '🌙'}
            </button>
            {isAdmin ? (
              <button className="logout-btn" onClick={handleLogout}>
                Logout (Admin)
              </button>
            ) : (
              <button className="login-btn" onClick={() => setShowLoginModal(true)}>
                Admin Login
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Login Modal */}
      {showLoginModal && !isAdmin && (
        <div className="modal-overlay" onClick={() => setShowLoginModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Admin Login</h2>
            <form onSubmit={handleAdminLogin}>
              <input
                type="text"
                placeholder="Username"
                value={loginUsername}
                onChange={(e) => setLoginUsername(e.target.value)}
                autoFocus
              />
              <input
                type="password"
                placeholder="Password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
              />
              {loginError && <p className="error-message">{loginError}</p>}
              <div className="modal-buttons">
                <button type="submit">Login</button>
                <button
                  type="button"
                  onClick={() => {
                    setShowLoginModal(false);
                    setLoginError('');
                    setLoginUsername('');
                    setLoginPassword('');
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="app-main">
        {isAdmin ? (
          <AdminPanel adminPassword={adminPassword} />
        ) : (
          <ClientPortal />
        )}
      </main>

      <footer className="app-footer">
        <p>&copy; 2025 Notes Sharing Platform. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default App;
