// src/services/authService.js
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export const useAuthService = () => {
  const navigate = useNavigate();
  const { logout } = useAuth(); // Direktes Verwenden von useAuth

  const handleLogout = () => {
    logout(); // Aufruf der logout-Funktion aus AuthContext
    navigate("/");
  };

  return { handleLogout };
};