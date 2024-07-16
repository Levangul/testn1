import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDoorOpen, faInbox } from '@fortawesome/free-solid-svg-icons'; // Import inbox icon

const Header = () => {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/'); // Redirect to home page after logout
  };

  return (
    <header className="bg-gray-800 text-white shadow-md">
      <nav className="container mx-auto p-4 flex justify-between items-center">
        <div className="navbar-brand">
          <Link to="/" className="text-2xl font-bold">Connect</Link>
        </div>
        <ul className="flex space-x-4">
          <li><Link to="/" className="hover:text-gray-300">Home</Link></li>
          <li><Link to="/profile" className="hover:text-gray-300">Profile</Link></li>
        </ul>
        {isAuthenticated ? (
          <ul className="flex space-x-4">
            <li>
              <Link to="/inbox" className="hover:text-gray-300">
                <FontAwesomeIcon icon={faInbox} /> {/* Use inbox icon */}
              </Link>
            </li>
            <li className='logout'>
              <button onClick={handleLogout} className="hover:text-gray-300">
                <FontAwesomeIcon icon={faDoorOpen} />
              </button>
            </li>
          </ul>
        ) : (
          <ul className="flex space-x-4">
            <li><Link to="/login" className="hover:text-gray-300">Login</Link></li>
            <li><Link to="/sign-up" className="hover:text-gray-300">Sign-up</Link></li>
          </ul>
        )}
      </nav>
    </header>
  );
};

export default Header;
