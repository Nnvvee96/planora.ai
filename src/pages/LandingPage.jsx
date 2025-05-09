// src/pages/LandingPage.jsx
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { fadeInUpVariants } from "../utils/animationUtils";
import beachImage from "../assets/images/beach.jpg"; // Beispiel-Bild

function LandingPage() {
  return (
    <div
      className="min-h-screen bg-cover bg-center"
      style={{ backgroundImage: `url(${beachImage})`, backgroundColor: 'var(--primary-bg)' }}
    >
      <div className="min-h-screen bg-gradient-to-b from-[var(--primary-bg)] to-[var(--secondary-bg)] opacity-90">
        <Navbar />
        <main className="flex flex-col items-center justify-center flex-grow px-4 py-16 text-center">
          {/* Hero-Bereich */}
          <motion.div
            variants={fadeInUpVariants}
            initial="hidden"
            animate="visible"
            className="relative z-10"
          >
            <h1 className="text-5xl md:text-7xl font-bold text-[var(--text-primary)] drop-shadow-[var(--shadow-dark)]">
              Discover Your Dream Trip with <span className="text-[var(--accent-secondary)]">Planora</span>
            </h1>
            <p className="mt-4 text-lg md:text-xl text-[var(--text-secondary)] max-w-2xl mx-auto">
              Let our AI-powered platform plan your perfect journey, tailored to your mood, budget, and interests.
            </p>
            <div className="mt-6 flex justify-center space-x-4">
              <Link
                to="/register"
                className="bg-[var(--button-bg)] text-[var(--text-primary)] px-6 py-3 rounded-lg hover:bg-[var(--button-hover)] transition-all duration-300 shadow-lg"
              >
                Get Started
              </Link>
              <Link
                to="/explore"
                className="border-2 border-[var(--accent)] text-[var(--accent)] px-6 py-3 rounded-lg hover:bg-[var(--accent)] hover:text-[var(--text-primary)] transition-all duration-300"
              >
                Explore Trips
              </Link>
            </div>
          </motion.div>

          {/* Statistikbereiche */}
          <div className="mt-16 flex justify-center space-x-8 text-[var(--text-primary)]">
            <div className="text-center">
              <h3 className="text-4xl font-bold">10K+</h3>
              <p className="text-sm text-[var(--text-secondary)]">Unique Trips</p>
            </div>
            <div className="text-center">
              <h3 className="text-4xl font-bold">7K+</h3>
              <p className="text-sm text-[var(--text-secondary)]">Happy Travelers</p>
            </div>
            <div className="text-center">
              <h3 className="text-4xl font-bold">49K+</h3>
              <p className="text-sm text-[var(--text-secondary)]">Bookings</p>
            </div>
          </div>

          {/* Feature-Highlights */}
          <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl">
            <div className="card text-center">
              <h3 className="text-xl font-semibold text-[var(--accent)]">AI Trip Planning</h3>
              <p className="mt-2 text-[var(--text-secondary)]">
                Personalized itineraries based on your preferences.
              </p>
            </div>
            <div className="card text-center">
              <h3 className="text-xl font-semibold text-[var(--accent)]">Budget Optimization</h3>
              <p className="mt-2 text-[var(--text-secondary)]">
                Find the best deals for flights and accommodations.
              </p>
            </div>
            <div className="card text-center">
              <h3 className="text-xl font-semibold text-[var(--accent)]">Real-Time Updates</h3>
              <p className="mt-2 text-[var(--text-secondary)]">
                Stay informed with the latest travel insights.
              </p>
            </div>
          </div>

          {/* Footer */}
          <Footer />
        </main>
      </div>
    </div>
  );
}

export default LandingPage;