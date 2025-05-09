// src/pages/TripDetailsPage.jsx
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { mockTrips } from "../data/trips";
import cityImage from "../assets/images/city.jpg";

function TripDetailsPage() {
  const { id } = useParams();
  const trip = mockTrips.find((trip) => trip.id === parseInt(id));

  if (!trip) {
    return (
      <div className="min-h-screen bg-[var(--primary-bg)] text-[var(--text-primary)] flex flex-col">
        <Navbar />
        <main className="flex flex-col items-center justify-center flex-grow px-4 py-8 text-center">
          <h1 className="text-4xl font-bold">Trip Not Found</h1>
          <Link to="/dashboard" className="text-[var(--accent)] hover:underline mt-4">
            Back to Dashboard
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-cover bg-center"
      style={{ backgroundImage: `url(${cityImage})`, backgroundColor: 'var(--primary-bg)' }}
    >
      <div className="min-h-screen bg-gradient-to-b from-[var(--primary-bg)] to-[var(--secondary-bg)] opacity-90">
        <Navbar />
        <main className="flex flex-col items-center justify-center flex-grow px-4 py-16 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="card max-w-2xl"
          >
            <h1 className="text-4xl font-bold text-[var(--text-primary)]">{trip.destination}</h1>
            <p className="mt-4 text-[var(--text-secondary)]">{trip.description}</p>
            <p className="mt-4 text-[var(--accent-secondary)] font-semibold">€{trip.price}</p>

            <h2 className="mt-8 text-2xl font-semibold text-[var(--text-primary)]">Itinerary</h2>
            <ul className="mt-4 text-[var(--text-secondary)] space-y-2">
              {trip.itinerary.map((day, index) => (
                <li key={index}>{day}</li>
              ))}
            </ul>

            <h2 className="mt-8 text-2xl font-semibold text-[var(--text-primary)]">Accommodations</h2>
            <p className="mt-4 text-[var(--text-secondary)]">{trip.accommodations}</p>

            <Link
              to="/dashboard"
              className="mt-8 inline-block bg-[var(--button-bg)] text-[var(--text-primary)] px-6 py-3 rounded-lg hover:bg-[var(--button-hover)] transition-all duration-300 shadow-lg"
            >
              Back to Dashboard
            </Link>
          </motion.div>
        </main>
        <Footer />
      </div>
    </div>
  );
}

export default TripDetailsPage;