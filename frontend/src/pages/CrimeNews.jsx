import { useEffect, useState } from "react";
import {
  FaExclamationTriangle,
  FaShieldAlt,
  FaNewspaper,
  FaSearch,
} from "react-icons/fa";

const CrimeNews = () => {
  const [crime, setCrime] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchType, setSearchType] = useState("city");

  const fetchCrimeNews = async (term = "", type = "city") => {
    setLoading(true);
    setError(false);

    try {
      const param = type === "address" ? "address" : "city";
      const url = term
        ? `https://heaven-hub-2.onrender.com/api/crime/summary?${param}=${encodeURIComponent(term)}`
        : "https://heaven-hub-2.onrender.com/api/crime/summary";

      const res = await fetch(url);
      const data = await res.json();

      if (data.success) {
        setCrime(data.data);
      } else {
        setCrime([]);
        setError(true);
      }
    } catch (err) {
      console.error("Error fetching crime news:", err);
      setCrime([]);
      setError(true);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCrimeNews();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      fetchCrimeNews(searchTerm.trim(), searchType);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800 mb-2 flex items-center gap-2">
          <FaExclamationTriangle className="text-red-500" />
          Crime News & Safety Information
        </h1>
        <p className="text-slate-600">
          Stay informed about recent crime incidents. Search by city or address
          for location-based crime data.
        </p>
      </div>

      {/* Search Form */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeho  lder={
                  searchType === "city"
                    ? "Enter city name (e.g., Mumbai, Delhi, Bangalore)"
                    : "Enter full address (e.g., 123 Main St, Mumbai, Maharashtra)"
                }
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <FaSearch />
              Search
            </button>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="searchType"
                  value="city"
                  checked={searchType === "city"}
                  onChange={(e) => setSearchType(e.target.value)}
                  className="text-blue-600"
                />
                <span className="text-sm text-slate-700">City Search</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="searchType"
                  value="address"
                  checked={searchType === "address"}
                  onChange={(e) => setSearchType(e.target.value)}
                  className="text-blue-600"
                />
                <span className="text-sm text-slate-700">Address Search</span>
              </label>
            </div>
          </div>
        </form>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-slate-600">Loading crime news...</p>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-2 text-red-700">
            <FaExclamationTriangle />
            <span>Unable to fetch crime news. Please try again later.</span>
          </div>
        </div>
      )}

      {/* Results */}
      {!loading && !error && crime.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-slate-800 flex items-center gap-2">
              <FaNewspaper className="text-blue-500" />
              Recent Crime Incidents ({crime.length} found)
            </h2>
            <div className="text-sm text-slate-500">
              Based on recent news articles
            </div>
          </div>

          <div className="grid gap-4">
            {crime.map((item, idx) => (
              <div
                key={idx}
                className="bg-white rounded-lg shadow-md p-6 border-l-4 border-orange-400"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-800 mb-2">
                      {item.title}
                    </h3>
                    <p className="text-slate-600 mb-3 line-clamp-3">
                      {item.description}
                    </p>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-4">
                        {item.publishedAt && (
                          <span className="text-slate-500">
                            Published:{" "}
                            {new Date(item.publishedAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                      {item.link && (
                        <a
                          href={item.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1"
                        >
                          Read full article
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                            />
                          </svg>
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No Results */}
      {!loading && !error && crime.length === 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
          <FaShieldAlt className="text-green-500 text-4xl mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-green-800 mb-2">
            No Recent Crime Incidents Found
          </h3>
          <p className="text-green-700">
            Great news! No recent crime incidents have been reported in this
            area.
          </p>
        </div>
      )}

      {/* Disclaimer */}
      <div className="mt-8 p-4 bg-slate-50 rounded-lg">
        <p className="text-sm text-slate-600">
          <strong>Disclaimer:</strong> Crime data is based on recent news
          articles and may not be comprehensive. This information is provided
          for awareness purposes only and should not be the sole factor in
          making real estate decisions. Always conduct thorough research and
          consider multiple factors when evaluating a property or neighborhood.
        </p>
      </div>
    </div>
  );
};

export default CrimeNews;
