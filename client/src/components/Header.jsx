import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useMutation, useQuery } from '@apollo/client';
import { TOGGLE_GHOST_MODE } from '../utils/mutations';
import { GET_USER } from '../utils/queries';
import { faBars, faHome, faUser, faUsers, faComments, faRightFromBracket, faLockOpen, faCircleCheck, faGhost } from '@fortawesome/free-solid-svg-icons';
import SearchUser from './SearchUser';
import '../css/header.css';

const Header = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const { unreadCount } = useChat();
  const navigate = useNavigate();
  const [isGhostMode, setIsGhostMode] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const headerRef = useRef(null);

  const { data, loading, error } = useQuery(GET_USER, {
    variables: { name: user?.name, lastname: user?.lastname },
    skip: !isAuthenticated,
  });

  useEffect(() => {
    if (data && data.user) {
      setIsGhostMode(data.user.GhostMode);
      document.body.classList.toggle('ghost-mode', data.user.GhostMode);
    }
  }, [data]);

  const [toggleGhostMode] = useMutation(TOGGLE_GHOST_MODE);

  const handleToggleGhostMode = async () => {
    try {
      const { data } = await toggleGhostMode();
      setIsGhostMode(data.toggleGhostMode.GhostMode);
      document.body.classList.toggle('ghost-mode', data.toggleGhostMode.GhostMode);
    } catch (err) {
      console.error('Error toggling Ghost Mode', err);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (headerRef.current && !headerRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  const handleLinkClick = () => {
    setIsMenuOpen(false);
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error loading user data: {error.message}</p>;

  return (
    <header ref={headerRef} className="header">
      <div className="flex items-center justify-between w-full">
        {/* Brand Name */}
        <div className="navbar-brand">
          <Link to="/" className="hover:text-gray-300">Connect</Link>
        </div>

        {/* Search Container */}
        <div className="search-container">
          <SearchUser />
        </div>

        {/* Hamburger Icon */}
        <div className="lg:hidden">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsMenuOpen(!isMenuOpen);
            }}
            className="focus:outline-none"
          >
            <FontAwesomeIcon icon={faBars} size="lg" />
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`mobile-nav ${isMenuOpen ? 'open' : ''} lg:hidden`}>
        <ul className="flex flex-col items-center space-y-4 py-4 bg-gray-800">
          <li>
            <Link to="/" onClick={handleLinkClick} className="flex items-center hover:text-gray-300">
              <FontAwesomeIcon icon={faHome} />
              <span className="ml-2">Home</span>
            </Link>
          </li>
          {isAuthenticated && user && (
            <>
              <li>
                <Link to={`/user/${user.name}/${user.lastname}`} onClick={handleLinkClick} className="flex items-center hover:text-gray-300">
                  <FontAwesomeIcon icon={faUser} />
                  <span className="ml-2">Profile</span>
                </Link>
              </li>
              <li>
                <Link to="/friends" onClick={handleLinkClick} className="flex items-center hover:text-gray-300">
                  <FontAwesomeIcon icon={faUsers} />
                  <span className="ml-2">Friends</span>
                </Link>
              </li>
              <li>
                <Link to="/inbox" onClick={handleLinkClick} className="flex items-center hover:text-gray-300">
                  <FontAwesomeIcon icon={faComments} />
                  <span className="ml-2">Messenger</span>
                  {unreadCount > 0 && (
                    <span className="badge bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center ml-1">
                      {unreadCount}
                    </span>
                  )}
                </Link>
              </li>
              <li>
                <button onClick={() => { handleLogout(); handleLinkClick(); }} className="flex items-center hover:text-gray-300">
                  <FontAwesomeIcon icon={faRightFromBracket} />
                  <span className="ml-2">Logout</span>
                </button>
              </li>
              <li>
                <button onClick={() => { handleToggleGhostMode(); handleLinkClick(); }} className="flex items-center hover:text-gray-300">
                  <FontAwesomeIcon icon={faGhost} />
                  <span className="ml-2">{isGhostMode ? 'Exit Ghost Mode' : 'Ghost Mode'}</span>
                </button>
              </li>
            </>
          )}
          {!isAuthenticated && (
            <>
              <li>
                <Link to="/login" onClick={handleLinkClick} className="flex items-center hover:text-gray-300">
                  <FontAwesomeIcon icon={faLockOpen} />
                  <span className="ml-2">Login</span>
                </Link>
              </li>
              <li>
                <Link to="/sign-up" onClick={handleLinkClick} className="flex items-center hover:text-gray-300">
                  <FontAwesomeIcon icon={faCircleCheck} />
                  <span className="ml-2">Sign Up</span>
                </Link>
              </li>
            </>
          )}
        </ul>
      </div>

      {/* Desktop Nav Links */}
      <nav className="nav-links hidden lg:flex gap-4 items-center">
        {isAuthenticated && user ? (
          <>
            <li><Link to="/" className="hover:text-gray-300">Home</Link></li>
            <li><Link to={`/user/${user.name}/${user.lastname}`} className="hover:text-gray-300">Profile</Link></li>
            <li><Link to="/friends" className="hover:text-gray-300">Friends</Link></li>
            <li><Link to="/inbox" className="hover:text-gray-300">Messenger</Link></li>
            <li>
              <button onClick={handleLogout} className="hover:text-gray-300 flex items-center">
                <FontAwesomeIcon icon={faRightFromBracket} />
                <span className="ml-2">Logout</span>
              </button>
            </li>
            <li>
              <button onClick={handleToggleGhostMode} className="hover:text-gray-300 flex items-center">
                <FontAwesomeIcon icon={faGhost} />
                <span className="ml-2">{isGhostMode ? 'Exit Ghost Mode' : 'Ghost Mode'}</span>
              </button>
            </li>
          </>
        ) : (
          <>
            <li><Link to="/login" className="hover:text-gray-300">Login</Link></li>
            <li><Link to="/sign-up" className="hover:text-gray-300">Sign Up</Link></li>
          </>
        )}
      </nav>
    </header>
  );
};

export default Header;

