import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiService } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('authToken'));
  const [loading, setLoading] = useState(true);

  const isAuthenticated = !!token && !!user;

  useEffect(() => {
    // Only load profile if we have a token but no user data (e.g., page refresh)
    if (token && !user) {
      loadUserProfile();
    } else if (!token) {
      setLoading(false);
    } else if (token && user) {
      // We have both token and user, so we're authenticated
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, user]);

  const loadUserProfile = async () => {
    try {
      const profile = await apiService.getUserProfile();
      setUser(profile);
    } catch (error) {
      console.error('Failed to load user profile:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      console.log('AuthContext: Attempting login with credentials:', credentials);
      const response = await apiService.login(credentials);
      console.log('AuthContext: Login response received:', response);
      console.log('AuthContext: Response has token?', !!response?.token);
      console.log('AuthContext: Response has id?', !!response?.id);
      
      if (response.token) {
        // Store token first
        console.log('AuthContext: Storing token in localStorage...');
        localStorage.setItem('authToken', response.token);
        
        console.log('AuthContext: Setting token state...');
        setToken(response.token);
        
        // Set user data from login response
        console.log('AuthContext: Setting user state...', response);
        setUser(response);
        
        // Mark loading as false since we have everything we need
        console.log('AuthContext: Setting loading to false...');
        setLoading(false);
        
        console.log('AuthContext: Login successful, token and user stored');
        console.log('AuthContext: isAuthenticated should be:', !!response.token && !!response);
        return response;
      }
      throw new Error('Invalid credentials - no token in response');
    } catch (error) {
      console.error('AuthContext: Login failed:', error);
      console.error('AuthContext: Error type:', error.constructor.name);
      console.error('AuthContext: Error message:', error.message);
      throw error;
    }
  };

  const register = async (userData) => {
    try {
      const response = await apiService.register(userData);
      if (response.token && response.id) {
        setToken(response.token);
        setUser(response);
        localStorage.setItem('authToken', response.token);
        return response;
      }
      return response;
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('authToken');
  };

  const updateUser = (userData) => {
    setUser(prev => ({ ...prev, ...userData }));
  };

  const value = {
    user,
    token,
    isAuthenticated,
    loading,
    login,
    register,
    logout,
    updateUser,
    loadUserProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};