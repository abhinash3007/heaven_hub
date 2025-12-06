import React from 'react'
import { Link } from 'react-router-dom'

const Foundation = () => {
    return (
        <div className="font-sans mt-20">
            {/* Hero Section */}
            <div className="relative">
                <img 
                    className='w-full h-[600px] object-bottom opacity-90' 
                    src="/foundation_5.jpg" 
                    alt="Hero Background"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                    <h1 className="text-blue-700 text-6xl font-semibold drop-shadow-lg text-center">
                        Welcome to The Fountain of Wisdom
                    </h1>
                </div>
            </div>

            {/* Intro Section */}
            <div className='mt-20 mb-16 px-8 md:px-44'>
                <h1 className='text-4xl font-light text-center mb-10'>THE FOUNTAIN OF WISDOM</h1>
                <h3 className='text-center text-lg mb-12 max-w-4xl mx-auto'>
                    Cradled by natural beauty and conceived in sacred reciprocity with the land, Ameyalli is the culmination of a pioneering collaboration with The Chopra Foundation, guided by the visionary leadership of Deepak Chopra.
                </h3>
                <p className='text-center mb-16 text-base max-w-4xl mx-auto leading-relaxed'>
                    Deeply rooted in 40 years of legacy teachings in well-being, longevity, and peak living, the partnership informs every aspect of Ameyalli's Wellbeing Center and its transformative programming with a singular perspective, foresight, and purpose aligned with Dr. Deepak Chopra’s Seven Pillars of Well-being. The Chopra Foundation, renowned for its dedication to research, education, and humanitarian efforts worldwide, selected the property as the future venue for the Ameyalli Center of Excellence, aimed to harness the collective wisdom and innovation of Deepak's work and his network of forward-thinkers and innovators seeking to expand consciousness, unlock human potential, and advance progress in health-span research.
                </p>
            </div>

            {/* Quote Section */}
            <div className='bg-gray-100 py-12'>
                <h5 className='text-4xl font-light text-center mb-6 text-red-500'>
                    “When your mind and heart are truly open, abundance will flow to you effortlessly and easily.”
                </h5>
                <p className='text-center text-red-400 text-xl mb-8'>— Deepak Chopra</p>
                <p className='text-center text-base max-w-3xl mx-auto'>
                    The 7 pillars of Deepak Chopra prioritize physical well-being, emotional balance, spiritual growth, social connections, environmental harmony, abundance, and intellectual enrichment, serving as guiding principles for Ameyalli.
                </p>
            </div>

            {/* Image Gallery */}
            <div className='grid grid-cols-1 md:grid-cols-2 gap-8 px-8 md:px-44 my-16'>
                <img className='h-[400px] object-cover' src="/foundation_1.png" alt="Nature Image 1" />
                <img className='h-[400px] object-cover' src="/foundation_2.jpg" alt="Nature Image 2" />
                <img className='h-[400px] object-cover' src="/Foundation_3.webp" alt="Nature Image 3" />
                <img className='h-[400px] object-cover' src="/foundation_4.jpg" alt="Nature Image 4" />
            </div>

            {/* Call to Action */}
            <div className="text-center py-12">
                <Link to="/about">
                    <h1 className="text-3xl font-thin text-red-500 hover:underline">
                        NEXT CHAPTER: ABOUT
                    </h1>
                </Link>
            </div>
        </div>
    )
}

export default Foundation
