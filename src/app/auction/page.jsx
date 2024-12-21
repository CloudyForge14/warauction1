"use client";
import React, { useState, useEffect } from 'react';
import jwt from 'jsonwebtoken';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { supabase } from '@/utils/supabase/client';

export default function AuctionItems() {
  const [items, setItems] = useState([]);
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('authToken');
      if (token) {
        try {
          const decoded = jwt.decode(token);
          setUser(decoded);
          setIsAuthenticated(true);
        } catch (err) {
          console.error('Failed to decode token:', err);
          setUser(null);
          setIsAuthenticated(false);
        }
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const refreshSession = async () => {
        const { data, error } = await supabase.auth.refreshSession();
        if (error) {
          console.error('Error refreshing session:', error);
        } else {
          localStorage.setItem('authToken', data.session.access_token);
          console.log('Token refreshed successfully.');
        }
      };
      refreshSession();
    }
  }, []);

  useEffect(() => {
    const fetchAuctionItems = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/auction-items');
        if (!response.ok) throw new Error('Failed to fetch auction items');
        const auctionItems = await response.json();
        setItems(auctionItems);
      } catch (err) {
        console.error('Error fetching auction items:', err);
        setError('Could not fetch auction items. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchAuctionItems();
  }, []);

  const openModal = (item) => {
    console.log('Opening modal with item:', item);
    if (!item) {
      toast.error('Invalid item selected.');
      return;
    }
    setSelectedItem(item);
    setCurrentImageIndex(0);
  };

  const closeModal = () => setSelectedItem(null);

  const handleBidChange = (change, minRaise) => {
    setSelectedItem((prevItem) => {
      if (!prevItem) return null;

      const newBid = Math.max(
        prevItem.current_bid + minRaise,
        (prevItem.bid || prevItem.current_bid) + change
      );
      return {
        ...prevItem,
        bid: newBid || prevItem.current_bid + minRaise,
      };
    });
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
      2,
      "0"
    )}:${String(secs).padStart(2, "0")}`;
  };
  
  const handlePlaceBid = async () => {
    if (!isAuthenticated) {
      toast.error('Please log in to place a bid.');
      return;
    }

    if (!selectedItem || !selectedItem.id || !selectedItem.bid) {
      toast.error('Invalid item or bid.');
      return;
    }

    try {
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('authToken');
        if (!token) {
          toast.error('Authorization token is missing.');
          return;
        }

        const response = await fetch(`/api/place-bid/${selectedItem.id}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ newBid: selectedItem.bid }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to place bid.');
        }

        const updatedItem = await response.json();
        setItems((prevItems) =>
          prevItems.map((item) =>
            item.id === updatedItem.id ? updatedItem : item
          )
        );

        toast.success('Bid placed successfully! You will be notified via email.');
      }
    } catch (err) {
      console.error('Error placing bid:', err);
      toast.error(err.message || 'Failed to place bid. Please try again.');
    }
  };
  
  if (loading)
    return (
      <div className="flex items-center justify-center" style={{ height: 'calc(100vh - 64px)', backgroundColor: '#1a202c', color: 'white' }}>
        <div className="loader"></div>
        <style jsx>{`
          .loader {
            border: 4px solid rgba(255, 255, 255, 0.3);
            border-top: 4px solid #fff;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            animation: spin 0.8s linear infinite;
          }

          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );

  if (error) return <div>{error}</div>;

  return (
    <div>
            <ToastContainer
              position="top-right"
              autoClose={3000}
              hideProgressBar={false}
              closeOnClick
              pauseOnHover
              draggable
              theme="dark"
              toastStyle={{
                marginTop: "60px",
                backgroundColor: '#1f2937',
                color: '#fff',
                border: '1px solid #374151',
                borderRadius: '8px',
                boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.3)',
              }}
              progressStyle={{ backgroundColor: '#2563eb' }}
            />
      <div className="bg-gray-900 text-white min-h-screen py-12">
        <h1 className="text-3xl font-bold text-center mb-8">Auction Items</h1>

        {/* Responsive Grid */}
        <div
          className="grid gap-6 px-6"
          style={{
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            maxWidth: '1440px', // Set a max-width for the grid to limit spreading
            margin: '0 auto', // Center the grid on the page
          }}
        >
          {items.map((item) => (
            <div
              key={item.id}
              onClick={() => openModal(item)}
              className="relative bg-gray-800 rounded-lg shadow-lg overflow-hidden cursor-pointer hover:scale-105 hover:border-yellow-500 transition-transform duration-300"
              style={{
                border: '2px solid transparent',
              }}
            >
              {/* Timer */}
              <div className="absolute top-2 left-2 bg-yellow-500 text-black px-3 py-1 rounded text-sm font-semibold">
                {formatTime(item.time_left)}
              </div>

              {/* Item Image */}
              <img
                src={item.image_url}
                alt={item.name}
                className="w-full h-48 object-cover"
              />

              {/* Content */}
              <div className="p-4 bg-gray-900 text-white text-center">
                <h2 className="text-xl font-bold mb-2">{item.name}</h2>
                <p className="text-gray-400 text-sm mb-4 truncate">{item.description}</p>

                {/* Divider */}
                <hr className="border-t border-gray-600 mb-4" />

                {/* Current Bid */}
                <p className="font-semibold text-lg">
                  Current Bid:{' '}
                  <span className="text-yellow-500 font-bold">
                    ${item.current_bid.toFixed(2)}
                  </span>
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal */}
      {selectedItem && (
  <div
    className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
    onClick={closeModal} // Close modal when clicking on the background
  >
    <div
      className="bg-gray-800 text-white rounded-lg p-6 max-w-4xl w-full flex flex-col lg:flex-row gap-6"
      onClick={(e) => e.stopPropagation()} // Stop click event from propagating
    >
      {/* Image Gallery */}
      <div className="lg:w-1/2 w-full">
        <img
          src={selectedItem.images?.[currentImageIndex] || selectedItem.image_url}
          alt={selectedItem.name}
          className="w-full h-64 lg:h-96 object-cover rounded-lg"
        />
        <div className="flex space-x-2 mt-4 overflow-x-auto">
          {selectedItem.images?.map((img, index) => (
            <img
              key={index}
              src={img}
              alt={`Thumbnail ${index}`}
              className={`w-16 h-16 object-cover rounded cursor-pointer ${
                index === currentImageIndex ? 'border-2 border-yellow-500' : ''
              }`}
              onClick={() => setCurrentImageIndex(index)}
            />
          ))}
        </div>
      </div>

      {/* Details and Bidding */}
      <div className="lg:w-1/2 w-full flex flex-col justify-between">
        <div>
          <h2 className="text-2xl lg:text-3xl font-bold mb-4">{selectedItem.name}</h2>
          <p className="text-gray-400 mb-4">{selectedItem.description}</p>
          <p className="font-semibold">
            Current Bid:{' '}
            <span className="text-yellow-500">${selectedItem.current_bid}</span>
          </p>
          <p className="font-semibold mt-2">
            Min Raise: <span className="text-yellow-500">${selectedItem.min_raise}</span>
          </p>
        </div>
        <div className="mt-4">
          <div className="flex items-center mb-4">
            <button
              className="bg-gray-600 px-4 py-2 rounded-l"
              onClick={() => handleBidChange(-1, selectedItem.min_raise)}
            >
              -
            </button>
            <input
              type="text"
              readOnly
              value={
                selectedItem.bid || selectedItem.current_bid + selectedItem.min_raise
              }
              className="w-24 text-center bg-gray-700"
            />
            <button
              className="bg-blue-600 px-4 py-2 rounded-r"
              onClick={() => handleBidChange(1, selectedItem.min_raise)}
            >
              +
            </button>
          </div>
          <button
            onClick={handlePlaceBid}
            className="w-full bg-green-600 hover:bg-green-700 px-4 py-2 rounded font-semibold"
          >
            Place Bid
          </button>
          <button
            onClick={closeModal}
            className="mt-2 w-full bg-red-600 hover:bg-red-700 px-4 py-2 rounded font-semibold"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  </div>
)}

      {/* Toast Container */}
      
    </div>
  );
}
