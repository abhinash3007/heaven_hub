const express = require('express');
const axios = require('axios');
const router = express.Router();

// Mapbox configuration
//pk.eyJ1IjoidW5kZWZpbmVkMDMiLCJhIjoiY2x2dW45dzg2MWoycDJqcGF2em5qY3NxdiJ9.qiAvyWqbp40gxZf56okDUA
const MAPBOX_TOKEN = 'pk.eyJ1IjoidW5kZWZpbmVkMDMiLCJhIjoiY2x2dW45dzg2MWoycDJqcGF2em5qY3NxdiJ9.qiAvyWqbp40gxZf56okDUA';
const MAPBOX_GEOCODING_URL = 'https://api.mapbox.com/geocoding/v5/mapbox.places';

const CRIME_KEYWORDS = [
'murder', 'rape', 'robbery', 'assault', 'gangrape', 'shooting', 'kidnapping',

  'fraud', 'money laundering', 'homicide', 'drug trafficking', 'cybercrime',
  'extortion', 'terrorism', 'gang violence', 'molestation'
];

// Simplified list of major Indian cities and states
const INDIAN_CITIES = new Set([
  // Major Cities
  'mumbai', 'delhi', 'bangalore', 'hyderabad', 'chennai', 'kolkata', 'pune', 'ahmedabad', 'jaipur', 'surat',
  'lucknow', 'kanpur', 'nagpur', 'indore', 'thane', 'bhopal', 'visakhapatnam', 'patna', 'vadodara', 'ghaziabad',
  'ludhiana', 'agra', 'nashik', 'faridabad', 'meerut', 'rajkot', 'kalyan', 'vasai', 'aurangabad', 'solapur',
  'bhavnagar', 'jamnagar', 'gandhinagar', 'anand', 'nadiad', 'bharuch', 'borivalli', 'bandra',
  
  // Major States (for broader matching)
  'maharashtra', 'delhi', 'karnataka', 'tamil nadu', 'telangana', 'gujarat', 'rajasthan', 'uttar pradesh',
  'west bengal', 'madhya pradesh', 'andhra pradesh', 'bihar', 'punjab', 'haryana', 'kerala', 'odisha',
  'assam', 'jharkhand', 'chhattisgarh', 'uttarakhand', 'himachal pradesh', 'goa', 'manipur', 'meghalaya',
  'tripura', 'mizoram', 'nagaland', 'arunachal pradesh', 'sikkim', 'andaman and nicobar', 'lakshadweep',
  'dadra and nagar haveli', 'ladakh'
]);

// Helper function to extract city from address
const extractCityFromAddress = (address) => {
  if (!address) return null;
  
  console.log(`Extracting city from address: "${address}"`);
  
  const addressLower = address.toLowerCase();
  const words = addressLower.split(/[\s,.-]+/);
  
  console.log(`Split words:`, words);
  
  // First, try to find exact city matches
  for (const word of words) {
    const trimmedWord = word.trim();
    if (INDIAN_CITIES.has(trimmedWord)) {
      console.log(`Found exact city match: "${trimmedWord}"`);
      return trimmedWord;
    }
  }
  
  // If no exact match, try partial matches
  for (const city of INDIAN_CITIES) {
    if (addressLower.includes(city)) {
      console.log(`Found partial city match: "${city}"`);
      return city;
    }
  }
  
  // Common patterns for major cities
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
    /(ghaziabad)/i
  ];
  
  for (const pattern of cityPatterns) {
    const match = address.match(pattern);
    if (match) {
      console.log(`Found pattern match: "${match[1]}"`);
      return match[1].toLowerCase();
    }
  }
  
  console.log(`No city found in address: "${address}"`);
  return null;
};

// Helper function to check if article is crime-related with improved detection
const isCrimeRelated = (title, description) => {
  if (!title || !description) return false;
  
  const text = (title + ' ' + description).toLowerCase();
  
  // Check for crime keywords
  const hasCrimeKeyword = CRIME_KEYWORDS.some(keyword => text.includes(keyword));
  
  // Additional checks for crime-related patterns
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
    /(suicide|self-harm)/i
  ];
  
  const hasCrimePattern = crimePatterns.some(pattern => pattern.test(text));
  
  return hasCrimeKeyword || hasCrimePattern;
};

