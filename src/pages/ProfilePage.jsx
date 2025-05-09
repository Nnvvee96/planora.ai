import React from "react";
import { motion } from "framer-motion";
import Select from "react-select";
import Autosuggest from "../components/Autosuggest.jsx";
import { fadeInVariants } from "../utils/animationUtils";
import { PROFILE_PAGE_CLASSES } from "../utils/constants";
import {
  travelStyleOptions,
  continentOptions,
  travelFrequencyOptions,
  travelBudgetOptions,
  accommodationTypeOptions,
  travelCompanionsOptions,
  activityPreferencesOptions,
} from "../utils/travelOptions";
import { countryOptions } from "../utils/autosuggestUtils";
import { useProfileSettings } from "../hooks/useProfileSettings";

function ProfilePage() {
  const {
    activeSection,
    setActiveSection,
    toast,
    profileSettings,
    travelPreferences,
    cities,
    setProfileSettings,
    handleProfileChange,
    handleProfileSelectChange,
    handleCountryChange,
    handleTravelSelectChange,
    handleSaveProfileSettings,
    handleSaveTravelPreferences,
    handleLogout,
    handleDeleteAccount,
    handleClose,
  } = useProfileSettings();

  const genderOptions = [
    { value: "male", label: "Male" },
    { value: "female", label: "Female" },
    { value: "other", label: "Other" },
    { value: "prefer-not-to-say", label: "Prefer not to say" },
  ];

  return (
    <div className={PROFILE_PAGE_CLASSES.container}>
      {toast.visible && <div className={PROFILE_PAGE_CLASSES.toast}>{toast.message}</div>}
      <motion.div
        variants={fadeInVariants}
        initial="hidden"
        animate="visible"
        className={PROFILE_PAGE_CLASSES.modal}
      >
        <button onClick={handleClose} className={PROFILE_PAGE_CLASSES.closeButton}>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
        <div className={PROFILE_PAGE_CLASSES.sidebar}>
          <h3 className={PROFILE_PAGE_CLASSES.sidebarTitle}>Settings</h3>
          <ul className="space-y-2">
            <li>
              <button
                onClick={() => setActiveSection("profile")}
                className={`${PROFILE_PAGE_CLASSES.sidebarItem} ${
                  activeSection === "profile" ? PROFILE_PAGE_CLASSES.sidebarActive : PROFILE_PAGE_CLASSES.sidebarInactive
                }`}
              >
                Profile Settings
              </button>
            </li>
            <li>
              <button
                onClick={() => setActiveSection("travel")}
                className={`${PROFILE_PAGE_CLASSES.sidebarItem} ${
                  activeSection === "travel" ? PROFILE_PAGE_CLASSES.sidebarActive : PROFILE_PAGE_CLASSES.sidebarInactive
                }`}
              >
                Travel Preferences
              </button>
            </li>
            <li>
              <button
                onClick={() => setActiveSection("account")}
                className={`${PROFILE_PAGE_CLASSES.sidebarItem} ${
                  activeSection === "account" ? PROFILE_PAGE_CLASSES.sidebarActive : PROFILE_PAGE_CLASSES.sidebarInactive
                }`}
              >
                Account Settings
              </button>
            </li>
          </ul>
        </div>
        <div className="md:hidden w-full p-4 bg-gray-800">
          <select
            value={activeSection}
            onChange={(e) => setActiveSection(e.target.value)}
            className={PROFILE_PAGE_CLASSES.mobileSelect}
          >
            <option value="profile">Profile Settings</option>
            <option value="travel">Travel Preferences</option>
            <option value="account">Account Settings</option>
          </select>
        </div>
        <div className={PROFILE_PAGE_CLASSES.content}>
          {activeSection === "profile" && (
            <div>
              <h3 className={PROFILE_PAGE_CLASSES.contentTitle}>Profile Settings</h3>
              <div className="space-y-4">
                <div>
                  <label htmlFor="firstName" className={PROFILE_PAGE_CLASSES.label}>
                    First Name
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={profileSettings.firstName}
                    onChange={handleProfileChange}
                    className={PROFILE_PAGE_CLASSES.input}
                    placeholder="Enter your first name"
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className={PROFILE_PAGE_CLASSES.label}>
                    Last Name
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={profileSettings.lastName}
                    onChange={handleProfileChange}
                    className={PROFILE_PAGE_CLASSES.input}
                    placeholder="Enter your last name"
                  />
                </div>
                <div>
                  <label htmlFor="email" className={PROFILE_PAGE_CLASSES.label}>
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={profileSettings.email}
                    onChange={handleProfileChange}
                    className={PROFILE_PAGE_CLASSES.input}
                    placeholder="Enter your email"
                  />
                </div>
                <div>
                  <label htmlFor="dateOfBirth" className={PROFILE_PAGE_CLASSES.label}>
                    Date of Birth
                  </label>
                  <input
                    type="text"
                    id="dateOfBirth"
                    name="dateOfBirth"
                    value={profileSettings.dateOfBirth}
                    onChange={handleProfileChange}
                    className={PROFILE_PAGE_CLASSES.input}
                    placeholder="DD/MM/YYYY"
                  />
                </div>
                <div>
                  <label className={PROFILE_PAGE_CLASSES.label}>Gender</label>
                  <Select
                    options={genderOptions}
                    onChange={(option) => handleProfileSelectChange("gender", option)}
                    placeholder="Select your gender"
                    className={PROFILE_PAGE_CLASSES.select}
                    value={
                      profileSettings.gender
                        ? {
                            value: profileSettings.gender,
                            label: profileSettings.gender.charAt(0).toUpperCase() +
                              profileSettings.gender.slice(1).replace(/-not-to-say/, " Not to Say"),
                          }
                        : null
                    }
                  />
                </div>
                <div>
                  <label htmlFor="occupation" className={PROFILE_PAGE_CLASSES.label}>
                    Occupation
                  </label>
                  <input
                    type="text"
                    id="occupation"
                    name="occupation"
                    value={profileSettings.occupation}
                    onChange={handleProfileChange}
                    className={PROFILE_PAGE_CLASSES.input}
                    placeholder="E.g., Software Engineer"
                  />
                </div>
                <div>
                  <label className={PROFILE_PAGE_CLASSES.label}>Country</label>
                  <Select
                    options={countryOptions}
                    onChange={handleCountryChange}
                    placeholder="Select your country"
                    className={PROFILE_PAGE_CLASSES.select}
                    value={countryOptions.find((option) => option.value === profileSettings.country)}
                  />
                </div>
                <div>
                  <label className={PROFILE_PAGE_CLASSES.label}>City</label>
                  <Autosuggest
                    cities={cities}
                    settings={profileSettings}
                    setSettings={setProfileSettings}
                    classes={PROFILE_PAGE_CLASSES}
                    disabled={!profileSettings.country}
                  />
                </div>
                <button
                  onClick={handleSaveProfileSettings}
                  className={PROFILE_PAGE_CLASSES.button}
                >
                  Save Changes
                </button>
              </div>
            </div>
          )}
          {activeSection === "travel" && (
            <div>
              <h3 className={PROFILE_PAGE_CLASSES.contentTitle}>Travel Preferences</h3>
              <div className="space-y-4">
                <div>
                  <label className={PROFILE_PAGE_CLASSES.label}>Preferred Travel Style</label>
                  <Select
                    options={travelStyleOptions}
                    onChange={(option) => handleTravelSelectChange("travelStyle", option)}
                    placeholder="Select your travel style"
                    className={PROFILE_PAGE_CLASSES.select}
                    value={
                      travelPreferences.travelStyle
                        ? {
                            value: travelPreferences.travelStyle,
                            label: travelPreferences.travelStyle
                              .split("-")
                              .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                              .join(" "),
                          }
                        : null
                    }
                  />
                </div>
                <div>
                  <label className={PROFILE_PAGE_CLASSES.label}>Preferred Continents</label>
                  <Select
                    isMulti
                    options={continentOptions}
                    onChange={(options) => handleTravelSelectChange("preferredContinents", options)}
                    placeholder="Select continents you love to visit"
                    className={PROFILE_PAGE_CLASSES.select}
                    value={continentOptions.filter((option) =>
                      travelPreferences.preferredContinents.includes(option.value)
                    )}
                  />
                </div>
                <div>
                  <label className={PROFILE_PAGE_CLASSES.label}>Travel Frequency</label>
                  <Select
                    options={travelFrequencyOptions}
                    onChange={(option) => handleTravelSelectChange("travelFrequency", option)}
                    placeholder="How often do you travel?"
                    className={PROFILE_PAGE_CLASSES.select}
                    value={
                      travelPreferences.travelFrequency
                        ? {
                            value: travelPreferences.travelFrequency,
                            label: travelPreferences.travelFrequency.charAt(0).toUpperCase() +
                              travelPreferences.travelFrequency.slice(1),
                          }
                        : null
                    }
                  />
                </div>
                <div>
                  <label className={PROFILE_PAGE_CLASSES.label}>Travel Budget (per person, per trip)</label>
                  <Select
                    options={travelBudgetOptions}
                    onChange={(option) => handleTravelSelectChange("travelBudget", option)}
                    placeholder="Select your travel budget"
                    className={PROFILE_PAGE_CLASSES.select}
                    value={
                      travelPreferences.travelBudget
                        ? {
                            value: travelPreferences.travelBudget,
                            label: travelBudgetOptions.find(
                              (option) => option.value === travelPreferences.travelBudget
                            )?.label || travelPreferences.travelBudget,
                          }
                        : null
                    }
                  />
                  <p className={PROFILE_PAGE_CLASSES.info}>
                    Budget includes flights and accommodation for one person per trip.
                  </p>
                </div>
                <div>
                  <label className={PROFILE_PAGE_CLASSES.label}>Preferred Accommodation Types</label>
                  <Select
                    isMulti
                    options={accommodationTypeOptions}
                    onChange={(options) => handleTravelSelectChange("accommodationTypes", options)}
                    placeholder="Select your accommodation types"
                    className={PROFILE_PAGE_CLASSES.select}
                    value={accommodationTypeOptions.filter((option) =>
                      travelPreferences.accommodationTypes.includes(option.value)
                    )}
                  />
                </div>
                <div>
                  <label className={PROFILE_PAGE_CLASSES.label}>Travel Companions</label>
                  <Select
                    options={travelCompanionsOptions}
                    onChange={(option) => handleTravelSelectChange("travelCompanions", option)}
                    placeholder="Select your travel companions"
                    className={PROFILE_PAGE_CLASSES.select}
                    value={
                      travelPreferences.travelCompanions
                        ? {
                            value: travelPreferences.travelCompanions,
                            label: travelPreferences.travelCompanions.charAt(0).toUpperCase() +
                              travelPreferences.travelCompanions.slice(1),
                          }
                        : null
                    }
                  />
                </div>
                <div>
                  <label className={PROFILE_PAGE_CLASSES.label}>Activity Preferences</label>
                  <Select
                    isMulti
                    options={activityPreferencesOptions}
                    onChange={(options) => handleTravelSelectChange("activityPreferences", options)}
                    placeholder="Select your activity preferences"
                    className={PROFILE_PAGE_CLASSES.select}
                    value={activityPreferencesOptions.filter((option) =>
                      travelPreferences.activityPreferences.includes(option.value)
                    )}
                  />
                </div>
                <button
                  onClick={handleSaveTravelPreferences}
                  className={PROFILE_PAGE_CLASSES.button}
                >
                  Save Preferences
                </button>
              </div>
            </div>
          )}
          {activeSection === "account" && (
            <div>
              <h3 className={PROFILE_PAGE_CLASSES.contentTitle}>Account Settings</h3>
              <div className="space-y-4">
                <div>
                  <button
                    onClick={() => alert("Change Password functionality coming soon!")}
                    className={PROFILE_PAGE_CLASSES.buttonGray}
                  >
                    Change Password
                  </button>
                </div>
                <div>
                  <button
                    onClick={handleDeleteAccount}
                    className={PROFILE_PAGE_CLASSES.buttonRed}
                  >
                    Delete Account
                  </button>
                </div>
                <div>
                  <button
                    onClick={handleLogout}
                    className={PROFILE_PAGE_CLASSES.buttonYellow}
                  >
                    Logout
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

export default ProfilePage;