// src/hooks/useRegister.js
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { citiesByCountry, getAutosuggestProps } from "../utils/autosuggestUtils";

export const useRegister = () => {
  const { updateUser } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    dateOfBirth: { day: "", month: "", year: "" },
    country: "",
    city: "",
    gender: "",
    occupation: "",
  });
  const [cities, setCities] = useState([]);
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    if (!formData.country) {
      setCities([]);
      setSuggestions([]);
      return;
    }
    const isoCode = Object.keys(countries).find((iso) => countries[iso].name === formData.country);
    const cityList = isoCode ? citiesByCountry[isoCode] || [] : [];
    setCities(cityList);
  }, [formData.country]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleOccupationChange = (e) => {
    const value = e.target.value;
    if (/^[A-Za-z\s]*$/.test(value)) {
      setFormData({ ...formData, occupation: value });
    }
  };

  const handleDateChange = (name, selectedOption) => {
    const value = selectedOption ? selectedOption.value : "";
    setFormData({
      ...formData,
      dateOfBirth: { ...formData.dateOfBirth, [name]: value },
    });
  };

  const handleCountryChange = (selectedOption) => {
    const country = selectedOption ? selectedOption.value : "";
    setFormData({ ...formData, country, city: "" });
  };

  const handleGenderChange = (selectedOption) => {
    const gender = selectedOption ? selectedOption.value : "";
    setFormData({ ...formData, gender });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (
      !formData.firstName ||
      !formData.lastName ||
      !formData.email ||
      !formData.dateOfBirth.day ||
      !formData.dateOfBirth.month ||
      !formData.dateOfBirth.year ||
      !formData.country ||
      !formData.city ||
      !formData.gender ||
      !formData.occupation
    ) {
      alert("Please fill out all required fields.");
      return;
    }
    if (!cities.includes(formData.city)) {
      alert("Please select a valid city from the suggestions.");
      return;
    }
    const userData = {
      username: formData.email.split("@")[0],
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      dateOfBirth: `${formData.dateOfBirth.day}/${formData.dateOfBirth.month}/${formData.dateOfBirth.year}`,
      country: formData.country,
      city: formData.city,
      gender: formData.gender,
      occupation: formData.occupation,
      chatHistory: [],
      travelPreferences: {},
    };
    updateUser(userData);
    navigate("/onboarding");
  };

  return {
    formData,
    cities,
    suggestions,
    setFormData,
    setSuggestions,
    handleChange,
    handleOccupationChange,
    handleDateChange,
    handleCountryChange,
    handleGenderChange,
    handleSubmit,
  };
};