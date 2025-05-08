// src/pages/SettingsPage.jsx
import React from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { SETTINGS_PAGE_CLASSES } from "../utils/constants";

function SettingsPage() {
  return (
    <div className={SETTINGS_PAGE_CLASSES.container}>
      <Navbar />
      <div className={SETTINGS_PAGE_CLASSES.content}>
        <div className={SETTINGS_PAGE_CLASSES.card}>
          <h2 className={SETTINGS_PAGE_CLASSES.title}>Setting</h2>
          <p className={SETTINGS_PAGE_CLASSES.text}>Setting page coming soon!</p>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default SettingsPage;