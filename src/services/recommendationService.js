// src/services/recommendationService.js
import { recommendations } from "../data/recommendations";
import llmService from "./llmService";

// Simulierte API-Funktion (derzeit aktiv)
const fetchRecommendationsFromAPI = async (userFingerprint) => {
  const { travelPreferences, travelHistory } = userFingerprint;
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
  if (travelHistory?.length > 0) {
    const pastDestinations = travelHistory.map((trip) => trip.destination);
    suggestedDestinations = suggestedDestinations.filter(
      (dest) => !pastDestinations.includes(dest)
    );
  }
  return [...new Set(suggestedDestinations)];
};

// Zukünftige LLM-Integration (Platzhalter)
const fetchRecommendationsFromLLM = async (userFingerprint) => {
  const { travelPreferences, travelHistory } = userFingerprint;
  const prompt = `Suggest travel destinations for a user with the following preferences: travel style - ${travelPreferences.travelStyle || "relaxed"}, activity preferences - ${travelPreferences.activityPreferences || "sightseeing"}. The user has previously visited: ${travelHistory.map((trip) => trip.destination).join(", ") || "none"}. Provide a list of 5 unique destinations that match the preferences and avoid past destinations.`;
  try {
    const response = await llmService.generateResponse(prompt);
    // Annahme: LLM gibt eine Liste im Format "1. Destination\n2. Destination\n..." zurück
    const destinations = response
      .split("\n")
      .filter((line) => line.match(/^\d+\.\s/))
      .map((line) => line.replace(/^\d+\.\s/, "").trim());
    return destinations;
  } catch (error) {
    console.error("Error fetching LLM recommendations:", error);
    return [];
  }
};

export const getRecommendedDestinations = async (user) => {
  if (!user) return [];

  const userFingerprint = {
    travelPreferences: user.travelPreferences || {},
    travelHistory: user.travelHistory || [],
    searchHistory: user.searchHistory || [],
  };

  // Derzeit simulierte API, später LLM
  const recommendations = await fetchRecommendationsFromAPI(userFingerprint);
  // const recommendations = await fetchRecommendationsFromLLM(userFingerprint);
  return recommendations;
};