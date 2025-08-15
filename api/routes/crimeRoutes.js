const express = require("express");
const axios = require("axios");
const router = express.Router();
const rateLimit = require("express-rate-limit");

const NodeCache = require("node-cache");
const crimeCache = new NodeCache({
  stdTTL: 1800,
  checkperiod: 600, 
});
const generateCacheKey = (city, type = "summary") => {
  return `crime_${type}_${city.toLowerCase().replace(/\s+/g, "_")}`;
};

const crimeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 10, 
  message: {
    success: false,
    error: "Too many requests, please try again later."
  }
});

router.use(crimeLimiter);

const CRIME_KEYWORDS = [
  "murder",
  "rape",
  "robbery",
  "assault",
  "gangrape",
  "shooting",
  "kidnapping",

  "fraud",
  "money laundering",
  "homicide",
  "drug trafficking",
  "cybercrime",
  "extortion",
  "terrorism",
  "gang violence",
  "molestation",
];

const INDIAN_CITIES = new Set([
  "mumbai",
  "delhi",
  "bangalore",
  "hyderabad",
  "chennai",
  "kolkata",
  "pune",
  "ahmedabad",
  "jaipur",
  "surat",
  "lucknow",
  "kanpur",
  "nagpur",
  "indore",
  "thane",
  "bhopal",
  "visakhapatnam",
  "patna",
  "vadodara",
  "ghaziabad",
  "ludhiana",
  "agra",
  "nashik",
  "faridabad",
  "meerut",
  "rajkot",
  "kalyan",
  "vasai",
  "aurangabad",
  "solapur",
  "bhavnagar",
  "jamnagar",
  "gandhinagar",
  "anand",
  "nadiad",
  "bharuch",
  "borivalli",
  "bandra",

  "maharashtra",
  "delhi",
  "karnataka",
  "tamil nadu",
  "telangana",
  "gujarat",
  "rajasthan",
  "uttar pradesh",
  "west bengal",
  "madhya pradesh",
  "andhra pradesh",
  "bihar",
  "punjab",
  "haryana",
  "kerala",
  "odisha",
  "assam",
  "jharkhand",
  "chhattisgarh",
  "uttarakhand",
  "himachal pradesh",
  "goa",
  "manipur",
  "meghalaya",
  "tripura",
  "mizoram",
  "nagaland",
  "arunachal pradesh",
  "sikkim",
  "andaman and nicobar",
  "lakshadweep",
  "dadra and nagar haveli",
  "ladakh",
]);

const extractCityFromAddress = (address) => {
  if (!address) return null;

  const addressLower = address.toLowerCase();
  const words = addressLower.split(/[\s,.-]+/);
  const internationalIndicators = [
    "spain",
    "france",
    "usa",
    "uk",
    "germany",
    "italy",
    "portugal",
    "netherlands",
    "belgium",
    "switzerland",
  ];
  const isInternational = internationalIndicators.some((country) =>
    addressLower.includes(country)
  );

  if (isInternational) {
    return null; 
  }

    for (const word of words) {
    const trimmedWord = word.trim();
    if (INDIAN_CITIES.has(trimmedWord)) {
      return trimmedWord;
    }
  }

  for (const city of INDIAN_CITIES) {
    if (addressLower.includes(city)) {
      return city;
    }
  }

  const cityPatterns = [
    /(mumbai|bombay)/i,
    /(delhi|new delhi)/i,
    /(bangalore|bengaluru)/i,
    /(hyderabad)/i,
    /(chennai|madras)/i,
    /(kolkata|calcutta)/i,
    /(pune)/i,
    /(ahmedabad)/i,
    /(jaipur)/i,
    /(surat)/i,
    /(lucknow)/i,
    /(kanpur)/i,
    /(nagpur)/i,
    /(indore)/i,
    /(thane)/i,
    /(bhopal)/i,
    /(visakhapatnam|vizag)/i,
    /(patna)/i,
    /(vadodara|baroda)/i,
    /(ghaziabad)/i,
  ];

  for (const pattern of cityPatterns) {
    const match = address.match(pattern);
    if (match) {
      return match[1].toLowerCase();
    }
  }
  return null;
};

