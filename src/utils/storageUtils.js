// src/utils/storageUtils.js
export const loadUserFromStorage = () => {
  const storedUser = localStorage.getItem("user");
  if (storedUser) {
    try {
      return JSON.parse(storedUser);
    } catch (error) {
      console.error("Error parsing stored user data:", error);
      return null;
    }
  }
  return null;
};

export const saveUserToStorage = (user) => {
  try {
    localStorage.setItem("user", JSON.stringify(user));
  } catch (error) {
    console.error("Error saving user data to storage:", error);
  }
};

export const removeUserFromStorage = () => {
  try {
    localStorage.removeItem("user");
  } catch (error) {
    console.error("Error removing user data from storage:", error);
  }
};