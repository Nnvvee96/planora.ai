// src/services/recommendationService.js
import { recommendations } from "../data/recommendations";

// Simulierte API-Funktion (später durch echten API/LLM-Aufruf ersetzen)
const fetchRecommendationsFromAPI = async (userFingerprint) => {
  // Beispiel: Simulierte API-Antwort basierend auf travelStyle und travelHistory
  const { travelPreferences, travelHistory } = userFingerprint;

  // Basierend auf statischen Daten (vorübergehend)
  let suggestedDestinations = [];
  if (travelPreferences?.travelStyle) {
    const style = travelPreferences.travelStyle;
    if (recommendations[style]) {
      suggestedDestinations.push(...recommendations[style]);
    }
  }
  if (travelPreferences?.activityPreferences) {
    const activity = travelPreferences.activityPreferences;
    if (recommendations[activity]) {
      suggestedDestinations.push(...recommendations[activity]);
    }
  }

  // Berücksichtige travelHistory, um Duplikate zu vermeiden
  if (travelHistory?.length > 0) {
    const pastDestinations = travelHistory.map((trip) => trip.destination);
    suggestedDestinations = suggestedDestinations.filter(
      (dest) => !pastDestinations.includes(dest)
    );
  }

  return [...new Set(suggestedDestinations)];
};

export const getRecommendedDestinations = async (user) => {
  if (!user) return [];

  // Nutzer-Fingerabdruck erstellen
  const userFingerprint = {
    travelPreferences: user.travelPreferences || {},
    travelHistory: user.travelHistory || [],
    searchHistory: user.searchHistory || [],
  };

  // Später: Echter API/LLM-Aufruf
  // const recommendations = await fetchRecommendationsFromLLM(userFingerprint);
  const recommendations = await fetchRecommendationsFromAPI(userFingerprint);
  return recommendations;
};