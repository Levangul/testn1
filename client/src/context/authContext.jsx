import React, { createContext, useContext, useState } from "react";
import decode from "jwt-decode";
const AuthContext = createContext();
export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(
    !!localStorage.getItem("id_token")
  );
  const getToken = () => {
    return localStorage.getItem("id_token");
  };
  const login = (token) => {
    localStorage.setItem("id_token", token);
    setIsAuthenticated(true);
  };
  const logout = () => {
    localStorage.removeItem("id_token");
    setIsAuthenticated(false);
    window.location.assign("/");
  };
  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, getToken }}>
      {children}
    </AuthContext.Provider>
  );
};
export const useAuth = () => useContext(AuthContext);
