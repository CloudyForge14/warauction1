'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import jwt from 'jsonwebtoken';

export default function Navbar() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = () => {
      const token = localStorage.getItem('authToken'); // Retrieve JWT token
      if (token) {
        try {
          const decoded = jwt.decode(token); // Decode the token to get user info
          setUser(decoded);
        } catch (err) {
          console.error('Invalid token', err);
          setUser(null);
        }
      } else {
        setUser(null);
      }
    };

    fetchUser();
  }, []);

  return (
    <header className="relative w-full flex justify-between items-center py-4 px-6 bg-opacity-75 z-10 bg-black">
      <div className="text-2xl font-bold text-white">
        <Link href="/">
          warAuction<span className="text-blue-500">UA</span>
        </Link>
      </div>
      <nav className="flex space-x-6">
        <a href="/auction" className="text-white hover:text-gray-400">
          Auction
        </a>
        <a href="/artillery" className="text-white hover:text-gray-400">
          Order a message
        </a>
        <a href="#about" className="text-white hover:text-gray-400">
          About Us
        </a>
      </nav>
      <div className="flex items-center space-x-4">
        <div className="bg-black border border-gray-400 px-2 pr-5 py-1 rounded-full">
          <span className="text-white">🌐 UA</span>
        </div>
        {user ? (
          // Show user profile if logged in
          <div className="flex items-center space-x-2">
            <img
              src={user.avatar || 'https://via.placeholder.com/150'} // Replace with actual user image URL
              alt={`${user.username || 'User'}'s avatar`}
              className="w-8 h-8 rounded-full"
            />
            <span className="text-white">{user.username || 'User'}</span>
          </div>
        ) : (
          // Show Register button if not logged in
          <Link href="/register">
            <button className="bg-green-800 hover:bg-green-600 text-white px-4 py-2 rounded">
              Register
            </button>
          </Link>
        )}
      </div>
    </header>
  );
}
