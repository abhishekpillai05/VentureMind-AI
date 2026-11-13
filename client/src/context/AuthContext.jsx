import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('venturemind_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('venturemind_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('venturemind_token');
      if (storedToken) {
        try {
          const res = await authService.getMe();
          if (res.success && res.user) {
            setUser(res.user);
            localStorage.setItem('venturemind_user', JSON.stringify(res.user));
          }
        } catch {
          logout();
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const saveAuth = (data) => {
    setToken(data.token);
    setUser(data.user);
    localStorage.setItem('venturemind_token', data.token);
    localStorage.setItem('venturemind_user', JSON.stringify(data.user));
  };

  const login = async (credentials) => {
    const data = await authService.login(credentials);
    if (data.success && data.token) {
      saveAuth(data);
    }
    return data;
  };

  const register = async (userData) => {
    const data = await authService.register(userData);
    if (data.success && data.token) {
      saveAuth(data);
    }
    return data;
  };

  const updateUser = (userData) => {
    setUser(userData);
    localStorage.setItem('venturemind_user', JSON.stringify(userData));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('venturemind_token');
    localStorage.removeItem('venturemind_user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token,
        isVerified: !!user?.email_verified,
        loading,
        login,
        register,
        updateUser,
        logout,
        saveAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
