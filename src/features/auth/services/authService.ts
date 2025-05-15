/**
 * Authentication Service
 * 
 * Responsible for handling authentication-related operations like login, registration, etc.
 * This service does NOT directly import any UI components, maintaining separation of concerns.
 */

import { LoginCredentials, RegisterData, User } from '../types';

export const authService = {
  /**
   * Attempts to login user with provided credentials
   * @param {LoginCredentials} credentials - User credentials
   * @returns {Promise<User>} User data
   */
  login: async (credentials: LoginCredentials): Promise<User> => {
    // In a real application, this would make an API call to authenticate
    // For now, we'll simulate a successful login
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          id: '1',
          username: 'testuser',
          email: credentials.email,
          firstName: 'Test',
          lastName: 'User'
        });
      }, 500);
    });
  },

  /**
   * Registers a new user with provided data
   * @param {RegisterData} data - Registration data
   * @returns {Promise<User>} New user data
   */
  register: async (data: RegisterData): Promise<User> => {
    // In a real application, this would make an API call to register the user
    // For now, we'll simulate a successful registration
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          id: '1',
          username: data.username,
          email: data.email,
          firstName: data.firstName,
          lastName: data.lastName
        });
      }, 500);
    });
  },

  /**
   * Logs out the current user
   * @returns {Promise<void>}
   */
  logout: async (): Promise<void> => {
    // In a real application, this would make an API call to invalidate the session
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve();
      }, 300);
    });
  },

  /**
   * Checks if user is currently authenticated
   * @returns {Promise<User|null>} User data if authenticated, null otherwise
   */
  getCurrentUser: async (): Promise<User | null> => {
    // In a real application, this would check for token validity
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }
};
