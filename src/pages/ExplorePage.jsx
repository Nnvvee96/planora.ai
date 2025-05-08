// src/pages/ExplorePage.jsx
import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { getRecommendedDestinations } from "../services/recommendationService";

function ExplorePage() {
  const { user } = useAuth();
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDestinations = async () => {
      setLoading(true);
      const recommendedDestinations = await getRecommendedDestinations(user);
      setDestinations(recommendedDestinations);
      setLoading(false);
    };

    fetchDestinations();
  }, [user]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-gray-900 text-white flex flex-col items-center p-4">
      <div className="bg-gray-800 bg-opacity-80 backdrop-blur-md p-8 rounded-lg shadow-lg w-full max-w-2xl">
        <h2 className="text-2xl font-bold mb-6">Explore Destinations</h2>
        {loading ? (
          <p className="text-gray-300">Loading recommendations...</p>
        ) : destinations.length > 0 ? (
          <div className="space-y-4">
            <p className="text-gray-300">
              Based on your preferences for{" "}
              {user?.travelPreferences?.travelStyle || "travel"} and{" "}
              {user?.travelPreferences?.activityPreferences || "activities"}, we recommend:
            </p>
            {destinations.map((destination, index) => (
              <div
                key={index}
                className="bg-gray-700 p-4 rounded-lg text-center"
              >
                <h3 className="text-xl font-semibold">{destination}</h3>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-300">
            Set your travel preferences in your profile to get personalized recommendations.
          </p>
        )}
      </div>
    </div>
  );
}

export default ExplorePage;