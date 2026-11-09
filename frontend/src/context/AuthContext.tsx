import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  loginWithOtp: (phoneNumber: string, otp: string, fullName?: string) => Promise<void>;
  loginAsAdmin: (phoneNumber: string, password: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('hk_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchCurrentUser = async () => {
    try {
      if (!localStorage.getItem('hk_token')) {
        setUser(null);
        setIsLoading(false);
        return;
      }
      const res: any = await api.get('/auth/me');
      if (res?.data) {
        setUser(res.data);
      }
    } catch {
      localStorage.removeItem('hk_token');
      setUser(null);
      setToken(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const loginWithOtp = async (phoneNumber: string, otp: string, fullName?: string) => {
    const res: any = await api.post('/auth/verify-token', {
      phone_number: phoneNumber,
      otp,
      full_name: fullName,
    });
    if (res.data?.token) {
      localStorage.setItem('hk_token', res.data.token);
      setToken(res.data.token);
      setUser(res.data.user);
    }
  };

  const loginAsAdmin = async (phoneNumber: string, password: string) => {
    const res: any = await api.post('/auth/admin-login', {
      phone_number: phoneNumber,
      password,
    });
    if (res.data?.token) {
      localStorage.setItem('hk_token', res.data.token);
      setToken(res.data.token);
      setUser(res.data.user);
    }
  };

  const logout = () => {
    localStorage.removeItem('hk_token');
    setToken(null);
    setUser(null);
  };

  const isAdmin = user?.role === 'admin' || user?.role === 'kitchen_staff';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: Boolean(user),
        isAdmin,
        loginWithOtp,
        loginAsAdmin,
        logout,
        refreshUser: fetchCurrentUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
