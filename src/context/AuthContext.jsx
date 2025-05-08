// src/context/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { loadUserFromStorage, saveUserToStorage, removeUserFromStorage } from '../utils/storageUtils';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = loadUserFromStorage();
    if (storedUser) {
      setUser(storedUser);
    }
  }, []);

  const updateUser = (userData) => {
    const newUserData = user
      ? {
          ...user,
          ...userData,
          travelHistory: userData.travelHistory || user.travelHistory || [],
          searchHistory: userData.searchHistory || user.searchHistory || [],
        }
      : { ...userData, travelHistory: [], searchHistory: [] };
    setUser(newUserData);
    saveUserToStorage(newUserData);
  };

  const logout = () => {
    setUser(null);
    removeUserFromStorage();
  };

  const value = { user, updateUser, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};