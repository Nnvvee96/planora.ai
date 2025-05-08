// src/utils/autosuggestUtils.js
import { countries } from "countries-list";
import cities from "cities.json";

const countryNameToIso = {};
Object.entries(countries).forEach(([iso, country]) => {
  countryNameToIso[country.name] = iso;
});

const countryList = Object.values(countries).sort((a, b) => a.name.localeCompare(b.name));
export const countryOptions = countryList.map((country) => ({
  value: country.name,
  label: country.name,
}));

export const citiesByCountry = cities.reduce((acc, city) => {
  const isoCode = city.country;
  if (!acc[isoCode]) acc[isoCode] = [];
  if (!acc[isoCode].includes(city.name)) acc[isoCode].push(city.name);
  return acc;
}, {});
Object.keys(citiesByCountry).forEach((country) => {
  citiesByCountry[country] = citiesByCountry[country].sort();
});

export const fuzzyMatch = (input, city) => {
  if (!input || !city) return 0;
  input = input.toLowerCase();
  city = city.toLowerCase();
  let score = 0;
  for (let i = 0; i < input.length && i < city.length; i++) {
    if (input[i] === city[i]) score++;
  }
  return score / Math.max(input.length, city.length);
};

export const getAutosuggestProps = (cities, setSuggestions, profileSettings, setProfileSettings) => {
  const onSuggestionsFetchRequested = ({ value }) => {
    if (!profileSettings.country || cities.length === 0) {
      setSuggestions([]);
      return;
    }
    const inputValue = value.trim().toLowerCase();
    const suggestions = cities
      .filter((city) => city.toLowerCase().includes(inputValue))
      .sort((a, b) => {
        const scoreA = fuzzyMatch(inputValue, a);
        const scoreB = fuzzyMatch(inputValue, b);
        return scoreB - scoreA;
      });
    setSuggestions(suggestions.slice(0, 5));
  };

  const onSuggestionsClearRequested = () => {
    setSuggestions([]);
  };

  const onSuggestionSelected = (event, { suggestion }) => {
    setProfileSettings({ ...profileSettings, city: suggestion });
  };

  const getSuggestionValue = (suggestion) => suggestion;

  const renderSuggestion = (suggestion, classes) => (
    <div className={classes.autosuggestSuggestion}>{suggestion}</div>
  );

  const handleCityChange = (event, { newValue }) => {
    setProfileSettings({ ...profileSettings, city: newValue });
  };

  const handleCityBlur = () => {
    if (!profileSettings.city || !profileSettings.country) return;
    const inputValue = profileSettings.city.trim().toLowerCase();
    const exactMatch = cities.find((city) => city.toLowerCase() === inputValue);
    if (exactMatch) {
      setProfileSettings({ ...profileSettings, city: exactMatch });
      return;
    }
    const bestMatch = cities
      .map((city) => ({ city, score: fuzzyMatch(inputValue, city) }))
      .sort((a, b) => b.score - a.score)[0];
    if (bestMatch && bestMatch.score > 0.7) {
      setProfileSettings({ ...profileSettings, city: bestMatch.city });
    }
  };

  return {
    onSuggestionsFetchRequested,
    onSuggestionsClearRequested,
    onSuggestionSelected,
    getSuggestionValue,
    renderSuggestion,
    handleCityChange,
    handleCityBlur,
  };
};