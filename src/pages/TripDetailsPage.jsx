import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

// Mock trip data (same as in DashboardPage for consistency)
const mockTrips = [
  {
    id: 1,
    destination: "Mallorca, Spain",
    description: "Enjoy sunny beaches and vibrant nightlife in Mallorca.",
    price: 550,
    itinerary: [
      "Day 1: Arrive in Palma, explore the historic city center.",
      "Day 2: Relax on Playa de Muro beach.",
      "Day 3: Visit the Serra de Tramuntana mountains.",
    ],
    accommodations: "4-star beachfront hotel with breakfast included.",
  },
  {
    id: 2,
    destination: "Santorini, Greece",
    description: "Relax in luxury with stunning views of the Aegean Sea.",
    price: 620,
    itinerary: [
      "Day 1: Arrive in Fira, enjoy a sunset dinner.",
      "Day 2: Visit Oia for iconic views and photography.",
      "Day 3: Take a boat tour to the volcanic islands.",
    ],
    accommodations: "Luxury villa with private pool and sea views.",
  },
  {
    id: 3,
    destination: "Ibiza, Spain",
    description: "Party on the beach and explore hidden coves in Ibiza.",
    price: 580,
    itinerary: [
      "Day 1: Arrive in Ibiza Town, explore Dalt Vila.",
      "Day 2: Party at a beach club in Playa d’en Bossa.",
      "Day 3: Discover the secluded Cala Comte beach.",
    ],
    accommodations: "Modern apartment near the nightlife district.",
  },
];

function TripDetailsPage() {
  const { id } = useParams(); // Get the trip ID from the URL
  const trip = mockTrips.find((trip) => trip.id === parseInt(id)); // Find the trip by ID

  if (!trip) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black to-gray-900 text-white flex flex-col">
        <Navbar />
        <main className="flex flex-col items-center justify-center flex-grow text-center px-4 py-8">
          <h1 className="text-4xl font-bold mb-4">Trip Not Found</h1>
          <Link to="/dashboard" className="text-blue-400 hover:underline">
            Back to Dashboard
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-gray-900 text-white flex flex-col">
      <Navbar />
      <main className="flex flex-col items-center justify-center flex-grow text-center px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="bg-gray-800 bg-opacity-80 backdrop-blur-md p-8 rounded-lg shadow-lg w-full max-w-2xl"
        >
          <h1 className="text-4xl font-bold mb-4">{trip.destination}</h1>
          <p className="text-gray-400 mb-4">{trip.description}</p>
          <p className="text-blue-400 font-semibold mb-6">€{trip.price}</p>

          <h2 className="text-2xl font-semibold mb-2">Itinerary</h2>
          <ul className="text-gray-300 mb-6 space-y-2">
            {trip.itinerary.map((day, index) => (
              <li key={index}>{day}</li>
            ))}
          </ul>

          <h2 className="text-2xl font-semibold mb-2">Accommodations</h2>
          <p className="text-gray-300 mb-6">{trip.accommodations}</p>

          <Link
            to="/dashboard"
            className="bg-blue-500 text-white px-6 py-3 rounded-full hover:bg-blue-600 transition-colors"
          >
            Back to Dashboard
          </Link>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
}

export default TripDetailsPage;