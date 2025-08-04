

import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import SwiperCore from 'swiper';
import { useSelector } from 'react-redux';
import { Navigation } from 'swiper/modules';
import 'swiper/css/bundle';
import {
    FaBath,
    FaBed,
    FaChair,
    FaMapMarkerAlt,
    FaParking,
    FaShare,
} from 'react-icons/fa';
import Contact from '../components/Contact';

export default function Listing() {
    SwiperCore.use([Navigation]);
    const [listing, setListing] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);
    const [copied, setCopied] = useState(false);
    const [contact, setContact] = useState(false);
    const params = useParams();
    const { currentUser } = useSelector((state) => state.user);

    useEffect(() => {
        const fetchListing = async () => {
            try {
                setLoading(true);
                const res = await fetch(`http://localhost:3000/api/listing/get/${params.listingId}`);
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

    return (
        <main className="mt-24">
            {loading && <p className='text-center my-7 text-2xl'>Loading...</p>}
            {error && (
                <p className='text-center my-7 text-2xl text-red-600'>Something went wrong!</p>
            )}
            {listing && !loading && !error && (
                <div className="max-w-6xl mx-auto p-4">
                    <Swiper navigation className="rounded-lg shadow-md">
                        {listing.imageUrls.map((url) => (
                            <SwiperSlide key={url}>
                                <img 
                                    src={url} 
                                    alt='listing-image' 
                                    className='w-full h-[500px] object-cover rounded-lg' 
                                />
                            </SwiperSlide>
                        ))}
                    </Swiper>
                    <div className='fixed top-20 right-4 z-10 border rounded-full w-12 h-12 flex justify-center items-center bg-white shadow-lg cursor-pointer'>
                        <FaShare
                            className='text-slate-500'
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
                        <p className='fixed top-32 right-4 z-10 rounded-md bg-gray-100 p-2 shadow-md'>
                            Link copied!
                        </p>
                    )}
                    <div className='bg-white rounded-lg shadow-lg p-6 my-7'>
                        <h1 className='text-3xl font-semibold'>
                            {listing.name} - ${' '}
                            {listing.offer
                                ? listing.discountPrice.toLocaleString('en-US')
                                : listing.regularPrice.toLocaleString('en-US')}
                            {listing.type === 'rent' && ' / month'}
                        </h1>
                        <p className='flex items-center mt-4 gap-2 text-gray-700 text-sm'>
                            <FaMapMarkerAlt className='text-green-700' />
                            {listing.address}
                        </p>
                        <div className='flex gap-4 my-4'>
                            <span className='bg-red-600 w-full max-w-[200px] text-white text-center p-2 rounded-md'>
                                {listing.type === 'rent' ? 'For Rent' : 'For Sale'}
                            </span>
                            {listing.offer && (
                                <span className='bg-green-600 w-full max-w-[200px] text-white text-center p-2 rounded-md'>
                                    ${+listing.regularPrice - +listing.discountPrice} OFF
                                </span>
                            )}
                        </div>
                        <p className='text-gray-800'>
                            <span className='font-semibold text-black'>Description:</span> 
                            {listing.description}
                        </p>
                        <ul className='text-green-700 font-semibold text-sm flex flex-wrap items-center gap-4 sm:gap-6 my-4'>
                            <li className='flex items-center gap-1 whitespace-nowrap '>
                                <FaBed className='text-lg' />
                                {listing.bedrooms > 1
                                    ? `${listing.bedrooms} beds`
                                    : `${listing.bedrooms} bed`}
                            </li>
                            <li className='flex items-center gap-1 whitespace-nowrap '>
                                <FaBath className='text-lg' />
                                {listing.bathrooms > 1
                                    ? `${listing.bathrooms} baths`
                                    : `${listing.bathrooms} bath`}
                            </li>
                            <li className='flex items-center gap-1 whitespace-nowrap '>
                                <FaParking className='text-lg' />
                                {listing.parking ? 'Parking spot' : 'No Parking'}
                            </li>
                            <li className='flex items-center gap-1 whitespace-nowrap '>
                                <FaChair className='text-lg' />
                                {listing.furnished ? 'Furnished' : 'Unfurnished'}
                            </li>
                        </ul>
                        {currentUser && listing.userRef !== currentUser._id && !contact && (
                            <button
                                onClick={() => setContact(true)}
                                className='bg-slate-700 text-white rounded-lg uppercase hover:opacity-90 p-3 transition duration-200'
                            >
                                Contact Landlord
                            </button>
                        )}
                        {contact && <Contact listing={listing}/>}
                    </div>
                </div>
            )}
        </main>
    );
}
