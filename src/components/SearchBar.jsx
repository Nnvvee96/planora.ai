// src/components/SearchBar.jsx
import { useState } from "react";
import { motion } from "framer-motion";
import { SEARCH_BAR_PLACEHOLDER } from "../utils/constants";
import { fadeInVariants } from "../utils/animationUtils"; // Neu hinzugefügt

function SearchBar({ onSearch }) {
  const [query, setQuery] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query);
      setQuery("");
    }
  };

  return (
    <motion.form
      variants={fadeInVariants}
      initial="hidden"
      animate="visible"
      onSubmit={handleSubmit}
      className="w-full max-w-2xl flex items-center space-x-4"
    >
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={SEARCH_BAR_PLACEHOLDER}
        className="flex-grow p-4 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
      />
      <button
        type="submit"
        className="bg-blue-500 text-white px-6 py-4 rounded-lg hover:bg-blue-600 transition-colors"
      >
        Search
      </button>
    </motion.form>
  );
}

export default SearchBar;