const Listing = require("../models/listingModels");
const { errorHandler } = require("../utils/error");
const axios = require("axios");

// Helper to parse filter values
const parseFilter = (value, allOptions) => {
  return value === undefined || value === "false" || value === "all"
    ? { $in: allOptions }
    : value;
};

// CREATE LISTING
module.exports.createListing = async (req, res, next) => {
  try {
    if (!req.user) return next(errorHandler(401, "Unauthorized"));

    const {
      name,
      description,
      address,
      regularPrice,
      bathrooms,
      bedrooms,
      furnished,
      parking,
      type,
      offer,
      imageUrls,
    } = req.body;

    if (
      !name ||
      !description ||
      !address ||
      !regularPrice ||
      !bathrooms ||
      !bedrooms ||
      !imageUrls ||
      imageUrls.length === 0
    ) {
      return next(errorHandler(400, "All required fields must be provided"));
    }

    const GEOCODE_API = "https://api.opencagedata.com/geocode/v1/json";
    const geoRes = await axios.get(GEOCODE_API, {
      params: {
        q: address,
        key: process.env.OPENCAGE_API_KEY,
      },
    });

    const geo = geoRes.data?.results?.[0]?.geometry;

    if (!geo) return next(errorHandler(400, "Invalid address"));

    const listing = await Listing.create({
      ...req.body,
      location: { lat: geo.lat, lng: geo.lng },
      userRef: req.user.id,
    });

    res.status(201).json(listing);
  } catch (error) {
    next(error);
  }
};

// DELETE LISTING
module.exports.deleteListing = async (req, res, next) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) return next(errorHandler(404, "Listing not found"));

    if (listing.userRef.toString() !== req.user.id) {
      return next(errorHandler(401, "You can delete your own listing"));
    }

    await Listing.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Listing has been deleted" });
  } catch (error) {
    next(error);
  }
};

// UPDATE LISTING
module.exports.updateListing = async (req, res, next) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) return next(errorHandler(404, "No listing found"));

    if (listing.userRef.toString() !== req.user.id) {
      return next(errorHandler(401, "You can only update your own listing"));
    }

    const updatedListing = await Listing.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.status(200).json(updatedListing);
  } catch (error) {
    next(error);
  }
};

// GET SINGLE LISTING
module.exports.getListing = async (req, res, next) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) return next(errorHandler(404, "Listing not found!"));

    res.status(200).json(listing);
  } catch (error) {
    next(error);
  }
};

// GET MULTIPLE LISTINGS WITH FILTERS
module.exports.getListings = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 9;
    const startIndex = parseInt(req.query.startIndex) || 0;

    const offer = parseFilter(req.query.offer, [false, true]);
    const furnished = parseFilter(req.query.furnished, [false, true]);
    const parking = parseFilter(req.query.parking, [false, true]);
    const type = parseFilter(req.query.type, ["sale", "rent"]);
    const searchTerm = req.query.searchTerm || "";
    const sort = req.query.sort || "createdAt";
    const order = req.query.order === "asc" ? 1 : -1;

    const filterQuery = {
      offer,
      furnished,
      parking,
      type,
    };

    // Add search functionality across multiple fields
    if (searchTerm) {
      // Check if search term is a number (for price search)
      const isNumeric = !isNaN(searchTerm) && searchTerm !== '';
      
      filterQuery.$or = [
        { name: { $regex: searchTerm, $options: "i" } },
        { address: { $regex: searchTerm, $options: "i" } },
        { description: { $regex: searchTerm, $options: "i" } },
        { type: { $regex: searchTerm, $options: "i" } },
      ];
      
      // If search term is numeric, also search in price fields
      if (isNumeric) {
        const price = parseInt(searchTerm);
        filterQuery.$or.push(
          { regularPrice: { $lte: price + 10000, $gte: price - 10000 } },
          { discountPrice: { $lte: price + 10000, $gte: price - 10000 } }
        );
      }
    }

    const listings = await Listing.find(filterQuery)
      .sort({ [sort]: order })
      .limit(limit)
      .skip(startIndex);

    const total = await Listing.countDocuments(filterQuery);

    res.status(200).json({ success: true, total, listings });
  } catch (error) {
    next(error);
  }
};
