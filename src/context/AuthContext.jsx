import React, { createContext, useContext, useState, useEffect } from 'react';
import { loadUserFromStorage, saveUserToStorage, removeUserFromStorage } from '../utils/storageUtils';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

const validateUserData = (userData) => {
  const validatedData = { ...userData };
  if (!validatedData.firstName) validatedData.firstName = "";
  if (!validatedData.lastName) validatedData.lastName = "";
  if (!validatedData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(validatedData.email)) {
    throw new Error("Invalid email format");
  }
  return validatedData;
};

const saveUserData = (userData) => {
  saveUserToStorage(userData);
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
    const validatedData = validateUserData(userData);
    const newUserData = user
      ? {
          ...user,
          ...validatedData,
          travelHistory: validatedData.travelHistory || user.travelHistory || [],
          searchHistory: validatedData.searchHistory || user.searchHistory || [],
          trips: validatedData.trips || user.trips || [], // Hinzufügen
        }
      : {
          ...validatedData,
          travelHistory: [],
          searchHistory: [],
          trips: [], // Hinzufügen
        };
    setUser(newUserData);
    saveUserData(newUserData);
  };

  const logout = () => {
    setUser(null);
    removeUserFromStorage();
  };

  const value = { user, updateUser, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};