/**
 * Authentication hook
 */
'use client';

import { useState, useEffect, createContext, useContext } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('access_token') || localStorage.getItem('token');
      if (token) {
        // Try to get user from localStorage first
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          try {
            setUser(JSON.parse(storedUser));
          } catch (e) {
            // Invalid JSON, fetch from API
          }
        }
        
        // Always verify with API
        const userData = await api.getCurrentUser();
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
      }
    } catch (error) {
      // Clear invalid tokens
      localStorage.removeItem('access_token');
      localStorage.removeItem('token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
    } finally {
      setLoading(false);
    }
  };

  const login = async (loginData) => {
    try {
      const response = await api.login(loginData);
      const token = response.access_token || response.token;
      if (token) {
        localStorage.setItem('access_token', token);
        localStorage.setItem('token', token); // Backward compatibility
        if (response.refresh_token) {
          localStorage.setItem('refresh_token', response.refresh_token);
        }
        if (response.user) {
          localStorage.setItem('user', JSON.stringify(response.user));
          setUser(response.user);
          return response.user;
        }
      }
      
      const userData = await api.getCurrentUser();
      setUser(userData);
      return userData;
    } catch (error) {
      throw error;
    }
  };

  const signup = async (signupData) => {
    try {
      const response = await api.signup(signupData);
      
      // If email verification required, return response without storing tokens
      if (response.requires_verification) {
        return response;
      }
      
      // If tokens returned (mobile signup), store them
      const token = response.access_token || response.token;
      if (token) {
        localStorage.setItem('access_token', token);
        localStorage.setItem('token', token); // Backward compatibility
        if (response.refresh_token) {
          localStorage.setItem('refresh_token', response.refresh_token);
        }
        if (response.user) {
          localStorage.setItem('user', JSON.stringify(response.user));
          setUser(response.user);
          return response.user;
        }
      }
      
      const userData = await api.getCurrentUser();
      setUser(userData);
      return userData;
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    setUser(null);
    router.push('/auth/login');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