// Helper function to geocode address using Mapbox
const geocodeAddress = async (address) => {
  try {
    console.log(`Geocoding address: "${address}"`);
    
    // Check if Mapbox token is configured
    if (!MAPBOX_TOKEN || MAPBOX_TOKEN.includes('example')) {
      console.log('Mapbox token not configured, skipping geocoding');
      return null;
    }
    
    const response = await axios.get(`${MAPBOX_GEOCODING_URL}/${encodeURIComponent(address)}.json`, {
      params: {
        access_token: MAPBOX_TOKEN,
        country: 'in',
        limit: 1,
        types: 'address,poi'
      }
    });

    if (response.data.features && response.data.features.length > 0) {
      const [lng, lat] = response.data.features[0].center;
      const placeName = response.data.features[0].place_name;
      
      console.log(`Geocoded to: ${lat}, ${lng} - ${placeName}`);
      return { lat, lng, placeName };
    }
    
    console.log('No geocoding results found');
    return null;
  } catch (error) {
    console.error('Geocoding error:', error.message);
    return null;
  }
};

// Helper function to calculate distance between two points (Haversine formula)
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c; // Distance in kilometers
  return distance;
};

router.get('/summary', async (req, res) => {
    try {
        let city = req.query.city;
        
        // If no city provided, try to extract from address
        if (!city && req.query.address) {
            city = extractCityFromAddress(req.query.address);
        }
        
        if (!city) {
            return res.status(400).json({ 
                success: false, 
                error: 'City parameter is required or provide address for city extraction' 
            });
        }

        console.log(`Fetching crime data for city: ${city}`);

        const response = await axios.get(
            'https://newsdata.io/api/1/latest',
            {
                params: {
                    apikey: 'pub_252fcf639348463bbe561344d8e4ce47',
                    q: city,
                    country: 'in',
                    language: 'en'
                }
            }
        );

        const articles = response.data.results || [];
        
        // Filter for crime-related articles
        const crimeArticles = articles.filter(article => 
            isCrimeRelated(article.title, article.description)
        );

        const crimeSummaries = crimeArticles.map(article => ({
            title: article.title,
            date: article.pubDate ? new Date(article.pubDate).toLocaleDateString() : 'Unknown Date',
            publishedAt: article.pubDate
        }));

        console.log(`Found ${crimeSummaries.length} crime articles for ${city}`);

        res.json({ 
            success: true, 
            data: crimeSummaries,
            totalCount: crimeSummaries.length,
            city: city
        });
    } catch (error) {
        console.error('Error fetching crime summary:', error.message);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to fetch crime summary',
            message: error.message 
        });
    }
});

// New endpoint to get just the crime count for a city
router.get('/count', async (req, res) => {
    try {
        let city = req.query.city;
        
        // If no city provided, try to extract from address
        if (!city && req.query.address) {
            city = extractCityFromAddress(req.query.address);
        }
        
        if (!city) {
            return res.status(400).json({ 
                success: false, 
                error: 'City parameter is required or provide address for city extraction' 
            });
        }

        console.log(`Fetching crime count for city: ${city}`);

        const response = await axios.get(
            'https://newsdata.io/api/1/latest',
            {
                params: {
                    apikey: 'pub_252fcf639348463bbe561344d8e4ce47',
                    q: city,
                    country: 'in',
                    language: 'en'
                }
            }
        );

        const articles = response.data.results || [];
        
        // Filter for crime-related articles
        const crimeArticles = articles.filter(article => 
            isCrimeRelated(article.title, article.description)
        );

        console.log(`Found ${crimeArticles.length} crime articles for ${city}`);

        res.json({ 
            success: true, 
            count: crimeArticles.length,
            city: city
        });
    } catch (error) {
        console.error('Error fetching crime count:', error.message);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to fetch crime count',
            message: error.message 
        });
    }
});

