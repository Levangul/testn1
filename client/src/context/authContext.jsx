import React, { createContext, useContext, useState, useEffect } from "react";
import decode from "jwt-decode";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem("id_token"));
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("id_token");
    if (token) {
      const decoded = decode(token);
      setUser({ ...decoded.data, id: decoded.data._id });
    }
  }, []);

  const getToken = () => {
    return localStorage.getItem("id_token");
  };

  const login = (token) => {
    localStorage.setItem("id_token", token);
    setIsAuthenticated(true);
    const decoded = decode(token);
    setUser({ ...decoded.data, id: decoded.data._id });
  };

  const logout = () => {
    localStorage.removeItem("id_token");
    setIsAuthenticated(false);
    setUser(null);
    // Navigate to home page after logout
    window.location.assign("/");
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout, getToken }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
