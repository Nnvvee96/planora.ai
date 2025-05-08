// src/pages/UpgradePlanPage.jsx
import React from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { UPGRADE_PLAN_PAGE_CLASSES } from "../utils/constants";

function UpgradePlanPage() {
  return (
    <div className={UPGRADE_PLAN_PAGE_CLASSES.container}>
      <Navbar />
      <div className={UPGRADE_PLAN_PAGE_CLASSES.content}>
        <div className={UPGRADE_PLAN_PAGE_CLASSES.card}>
          <h2 className={UPGRADE_PLAN_PAGE_CLASSES.title}>Upgrade Plan</h2>
          <p className={UPGRADE_PLAN_PAGE_CLASSES.text}>Upgrade Plan Soon!</p>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default UpgradePlanPage;