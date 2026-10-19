import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import * as authApi from '../api/auth.api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    try {
      const res = await authApi.getMe();
      setUser(res.data.data.user);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchUser(); }, [fetchUser]);

  const login = async (email, password) => {
    const res = await authApi.login({ email, password });
    setUser(res.data.data.user);
    return res.data;
  };

  const registerUser = async (data) => {
    const res = await authApi.register(data);
    setUser(res.data.data.user);
    return res.data;
  };

  const logout = async () => {
    await authApi.logout();
    setUser(null);
  };

  const isAdmin = user?.role === 'admin';
  const isManager = user?.role === 'manager';
  const isStaff = user?.role === 'staff';
  const canManage = isAdmin || isManager;

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, registerUser, fetchUser, isAdmin, isManager, isStaff, canManage }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
