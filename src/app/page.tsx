'use client'
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from './component/navbar';
const AuctionApp = () => {
    const [days, setDays] = useState(5);
    const [hours, setHours] = useState(12);
    const [minutes, setMinutes] = useState(54);
    const [seconds, setSeconds] = useState(46);

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

    return (
<div className="min-h-screen bg-cover bg-center text-white flex flex-col items-center relative" style={{ backgroundImage: `url('img/background.png')`, backgroundSize: 'cover' }}>
    {/* Gradient Overlay for Fading Effect */}
    <div className="absolute inset-0 bg-gradient-to-r from-black via-transparent to-black opacity-90"></div>
    
    <Navbar />

    <main className="relative w-full flex flex-col items-center justify-center flex-grow p-8 z-10">
    <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 text-center">
        Stand with Ukraine during challenging times
    </h1>
    <p className="text-lg sm:text-xl md:text-2xl mb-8 text-center">
        Here you can buy Russian trophy items that were captured by the Ukrainian soldiers.
    </p>

    <div className="relative flex justify-center items-center w-full">
    {/* Blurred Cube */}
    <div
        className="bg-black bg-opacity-50 backdrop-blur-md rounded-3xl shadow-lg flex flex-col items-center justify-center border-gray-400 border"
        style={{ width: '400px', height: '220px', zIndex: 1 }}
    >
        {/* Countdown Timer */}
        <div className="flex space-x-4 text-center mb-4">
            <div className="flex flex-col items-center">
                <div className="bg-gray-800 bg-opacity-45 border-black border-opacity-70 text-white w-16 h-16 flex items-center justify-center rounded-xl">
                    <span className="text-3xl font-bold">{String(days).padStart(2, '0')}</span>
                </div>
                <span className="mt-2">Days</span>
            </div>
            <div className="flex flex-col items-center">
                <div className="bg-gray-800 bg-opacity-45 border-black border-opacity-70 text-white w-16 h-16 flex items-center justify-center rounded-xl">
                    <span className="text-3xl font-bold">{String(hours).padStart(2, '0')}</span>
                </div>
                <span className="mt-2">Hours</span>
            </div>
            <div className="flex flex-col items-center">
                <div className="bg-gray-800 bg-opacity-45 border-black border-opacity-70 text-white w-16 h-16 flex items-center justify-center rounded-xl">
                    <span className="text-3xl font-bold">{String(minutes).padStart(2, '0')}</span>
                </div>
                <span className="mt-2">Minutes</span>
            </div>
            <div className="flex flex-col items-center">
                <div className="bg-gray-800 bg-opacity-45 border-black border-opacity-70 text-white w-16 h-16 flex items-center justify-center rounded-xl">
                    <span className="text-3xl font-bold">{String(seconds).padStart(2, '0')}</span>
                </div>
                <span className="mt-2">Seconds</span>
            </div>
        </div>
{/* Button */}
{/* Button */}
<button className="relative bg-black bg-opacity-90 text-white px-20 py-3 rounded-xl mt-4 text-lg font-semibold overflow-hidden">
    <span className="relative z-10">Enter Auction</span>
    <div className="absolute inset-0 rounded-xl border-1 border-transparent" style={{
        background: 'linear-gradient(90deg, blue, yellow)',
        WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
        WebkitMaskComposite: 'xor',
        maskComposite: 'exclude',
        padding: '2px',
    }}></div>
</button>


    </div>
</div>

</main>


<footer className="relative w-full py-4 text-center text-gray-400 bg-zinc-950 bg-opacity-75 z-10">
    <div className="flex justify-center space-x-6 mb-4">
        <a href="#" className="hover:text-white">
            <div className="bg-white rounded-full p-2 flex items-center justify-center">
                <img src="img/telegram.png" width={30} height={30} />
            </div>
        </a>
        <a href="#" className="hover:text-white">
            <div className="bg-white rounded-full p-2 flex items-center justify-center">
                <img src="img/twitter.png" width={30} height={30} />
            </div>
        </a>
    </div>
    <hr className="m-5 mb-2 border-50" />
    <p>Copyright 2024: All rights reserved</p>
</footer>

</div>

    );
};

export default AuctionApp;
