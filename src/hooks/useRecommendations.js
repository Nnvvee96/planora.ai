// src/hooks/useRecommendations.js
import { useState, useEffect } from "react";
import { getRecommendedDestinations } from "../services/recommendationService";

export const useRecommendations = (user) => {
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

  return { destinations, loading };
};