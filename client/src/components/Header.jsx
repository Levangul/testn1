import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDoorOpen, faInbox, faUsers, faHome, faUser, faComments, faRightFromBracket, faLockOpen, faCircleCheck } from '@fortawesome/free-solid-svg-icons';

const Header = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const { unreadCount } = useChat();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/'); // Redirect to home page after logout
  };

  return (
    <header className="bg-gray-800 text-white shadow-md">
      <nav className="container mx-auto p-4 flex justify-between items-center">

        {/* Left side items */}
        <div className="flex items-center space-x-4 flex-1">
          <div className="navbar-brand">
            <Link to="/" className="text-2xl font-bold hover:text-gray-300">Connect</Link>
          </div>
        </div>

        {/* Center items */}
        {isAuthenticated && user ? (
          <ul className="flex space-x-4 items-center">
            <li>
              <Link to="/" className="flex flex-col items-center hover:text-gray-300">
                <span className="text-2xl"><FontAwesomeIcon icon={faHome} /></span>
                <span className="text-xs">Home</span>
              </Link>
            </li>
            <li>
              <Link to={`/user/${user.name}/${user.lastname}`} className="flex flex-col items-center hover:text-gray-300">
                <span className="text-2xl"><FontAwesomeIcon icon={faUser} /></span>
                <span className="text-xs">Profile</span>
              </Link>
            </li>
          </ul>
        ) : (
          <div className="flex-1 flex justify-center">
            <Link to="/" className="flex flex-col items-center hover:text-gray-300">
              <span className="text-2xl"><FontAwesomeIcon icon={faHome} /></span>
              <span className="text-xs">Home</span>
            </Link>
          </div>
        )}

        {/* Right side items */}
        <div className="flex items-center space-x-4 flex-1 justify-end">
          {isAuthenticated ? (
            <ul className="flex space-x-4 items-center">
              <li className="relative">
                <Link to="/friends" className="flex flex-col items-center hover:text-gray-300" aria-label="Friends">
                  <span className="text-2xl"><FontAwesomeIcon icon={faUsers} /></span>
                  <span className="text-xs">Friends</span>
                </Link>
              </li>
              <li className="relative">
                <Link to="/inbox" className="flex flex-col items-center hover:text-gray-300" aria-label="Inbox">
                  <span className="text-2xl"><FontAwesomeIcon icon={faComments} /></span>
                  <span className="text-xs">Messenger</span>
                  {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full">
                      {unreadCount}
                    </span>
                  )}
                </Link>
              </li>
              <li>
                <Link onClick={handleLogout} className="flex flex-col items-center hover:text-gray-300" aria-label="Logout">
                  <span className="text-2xl"><FontAwesomeIcon icon={faRightFromBracket} /></span>
                  <span className="text-xs">Logout</span>
                </Link>
              </li>
            </ul>
          ) : (
            <ul className="flex space-x-4 items-center">
              <li><Link to="/login" className="flex flex-col items-center hover:text-gray-300">
              <span className="text-2xl"><FontAwesomeIcon icon={faLockOpen} /></span>
              <span className="text-xs">Login</span>
              </Link>
              </li>
              <li><Link to="/sign-up" className="flex flex-col items-center hover:text-gray-300">
              <span className="text-2xl"><FontAwesomeIcon icon={faCircleCheck} /></span>
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