// New endpoint for radius-based crime search
router.get('/radius-search', async (req, res) => {
    try {
        const { address, radius = 2 } = req.query; // radius in km, default 2km
        
        if (!address) {
            return res.status(400).json({ 
                success: false, 
                error: 'Address parameter is required' 
            });
        }

        console.log(`Radius search for address: "${address}" within ${radius}km`);
        console.log(`Radius parameter type: ${typeof radius}, value: ${radius}`);
        console.log(`Parsed radius: ${parseFloat(radius)}`);

        // 1. Try to geocode the address
        let coordinates = null;
        try {
            coordinates = await geocodeAddress(address);
        } catch (geocodeError) {
            console.error('Geocoding failed:', geocodeError.message);
        }

        // 2. Extract city for news search (fallback if geocoding fails)
        const city = extractCityFromAddress(address);
        if (!city && !coordinates) {
            return res.status(400).json({ 
                success: false, 
                error: 'Could not determine location from the provided address' 
            });
        }

        // 3. Fetch crime news for the area
        const response = await axios.get(
            'https://newsdata.io/api/1/latest',
            {
                params: {
                    apikey: 'pub_252fcf639348463bbe561344d8e4ce47',
                    q: city || coordinates.placeName.split(',')[0],
                    country: 'in',
                    language: 'en'
                }
            }
        );

        const articles = response.data.results || [];
        const crimeArticles = articles.filter(article => 
            isCrimeRelated(article.title, article.description)
        );

        // 4. If geocoding failed, use city-based results without coordinates
        if (!coordinates) {
            const crimeSummaries = crimeArticles.map(article => ({
                title: article.title,
                description: article.description,
                date: article.pubDate ? new Date(article.pubDate).toLocaleDateString() : 'Unknown Date',
                publishedAt: article.pubDate,
                link: article.link
            }));

            console.log(`Found ${crimeSummaries.length} crimes for ${city} (city-based search)`);

            res.json({ 
                success: true, 
                data: crimeSummaries,
                center: null,
                radius: parseFloat(radius),
                totalFound: crimeSummaries.length,
                searchAddress: address,
                searchType: 'city-based'
            });
            return;
        }

        // 5. For demo purposes, simulate crime locations around the address
        const simulatedCrimes = crimeArticles.map((article, index) => {
            // Use a consistent seed based on article title and radius for reproducible results
            const seed = article.title.length + index + Math.floor(radius * 10);
            const random = (seed * 9301 + 49297) % 233280; // Simple linear congruential generator
            const normalizedRandom = random / 233280;
            
            // Simulate locations within the radius with better distribution
            const angle = (normalizedRandom * 360); // Random angle
            const distance = Math.sqrt(normalizedRandom) * radius; // Better distribution within radius
            const latOffset = (distance / 111) * Math.cos(angle * Math.PI / 180);
            const lngOffset = (distance / (111 * Math.cos(coordinates.lat * Math.PI / 180))) * Math.sin(angle * Math.PI / 180);
            
            const crimeLat = coordinates.lat + latOffset;
            const crimeLng = coordinates.lng + lngOffset;
            const actualDistance = calculateDistance(coordinates.lat, coordinates.lng, crimeLat, crimeLng);
            
            return {
                title: article.title,
                description: article.description,
                date: article.pubDate ? new Date(article.pubDate).toLocaleDateString() : 'Unknown Date',
                publishedAt: article.pubDate,
                link: article.link,
                coordinates: { lat: crimeLat, lng: crimeLng },
                distance: actualDistance,
                distanceFormatted: `${actualDistance.toFixed(1)}km`
            };
        }).filter(crime => crime.distance <= radius);

        // Add radius-specific filtering to show different results for different radii
        let finalCrimes = simulatedCrimes;
        
        // For smaller radii, show fewer crimes to simulate more localized incidents
        if (radius <= 1) {
            finalCrimes = simulatedCrimes.slice(0, Math.min(3, simulatedCrimes.length));
        } else if (radius <= 2) {
            finalCrimes = simulatedCrimes.slice(0, Math.min(5, simulatedCrimes.length));
        } else if (radius <= 3) {
            finalCrimes = simulatedCrimes.slice(0, Math.min(7, simulatedCrimes.length));
        } else {
            finalCrimes = simulatedCrimes.slice(0, Math.min(10, simulatedCrimes.length));
        }

        console.log(`Found ${finalCrimes.length} crimes within ${radius}km of ${address} (filtered from ${simulatedCrimes.length} total)`);

        res.json({ 
            success: true, 
            data: finalCrimes,
            center: coordinates,
            radius: parseFloat(radius),
            totalFound: finalCrimes.length,
            searchAddress: address,
            searchType: 'radius-based'
        });
    } catch (error) {
        console.error('Error in radius search:', error.message);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to perform radius search',
            message: error.message 
        });
    }
});

module.exports = router;