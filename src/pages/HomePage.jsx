// src/pages/HomePage.jsx
import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { features } from "../data/features";
import { fadeInUpVariants, containerVariants } from "../utils/animationUtils";

function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-gray-900 text-white flex flex-col">
      <Navbar />
      <main className="flex flex-col flex-grow">
        {/* Hero Section with Motion */}
        <div className="flex flex-col items-center justify-center flex-grow text-center px-4 py-12">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-6"
          >
            <motion.h1
              variants={fadeInUpVariants}
              className="text-4xl md:text-5xl font-bold"
            >
              Welcome to Planora Travel Agent
            </motion.h1>
            <motion.p
              variants={fadeInUpVariants}
              className="text-lg md:text-xl max-w-2xl mx-auto"
            >
              Plan your next adventure with ease! Personalized travel recommendations, tailored to your budget and preferences, all in one place.
            </motion.p>
            <motion.div variants={fadeInUpVariants} className="flex space-x-4">
              <Link
                to="/register"
                className="bg-blue-500 text-white py-2 px-6 rounded-lg hover:bg-blue-600 transition-colors text-lg"
              >
                Get Started
              </Link>
              <Link
                to="/login"
                className="bg-transparent border-2 border-gray-200 text-gray-200 py-2 px-6 rounded-lg hover:bg-gray-200 hover:text-gray-900 transition-colors text-lg"
              >
                Login
              </Link>
            </motion.div>
          </motion.div>
        </div>

        {/* Features Section */}
        <div className="bg-gray-800 py-12 px-4">
          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                variants={fadeInUpVariants}
                initial="hidden"
                animate="visible"
                className="text-center"
              >
                {feature.icon}
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default HomePage;