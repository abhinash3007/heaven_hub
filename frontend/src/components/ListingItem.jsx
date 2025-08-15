import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { MdLocationOn } from "react-icons/md";
import { FaShieldAlt } from "react-icons/fa";

const ListingItem = ({ listing }) => {
  const [crimeCount, setCrimeCount] = useState(null);
  const [crimeLoading, setCrimeLoading] = useState(false);

  useEffect(() => {
    const fetchCrimeCount = async () => {
      if (!listing?.address) return;

      try {
        setCrimeLoading(true);
        const res = await fetch(
          `/api/crime/count?address=${encodeURIComponent(
            listing.address
          )}`
        );
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }

        const data = await res.json();

        if (data.success) {
          setCrimeCount(data.count || 0);
        } else {
          setCrimeCount(0);
        }
      } catch (error) {
        console.error("Error fetching crime count:", error);
        setCrimeCount(0);
      } finally {
        setCrimeLoading(false);
      }
    };

    fetchCrimeCount();
  }, [listing?.address]);

  const getCrimeSeverityColor = (count) => {
    if (count === 0) return "bg-green-500";
    if (count <= 2) return "bg-yellow-500";
    if (count <= 5) return "bg-orange-500";
    return "bg-red-500";
  };

  const getCrimeSeverityText = (count) => {
    if (count === 0) return "Safe";
    if (count <= 2) return "Low";
    if (count <= 5) return "Medium";
    return "High";
  };

  return (
    <div className="bg-white shadow-lg hover:shadow-xl transition-shadow overflow-hidden rounded-lg w-full sm:w-[330px] relative">
      <Link to={`/listing/${listing._id}`}>
        <img
          src={
            listing.imageUrls[0] ||
            "https://53.fs1.hubspotusercontent-na1.net/hub/53/hubfs/Sales_Blog/real-estate-business-compressor.jpg?width=595&height=400&name=real-estate-business-compressor.jpg"
          }
          alt="listing cover"
          className="h-[320px] sm:h-[220px] w-full object-cover transition-transform duration-300 hover:scale-105"
        />
        {crimeCount !== null && (
          <div
            className={`absolute top-2 right-2 px-2 py-1 rounded-full text-white text-xs font-semibold flex items-center gap-1 ${getCrimeSeverityColor(
              crimeCount
            )}`}
          >
            <FaShieldAlt className="text-xs" />
            {getCrimeSeverityText(crimeCount)}
          </div>
        )}
        <div className="p-4 flex flex-col gap-2">
          <p className="truncate text-lg font-semibold text-gray-800">
            {listing.name}
          </p>
          <div className="flex items-center gap-1">
            <MdLocationOn className="h-5 w-5 text-green-700" />
            <p className="text-sm text-gray-600 truncate w-full">
              {listing.address}
            </p>
          </div>
          <p className="text-sm text-gray-600 line-clamp-2">
            {listing.description}
          </p>
          <p className="text-gray-800 mt-2 font-semibold">
            ₹
            {(
              (listing.offer ? listing.discountPrice : listing.regularPrice) *
              85
            ).toLocaleString("en-IN")}
            {listing.type === "rent" && " / month"}
          </p>
          {crimeLoading ? (
            <div className="text-xs text-slate-500 flex items-center gap-1">
              <FaShieldAlt className="text-xs" />
              Loading crime data...
            </div>
          ) : (
            crimeCount !== null && (
              <div className="text-xs text-slate-600 flex items-center gap-1">
                <FaShieldAlt className="text-xs" />
                {crimeCount === 0
                  ? "No recent crime incidents"
                  : `${crimeCount} recent crime incident${
                      crimeCount > 1 ? "s" : ""
                    }`}
              </div>
            )
          )}
        </div>
      </Link>
    </div>
  );
};

export default ListingItem;