import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import api from '../api';

const AuthContext = createContext();
const STORAGE_KEY = 'medishop_admin_token';

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem(STORAGE_KEY));
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  const decodeToken = (authToken) => {
    try {
      return jwtDecode(authToken);
    } catch (_error) {
      return null;
    }
  };

  const clearSession = () => {
    localStorage.removeItem(STORAGE_KEY);
    setToken(null);
    setAdmin(null);
  };

  useEffect(() => {
    const restoreSession = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      const decoded = decodeToken(token);
      if (!decoded?.id) {
        clearSession();
        setLoading(false);
        return;
      }

      try {
        const { data } = await api.get('/auth/me');
        setAdmin(data.admin);
      } catch (_error) {
        clearSession();
      } finally {
        setLoading(false);
      }
    };

    restoreSession();
  }, [token]);

  const login = ({ token: nextToken, admin: nextAdmin }) => {
    localStorage.setItem(STORAGE_KEY, nextToken);
    setToken(nextToken);
    setAdmin(nextAdmin);
  };

  const logout = () => {
    clearSession();
    setLoading(false);
  };

  const value = useMemo(
    () => ({
      token,
      admin,
      isAuthenticated: Boolean(token && admin),
      loading,
      login,
      logout,
    }),
    [token, admin, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};