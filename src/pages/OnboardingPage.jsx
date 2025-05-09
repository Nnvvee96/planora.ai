// src/pages/OnboardingPage.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Select from "react-select";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { ONBOARDING_PAGE_CLASSES } from "../utils/constants";
import {
  travelStyleOptions,
  continentOptions,
  travelFrequencyOptions,
  travelBudgetOptions,
  accommodationTypeOptions,
  travelCompanionsOptions,
  activityPreferencesOptions,
  preferredSeasonsOptions,
  maxTravelDurationOptions,
} from "../utils/travelOptions";

function OnboardingPage() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();

  const [travelPreferences, setTravelPreferences] = useState({
    travelStyle: user?.travelPreferences?.travelStyle || "",
    preferredContinents: user?.travelPreferences?.preferredContinents || [],
    travelFrequency: user?.travelPreferences?.travelFrequency || "",
    travelBudget: user?.travelPreferences?.travelBudget || "",
    accommodationTypes: user?.travelPreferences?.accommodationTypes || [],
    travelCompanions: user?.travelPreferences?.travelCompanions || "",
    activityPreferences: user?.travelPreferences?.activityPreferences || [],
    preferredSeasons: "",
    maxTravelDuration: "",
  });

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

  const handleSubmit = () => {
    console.log("Saving travel preferences in Onboarding:", travelPreferences);
    updateUser({ travelPreferences });
    navigate("/dashboard");
  };

  return (
    <div className={ONBOARDING_PAGE_CLASSES.container}>
      <Navbar />
      <div className={ONBOARDING_PAGE_CLASSES.main}>
        <div className={ONBOARDING_PAGE_CLASSES.card}>
          <h2 className={ONBOARDING_PAGE_CLASSES.title}>Tell Us About Your Travel Preferences</h2>
          <div className="space-y-4">
            <div>
              <label className={ONBOARDING_PAGE_CLASSES.label}>Preferred Travel Style</label>
              <Select
                options={travelStyleOptions}
                onChange={(option) => handleTravelSelectChange("travelStyle", option)}
                placeholder="Select your travel style"
                className={ONBOARDING_PAGE_CLASSES.select}
              />
            </div>
            <div>
              <label className={ONBOARDING_PAGE_CLASSES.label}>Preferred Continents</label>
              <Select
                isMulti
                options={continentOptions}
                onChange={(options) => handleTravelSelectChange("preferredContinents", options)}
                placeholder="Select continents you love to visit"
                className={ONBOARDING_PAGE_CLASSES.select}
              />
            </div>
            <div>
              <label className={ONBOARDING_PAGE_CLASSES.label}>Travel Frequency</label>
              <Select
                options={travelFrequencyOptions}
                onChange={(option) => handleTravelSelectChange("travelFrequency", option)}
                placeholder="How often do you travel?"
                className={ONBOARDING_PAGE_CLASSES.select}
              />
            </div>
            <div>
              <label className={ONBOARDING_PAGE_CLASSES.label}>Travel Budget (per person, per trip)</label>
              <Select
                options={travelBudgetOptions}
                onChange={(option) => handleTravelSelectChange("travelBudget", option)}
                placeholder="Select your travel budget"
                className={ONBOARDING_PAGE_CLASSES.select}
              />
              <p className={ONBOARDING_PAGE_CLASSES.info}>
                Budget includes flights and accommodation for one person per trip.
              </p>
            </div>
            <div>
              <label className={ONBOARDING_PAGE_CLASSES.label}>Preferred Accommodation Types</label>
              <Select
                isMulti
                options={accommodationTypeOptions}
                onChange={(options) => handleTravelSelectChange("accommodationTypes", options)}
                placeholder="Select your accommodation types"
                className={ONBOARDING_PAGE_CLASSES.select}
              />
            </div>
            <div>
              <label className={ONBOARDING_PAGE_CLASSES.label}>Travel Companions</label>
              <Select
                options={travelCompanionsOptions}
                onChange={(option) => handleTravelSelectChange("travelCompanions", option)}
                placeholder="Select your travel companions"
                className={ONBOARDING_PAGE_CLASSES.select}
              />
            </div>
            <div>
              <label className={ONBOARDING_PAGE_CLASSES.label}>Activity Preferences</label>
              <Select
                isMulti
                options={activityPreferencesOptions}
                onChange={(options) => handleTravelSelectChange("activityPreferences", options)}
                placeholder="Select your activity preferences"
                className={ONBOARDING_PAGE_CLASSES.select}
              />
            </div>
            <div>
              <label className={ONBOARDING_PAGE_CLASSES.label}>Preferred Seasons</label>
              <Select
                options={preferredSeasonsOptions}
                onChange={(option) => handleTravelSelectChange("preferredSeasons", option)}
                placeholder="Select your preferred seasons"
                className={ONBOARDING_PAGE_CLASSES.select}
              />
            </div>
            <div>
              <label className={ONBOARDING_PAGE_CLASSES.label}>Maximum Travel Duration</label>
              <Select
                options={maxTravelDurationOptions}
                onChange={(option) => handleTravelSelectChange("maxTravelDuration", option)}
                placeholder="Select your maximum travel duration"
                className={ONBOARDING_PAGE_CLASSES.select}
              />
            </div>
            <button
              onClick={handleSubmit}
              className={ONBOARDING_PAGE_CLASSES.button}
            >
              Save and Continue
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default OnboardingPage;