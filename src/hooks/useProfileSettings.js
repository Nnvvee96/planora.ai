// src/hooks/useProfileSettings.js
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { citiesByCountry, getAutosuggestProps } from "../utils/autosuggestUtils";

export const useProfileSettings = () => {
  const { user, updateUser, logout } = useAuth();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState("profile");
  const [toast, setToast] = useState({ visible: false, message: "" });

  const [profileSettings, setProfileSettings] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
    dateOfBirth: user?.dateOfBirth || "",
    gender: user?.gender || "",
    occupation: user?.occupation || "",
    country: user?.country || "",
    city: user?.city || "",
  });

  const [travelPreferences, setTravelPreferences] = useState({
    travelStyle: user?.travelPreferences?.travelStyle || "",
    preferredContinents: user?.travelPreferences?.preferredContinents || [],
    travelFrequency: user?.travelPreferences?.travelFrequency || "",
    travelBudget: user?.travelPreferences?.travelBudget || "",
    accommodationTypes: user?.travelPreferences?.accommodationTypes || [],
    travelCompanions: user?.travelPreferences?.travelCompanions || "",
    activityPreferences: user?.travelPreferences?.activityPreferences || [],
  });

  const [cities, setCities] = useState([]);
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    if (user?.travelPreferences) {
      setTravelPreferences({
        travelStyle: user.travelPreferences.travelStyle || "",
        preferredContinents: user.travelPreferences.preferredContinents || [],
        travelFrequency: user.travelPreferences.travelFrequency || "",
        travelBudget: user.travelPreferences.travelBudget || "",
        accommodationTypes: user.travelPreferences.accommodationTypes || [],
        travelCompanions: user.travelPreferences.travelCompanions || "",
        activityPreferences: user.travelPreferences.activityPreferences || [],
      });
    }
  }, [user]);

  useEffect(() => {
    if (!profileSettings.country) {
      setCities([]);
      setSuggestions([]);
      return;
    }
    const isoCode = Object.keys(countries).find((iso) => countries[iso].name === profileSettings.country);
    const cityList = isoCode ? citiesByCountry[isoCode] || [] : [];
    setCities(cityList);
  }, [profileSettings.country]);

  const showToast = (message) => {
    setToast({ visible: true, message });
    setTimeout(() => setToast({ visible: false, message: "" }), 3000);
  };

  const handleProfileChange = (e) => {
    setProfileSettings({ ...profileSettings, [e.target.name]: e.target.value });
  };

  const handleProfileSelectChange = (name, selectedOption) => {
    setProfileSettings({ ...profileSettings, [name]: selectedOption ? selectedOption.value : "" });
  };

  const handleCountryChange = (selectedOption) => {
    const country = selectedOption ? selectedOption.value : "";
    setProfileSettings({ ...profileSettings, country, city: "" });
  };

  const handleTravelSelectChange = (name, selectedOption) => {
    if (Array.isArray(selectedOption)) {
      setTravelPreferences({
        ...travelPreferences,
        [name]: selectedOption.map((option) => option.value),
      });
    } else {
      setTravelPreferences({
        ...travelPreferences,
        [name]: selectedOption ? selectedOption.value : "",
      });
    }
  };

  const handleSaveProfileSettings = () => {
    updateUser(profileSettings);
    showToast("Profile Updated Successfully!");
  };

  const handleSaveTravelPreferences = () => {
    updateUser({ travelPreferences });
    showToast("Preferences Updated Successfully!");
  };

  const handleLogout = () => {
    logout();
    navigate("/");
    showToast("Logged Out Successfully!");
  };

  const handleDeleteAccount = () => {
    if (window.confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      logout();
      navigate("/");
      showToast("Account Deleted Successfully!");
    }
  };

  const handleClose = () => {
    navigate(-1);
  };

  return {
    activeSection,
    setActiveSection,
    toast,
    profileSettings,
    travelPreferences,
    cities,
    suggestions,
    setProfileSettings,
    setSuggestions,
    showToast,
    handleProfileChange,
    handleProfileSelectChange,
    handleCountryChange,
    handleTravelSelectChange,
    handleSaveProfileSettings,
    handleSaveTravelPreferences,
    handleLogout,
    handleDeleteAccount,
    handleClose,
  };
};