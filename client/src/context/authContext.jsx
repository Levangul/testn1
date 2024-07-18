import React, { createContext, useContext, useState, useEffect } from "react";
import decode from "jwt-decode";
import AuthService from "../utils/auth"; // Assuming AuthService is exported correctly
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem("id_token"));
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = AuthService.getToken();
    if (token) {
      if (AuthService.isTokenExpired(token)) {
        AuthService.logout();
        setIsAuthenticated(false);
        setUser(null);
        navigate('/');
      } else {
        const decoded = decode(token);
        setUser({
          id: decoded.data._id,
          email: decoded.data.email,
          name: decoded.data.name,
          lastname: decoded.data.lastname,
        });
      }
    }
  }, [navigate]);

  const getToken = () => {
    const token = AuthService.getToken();
    if (AuthService.isTokenExpired(token)) {
      logout();
      return null;
    }
    return token;
  };

  const login = (token) => {
    AuthService.login(token);
    setIsAuthenticated(true);
    const decoded = decode(token);
    setUser({
      id: decoded.data._id,
      email: decoded.data.email,
      name: decoded.data.name,
      lastname: decoded.data.lastname,
    });
    navigate('/');
  };

  const logout = () => {
    AuthService.logout();
    setIsAuthenticated(false);
    setUser(null);
    navigate('/');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout, getToken }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
