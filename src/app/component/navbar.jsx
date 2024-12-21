'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabase/client';

export default function Navbar() {
  const [user, setUser] = useState(null);
  const [avatarUrl, setAvatarUrl] = useState('');
  const [username, setUsername] = useState('');

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();

      if (error) {
        console.error('Error fetching user:', error.message);
        setUser(null);
        return;
      }

      if (user) {
        setUser(user);
        setAvatarUrl(user.user_metadata?.avatar_url || '');
        setUsername(user.user_metadata?.username || '');
      }
    };

    fetchUser();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setAvatarUrl('');
    setUsername('');
    localStorage.removeItem('authToken');
    window.location.reload();
  };

  return (
    <header className="sticky top-0 w-full flex justify-between items-center h-16 py-4 px-8 bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 shadow-md z-50">
  {/* Logo */}
  <div className="flex-shrink-0  md:flex hidden text-2xl font-bold text-white hover:scale-105 transform transition duration-300">
    <Link href="/">
      <span className="text-blue-500">Cloudy</span>
      <span className="text-gray-300">Forge</span>
    </Link>
  </div>

  {/* Navigation Links */}
  <nav className="flex flex-grow justify-center space-x-8">
  <Link href="/" className="items-center text-s flex  text-white hover:text-blue-400 transition duration-200">
  🏠 Home    </Link>
    <Link href="/auction" className="flex items-center text-s md:text-l text-white hover:text-blue-400 transition duration-200">
      🏆 Auction
    </Link>
    <Link href="/artillery" className="flex items-center md:text-l text-s text-white hover:text-blue-400 transition duration-200">
      ✉️ "REVENGE"
    </Link>
  </nav>

  {/* User Actions */}
  <div className="flex items-center space-x-6 ">
    {/* Language Selector */}
    <div className="bg-black border border-gray-400 px-3 py-1 rounded-full hover:bg-gray-700 transition md:flex hidden">
      <span className="text-white">🌐 EN</span>
    </div>

    {/* User Info or Register/Login */}
    <div className="flex items-center space-x-4">
      {user ? (
        <div className="relative group">
          <div className="flex items-center space-x-2 cursor-pointer">
            <img
              src={avatarUrl || 'https://via.placeholder.com/150'}
              alt={`${username || 'User'}'s avatar`}
              className="w-16 h-8 md:w-8 rounded-full object-cover border-2 border-gray-600"
            />
            <span className="text-white hidden md:flex">{username || 'User'}</span>
          </div>
          {/* Dropdown */}
          <div className="absolute right-0 ml-1 bg-gray-800 text-white rounded-lg shadow-lg hidden group-hover:block">
            <Link href="/profile" className="block px-4 py-2 hover:bg-gray-700">
              Profile
            </Link>
            <button 
              onClick={handleLogout}
              className="block w-full text-left px-4 py-2 hover:bg-gray-700"
            >
              Logout
            </button>
          </div>
        </div>
      ) : (
        <Link href="/register">
          <button className="bg-green-700 hover:bg-green-600 text-white px-2 py-2 text-xs md:px-4 md:py-2 md:text-sm rounded-lg shadow-md transition duration-200">
            Register
          </button>
        </Link>
      )}
    </div>
  </div>
</header>
  );
}
