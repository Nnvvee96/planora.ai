// src/pages/DashboardPage.jsx
import React from "react";
import { useNavigation } from "../utils/navigationUtils";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

function DashboardPage() {
  const { goToPlanTrip } = useNavigation();

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 flex flex-col">
      <Navbar />
      <main className="flex-grow p-4">
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-4">Your Dashboard</h2>
          <p>Here you can view your upcoming trips, past trips, or start planning a new adventure!</p>
          <button
            onClick={goToPlanTrip}
            className="mt-4 bg-blue-600 text-gray-100 px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Plan a New Trip
          </button>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default DashboardPage;