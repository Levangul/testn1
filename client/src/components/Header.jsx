import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDoorOpen, faInbox, faUsers, faHome, faUser, faComments, faRightFromBracket, faLockOpen, faCircleCheck } from '@fortawesome/free-solid-svg-icons';
import SearchUser from './SearchUser'; 
import '../css/header.css'

const Header = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const { unreadCount } = useChat();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/'); // Redirect to home page after logout
  };

  return (
    <header className="header">
      <nav className="container mx-auto flex items-center justify-between">
        {/* Left side items */}
        <div className="flex items-center space-x-4">
          <div className="navbar-brand">
            <Link to="/" className="hover:text-gray-300">Connect</Link>
          </div>
        </div>

        {/* Center items (Home and Profile links) */}
        <div className="hidden lg:flex lg:space-x-8 absolute left-1/2 transform -translate-x-1/2">
          {isAuthenticated && user ? (
            <ul className="flex space-x-4 items-center">
              <li>
                <Link to="/" className="flex flex-col items-center hover:text-gray-300">
                  <span className="icon"><FontAwesomeIcon icon={faHome} /></span>
                  <span className="text-xs">Home</span>
                </Link>
              </li>
              <li>
                <Link to={`/user/${user.name}/${user.lastname}`} className="flex flex-col items-center hover:text-gray-300">
                  <span className="icon"><FontAwesomeIcon icon={faUser} /></span>
                  <span className="text-xs">Profile</span>
                </Link>
              </li>
            </ul>
          ) : (
            <div className="flex justify-center">
              <Link to="/" className="flex flex-col items-center hover:text-gray-300">
                <span className="icon"><FontAwesomeIcon icon={faHome} /></span>
                <span className="text-xs">Home</span>
              </Link>
            </div>
          )}
        </div>

        {/* Right side items */}
        <div className="flex items-center space-x-4 ml-auto">
          <div className="search-container">
            <SearchUser />
          </div>
          {isAuthenticated ? (
            <ul className="flex space-x-4 items-center">
              <li className="relative">
                <Link to="/friends" className="flex flex-col items-center hover:text-gray-300" aria-label="Friends">
                  <span className="icon"><FontAwesomeIcon icon={faUsers} /></span>
                  <span className="text-xs">Friends</span>
                </Link>
              </li>
              <li className="relative">
                <Link to="/inbox" className="flex flex-col items-center hover:text-gray-300" aria-label="Inbox">
                  <span className="icon"><FontAwesomeIcon icon={faComments} /></span>
                  <span className="text-xs">Messenger</span>
                  {unreadCount > 0 && (
                    <span className="badge">
                      {unreadCount}
                    </span>
                  )}
                </Link>
              </li>
              <li>
                <Link onClick={handleLogout} className="flex flex-col items-center hover:text-gray-300" aria-label="Logout">
                  <span className="icon"><FontAwesomeIcon icon={faRightFromBracket} /></span>
                  <span className="text-xs">Logout</span>
                </Link>
              </li>
            </ul>
          ) : (
            <ul className="flex space-x-4 items-center">
              <li><Link to="/login" className="flex flex-col items-center hover:text-gray-300">
              <span className="icon"><FontAwesomeIcon icon={faLockOpen} /></span>
              <span className="text-xs">Login</span>
              </Link>
              </li>
              <li><Link to="/sign-up" className="flex flex-col items-center hover:text-gray-300">
              <span className="icon"><FontAwesomeIcon icon={faCircleCheck} /></span>
              <span className="text-xs">Sign Up</span>
              </Link>
              </li>
            </ul>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Header;
