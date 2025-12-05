import React, { useEffect, useState, Suspense, lazy } from 'react';
import { Link } from 'react-router-dom';
import SwiperCore, { Navigation } from 'swiper';
import 'swiper/css/bundle';
const ListingItem = lazy(() => import('../components/ListingItem')); // lazy load
const Swiper = lazy(() => import('swiper/react').then(mod => ({ default: mod.Swiper })));
const SwiperSlide = lazy(() => import('swiper/react').then(mod => ({ default: mod.SwiperSlide })));

SwiperCore.use([Navigation]);

const Home = () => {
  const [offerListing, setOfferListing] = useState([]);
  const [rentListing, setRentListing] = useState([]);
  const [saleListing, setSaleListing] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [offerRes, rentRes, saleRes] = await Promise.all([
          fetch(`${import.meta.env.VITE_API_URL}/listing/get?offer=true&limit=4`),
          fetch(`${import.meta.env.VITE_API_URL}/listing/get?type=rent&limit=4`),
          fetch(`${import.meta.env.VITE_API_URL}/listing/get?type=sale&limit=4`),
        ]);

        const offers = await offerRes.json();
        const rents = await rentRes.json();
        const sales = await saleRes.json();

        setOfferListing(offers.listings || []);
        setRentListing(rents.listings || []);
        setSaleListing(sales.listings || []);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <>
      {/* Hero section with optimized image */}
      <div
        className="h-screen bg-fixed bg-center bg-cover"
        style={{
          backgroundImage: "url('https://www.gibsonarchitecture.com/wp-content/uploads/2018/08/MB1.jpg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* Optional: use a low-res placeholder or poster */}
      </div>

      <div className="container mx-auto p-4 pt-6 md:p-6">
        <div className="flex flex-col gap-8 p-8 lg:p-20 max-w-6xl mx-auto">
          <h1 className="font-bold text-4xl text-slate-800 lg:text-6xl">
            Find Your Next Perfect Place with Ease
          </h1>
          <p className="text-gray-600 text-base lg:text-lg">
            Discover a wide variety of listings tailored just for you. Let us help you find the perfect home!
          </p>
          <Link
            to="/search"
            className="text-lg text-blue-600 bg-blue-100 hover:bg-blue-200 py-2 px-4 rounded-lg transition duration-300"
          >
            Let’s Get Started...
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-10 text-gray-500">Loading listings...</div>
        ) : (
          <Suspense fallback={<div className="text-center py-10 text-gray-500">Loading components...</div>}>
            {/* Swiper carousel */}
            {offerListing.length > 0 && (
              <Swiper navigation className="my-8" lazy={true}>
                {offerListing.map((listing) => (
                  <SwiperSlide key={listing._id}>
                    <img
                      src={listing.imageUrls[0]}
                      alt="listing-image"
                      className="w-full h-[588px] object-cover rounded-lg shadow-md"
                      loading="lazy"
                    />
                  </SwiperSlide>
                ))}
              </Swiper>
            )}

            {/* Listings sections */}
            <div className="flex flex-col max-w-6xl mx-auto p-4 gap-8">
              {offerListing.length > 0 && (
                <div className="bg-gray-100 shadow-lg rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-slate-700">Recent Offers</h2>
                    <Link className="text-sm text-blue-600 hover:underline" to="/search?offer=true">
                      Show more offers
                    </Link>
                  </div>
                  <div className="flex flex-wrap gap-4 mt-4">
                    {offerListing.map((listing) => (
                      <ListingItem listing={listing} key={listing._id} />
                    ))}
                  </div>
                </div>
              )}

              {rentListing.length > 0 && (
                <div className="bg-gray-100 shadow-lg rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-slate-700">Newly Added for Rent</h2>
                    <Link className="text-sm text-blue-600 hover:underline" to="/search?type=rent">
                      Show more places for rent
                    </Link>
                  </div>
                  <div className="flex flex-wrap gap-4 mt-4">
                    {rentListing.map((listing) => (
                      <ListingItem listing={listing} key={listing._id} />
                    ))}
                  </div>
                </div>
              )}

              {saleListing.length > 0 && (
                <div className="bg-gray-100 shadow-lg rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-slate-700">Latest Additions for Sale</h2>
                    <Link className="text-sm text-blue-600 hover:underline" to="/search?type=sale">
                      Show more...
                    </Link>
                  </div>
                  <div className="flex flex-wrap gap-4 mt-4">
                    {saleListing.map((listing) => (
                      <ListingItem listing={listing} key={listing._id} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Suspense>
        )}

        <Link to="/foundation">
          <h1 className="text-center mt-10 text-red-400 text-3xl font-thin hover:underline">
            NEXT CHAPTER THE FOUNDATION
          </h1>
        </Link>
      </div>
    </>
  );
};

export default Home;
