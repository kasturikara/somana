import { createContext, useContext, useState, useEffect } from "react";
import {
  isAuthenticated as checkAuth,
  logout as doLogout,
} from "../utils/auth";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(checkAuth());

  // Cek auth saat mount
  useEffect(() => {
    const checkAuthStatus = () => {
      const authStatus = checkAuth();
      setIsAuthenticated(authStatus);

      // Cleanup invalid token
      if (!authStatus && localStorage.getItem("token")) {
        doLogout();
      }
    };

    checkAuthStatus();
  }, []);

  const login = (token, user) => {
    localStorage.setItem("token", token);
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    }
    setIsAuthenticated(true);
  };

  const logout = () => {
    doLogout();
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
