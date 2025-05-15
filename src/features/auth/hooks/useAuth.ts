/**
 * useAuth hook
 * 
 * Provides interface to authentication state and operations
 */

import { useState, useEffect } from 'react';
import { authService } from '../services/authService';
import { User, LoginCredentials, RegisterData } from '../types';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check for existing authentication on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        setLoading(true);
        const currentUser = await authService.getCurrentUser();
        setUser(currentUser);
        setError(null);
      } catch (err) {
        setError('Failed to retrieve authentication state');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    checkAuth();
  }, []);

  // Login function
  const login = async (credentials: LoginCredentials) => {
    try {
      setLoading(true);
      setError(null);
      const loggedInUser = await authService.login(credentials);
      setUser(loggedInUser);
      // In a real app, we might store the token in localStorage
      localStorage.setItem('user', JSON.stringify(loggedInUser));
      return loggedInUser;
    } catch (err) {
      setError('Login failed. Please check your credentials and try again.');
      console.error(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Register function
  const register = async (data: RegisterData) => {
    try {
      setLoading(true);
      setError(null);
      const newUser = await authService.register(data);
      setUser(newUser);
      // In a real app, we might store the token in localStorage
      localStorage.setItem('user', JSON.stringify(newUser));
      return newUser;
    } catch (err) {
      setError('Registration failed. Please try again later.');
      console.error(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      setLoading(true);
      await authService.logout();
      setUser(null);
      // Remove user from storage
      localStorage.removeItem('user');
    } catch (err) {
      setError('Logout failed');
      console.error(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    loading,
    error,
    login,
    register,
    logout,
    isAuthenticated: !!user
  };
}
