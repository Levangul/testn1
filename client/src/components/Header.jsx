import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Header = () => {
  const { isAuthenticated, logout } = useAuth();

  return (
    <header className="header">
      <nav className="navbar">
        <div className="navbar-brand">
          <Link to="/">Connect</Link>
        </div>
        <ul className="navbar-links">
          <li><Link to="/" className="nav-item">Home</Link></li>
          <li><Link to="/profile" className="nav-item">Profile</Link></li>
          {isAuthenticated ? (
            <li><button onClick={logout} className="nav-item">Logout</button></li>
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
