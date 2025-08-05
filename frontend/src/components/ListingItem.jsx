
import React from 'react';
import { Link } from 'react-router-dom';
import { MdLocationOn } from 'react-icons/md';

const ListingItem = ({ listing }) => {
    return (
        <div className='bg-white shadow-lg hover:shadow-xl transition-shadow overflow-hidden rounded-lg w-full sm:w-[330px]'>
            <Link to={`/listing/${listing._id}`}>
                <img
                    src={
                        listing.imageUrls[0] ||
                        'https://53.fs1.hubspotusercontent-na1.net/hub/53/hubfs/Sales_Blog/real-estate-business-compressor.jpg?width=595&height=400&name=real-estate-business-compressor.jpg'
                    }
                    alt='listing cover'
                    className='h-[320px] sm:h-[220px] w-full object-cover transition-transform duration-300 hover:scale-105'
                />
                <div className='p-4 flex flex-col gap-2'>
                    <p className='truncate text-lg font-semibold text-gray-800'>
                        {listing.name}
                    </p>
                    <div className='flex items-center gap-1'>
                        <MdLocationOn className='h-5 w-5 text-green-700' />
                        <p className='text-sm text-gray-600 truncate w-full'>
                            {listing.address}
                        </p>
                    </div>
                    <p className='text-sm text-gray-600 line-clamp-2'>
                        {listing.description}
                    </p>
                    <p className='text-gray-800 mt-2 font-semibold'>
                        ₹{((listing.offer ? listing.discountPrice : listing.regularPrice) * 85).toLocaleString('en-IN')}
                        {listing.type === 'rent' && ' / month'}
                    </p>
                </div>
            </Link>
        </div>
    )
}

export default ListingItem;
