
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const Contact = ({ listing }) => {
    const [landlord, setLandlord] = useState(null);
    const [message, setMessage] = useState('');

    useEffect(() => {
        const fetchLandLord = async () => {
            try {
                const res = await fetch(`/api/user/${listing.userRef}`);
                const data = await res.json();
                setLandlord(data);
            } catch (error) {
                console.log(error);
            }
        }
        fetchLandLord();
    }, [listing.userRef]);

    return (
        <div className='flex flex-col gap-4'>
            {landlord && (
                <>
                    <p>Contact <span className='font-bold'>{landlord.userName}</span> for <span>{listing.name}</span></p>
                    <textarea
                        name='message'
                        id='message'
                        placeholder='Enter your message here'
                        rows='2'
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        className='border border-gray-300 rounded-md p-2 w-full'
                    />
                    <Link 
                        to={`mailto:${landlord.email}?subject=Regarding ${listing.name}&body=${message}`}
                        className='bg-blue-500 text-white rounded-md py-2 px-4 text-center hover:bg-blue-600 transition-colors'>Send Message
                    </Link>
                </>
            )}
        </div>
    )
}

export default Contact;
