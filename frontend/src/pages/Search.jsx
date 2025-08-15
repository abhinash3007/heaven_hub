import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ListingItem from "../components/ListingItem";

const Search = () => {
  const navigate = useNavigate();
  const [sidebardata, setSidebardata] = useState({
    searchTerm: "",
    type: "all",
    parking: false,
    furnished: false,
    offer: false,
    sort: "created_at",
    order: "desc",
  });
  const [loading, setLoading] = useState(false);
  const [listing, setListing] = useState([]);
  const [showMore, setShowMore] = useState(false);

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const searchTermFromUrl = urlParams.get("searchTerm");
    const typeFromUrl = urlParams.get("type");
    const parkingFromUrl = urlParams.get("parking");
    const furnishedFromUrl = urlParams.get("furnished");
    const offerFromUrl = urlParams.get("offer");
    const sortFromUrl = urlParams.get("sort");
    const orderFromUrl = urlParams.get("order");

    if (
      sortFromUrl ||
      typeFromUrl ||
      parkingFromUrl ||
      furnishedFromUrl ||
      offerFromUrl ||
      sortFromUrl ||
      orderFromUrl
    ) {
      setSidebardata({
        searchTerm: searchTermFromUrl || "",
        type: typeFromUrl || "all",
        parking: parkingFromUrl === "true",
        furnished: furnishedFromUrl === "true",
        offer: offerFromUrl === "true",
        sort: sortFromUrl || "created_at",
        order: orderFromUrl || "desc",
      });
    }

    const fetchListing = async () => {
      setLoading(true);
      urlParams.set("limit", 6);
      const searchQuery = urlParams.toString();
      const res = await fetch(
        `https://heaven-hub-2.onrender.com/api/listing/get?${searchQuery}`
      );
      const data = await res.json();

      if (data.success && Array.isArray(data.listings)) {
        setShowMore(data.listings.length > 5);
        setListing(data.listings);
      } else {
        setShowMore(false);
        setListing([]);
      }
      setLoading(false);
    };
    fetchListing();
  }, [location.search]);

  const handleChange = (e) => {
    const { id, value, checked } = e.target;

    if (["all", "rent", "sale"].includes(id)) {
      setSidebardata({ ...sidebardata, type: id });
    } else if (id === "searchTerm") {
      setSidebardata({ ...sidebardata, searchTerm: value });
    } else if (["offer", "parking", "furnished"].includes(id)) {
      setSidebardata({ ...sidebardata, [id]: checked });
    } else if (id === "sort_order") {
      const [sort, order] = value.split("_");
      setSidebardata({
        ...sidebardata,
        sort: sort || "created_at",
        order: order || "desc",
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const urlParams = new URLSearchParams();
    Object.keys(sidebardata).forEach((key) => {
      urlParams.set(key, sidebardata[key]);
    });
    navigate(`/search?${urlParams.toString()}`);
  };

  const onShowMore = async () => {
    const startIndex = listing.length;
    const urlParams = new URLSearchParams(location.search);
    urlParams.set("startIndex", startIndex);
    urlParams.set("limit", 6);
    const searchQuery = urlParams.toString();
    const res = await fetch(
      `https://heaven-hub-2.onrender.com/api/listing/get?${searchQuery}`
    );
    const data = await res.json();
    setShowMore(data.length === 6);
    setListing([...listing, ...data]);
  };

  return (
    <div className="flex flex-col mt-24 md:flex-row ">
      <div className="p-7 border-b-2 md:border-r-2 md:min-h-screen">
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <h2 className="text-2xl font-bold mb-4">Search Listings</h2>
          <div className="flex items-center gap-2">
            <label className="whitespace-nowrap font-semibold">
              Search Term:
            </label>
            <input
              type="text"
              id="searchTerm"
              placeholder="Search..."
              className="border rounded-lg p-3 w-full shadow-sm focus:outline-none focus:ring focus:ring-blue-400"
              value={sidebardata.searchTerm}
              onChange={handleChange}
            />
          </div>
          <div className="flex gap-2 flex-wrap items-center">
            <label className="font-semibold">Type:</label>
            <div className="flex gap-2">
              <input
                type="radio"
                id="all"
                name="type"
                className="w-5"
                checked={sidebardata.type === "all"}
                onChange={handleChange}
              />
              <span>All</span>
            </div>
            <div className="flex gap-2">
              <input
                type="radio"
                id="rent"
                name="type"
                className="w-5"
                checked={sidebardata.type === "rent"}
                onChange={handleChange}
              />
              <span>Rent</span>
            </div>
            <div className="flex gap-2">
              <input
                type="radio"
                id="sale"
                name="type"
                className="w-5"
                checked={sidebardata.type === "sale"}
                onChange={handleChange}
              />
              <span>Sale</span>
            </div>
            <div className="flex gap-2">
              <input
                type="checkbox"
                id="offer"
                className="w-5"
                checked={sidebardata.offer}
                onChange={handleChange}
              />
              <span>Offer</span>
            </div>
          </div>
          <div className="flex gap-2 flex-wrap items-center">
            <label className="font-semibold">Facilities:</label>
            <div className="flex gap-2">
              <input
                type="checkbox"
                id="parking"
                className="w-5"
                checked={sidebardata.parking}
                onChange={handleChange}
              />
              <span>Parking</span>
            </div>
            <div className="flex gap-2">
              <input
                type="checkbox"
                id="furnished"
                className="w-5"
                checked={sidebardata.furnished}
                onChange={handleChange}
              />
              <span>Furnished</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <label className="font-semibold">Sort By:</label>
            <select
              id="sort_order"
              className="border rounded-lg p-3 w-full shadow-sm focus:outline-none focus:ring focus:ring-blue-400"
              onChange={handleChange}
              defaultValue="createdAt_desc"
            >
              <option value="regularPrice_desc">Price: High to Low</option>
              <option value="regularPrice_asc">Price: Low to High</option>
              <option value="createdAt_desc">Latest</option>
              <option value="createdAt_asc">Oldest</option>
            </select>
          </div>
          <button className="bg-blue-600 text-white p-3 rounded-lg uppercase hover:bg-blue-700 transition duration-200">
            Search
          </button>
        </form>
      </div>
      <div className="flex-1 p-7">
        <h1 className="text-3xl font-bold border-b p-3 mt-5 text-blue-600">
          Listing Results:
        </h1>
        <div className="flex flex-wrap gap-4 mt-4">
          {!loading && listing.length === 0 && (
            <p className="text-xl text-red-600">No listings found!</p>
          )}
          {loading && (
            <p className="text-xl text-blue-600 text-center w-full">
              Loading...
            </p>
          )}
          {!loading &&
            listing.map((listing) => (
              <ListingItem key={listing._id} listing={listing} />
            ))}
          {showMore && (
            <button
              onClick={onShowMore}
              className="text-green-700 hover:underline p-3 text-center w-full"
            >
              Show More
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Search;
