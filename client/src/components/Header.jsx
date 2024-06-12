import React from 'react';
import { Link } from 'react-router-dom';

const Header = () => {
  return (
    <header className="header">
      <nav className="navbar">
        <div className="navbar-brand">
          <Link to="/">MyBrand</Link>
        </div>
        <ul className="navbar-links">
          <li><Link to="/">Home</Link></li>
          <li><Link to="/about">Profile</Link></li>
          <li><Link to="/Login">Login</Link></li>
          <li><Link to="/Sign-up">Sign-up</Link></li>
        </ul>
      </nav>
    </header>
  );
}

export default Header;