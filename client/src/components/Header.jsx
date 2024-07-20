import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDoorOpen, faInbox } from '@fortawesome/free-solid-svg-icons';

const Header = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const { unreadCount } = useChat(); // Fetch the unread count from the Chat context
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
          {isAuthenticated && user && (
            <li>
              <Link to={`/user/${user.name}/${user.lastname}`} className="hover:text-gray-300">
                Profile
              </Link>
            </li>
          )}
        </ul>
        {isAuthenticated ? (
          <ul className="flex space-x-4">
            <li className="relative">
              <Link to="/inbox" className="hover:text-gray-300">
                <FontAwesomeIcon icon={faInbox} />
                {unreadCount > 0 && (
                  <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full">
                    {unreadCount}
                  </span>
                )}
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
