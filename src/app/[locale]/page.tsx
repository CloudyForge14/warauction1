"use client"
import React, { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { motion } from 'framer-motion';
import {useTranslations} from 'next-intl';
import {Link} from '@/i18n/routing';
import { useSwipeable } from 'react-swipeable';
import Image from 'next/image';
type SymbolPosition = {
    symbol: string;
    left: number;
    top: number;
  };
  
  function BackgroundSymbols() {
    const symbols = ["+", "-", "*", "/"];
    // Храним массив объектов вида { symbol, left, top }
    const [positions, setPositions] = useState<SymbolPosition[]>([]);
  
    useEffect(() => {
      // Допустим, генерируем 50 символов
      const arr: SymbolPosition[] = Array.from({ length: 50 }, () => {
        const symbol = symbols[Math.floor(Math.random() * symbols.length)];
        return {
          symbol,
          left: Math.random() * 100, // % относительно ширины контейнера
          top: Math.random() * 100,  // % относительно высоты контейнера
        };
      });
      setPositions(arr);
    }, []);
  
    return (
      // Абсолютный контейнер занимает всю площадь родителя
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
        {positions.map((pos, i) => (
          <span
            key={i}
            style={{
              position: "absolute",
              left: `${pos.left}%`,
              top: `${pos.top}%`,
              transform: "rotate(45deg)",
              opacity: 0.1,
              fontSize: "2rem"
            }}
            className="text-white font-extrabold"
          >
            {pos.symbol}
          </span>
        ))}
      </div>
    );
  }

const AuctionApp = () => {
    const t = useTranslations('HomePage');
    const [days, setDays] = useState(0);
    const [hours, setHours] = useState(0);
    const [minutes, setMinutes] = useState(0);
    const [seconds, setSeconds] = useState(0);
    const [currentAuctionImageIndex, setCurrentAuctionImageIndex] = useState(0);
    const [currentArtilleryImageIndex, setCurrentArtilleryImageIndex] = useState(0);
    const [loading, setLoading] = useState(false); // Add this line

    const artilleryImages = [
      '/artillery/10.jpeg',
      '/artillery/11.jpeg',
      '/artillery/1.jpeg',
      '/artillery/2.jpg',
      '/artillery/3.jpg',
      '/artillery/4.jpg',
      '/artillery/5.jpg',
      '/artillery/8.jpeg',
      '/artillery/9.jpg',
    ];
    const auctionImages = [
      '/auction/4.jpeg',

        '/auction/1.jpeg',
        '/auction/2.jpeg',
        '/auction/3.jpeg',
        '/auction/5.jpeg',
        '/auction/6.jpeg',
        '/auction/7.jpeg',
        '/auction/8.jpeg',

    ];
    useEffect(() => {
        const fetchAuctionItems = async () => {
            setLoading(true); // Loading state is updated here
            try {
                const response = await fetch("/api/auction-items");
                if (!response.ok) throw new Error(t("errors.fetchItems"));
                const auctionItems = await response.json();

                // Find the item with the closest time
                const closestItem = auctionItems.reduce(
                    (closest: { time_left: number }, item: { time_left: number }) => {
                        const remainingTime = item.time_left; // Assume time_left is in seconds
                        return !closest || remainingTime < closest.time_left
                            ? item
                            : closest;
                    },
                    null
                );

                if (closestItem) {
                    const remainingTime = closestItem.time_left;
                    setDays(Math.floor(remainingTime / (3600 * 24)));
                    setHours(Math.floor((remainingTime % (3600 * 24)) / 3600));
                    setMinutes(Math.floor((remainingTime % 3600) / 60));
                    setSeconds(remainingTime % 60);
                }
            } catch (err) {
                console.error("Error fetching auction items:", err);
                setError(t("errors.fetchItemsRetry"));
            } finally {
                setLoading(false); 
            }
        };

        fetchAuctionItems();
    }, [t]);
    const auctionHandlers = useSwipeable({
        onSwipedLeft: () =>
          setCurrentAuctionImageIndex((prev) =>
            prev === auctionImages.length - 1 ? 0 : prev + 1
          ),
        onSwipedRight: () =>
          setCurrentAuctionImageIndex((prev) =>
            prev === 0 ? auctionImages.length - 1 : prev - 1
          ),
        trackMouse: true,
      });
    
      const artilleryHandlers = useSwipeable({
        onSwipedLeft: () =>
          setCurrentArtilleryImageIndex((prev) =>
            prev === artilleryImages.length - 1 ? 0 : prev + 1
          ),
        onSwipedRight: () =>
          setCurrentArtilleryImageIndex((prev) =>
            prev === 0 ? artilleryImages.length - 1 : prev - 1
          ),
        trackMouse: true,
      });
    useEffect(() => {
        const countdownInterval = setInterval(() => {
            if (seconds > 0) {
                setSeconds(seconds - 1);
            } else if (minutes > 0) {
                setMinutes(minutes - 1);
                setSeconds(59);
            } else if (hours > 0) {
                setHours(hours - 1);
                setMinutes(59);
                setSeconds(59);
            } else if (days > 0) {
                setDays(days - 1);
                setHours(23);
                setMinutes(59);
                setSeconds(59);
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
<div className="relative">
  <BackgroundSymbols />

  <div className="absolute z-0 inset-0">
  <Image
  src="/back.avif"
  alt="Background Image"
  layout="fill"
  objectFit="cover"
  priority // Ensures it loads faster for above-the-fold content
/>
  </div>

  <section className="relative z-10 w-full bg-gray-900/60 text-white py-20">
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-screen-lg mx-auto px-6 flex flex-col items-center text-center"
    >
      <h1 className="text-5xl font-extrabold mb-6 text-blue-500">
        {t('title1')}<span className="text-yellow-500">{t('title2')}</span>
      </h1>
      <p className="text-xl text-gray-300 mb-10 max-w-md">
        {t("about")}
      </p>

      <div className="flex justify-center items-center w-full px-4">
  <div className="bg-gray-900/50 backdrop-blur-md rounded-lg shadow-lg p-6 flex flex-wrap justify-center gap-y-6 gap-x-4 items-center max-w-xs sm:max-w-md md:max-w-screen-lg">
    {[
      { label: t("timer.days"), value: days },
      { label: t("timer.hours"), value: hours },
      { label: t("timer.minutes"), value: minutes },
      { label: t("timer.seconds"), value: seconds },
    ].map((time, index) => (
      <div
        key={index}
        className="flex flex-col items-center w-16 sm:w-20 md:w-24"
      >
        <span className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-yellow-400">
          {String(time.value).padStart(2, "0")}
        </span>
        <span className="text-gray-300 mt-2 text-xs sm:text-sm uppercase tracking-wide text-center">
          {time.label}
        </span>
      </div>
    ))}
  </div>
</div>



      <div className="flex justify-center gap-4 mt-8">
        <Link href="/auction">
          <button className="bg-blue-600 hover:bg-blue-700 text-white py-3 px-8 rounded-lg text-lg font-medium shadow-md transition duration-300">
            To the Auction
          </button>
        </Link>
        <Link href="/artillery">
          <button className="bg-yellow-600 hover:bg-yellow-700 text-white py-3 px-8 rounded-lg text-lg font-medium shadow-md transition duration-300">
            Order Artillery
          </button>
        </Link>
      </div>
    </motion.div>
  </section>
</div>


  <motion.hr
    initial={{ width: 0 }}
    animate={{ width: '100%' }}
    transition={{ duration: 1 }}
    className="border-gray-800 border-4 mx-auto"
  />

<section className="relative py-20 bg-gray-900 text-gray-100">

  <motion.div
    initial={{ opacity: 0, y: 50 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5 }}
    className="max-w-screen-lg mx-auto px-6"
  >
    <h2 className="text-4xl font-bold text-center mb-12">{t("whyChooseUs.title")}</h2>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
      {['trustedItems', 'supportUkraine', 'uniqueCollectibles'].map((reasonKey, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: index * 0.2 }}
          className="bg-gray-700 p-6 rounded-lg shadow-md text-center"
        >
          <h3 className="text-2xl font-semibold mb-4">{t(`whyChooseUs.reasons.${reasonKey}Title`)}</h3>
          <p className="text-gray-400">{t(`whyChooseUs.reasons.${reasonKey}`)}</p>
        </motion.div>
      ))}
    </div>
  </motion.div>
</section>

            <section className="py-20 bg-gray-800 text-gray-100">
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
  </div>
                <div className="max-w-screen-lg mx-auto px-6">
                    
                    <h2 className="text-4xl font-bold text-center mb-12">{t("howItWorks.title")}</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                        <div className="text-center">
                            <span className="text-5xl font-bold text-blue-500">1</span>
                            <h3 className="text-2xl font-semibold mt-4 mb-2">{t("howItWorks.steps.browseItemsTitle")}</h3>
                            <p className="text-gray-400">
                            {t("howItWorks.steps.browseItems")}
                            </p>
                        </div>
                        <div className="text-center">
                            <span className="text-5xl font-bold text-blue-500">2</span>
                            <h3 className="text-2xl font-semibold mt-4 mb-2">{t("howItWorks.steps.placeBidTitle")}</h3>
                            <p className="text-gray-400">
                            {t("howItWorks.steps.placeBid")}
                            </p>
                        </div>
                        <div className="text-center">
                            <span className="text-5xl font-bold text-blue-500">3</span>
                            <h3 className="text-2xl font-semibold mt-4 mb-2">{t("howItWorks.steps.makeImpactTitle")}</h3>
                            <p className="text-gray-400">
                            {t("howItWorks.steps.makeImpact")}
                            </p>
                        </div>
                    </div>
                </div>
            </section>


            <section className="py-20 bg-gray-900 text-gray-100">
                  <div className="absolute inset-0 pointer-events-none overflow-hidden">
  </div>
        <div className="max-w-screen-lg mx-auto px-6 flex flex-col md:flex-row items-center md:space-x-10">
          <div
            {...auctionHandlers}
            className="w-full md:w-1/2 h-72 bg-gray-700 rounded-lg overflow-hidden relative"
          >
            <div
              className="w-full h-full flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${currentAuctionImageIndex * 100}%)` }}
            >
              {auctionImages.map((src, index) => (
                <img
                  key={index}
                  src={src}
                  alt={`Auction Slide ${index}`}
                  className="w-full h-full object-contain flex-shrink-0"
                />
              ))}
            </div>
            <button
              onClick={() =>
                setCurrentAuctionImageIndex((prev) =>
                  prev === 0 ? auctionImages.length - 1 : prev - 1
                )
              }
              className="absolute top-1/2 left-2 transform -translate-y-1/2 bg-gray-800 text-white p-4 rounded-full hover:bg-gray-600"
            >
              ‹
            </button>
            <button
              onClick={() =>
                setCurrentAuctionImageIndex((prev) =>
                  prev === auctionImages.length - 1 ? 0 : prev + 1
                )
              }
              className="absolute top-1/2 right-2 transform -translate-y-1/2 bg-gray-800 text-white p-4 rounded-full hover:bg-gray-600"
            >
              ›
            </button>
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

          <div className="w-full md:w-1/2 mt-10 md:mt-0">
            <h3 className="text-3xl font-bold mb-4">
              {t('auction.aboutTitle')}{' '}
              <span className="text-blue-500">{t('auction.auctions')}</span>
            </h3>
            <p className="text-gray-400">{t('auction.aboutDescription')}</p>
          </div>
        </div>
      </section>

      <section className="relative py-20 bg-gray-800 text-gray-100">

  <div className="absolute inset-0 pointer-events-none overflow-hidden">
  </div>

  <div className="max-w-screen-lg mx-auto px-6 flex flex-col md:flex-row items-center md:space-x-10">

    <div className="w-full md:w-1/2 mt-10 md:mt-0">
      <h3 className="text-3xl font-bold mb-4">
        {t('projectRevenge.title')} <span className="text-blue-500 text-4xl">"REVENGE"</span>
      </h3>
      <p className="text-gray-400 leading-relaxed">{t('projectRevenge.description')}</p>
    </div>

    <div
      {...useSwipeable({
        onSwipedLeft: () =>
          setCurrentArtilleryImageIndex((prevIndex) =>
            prevIndex === artilleryImages.length - 1 ? 0 : prevIndex + 1
          ),
        onSwipedRight: () =>
          setCurrentArtilleryImageIndex((prevIndex) =>
            prevIndex === 0 ? artilleryImages.length - 1 : prevIndex - 1
          ),
        trackMouse: true,
      })}
      className="w-full md:w-1/2 h-72 bg-gray-700 rounded-lg overflow-hidden relative"
    >
      <div
        className="w-full h-full flex transition-transform duration-500 ease-in-out"
        style={{
          transform: `translateX(-${currentArtilleryImageIndex * 100}%)`,
        }}
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

      <button
        onClick={() =>
          setCurrentArtilleryImageIndex((prevIndex) =>
            prevIndex === 0 ? artilleryImages.length - 1 : prevIndex - 1
          )
        }
        className="absolute top-1/2 left-2 transform -translate-y-1/2 bg-gray-800 text-white p-4 rounded-full shadow-md hover:bg-gray-600"
      >
        ‹
      </button>
      <button
        onClick={() =>
          setCurrentArtilleryImageIndex((prevIndex) =>
            prevIndex === artilleryImages.length - 1 ? 0 : prevIndex + 1
          )
        }
        className="absolute top-1/2 right-2 transform -translate-y-1/2 bg-gray-800 text-white p-4 rounded-full shadow-md hover:bg-gray-600"
      >
        ›
      </button>

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
function setError(arg0: string) {
    throw new Error('Function not implemented.');
}

