// src/pages/SearchResultsPage.jsx
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

function SearchResultsPage() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <Navbar />
      <main className="flex-grow flex items-center justify-center">
        <h2 className="text-2xl font-bold">Search Results Page</h2>
      </main>
      <Footer />
    </div>
  );
}

export default SearchResultsPage;