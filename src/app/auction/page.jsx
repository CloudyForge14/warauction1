'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '../component/navbar';
import jwt from 'jsonwebtoken';
import { fetchUploadedImages } from '../api/auction-items/route'; // Предполагается, что эта функция есть в utils/api.js

export default function AuctionItems() {
  const [items, setItems] = useState([]);
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
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
  }, []);

  // Fetch auction items and their associated images
  useEffect(() => {
    const fetchAuctionItems = async () => {
      setLoading(true);
      try {
        // Получение изображений из Supabase
        const uploadedImages = await fetchUploadedImages();

        // Получение товаров аукциона
        const response = await fetch('/api/auction-items'); // Настроенный API для аукционных товаров
        if (!response.ok) {
          throw new Error('Failed to fetch auction items');
        }
        const auctionItems = await response.json();

        // Связать изображения с товарами
        const itemsWithImages = auctionItems.map((item) => ({
          ...item,
          image_url:
            uploadedImages.find((img) => img.id === item.image_id)?.url || item.image_url,
        }));

        setItems(itemsWithImages);
      } catch (err) {
        console.error('Error fetching auction items:', err);
        setError('Could not fetch auction items. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchAuctionItems();
  }, []);

  // Update timeLeft for auction items
  useEffect(() => {
    const timer = setInterval(() => {
      setItems((prevItems) =>
        prevItems.map((item) => ({
          ...item,
          time_left: Math.max(item.time_left - 1, 0),
        }))
      );
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handlePlaceBid = async (itemId, currentBid) => {
    if (!isAuthenticated) {
      alert('Please log in to place a bid.');
      return;
    }

    const newBid = currentBid + 1; // Increment the bid by $1 for simplicity

    try {
      const response = await fetch(`/api/place-bid/${itemId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('authToken')}`,
        },
        body: JSON.stringify({ newBid }),
      });

      if (!response.ok) {
        throw new Error('Failed to place bid.');
      }

      const updatedItem = await response.json();
      setItems((prevItems) =>
        prevItems.map((item) =>
          item.id === updatedItem.id ? updatedItem : item
        )
      );
    } catch (err) {
      console.error('Error placing bid:', err);
      alert('Failed to place bid. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
        <p>Loading auction items...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div className="bg-gray-900 text-white min-h-screen px-6 py-12">
        <h1 className="text-3xl font-bold text-center mb-8">Auction Items</h1>

        {!isAuthenticated ? (
          <div className="text-center">
            <p className="text-lg font-semibold mb-4">
              You must be logged in to participate in the auction.
            </p>
            <a
              href="/login"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
            >
              Go to Login
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {items.map((item) => (
              <div key={item.id} className="bg-gray-800 rounded-lg p-4 shadow-lg text-center">
                <img
                  src={item.image_url}
                  alt={item.name}
                  className="w-full h-40 object-cover rounded-t-md mb-4"
                />
                <h2 className="text-xl font-semibold mb-2">{item.name}</h2>
                <p>Description: {item.description}</p>
                <p>
                  Current Bid: ${item.current_bid ? item.current_bid.toFixed(2) : 'N/A'}
                </p>
                <p>
                  Time Left:{' '}
                  {`${Math.floor(item.time_left / 3600)}h ${Math.floor(
                    (item.time_left % 3600) / 60
                  )}m ${item.time_left % 60}s`}
                </p>
                <button
                  className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                  onClick={() => handlePlaceBid(item.id, item.current_bid)}
                  disabled={item.time_left === 0}
                >
                  {item.time_left > 0 ? 'Place a Bid' : 'Auction Ended'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
