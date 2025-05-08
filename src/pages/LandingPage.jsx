// src/pages/LandingPage.jsx
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { fadeInUpVariants } from "../utils/animationUtils";

function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-gray-900 text-white flex flex-col">
      <Navbar />
      <main className="flex flex-col items-center justify-center flex-grow text-center px-4 pt-16 pb-8">
        <motion.h1
          variants={fadeInUpVariants}
          initial="hidden"
          animate="visible"
          className="text-5xl md:text-7xl font-bold mb-4"
        >
          Plan Your Dream Trip with Planora
        </motion.h1>
        <motion.p
          variants={fadeInUpVariants}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.2 }}
          className="text-lg md:text-xl mb-8 max-w-2xl"
        >
          Let our AI find the cheapest flights and accommodations tailored to your mood, budget, and interests.
        </motion.p>
        <motion.div
          variants={fadeInUpVariants}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.4 }}
        >
          <Link
            to="/register"
            className="bg-blue-500 text-white px-6 py-3 rounded-full text-lg hover:bg-blue-600 transition-colors"
          >
            Get Started
          </Link>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
}

export default LandingPage;