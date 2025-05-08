// src/pages/RegisterPage.jsx
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Select from "react-select";
import Autosuggest from "react-autosuggest";
import { countries } from "countries-list";
import cities from "cities.json";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { fadeInUpVariants } from "../utils/animationUtils";
import { REGISTER_PAGE_CLASSES } from "../utils/constants";

const countryNameToIso = {};
Object.entries(countries).forEach(([iso, country]) => {
  countryNameToIso[country.name] = iso;
});

const countryList = Object.values(countries).sort((a, b) => a.name.localeCompare(b.name));
const countryOptions = countryList.map((country) => ({
  value: country.name,
  label: country.name,
}));

const citiesByCountry = cities.reduce((acc, city) => {
  const isoCode = city.country;
  if (!acc[isoCode]) acc[isoCode] = [];
  if (!acc[isoCode].includes(city.name)) acc[isoCode].push(city.name);
  return acc;
}, {});
Object.keys(citiesByCountry).forEach((country) => {
  citiesByCountry[country] = citiesByCountry[country].sort();
});

const days = Array.from({ length: 31 }, (_, i) => ({ value: i + 1, label: i + 1 }));
const months = [
  { value: 1, label: "January" },
  { value: 2, label: "February" },
  { value: 3, label: "March" },
  { value: 4, label: "April" },
  { value: 5, label: "May" },
  { value: 6, label: "June" },
  { value: 7, label: "July" },
  { value: 8, label: "August" },
  { value: 9, label: "September" },
  { value: 10, label: "October" },
  { value: 11, label: "November" },
  { value: 12, label: "December" },
];
const years = Array.from({ length: 100 }, (_, i) => {
  const year = new Date().getFullYear() - i;
  return { value: year, label: year };
});

const fuzzyMatch = (input, city) => {
  if (!input || !city) return 0;
  input = input.toLowerCase();
  city = city.toLowerCase();
  let score = 0;
  for (let i = 0; i < input.length && i < city.length; i++) {
    if (input[i] === city[i]) score++;
  }
  return score / Math.max(input.length, city.length);
};

