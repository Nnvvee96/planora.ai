// src/hooks/useLogin.js
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export const useLogin = () => {
  const { updateUser } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }

    const userData = {
      username: email.split("@")[0],
      email,
      chatHistory: [],
      travelPreferences: {},
    };

    updateUser(userData);
    navigate("/dashboard");
  };

  return { email, setEmail, password, setPassword, error, handleLogin };
};