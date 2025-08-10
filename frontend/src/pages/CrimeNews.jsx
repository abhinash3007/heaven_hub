import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { FaExclamationTriangle, FaShieldAlt, FaNewspaper, FaMapMarkerAlt, FaSearch, FaMap } from "react-icons/fa";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

// Set your Mapbox access token here
mapboxgl.accessToken = 'pk.eyJ1IjoidW5kZWZpbmVkMDMiLCJhIjoiY2x2dW45dzg2MWoycDJqcGF2em5qY3NxdiJ9.qiAvyWqbp40gxZf56okDUA';

const CrimeNews = () => {
  const [crime, setCrime] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchType, setSearchType] = useState("city"); // "city", "address", or "radius"
  const [radius, setRadius] = useState(2); // Default 2km radius
  const [searchResults, setSearchResults] = useState(null);
  const [showMap, setShowMap] = useState(false);
  const [mapLoading, setMapLoading] = useState(false);
  const mapContainer = useRef(null);
  const map = useRef(null);

  const fetchCrimeNews = async (term = "", type = "city", radiusKm = 2) => {
    setLoading(true);
    setError(false);
    setSearchResults(null);
    
    try {
      let url;
      
      if (type === "radius") {
        // Use the new radius search endpoint
        url = `https://heaven-hub-2.onrender.com/api/crime/radius-search?address=${encodeURIComponent(term)}&radius=${radiusKm}`;
      } else {
        // Use existing city/address search
        const param = type === "address" ? "address" : "city";
        url = term
          ? `https://heaven-hub-2.onrender.com/api/crime/summary?${param}=${encodeURIComponent(term)}`
          : "https://heaven-hub-2.onrender.com/api/crime/summary";
      }
      
      const res = await fetch(url);
      const data = await res.json();
      
      if (data.success) {
        setCrime(data.data);
        if (type === "radius") {
          setSearchResults({
            center: data.center,
            radius: data.radius,
            totalFound: data.totalFound,
            searchAddress: data.searchAddress
          });
        }
      } else {
        setCrime([]);
        setError(true);
      }
    } catch (err) {
      console.error('Error fetching crime news:', err);
      setCrime([]);
      setError(true);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCrimeNews();
  }, []);

  // Initialize map when showMap changes and crime data is available
  useEffect(() => {
    if (showMap && crime.length > 0 && searchResults?.center && !map.current) {
      setMapLoading(true);
      
      try {
        map.current = new mapboxgl.Map({
          container: mapContainer.current,
          style: 'mapbox://styles/mapbox/streets-v12',
          center: [searchResults.center.lng, searchResults.center.lat],
          zoom: 12
        });

        // Add navigation controls
        map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

        // Add crime markers
        crime.forEach((crimeItem, index) => {
          if (crimeItem.coordinates) {
            new mapboxgl.Marker({ color: '#EF4444' })
              .setLngLat([crimeItem.coordinates.lng, crimeItem.coordinates.lat])
              .setPopup(new mapboxgl.Popup().setHTML(`
                <div class="p-2">
                  <h3 class="font-semibold text-sm">${crimeItem.title}</h3>
                  <p class="text-xs text-gray-600">${crimeItem.distanceFormatted} away</p>
                  <p class="text-xs text-gray-500">${crimeItem.date}</p>
                </div>
              `))
              .addTo(map.current);
          }
        });

        // Add center marker
        new mapboxgl.Marker({ color: '#3B82F6' })
          .setLngLat([searchResults.center.lng, searchResults.center.lat])
          .setPopup(new mapboxgl.Popup().setHTML(`
            <div class="p-2">
              <h3 class="font-semibold text-sm">Search Center</h3>
              <p class="text-xs text-gray-600">${searchResults.searchAddress}</p>
              <p class="text-xs text-gray-500">${searchResults.radius}km radius</p>
            </div>
          `))
          .addTo(map.current);

        setMapLoading(false);
      } catch (error) {
        console.error('Error initializing map:', error);
        setMapLoading(false);
      }
    }

    // Cleanup map when showMap becomes false
    if (!showMap && map.current) {
      map.current.remove();
      map.current = null;
    }
  }, [showMap, crime, searchResults]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      fetchCrimeNews(searchTerm.trim(), searchType, radius);
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
          Stay informed about recent crime incidents. Search by city, address, or use radius search for precise location-based crime data.
        </p>
      </div>

      {/* Search Form */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder={
                  searchType === "city" 
                    ? "Enter city name (e.g., Mumbai, Delhi, Bangalore)" 
                    : searchType === "address"
                    ? "Enter full address (e.g., 123 Main St, Mumbai, Maharashtra)"
                    : "Enter address for radius search (e.g., 123 Main St, Mumbai)"
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
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="searchType"
                  value="radius"
                  checked={searchType === "radius"}
                  onChange={(e) => setSearchType(e.target.value)}
                  className="text-blue-600"
                />
                <span className="text-sm text-slate-700 flex items-center gap-1">
                  <FaMapMarkerAlt className="text-red-500" />
                  Radius Search
                </span>
              </label>
            </div>
            
            {searchType === "radius" && (
              <div className="flex items-center gap-2">
                <label className="text-sm text-slate-700">Radius:</label>
                <select
                  value={radius}
                  onChange={(e) => setRadius(parseFloat(e.target.value))}
                  className="border border-slate-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value={1}>1 km</option>
                  <option value={2}>2 km</option>
                  <option value={3}>3 km</option>
                  <option value={5}>5 km</option>
                  <option value={10}>10 km</option>
                </select>
              </div>
            )}
          </div>
        </form>
      </div>

      {/* Radius Search Results Summary */}
      {searchResults && searchType === "radius" && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-2 text-blue-800 mb-2">
            <FaMapMarkerAlt />
            <span className="font-semibold">Radius Search Results</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-blue-600 font-medium">Search Address:</span>
              <p className="text-blue-800">{searchResults.searchAddress}</p>
            </div>
            <div>
              <span className="text-blue-600 font-medium">Radius:</span>
              <p className="text-blue-800">{searchResults.radius} km</p>
            </div>
            <div>
              <span className="text-blue-600 font-medium">Crimes Found:</span>
              <p className="text-blue-800">{searchResults.totalFound} incidents</p>
            </div>
          </div>
          
          {/* Map Toggle Button */}
          {searchResults.center && (
            <div className="mt-4 pt-4 border-t border-blue-200">
              <button
                onClick={() => setShowMap(!showMap)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <FaMap />
                {showMap ? 'Hide Map' : 'Show Map'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-slate-600">
            {searchType === "radius" ? "Searching for crimes in your area..." : "Loading crime news..."}
          </p>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-2 text-red-700">
            <FaExclamationTriangle />
            <span>
              {searchType === "radius" 
                ? "Unable to perform radius search. Please check the address and try again."
                : "Unable to fetch crime news. Please try again later."
              }
            </span>
          </div>
        </div>
      )}

      {/* Results */}
      {!loading && !error && crime.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-slate-800 flex items-center gap-2">
              <FaNewspaper className="text-blue-500" />
              {searchType === "radius" 
                ? `Crime Incidents Within ${radius}km Radius (${crime.length} found)`
                : `Recent Crime Incidents (${crime.length} found)`
              }
            </h2>
            <div className="text-sm text-slate-500">
              Based on recent news articles
            </div>
          </div>
          
          <div className="grid gap-4">
            {crime.map((item, idx) => (
              <div key={idx} className="bg-white rounded-lg shadow-md p-6 border-l-4 border-orange-400">
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
                            Published: {new Date(item.publishedAt).toLocaleDateString()}
                          </span>
                        )}
                        {searchType === "radius" && item.distanceFormatted && (
                          <span className="text-red-600 font-medium flex items-center gap-1">
                            <FaMapMarkerAlt className="text-xs" />
                            {item.distanceFormatted} away
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
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
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
            {searchType === "radius" 
              ? "No Crime Incidents Found in This Area"
              : "No Recent Crime Incidents Found"
            }
          </h3>
          <p className="text-green-700">
            {searchType === "radius"
              ? `Great news! No recent crime incidents have been reported within ${radius}km of this location.`
              : "Great news! No recent crime incidents have been reported in this area."
            }
          </p>
        </div>
      )}

      {/* Disclaimer */}
      <div className="mt-8 p-4 bg-slate-50 rounded-lg">
        <p className="text-sm text-slate-600">
          <strong>Disclaimer:</strong> Crime data is based on recent news articles and may not be comprehensive. 
          {searchType === "radius" && " Radius search uses geocoding to approximate locations and distances."}
          This information is provided for awareness purposes only and should not be the sole factor in making 
          real estate decisions. Always conduct thorough research and consider multiple factors when evaluating 
          a property or neighborhood.
        </p>
      </div>
    </div>
  );
};

export default CrimeNews;
