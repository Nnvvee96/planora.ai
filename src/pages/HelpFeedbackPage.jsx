// src/pages/HelpFeedbackPage.jsx
import React from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { HELP_FEEDBACK_PAGE_CLASSES } from "../utils/constants";

function HelpFeedbackPage() {
  return (
    <div className={HELP_FEEDBACK_PAGE_CLASSES.container}>
      <Navbar />
      <div className={HELP_FEEDBACK_PAGE_CLASSES.content}>
        <div className={HELP_FEEDBACK_PAGE_CLASSES.card}>
          <h2 className={HELP_FEEDBACK_PAGE_CLASSES.title}>Help & Feedback</h2>
          <p className={HELP_FEEDBACK_PAGE_CLASSES.text}>
            Need assistance? Contact us at <a href="mailto:support@planora.com" className="text-blue-500 hover:underline">support@planora.com</a>.
          </p>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default HelpFeedbackPage;