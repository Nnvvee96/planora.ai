import React from "react";
import { motion } from "framer-motion";
import Select from "react-select";
import Autosuggest from "../components/Autosuggest.jsx";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { fadeInUpVariants } from "../utils/animationUtils";
import { REGISTER_PAGE_CLASSES } from "../utils/constants";
import { countryOptions } from "../utils/autosuggestUtils";
import { useRegister } from "../hooks/useRegister";

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

function RegisterPage() {
  const {
    formData,
    cities,
    setFormData,
    handleChange,
    handleOccupationChange,
    handleDateChange,
    handleCountryChange,
    handleGenderChange,
    handleSubmit,
  } = useRegister();

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
                cities={cities}
                settings={formData}
                setSettings={setFormData}
                classes={REGISTER_PAGE_CLASSES}
                disabled={!formData.country}
                required
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