const isCrimeRelated = (title, description) => {
  if (!title || !description) return false;

  const text = (title + " " + description).toLowerCase();

  const hasCrimeKeyword = CRIME_KEYWORDS.some((keyword) =>
    text.includes(keyword)
  );

  const crimePatterns = [
    /(arrested|arrest)/i,
    /(police|cop|officer)/i,
    /(victim|killed|died|death)/i,
    /(suspect|accused|defendant)/i,
    /(court|judge|judgment|verdict)/i,
    /(jail|prison|imprisonment)/i,
    /(investigation|probe|inquiry)/i,
    /(case|fir|complaint)/i,
    /(wanted|fugitive|escape)/i,
    /(gang|mafia|cartel)/i,
    /(illegal|unlawful|criminal)/i,
    /(violence|violent|attack)/i,
    /(weapon|gun|knife|bomb)/i,
    /(drug|narcotic|smuggling)/i,
    /(fraud|scam|cheat)/i,
    /(theft|robbery|burglary)/i,
    /(kidnap|abduct|hostage)/i,
    /(rape|molest|assault)/i,
    /(murder|kill|homicide)/i,
    /(suicide|self-harm)/i,
  ];

  const hasCrimePattern = crimePatterns.some((pattern) => pattern.test(text));

  return hasCrimeKeyword || hasCrimePattern;
};

router.get("/summary", async (req, res) => {
  try {
    let city = req.query.city;

    if (!city && req.query.address) {
      city = extractCityFromAddress(req.query.address);
    }

    if (!city) {
      return res.json({
        success: true,
        data: [],
        totalCount: 0,
        city: null,
        message: "Crime data only available for Indian cities",
      });
    }

    const cacheKey = generateCacheKey(city, "summary");
    const cachedData = crimeCache.get(cacheKey);

    if (cachedData) {
      return res.json({
        ...cachedData,
        fromCache: true,
        cacheTime: new Date().toISOString(),
      });
    }

    const response = await axios.get("https://newsdata.io/api/1/latest", {
      params: {
        apikey: "pub_252fcf639348463bbe561344d8e4ce47",
        q: city,
        country: "in",
        language: "en",
      },
    });

    const articles = response.data.results || [];

    const crimeArticles = articles.filter((article) =>
      isCrimeRelated(article.title, article.description)
    );

    const crimeSummaries = crimeArticles.map((article) => ({
      title: article.title,
      description: article.description,
      date: article.pubDate
        ? new Date(article.pubDate).toLocaleDateString()
        : "Unknown Date",
      publishedAt: article.pubDate,
      link: article.link,
    }));

    const responseData = {
      success: true,
      data: crimeSummaries,
      totalCount: crimeSummaries.length,
      city: city,
      fromCache: false,
      fetchTime: new Date().toISOString(),
      link: crimeSummaries.map((item) => item.link),
    };

    crimeCache.set(cacheKey, responseData);
    res.json(responseData);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Failed to fetch crime summary",
      message: error.message,
    });
  }
});

router.get("/count", async (req, res) => {
  try {
    let city = req.query.city;

    if (!city && req.query.address) {
      city = extractCityFromAddress(req.query.address);
    }

    if (!city) {
      return res.json({
        success: true,
        count: 0,
        city: null,
        message: "Crime data only available for Indian cities",
      });
    }

    const cacheKey = generateCacheKey(city, "summary");
    const cachedData = crimeCache.get(cacheKey);

    if (cachedData) {
      return res.json({
        success: true,
        count: cachedData.totalCount || 0,
        city: city,
        fromCache: true,
        cacheTime: cachedData.fetchTime || new Date().toISOString(),
      });
    }
    const response = await axios.get("https://newsdata.io/api/1/latest", {
      params: {
        apikey: "pub_252fcf639348463bbe561344d8e4ce47",
        q: city,
        country: "in",
        language: "en",
      },
    });

    const articles = response.data.results || [];

    const crimeArticles = articles.filter((article) =>
      isCrimeRelated(article.title, article.description)
    );


    const responseData = {
      success: true,
      data: crimeArticles.map((article) => ({
        title: article.title,
        description: article.description,
        date: article.pubDate
          ? new Date(article.pubDate).toLocaleDateString()
          : "Unknown Date",
        publishedAt: article.pubDate,
        link: article.link,
      })),
      totalCount: crimeArticles.length,
      city: city,
      fromCache: false,
      fetchTime: new Date().toISOString(),
    };

    crimeCache.set(cacheKey, responseData);

    res.json({
      success: true,
      count: crimeArticles.length,
      city: city,
      fromCache: false,
    });
  } catch (error) {
    console.error("Error fetching crime count:", error.message);
    res.status(500).json({
      success: false,
      error: "Failed to fetch crime count",
      message: error.message,
    });
  }
});

module.exports = router;
