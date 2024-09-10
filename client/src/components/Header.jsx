import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useMutation, useQuery } from '@apollo/client';
import { TOGGLE_GHOST_MODE } from '../utils/mutations';
import { GET_USER } from '../utils/queries';
import { faDoorOpen, faInbox, faUsers, faHome, faUser, faComments, faRightFromBracket, faLockOpen, faCircleCheck, faGhost, faBars } from '@fortawesome/free-solid-svg-icons'; 
import SearchUser from './SearchUser'; 
import '../css/header.css';

const Header = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const { unreadCount } = useChat();
  const navigate = useNavigate();
  const [isGhostMode, setIsGhostMode] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false); // New state for toggling mobile menu

  // Fetch user data including GhostMode from the server
  const { data, loading, error } = useQuery(GET_USER, {
    variables: { name: user?.name, lastname: user?.lastname },
    skip: !isAuthenticated,
  });

  // Ensure the GhostMode is set based on the data
  useEffect(() => {
    if (data && data.user) {
      setIsGhostMode(data.user.GhostMode);
      
      if (data.user.GhostMode) {
        document.body.classList.add('ghost-mode');
      } else {
        document.body.classList.remove('ghost-mode');
      }
    }
  }, [data]);

  const [toggleGhostMode] = useMutation(TOGGLE_GHOST_MODE);

  const handleToggleGhostMode = async () => {
    try {
      const { data } = await toggleGhostMode();
      setIsGhostMode(data.toggleGhostMode.GhostMode);
      
      if (data.toggleGhostMode.GhostMode) {
        document.body.classList.add('ghost-mode');
      } else {
        document.body.classList.remove('ghost-mode');
      }
    } catch (err) {
      console.error('Error toggling Ghost Mode', err);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error loading user data: {error.message}</p>;

  return (
    <header className="bg-gray-800 text-white">
      <nav className="container mx-auto flex items-center justify-between p-4">
        {/* Left side items */}
        <div className="flex items-center space-x-4">
          <div className="navbar-brand">
            <Link to="/" className="hover:text-gray-300 text-lg">Connect</Link>
          </div>
        </div>

        {/* Center items for large screens (Home and Profile links) */}
        <div className="hidden lg:flex lg:space-x-8 absolute left-1/2 transform -translate-x-1/2">
          {isAuthenticated && user ? (
            <ul className="flex space-x-4 items-center">
              <li>
                <Link to="/" className="flex flex-col items-center hover:text-gray-300">
                  <FontAwesomeIcon icon={faHome} />
                  <span className="text-xs">Home</span>
                </Link>
              </li>
              <li>
                <Link to={`/user/${user.name}/${user.lastname}`} className="flex flex-col items-center hover:text-gray-300">
                  <FontAwesomeIcon icon={faUser} />
                  <span className="text-xs">Profile</span>
                </Link>
              </li>
            </ul>
          ) : (
            <div className="flex justify-center">
              <Link to="/" className="flex flex-col items-center hover:text-gray-300">
                <FontAwesomeIcon icon={faHome} />
                <span className="text-xs">Home</span>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Hamburger Icon */}
        <div className="lg:hidden flex items-center">
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="focus:outline-none">
            <FontAwesomeIcon icon={faBars} size="lg" />
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="absolute top-16 left-0 w-full bg-gray-800 lg:hidden z-10">
            <ul className="flex flex-col items-center space-y-4 py-4">
              <li>
                <Link to="/" className="flex flex-col items-center hover:text-gray-300">
                  <FontAwesomeIcon icon={faHome} />
                  <span className="text-xs">Home</span>
                </Link>
              </li>
              {isAuthenticated && user && (
                <>
                  <li>
                    <Link to={`/user/${user.name}/${user.lastname}`} className="flex flex-col items-center hover:text-gray-300">
                      <FontAwesomeIcon icon={faUser} />
                      <span className="text-xs">Profile</span>
                    </Link>
                  </li>
                  <li>
                    <Link to="/friends" className="flex flex-col items-center hover:text-gray-300">
                      <FontAwesomeIcon icon={faUsers} />
                      <span className="text-xs">Friends</span>
                    </Link>
                  </li>
                  <li>
                    <Link to="/inbox" className="flex flex-col items-center hover:text-gray-300">
                      <FontAwesomeIcon icon={faComments} />
                      <span className="text-xs">Messenger</span>
                      {unreadCount > 0 && (
                        <span className="badge bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center">
                          {unreadCount}
                        </span>
                      )}
                    </Link>
                  </li>
                  <li>
                    <button onClick={handleLogout} className="flex flex-col items-center hover:text-gray-300">
                      <FontAwesomeIcon icon={faRightFromBracket} />
                      <span className="text-xs">Logout</span>
                    </button>
                  </li>
                  <li>
                    <button onClick={handleToggleGhostMode} className="flex flex-col items-center hover:text-gray-300">
                      <FontAwesomeIcon icon={faGhost} />
                      <span className="text-xs">{isGhostMode ? 'Exit Ghost Mode' : 'Ghost Mode'}</span>
                    </button>
                  </li>
                </>
              )}
              {!isAuthenticated && (
                <>
                  <li>
                    <Link to="/login" className="flex flex-col items-center hover:text-gray-300">
                      <FontAwesomeIcon icon={faLockOpen} />
                      <span className="text-xs">Login</span>
                    </Link>
                  </li>
                  <li>
                    <Link to="/sign-up" className="flex flex-col items-center hover:text-gray-300">
                      <FontAwesomeIcon icon={faCircleCheck} />
                      <span className="text-xs">Sign Up</span>
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </div>
        )}

        {/* Right side items for large screens */}
        <div className="hidden lg:flex items-center space-x-4 ml-auto">
          <div className="search-container">
            <SearchUser />
          </div>
          {isAuthenticated ? (
            <ul className="flex space-x-4 items-center">
              <li>
                <Link to="/friends" className="flex flex-col items-center hover:text-gray-300">
                  <FontAwesomeIcon icon={faUsers} />
                  <span className="text-xs">Friends</span>
                </Link>
              </li>
              <li>
                <Link to="/inbox" className="flex flex-col items-center hover:text-gray-300">
                  <FontAwesomeIcon icon={faComments} />
                  <span className="text-xs">Messenger</span>
                  {unreadCount > 0 && (
                    <span className="badge bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </Link>
              </li>
              <li>
                <button onClick={handleLogout} className="flex flex-col items-center hover:text-gray-300">
                  <FontAwesomeIcon icon={faRightFromBracket} />
                  <span className="text-xs">Logout</span>
                </button>
              </li>
              <li>
                <button onClick={handleToggleGhostMode} className="flex flex-col items-center hover:text-gray-300">
                  <FontAwesomeIcon icon={faGhost} />
                  <span className="text-xs">{isGhostMode ? 'Exit Ghost Mode' : 'Ghost Mode'}</span>
                </button>
              </li>
            </ul>
          ) : (
            <ul className="flex space-x-4 items-center">
              <li>
                <Link to="/login" className="flex flex-col items-center hover:text-gray-300">
                  <FontAwesomeIcon icon={faLockOpen} />
                  <span className="text-xs">Login</span>
                </Link>
              </li>
              <li>
                <Link to="/sign-up" className="flex flex-col items-center hover:text-gray-300">
                  <FontAwesomeIcon icon={faCircleCheck} />
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
