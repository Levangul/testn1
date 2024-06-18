import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/authContext';
import '../css/header.css'; // Ensure you import the CSS file

const Header = () => {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate(); // Get the navigate function

  const handleLogout = () => {
    logout();
    navigate('/'); // Use navigate to redirect to the home page
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
          {isAuthenticated ? (
            <li><Link to="/" onClick={handleLogout} className="nav-item">Logout</Link></li>
          ) : (
            <>
              <li><Link to="/login" className="nav-item">Login</Link></li>
              <li><Link to="/sign-up" className="nav-item">Sign-up</Link></li>
            </>
          )}
        </ul>
      </nav>
    </header>
  );
};

export default Header;
