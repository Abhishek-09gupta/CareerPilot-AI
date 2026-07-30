import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if token exists on mount and load user profile
  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const response = await api.getProfile();
        if (response.success) {
          setUser(response);
        } else {
          localStorage.removeItem('token');
        }
      } catch (err) {
        console.error('Error loading session user:', err);
        localStorage.removeItem('token');
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  // Register User
  const register = async (userData) => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.register(userData);
      if (data.success && data.token) {
        localStorage.setItem('token', data.token);
        setUser(data);
        return { success: true };
      }
      return { success: false, message: data.message || 'Registration failed' };
    } catch (err) {
      setError(err.message);
      return { success: false, message: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Login User
  const login = async (credentials) => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.login(credentials);
      if (data.success && data.token) {
        localStorage.setItem('token', data.token);
        setUser(data);
        return { success: true };
      }
      return { success: false, message: data.message || 'Login failed' };
    } catch (err) {
      setError(err.message);
      return { success: false, message: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Logout User
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  // Profile Sync helper after resume uploads or edits
  const syncProfile = async () => {
    try {
      const data = await api.getProfile();
      if (data.success) {
        setUser(data);
      }
    } catch (err) {
      console.error('Failed to sync profile', err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        register,
        login,
        logout,
        syncProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
