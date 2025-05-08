// src/services/authService.js
import { useNavigate } from "react-router-dom";

export const useAuthService = () => {
  const navigate = useNavigate();

  const handleLogout = (logoutFunction) => {
    logoutFunction(); // Aufruf der logout-Funktion aus AuthContext
    navigate("/");
  };

  return { handleLogout };
};