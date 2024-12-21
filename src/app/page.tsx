"use client"
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { motion } from 'framer-motion';

const AuctionApp = () => {
    const [days, setDays] = useState(5);
    const [hours, setHours] = useState(12);
    const [minutes, setMinutes] = useState(54);
    const [seconds, setSeconds] = useState(46);
    const [currentAuctionImageIndex, setCurrentAuctionImageIndex] = useState(0);
    const [currentArtilleryImageIndex, setCurrentArtilleryImageIndex] = useState(0);

    const artilleryImages = [
        '/artillery/1.jpeg',
        '/artillery/2.jpg',
        '/artillery/3.jpg',
        '/artillery/4.jpg',
        '/artillery/5.jpg',
        '/artillery/8.jpeg',
    ];
    const auctionImages = [
        '/auction/4.jpeg',
        '/auction/2.jpeg',
        '/auction/1.jpeg',
        '/auction/3.jpeg',
        '/auction/5.jpeg',
    ];

    useEffect(() => {
        const countdownInterval = setInterval(() => {
            if (seconds > 0) {
                setSeconds(seconds - 1);
            } else {
                if (minutes > 0) {
                    setMinutes(minutes - 1);
                    setSeconds(59);
                } else {
                    if (hours > 0) {
                        setHours(hours - 1);
                        setMinutes(59);
                        setSeconds(59);
                    } else {
                        if (days > 0) {
                            setDays(days - 1);
                            setHours(23);
                            setMinutes(59);
                            setSeconds(59);
                        }
                    }
                }
            }
        }, 1000);

        return () => clearInterval(countdownInterval);
    }, [seconds, minutes, hours, days]);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentAuctionImageIndex((prevIndex) => (prevIndex + 1) % auctionImages.length);
        }, 4000);

        return () => clearInterval(interval);
    }, [auctionImages.length]);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentArtilleryImageIndex((prevIndex) => (prevIndex + 1) % artilleryImages.length);
        }, 4000);

        return () => clearInterval(interval);
    }, [artilleryImages.length]);

    return (
<div className="min-h-screen bg-gray-900 text-white flex flex-col">
  <section className="w-full bg-gray-900 text-white py-20">
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-screen-lg mx-auto px-6 flex flex-col items-center text-center"
    >
      <h1 className="text-5xl font-extrabold mb-6 text-blue-500 ">
        Stand wi<span className="text-yellow-500">th Ukraine</span>
      </h1>
      <p className="text-xl text-gray-300 mb-10 max-w-md">
        Join our auctions to own unique trophy items captured by Ukrainian soldiers and support their fight for freedom.
      </p>

      <div className="flex justify-center items-center w-full max-w-screen-lg gap-x-12">
  {/* Left Image */}
  <div className="w-1/3 h-48 md:flex hidden bg-gray-700 border-4 border-blue-500 rounded-lg  items-center justify-center flex-shrink-0 overflow-hidden">
    <img
      src="main1.jpg"
      alt="Main Image 1"
      className="w-full h-full object-cover"
    />
  </div>

        {/* Countdown Timer */}
        <div className="bg-gray-800 rounded-lg shadow-lg p-6 flex space-x-8 items-center flex-shrink-0">
          {[{ label: 'Days', value: days }, { label: 'Hours', value: hours }, { label: 'Minutes', value: minutes }, { label: 'Seconds', value: seconds }].map(
            (time, index) => (
              <div key={index} className="flex flex-col items-center">
                <span className="text-4xl font-bold text-yellow-500">
                  {String(time.value).padStart(2, '0')}
                </span>
                <span className="text-gray-400 mt-1">{time.label}</span>
              </div>
            )
          )}
        </div>

        {/* Right Image Placeholder */}
        <div className="w-1/3 h-48  md:flex hidden bg-gray-700 border-4 border-yellow-500 rounded-lg  items-center justify-center flex-shrink-0 overflow-hidden">
    <img
      src="main2.jpg"
      alt="Main Image 2"
      className="w-full h-full object-cover"
    />
  </div>
      </div>

      <Link href="/auction">
        <button className="bg-blue-600 hover:bg-blue-700 text-white py-3 px-8 rounded-lg text-lg font-medium shadow-md transition duration-300 mt-8">
          Enter Auction
        </button>
      </Link>
    </motion.div>
  </section>
  <motion.hr
    initial={{ width: 0 }}
    animate={{ width: '100%' }}
    transition={{ duration: 1 }}
    className="border-gray-800 border-4 mx-auto"
  />




            <section className="py-20 bg-gray-900 text-gray-100">
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="max-w-screen-lg mx-auto px-6"
                >
                    <h2 className="text-4xl font-bold text-center mb-12">Why Choose Us</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                        {['Trusted Items', 'Support Ukraine', 'Unique Collectibles'].map((title, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, scale: 0.8 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: index * 0.2 }}
                                className="bg-gray-700 p-6 rounded-lg shadow-md text-center"
                            >
                                <h3 className="text-2xl font-semibold mb-4">{title}</h3>
                                <p className="text-gray-400">
                                    {title === 'Trusted Items'
                                        ? 'All items are certified and come directly from Ukrainian soldiers.'
                                        : title === 'Support Ukraine'
                                        ? 'Your purchases contribute to helping Ukrainian efforts.'
                                        : 'Own one-of-a-kind trophies with incredible stories.'}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            </section>



            {/* How It Works */}
            <section className="py-20 bg-gray-800 text-gray-100">
                <div className="max-w-screen-lg mx-auto px-6">
                    <h2 className="text-4xl font-bold text-center mb-12">How It Works</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                        <div className="text-center">
                            <span className="text-5xl font-bold text-blue-500">1</span>
                            <h3 className="text-2xl font-semibold mt-4 mb-2">Browse Items</h3>
                            <p className="text-gray-400">
                                Explore our collection of exclusive trophy items.
                            </p>
                        </div>
                        <div className="text-center">
                            <span className="text-5xl font-bold text-blue-500">2</span>
                            <h3 className="text-2xl font-semibold mt-4 mb-2">Place Your Bid</h3>
                            <p className="text-gray-400">
                                Participate in auctions and win your desired items.
                            </p>
                        </div>
                        <div className="text-center">
                            <span className="text-5xl font-bold text-blue-500">3</span>
                            <h3 className="text-2xl font-semibold mt-4 mb-2">Make an Impact</h3>
                            <p className="text-gray-400">
                                Your contribution directly helps the Ukrainian cause.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Auctions Section */}
            <section className="py-20 bg-gray-900 text-gray-100">
                <div className="max-w-screen-lg mx-auto px-6 flex flex-col md:flex-row items-center md:space-x-10">
                    {/* Slider Section */}
                    <div className="w-full md:w-1/2 h-72 bg-gray-700 rounded-lg overflow-hidden relative">
                        <div
                            className="w-full h-full flex transition-transform duration-500 ease-in-out"
                            style={{ transform: `translateX(-${currentAuctionImageIndex * 100}%)` }}
                        >
                            {auctionImages.map((src, index) => (
                                <img
                                    key={index}
                                    src={src}
                                    alt={`Auction Slide ${index}`}
                                    className="w-full h-full object-cover flex-shrink-0"
                                />
                            ))}
                        </div>

                        {/* Dots Indicator */}
                        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                            {auctionImages.map((_, index) => (
                                <div
                                    key={index}
                                    className={`w-3 h-3 rounded-full ${
                                        index === currentAuctionImageIndex ? 'bg-white' : 'bg-gray-400'
                                    }`}
                                ></div>
                            ))}
                        </div>
                    </div>

                    {/* Text Block */}
                    <div className="w-full md:w-1/2 mt-10 md:mt-0">
                        <h3 className="text-3xl font-bold mb-4">About Our <span className="text-blue-500 text-4xl">Auctions</span></h3>
                        <p className="text-gray-400 leading-relaxed">
                            Each item in our collection has a unique story and helps support Ukrainian efforts. Browse through our gallery to see some of the featured items, and join the auction to make an impact.
                        </p>
                        <p className="text-gray-400 mt-4">
                            Together, we can preserve history and support a vital cause.
                        </p>
                    </div>
                </div>
            </section>

            {/* Revenge Section */}
            <section className="py-20 bg-gray-800 text-gray-100">
                <div className="max-w-screen-lg mx-auto px-6 flex flex-col md:flex-row items-center md:space-x-10">
                    {/* Text Block */}
                    <div className="w-full md:w-1/2 mt-10 md:mt-0">
                        <h3 className="text-3xl font-bold mb-4">About Project <span className="text-blue-500 text-4xl">"REVENGE"</span></h3>
                        <p className="text-gray-400 leading-relaxed">
                            Send a powerful message against Russian aggression by personalizing an artillery shell. Each message carries a unique story, supporting Ukraine’s fight for freedom and symbolizing justice.
                        </p>
                        <p className="text-gray-400 mt-4">
                            Together, we can take a stand and make a difference.
                        </p>
                    </div>

                    {/* Slider Section */}
                    <div className="w-full md:w-1/2 h-72 bg-gray-700 rounded-lg overflow-hidden relative">
                        <div
                            className="w-full h-full flex transition-transform duration-500 ease-in-out"
                            style={{ transform: `translateX(-${currentArtilleryImageIndex * 100}%)` }}
                        >
                            {artilleryImages.map((src, index) => (
                                <img
                                    key={index}
                                    src={src}
                                    alt={`Artillery Slide ${index}`}
                                    className="w-full h-full object-cover flex-shrink-0"
                                />
                            ))}
                        </div>

                        {/* Dots Indicator */}
                        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                            {artilleryImages.map((_, index) => (
                                <div
                                    key={index}
                                    className={`w-3 h-3 rounded-full ${
                                        index === currentArtilleryImageIndex ? 'bg-white' : 'bg-gray-400'
                                    }`}
                                ></div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};


export default AuctionApp;
