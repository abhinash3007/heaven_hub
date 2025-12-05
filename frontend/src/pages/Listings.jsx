import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import SwiperCore from "swiper";
import { useSelector } from "react-redux";
import { Navigation } from "swiper/modules";
import "swiper/css/bundle";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

import {
  FaBath,
  FaBed,
  FaChair,
  FaMapMarkerAlt,
  FaParking,
  FaShare,
  FaExclamationTriangle,
  FaShieldAlt,
  FaSearch,
  FaMap,
} from "react-icons/fa";
import Contact from "../components/Contact";
mapboxgl.accessToken =
  "pk.eyJ1IjoidW5kZWZpbmVkMDMiLCJhIjoiY2x2dW45dzg2MWoycDJqcGF2em5qY3NxdiJ9.qiAvyWqbp40gxZf56okDUA";

export default function Listing() {
  SwiperCore.use([Navigation]);
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [copied, setCopied] = useState(false);
  const [contact, setContact] = useState(false);
  const params = useParams();
  const { currentUser } = useSelector((state) => state.user);
  const [crimeCount, setCrimeCount] = useState(null);
  const [crimeList, setCrimeList] = useState([]);
  const [showCrime, setShowCrime] = useState(false);
  const [crimeLoading, setCrimeLoading] = useState(false);
  const [crimeError, setCrimeError] = useState(false);
  const [propertyCoordinates, setPropertyCoordinates] = useState(null);
  const [showMap, setShowMap] = useState(false);
  const [mapLoading, setMapLoading] = useState(false);
  const [lastCrimeUpdate, setLastCrimeUpdate] = useState(null);
  const mapContainer = useRef(null);
  const map = useRef(null);
  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchListing = async () => {
      try {
        setLoading(true);
        const res = await fetch(
          `${API_URL}/listing/get/${params.listingId}`
        );
        const data = await res.json();
        if (data.success === false) {
          setError(true);
          setLoading(false);
          return;
        }
        setListing(data);

        setLoading(false);
        setError(false);
      } catch (error) {
        setError(true);
        setLoading(false);
      }
    };
    fetchListing();
  }, [params.listingId]);

  useEffect(() => {
    if (listing?.address) {
      geocodePropertyAddress(listing.address);
    }
  }, [listing]);

  const geocodePropertyAddress = async (address) => {
    try {
      setMapLoading(true);

      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
          address
        )}.json?access_token=${mapboxgl.accessToken}&country=in&limit=1`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.features && data.features.length > 0) {
        const [lng, lat] = data.features[0].center;
        const placeName = data.features[0].place_name;
        setPropertyCoordinates({ lat, lng, placeName });
      } else {
        setPropertyCoordinates({
          lat: 19.076,
          lng: 72.8777,
          placeName: "Mumbai, Maharashtra, India",
        });
      }
    } catch (error) {
      setPropertyCoordinates({
        lat: 19.076,
        lng: 72.8777,
        placeName: "Mumbai, Maharashtra, India",
      });
    } finally {
      setMapLoading(false);
    }
  };

  useEffect(() => {
    if (showMap && propertyCoordinates && !map.current) {
      try {
        map.current = new mapboxgl.Map({
          container: mapContainer.current,
          style: "mapbox://styles/mapbox/streets-v12",
          center: [propertyCoordinates.lng, propertyCoordinates.lat],
          zoom: 15,
        });

        map.current.addControl(new mapboxgl.NavigationControl(), "top-right");

        new mapboxgl.Marker({ color: "#3B82F6" })
          .setLngLat([propertyCoordinates.lng, propertyCoordinates.lat])
          .setPopup(
            new mapboxgl.Popup().setHTML(`
            <div class="p-3">
              <h3 class="font-semibold text-blue-600 text-sm">Property Location</h3>
              <p class="text-xs text-gray-600 mt-1">${
                listing?.address || "Property Address"
              }</p>
            </div>
          `)
          )
          .addTo(map.current);

        setTimeout(() => {
          map.current?.resize();
        }, 1000);
      } catch (error) {
        console.error("Error initializing map:", error);
      }
    }

    if (!showMap && map.current) {
      map.current.remove();
      map.current = null;
    }
  }, [showMap, propertyCoordinates]); 

  const handleShowCrime = async () => {
    if (!listing?.address) {
      setCrimeError(true);
      return;
    }

    setShowCrime(!showCrime);

    if (!showCrime) {
      await fetchCrimeData();
    } else {
      setCrimeCount(null);
      setCrimeList([]);
      setLastCrimeUpdate(null);
      setCrimeError(false);
    }
  };

  const fetchCrimeData = async () => {
    try {
      setCrimeLoading(true);
      setCrimeError(false);

      const countRes = await fetch(
        `${API_URL}/crime/count?address=${encodeURIComponent(
          listing.address
        )}`
      );
      const countData = await countRes.json();

      if (countData.success) {
        setCrimeCount(countData.count || 0);
      } else {
        setCrimeCount(0);
      }

      const summaryRes = await fetch(
        `${API_URL}/crime/summary?address=${encodeURIComponent(
          listing.address
        )}`
      );
      const summaryData = await summaryRes.json();

      if (summaryData.success) {
        setCrimeList(summaryData.data.slice(0, 6));
        setLastCrimeUpdate(new Date().toLocaleString());
      } else {
        setCrimeList([]);
        setCrimeError(true);
      }
    } catch (error) {
      console.error("Error fetching crime data:", error);
      setCrimeCount(0);
      setCrimeList([]);
      setCrimeError(true);
    } finally {
      setCrimeLoading(false);
    }
  };

  const getCrimeSeverityColor = (count) => {
    if (count === 0) return "bg-green-600";
    if (count <= 2) return "bg-yellow-600";
    return "bg-orange-600";
  };

  const getCrimeSeverityText = (count) => {
    if (count === 0) return "Safe";
    if (count <= 2) return "Low";
    return "Medium";
  };

  return (
    <main className="mt-24">
      {loading && <p className="text-center my-7 text-2xl">Loading...</p>}
      {error && (
        <p className="text-center my-7 text-2xl text-red-600">
          Something went wrong!
        </p>
      )}
      {listing && !loading && !error && (
        <div className="max-w-6xl mx-auto p-4">
          <Swiper navigation className="rounded-lg shadow-md">
            {listing.imageUrls.map((url) => (
              <SwiperSlide key={url}>
                <img
                  src={url}
                  alt="listing-image"
                  className="w-full h-[500px] object-cover rounded-lg"
                />
              </SwiperSlide>
            ))}
          </Swiper>
          <div className="fixed top-20 right-4 z-10 border rounded-full w-12 h-12 flex justify-center items-center bg-white shadow-lg cursor-pointer">
            <FaShare
              className="text-slate-500"
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                setCopied(true);
                setTimeout(() => {
                  setCopied(false);
                }, 2000);
              }}
            />
          </div>
          {copied && (
            <p className="fixed top-32 right-4 z-10 rounded-md bg-gray-100 p-2 shadow-md">
              Link copied!
            </p>
          )}
          <div className="bg-white rounded-lg shadow-lg p-6 my-7">
            <h1 className="text-3xl font-semibold">
              {listing.name} - ₹{" "}
              {(
                (listing.offer ? listing.discountPrice : listing.regularPrice) *
                85
              ).toLocaleString("en-IN")}
              {listing.type === "rent" && " / month"}
            </h1>
            
            <div className=" m-5 flex items-center justify-between gap-2 ml-4">
              <p className="flex items-center mt-4 gap-2 text-gray-700 text-sm">
              <FaMapMarkerAlt className="text-green-700" />
              {listing.address}
            </p>
              <button
                className={`px-4 py-2 text-white rounded-lg hover:opacity-90 transition-all duration-200 flex items-center gap-2 ${
                  crimeCount !== null
                    ? getCrimeSeverityColor(crimeCount)
                    : "bg-blue-500"
                }`}
                onClick={handleShowCrime}
                disabled={crimeLoading}
              >
                <FaShieldAlt />
                {crimeLoading
                  ? "Loading..."
                  : crimeCount !== null
                  ? `${getCrimeSeverityText(
                      crimeCount
                    )} Crime Risk (${crimeCount})`
                  : "Check Crime Data"}
              </button>
            </div>

            {crimeError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2">
                <FaExclamationTriangle className="text-red-500" />
                <span className="text-red-700 text-sm">
                  Unable to fetch crime data for this location
                </span>
              </div>
            )}

            {/* Property Location Map */}
            <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
              <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-slate-800 flex items-center gap-2">
                    <FaMap className="text-blue-500" />
                    Property Location
                  </h4>
                  {propertyCoordinates && (
                    <p className="text-xs text-slate-600 mt-1">
                      Mapped: {propertyCoordinates.placeName}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => setShowMap(!showMap)}
                  className="flex items-center gap-1 px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
                >
                  <FaMap />
                  {showMap ? "Hide Map" : "Show Map"}
                </button>
              </div>

              {showMap && (
                <div>
                  {mapLoading ? (
                    <div className="h-64 flex items-center justify-center bg-slate-50">
                      <div className="text-center">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
                        <p className="text-slate-600 text-sm">Loading map...</p>
                      </div>
                    </div>
                  ) : propertyCoordinates ? (
                    <div
                      ref={mapContainer}
                      className="w-full h-64 bg-slate-100 border border-slate-200 relative"
                      style={{ minHeight: "256px" }}
                    >
                      <div className="absolute inset-0 flex items-center justify-center text-slate-500 text-sm">
                        Loading map...
                      </div>
                    </div>
                  ) : (
                    <div className="h-64 flex items-center justify-center bg-slate-50">
                      <div className="text-center">
                        <FaMapMarkerAlt className="text-slate-400 text-2xl mx-auto mb-2" />
                        <p className="text-slate-600 text-sm">
                          Location not found
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Crime Data Display */}
            {showCrime && crimeList.length > 0 && (
              <div className="bg-slate-50 border border-slate-200 p-4 rounded-lg my-3">
                <h4 className="font-bold mb-3 text-slate-800 flex items-center gap-2">
                  <FaExclamationTriangle className="text-orange-500" />
                  Latest Crime Incidents in This Area
                  {crimeLoading && (
                    <span className="text-xs text-slate-500 font-normal">
                      (Refreshing...)
                    </span>
                  )}
                </h4>
                <div className="space-y-2">
                  {crimeList.map((item, idx) => (
                    <div
                      key={idx}
                      className="bg-white p-3 rounded border-l-4 border-orange-400"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h5 className="font-semibold text-slate-800 text-sm">
                            {item.title}
                          </h5>
                        </div>
                        <span className="text-xs text-slate-500 ml-2 whitespace-nowrap">
                          {item.date}
                        </span>
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
                  ))}
                </div>
                {lastCrimeUpdate && (
                  <div className="mt-3 pt-2 border-t border-slate-200">
                    <span className="text-slate-600 text-xs">
                      Last Updated: {lastCrimeUpdate}
                    </span>
                  </div>
                )}
                <p className="text-xs text-slate-500 mt-3">
                  * Crime data is based on recent news articles for this area.
                  Results may not be comprehensive.
                </p>
              </div>
            )}

            {showCrime &&
              crimeList.length === 0 &&
              crimeCount === 0 &&
              !crimeLoading && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-2">
                  <FaShieldAlt className="text-green-500" />
                  <span className="text-green-700 text-sm">
                    No recent crime incidents reported in this area
                  </span>
                </div>
              )}
            <div className="flex gap-4 my-4">
              <span className="bg-red-600 w-full max-w-[200px] text-white text-center p-2 rounded-md">
                {listing.type === "rent" ? "For Rent" : "For Sale"}
              </span>
              {listing.offer && (
                <span className="bg-green-600 w-full max-w-[200px] text-white text-center p-2 rounded-md">
                  ₹
                  {(
                    (+listing.regularPrice - +listing.discountPrice) *
                    85
                  ).toLocaleString("en-IN")}{" "}
                  OFF
                </span>
              )}
            </div>
            <p className="text-gray-800">
              <span className="font-semibold text-black">Description:</span>
              {listing.description}
            </p>
            <ul className="text-green-700 font-semibold text-sm flex flex-wrap items-center gap-4 sm:gap-6 my-4">
              <li className="flex items-center gap-1 whitespace-nowrap ">
                <FaBed className="text-lg" />
                {listing.bedrooms > 1
                  ? `${listing.bedrooms} beds`
                  : `${listing.bedrooms} bed`}
              </li>
              <li className="flex items-center gap-1 whitespace-nowrap ">
                <FaBath className="text-lg" />
                {listing.bathrooms > 1
                  ? `${listing.bathrooms} baths`
                  : `${listing.bathrooms} bath`}
              </li>
              <li className="flex items-center gap-1 whitespace-nowrap ">
                <FaParking className="text-lg" />
                {listing.parking ? "Parking spot" : "No Parking"}
              </li>
              <li className="flex items-center gap-1 whitespace-nowrap ">
                <FaChair className="text-lg" />
                {listing.furnished ? "Furnished" : "Unfurnished"}
              </li>
            </ul>
            {currentUser && listing.userRef !== currentUser._id && !contact && (
              <button
                onClick={() => setContact(true)}
                className="bg-slate-700 text-white rounded-lg uppercase hover:opacity-90 p-3 transition duration-200"
              >
                Contact Landlord
              </button>
            )}
            {contact && <Contact listing={listing} />}
          </div>
        </div>
      )}
    </main>
  );
}
