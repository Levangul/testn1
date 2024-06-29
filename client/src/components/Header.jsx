import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/authContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDoorOpen } from '@fortawesome/free-solid-svg-icons';
import '../css/header.css';

const Header = () => {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/'); // Redirect to home page after logout
  };

  return (
    <header className="header">
      <nav className="navbar">
        <div className="navbar-brand">
          <Link to="/" className="brand-logo">Connect</Link>
        </div>
        <ul className="navbar-links">
          <li><Link to="/" className="nav-item">Home</Link></li>
          <li><Link to="/profile" className="nav-item">Profile</Link></li>
        </ul>
        {isAuthenticated ? (
          <ul className="auth-links">
            <li>
              <button onClick={handleLogout} className="nav-item logout-button">
                <FontAwesomeIcon icon={faDoorOpen} />
              </button>
            </li>
          </ul>
        ) : (
          <ul className="auth-links">
            <li><Link to="/login" className="nav-item">Login</Link></li>
            <li><Link to="/sign-up" className="nav-item">Sign-up</Link></li>
          </ul>
        )}
      </nav>
    </header>
  );
};

export default Header;