function RegisterPage() {
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
    const isoCode = countryNameToIso[formData.country];
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

  const onSuggestionsFetchRequested = ({ value }) => {
    if (!formData.country || cities.length === 0) {
      setSuggestions([]);
      return;
    }
    const inputValue = value.trim().toLowerCase();
    const suggestions = cities
      .filter((city) => city.toLowerCase().includes(inputValue))
      .sort((a, b) => {
        const scoreA = fuzzyMatch(inputValue, a);
        const scoreB = fuzzyMatch(inputValue, b);
        return scoreB - scoreA;
      });
    setSuggestions(suggestions.slice(0, 5));
  };

  const onSuggestionsClearRequested = () => {
    setSuggestions([]);
  };

  const onSuggestionSelected = (event, { suggestion }) => {
    setFormData({ ...formData, city: suggestion });
  };

  const getSuggestionValue = (suggestion) => suggestion;

  const renderSuggestion = (suggestion) => <div className="p-2 text-white">{suggestion}</div>;

  const handleCityChange = (event, { newValue }) => {
    setFormData({ ...formData, city: newValue });
  };

  const handleCityBlur = () => {
    if (!formData.city || !formData.country) return;
    const inputValue = formData.city.trim().toLowerCase();
    const exactMatch = cities.find((city) => city.toLowerCase() === inputValue);
    if (exactMatch) {
      setFormData({ ...formData, city: exactMatch });
      return;
    }
    const bestMatch = cities
      .map((city) => ({ city, score: fuzzyMatch(inputValue, city) }))
      .sort((a, b) => b.score - a.score)[0];
    if (bestMatch && bestMatch.score > 0.7) {
      setFormData({ ...formData, city: bestMatch.city });
    }
  };

  const autosuggestProps = {
    suggestions,
    onSuggestionsFetchRequested,
    onSuggestionsClearRequested,
    onSuggestionSelected,
    getSuggestionValue,
    renderSuggestion,
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

  return (
    <div className={REGISTER_PAGE_CLASSES.container}>
      <Navbar />
      <main className={REGISTER_PAGE_CLASSES.main}>
        <motion.div
          variants={fadeInUpVariants}
          initial="hidden"
          animate="visible"
          className={REGISTER_PAGE_CLASSES.card}
        >
          <h2 className={REGISTER_PAGE_CLASSES.title}>Sign Up</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="firstName" className={REGISTER_PAGE_CLASSES.label}>
                First Name
              </label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className={REGISTER_PAGE_CLASSES.input}
                placeholder="Enter your first name"
                required
              />
            </div>
            <div>
              <label htmlFor="lastName" className={REGISTER_PAGE_CLASSES.label}>
                Last Name
              </label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className={REGISTER_PAGE_CLASSES.input}
                placeholder="Enter your last name"
                required
              />
            </div>
            <div>
              <label htmlFor="email" className={REGISTER_PAGE_CLASSES.label}>
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={REGISTER_PAGE_CLASSES.input}
                placeholder="Enter your email"
                required
              />
            </div>
            <div>
              <label className={REGISTER_PAGE_CLASSES.label}>Date of Birth</label>
              <div className="flex space-x-2">
                <Select
                  options={days}
                  onChange={(option) => handleDateChange("day", option)}
                  placeholder="Day"
                  className={REGISTER_PAGE_CLASSES.select}
                  value={days.find((option) => option.value === formData.dateOfBirth.day)}
                  required
                />
                <Select
                  options={months}
                  onChange={(option) => handleDateChange("month", option)}
                  placeholder="Month"
                  className={REGISTER_PAGE_CLASSES.select}
                  value={months.find((option) => option.value === formData.dateOfBirth.month)}
                  required
                />
                <Select
                  options={years}
                  onChange={(option) => handleDateChange("year", option)}
                  placeholder="Year"
                  className={REGISTER_PAGE_CLASSES.select}
                  value={years.find((option) => option.value === formData.dateOfBirth.year)}
                  required
                />
              </div>
            </div>
            <div>
              <label className={REGISTER_PAGE_CLASSES.label}>Country</label>
              <Select
                options={countryOptions}
                onChange={handleCountryChange}
                placeholder="Select your country"
                className={REGISTER_PAGE_CLASSES.select}
                value={countryOptions.find((option) => option.value === formData.country)}
                required
              />
            </div>
            <div>
              <label className={REGISTER_PAGE_CLASSES.label}>City</label>
              <Autosuggest
                {...autosuggestProps}
                inputProps={{
                  placeholder: "Type your city",
                  value: formData.city,
                  onChange: handleCityChange,
                  onBlur: handleCityBlur,
                  className: REGISTER_PAGE_CLASSES.autosuggest,
                  disabled: !formData.country,
                  required: true,
                }}
                theme={{
                  container: "w-full",
                  suggestionsContainer: REGISTER_PAGE_CLASSES.autosuggestSuggestions,
                  suggestionsList: "list-none m-0 p-0",
                  suggestion: REGISTER_PAGE_CLASSES.autosuggestSuggestion,
                  suggestionHighlighted: REGISTER_PAGE_CLASSES.autosuggestHighlighted,
                }}
              />
            </div>
            <div>
              <label className={REGISTER_PAGE_CLASSES.label}>Gender</label>
              <Select
                options={[
                  { value: "male", label: "Male" },
                  { value: "female", label: "Female" },
                  { value: "other", label: "Other" },
                  { value: "prefer-not-to-say", label: "Prefer not to say" },
                ]}
                onChange={handleGenderChange}
                placeholder="Select your gender"
                className={REGISTER_PAGE_CLASSES.select}
                value={
                  formData.gender
                    ? {
                        value: formData.gender,
                        label: formData.gender.charAt(0).toUpperCase() + formData.gender.slice(1).replace(/-not-to-say/, " Not to Say"),
                      }
                    : null
                }
                required
              />
            </div>
            <div>
              <label htmlFor="occupation" className={REGISTER_PAGE_CLASSES.label}>
                Occupation
              </label>
              <input
                type="text"
                id="occupation"
                name="occupation"
                value={formData.occupation}
                onChange={handleOccupationChange}
                className={REGISTER_PAGE_CLASSES.input}
                placeholder="E.g., Software Engineer"
                required
              />
            </div>
            <button
              type="submit"
              className={REGISTER_PAGE_CLASSES.button}
            >
              Sign Up
            </button>
          </form>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
}

export default RegisterPage;