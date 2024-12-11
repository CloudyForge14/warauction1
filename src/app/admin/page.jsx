'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '../component/navbar';
import { supabase } from '@/utils/supabase/client';
import jwt from 'jsonwebtoken';

export default function AdminPage() {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [items, setItems] = useState([]);
  const [newLot, setNewLot] = useState({ name: '', description: '', current_bid: 0, time_left: 0 });
  const [file, setFile] = useState(null);
  const [newOption, setNewOption] = useState({ name: '', cost: 0, description: '' });
  const [users, setUsers] = useState([]);
  const [admins, setAdmins] = useState([]);

  // Загрузка администраторов
  useEffect(() => {
    const fetchAdmins = async () => {
      const { data: adminsData, error } = await supabase.from('admins').select('*');
      if (error) {
        console.error('Error fetching admins:', error.message);
        return;
      }
      setAdmins(adminsData);
    };

    fetchAdmins();
  }, []);

  // Проверка прав администратора
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      const decoded = jwt.decode(token);
      setUser(decoded);

      const checkAdmin = async () => {
        const { data, error } = await supabase
          .from('admins')
          .select('*')
          .eq('user_id', decoded.id);

        if (error) {
          console.error('Error checking admin rights:', error.message);
          setIsAdmin(false);
        } else {
          setIsAdmin(data.length > 0);
        }
      };

      checkAdmin();
    } else {
      setUser(null);
      setIsAdmin(false);
    }
  }, []);

  // Загрузка существующих лотов и пользователей
  useEffect(() => {
    const fetchData = async () => {
      const { data: itemsData } = await supabase.from('auction_items').select('*');
      setItems(itemsData);

      const { data: usersData } = await supabase.from('users').select('*');
      setUsers(usersData);
    };

    fetchData();
  }, []);

  // Удаление администратора
  const handleRemoveAdmin = async (userId) => {
    try {
      const { error } = await supabase.from('admins').delete().eq('user_id', userId);
      if (error) throw error;

      alert('User removed from admins!');
      window.location.reload();
    } catch (err) {
      console.error(err);
      alert('Failed to remove admin');
    }
  };

  // Добавление нового лота
  const handleAddLot = async () => {
    try {
      let imageUrl = '';
      if (file) {
        const fileName = `${Date.now()}-${file.name}`;
        const { data, error } = await supabase.storage.from('auction_images').upload(fileName, file);
        if (error) throw error;
        imageUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/auction-images/${fileName}`;
      }

      const { error } = await supabase.from('auction_items').insert({
        ...newLot,
        image_url: imageUrl,
        is_active: true,
      });

      if (error) throw error;

      alert('Lot added successfully!');
      setNewLot({ name: '', description: '', current_bid: 0, time_left: 0 });
      setFile(null);
    } catch (err) {
      console.error(err);
      alert('Failed to add lot');
    }
  };

  // Завершение аукциона
  const handleEndAuction = async (itemId) => {
    try {
      const { error } = await supabase
        .from('auction_items')
        .update({ is_active: false })
        .eq('id', itemId);

      if (error) throw error;

      alert('Auction ended successfully!');
      setItems(items.map((item) => (item.id === itemId ? { ...item, is_active: false } : item)));
    } catch (err) {
      console.error('Error ending auction:', err);
      alert('Failed to end auction');
    }
  };

  // Создание новой опции
  const handleAddOption = async () => {
    try {
      const { error } = await supabase.from('options').insert(newOption);
      if (error) throw error;

      alert('Option added successfully!');
      setNewOption({ name: '', cost: 0, description: '' });
    } catch (err) {
      console.error(err);
      alert('Failed to add option');
    }
  };

  // Добавление администратора
  const handleMakeAdmin = async (userId) => {
    try {
      const { data: existingAdmins, error: checkError } = await supabase
        .from('admins')
        .select('*')
        .eq('user_id', userId);

      if (checkError) throw checkError;

      if (existingAdmins.length > 0) {
        alert('This user is already an admin.');
        return;
      }

      const { error } = await supabase.from('admins').insert({ user_id: userId });
      if (error) throw error;

      alert('User promoted to admin!');
      window.location.reload();
    } catch (err) {
      console.error(err);
      alert('Failed to promote user');
    }
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
        <p>Access denied. You must be an administrator to access this page.</p>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div className="bg-gray-900 text-white min-h-screen px-6 py-12">
        <h1 className="text-4xl font-extrabold text-center mb-12">Admin Panel</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Add Lot */}
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-semibold mb-4">Add New Lot</h2>
            <input
              type="text"
              placeholder="Name"
              value={newLot.name}
              onChange={(e) => setNewLot({ ...newLot, name: e.target.value })}
              className="block w-full mb-4 p-2 bg-gray-700 rounded"
            />
            <textarea
              placeholder="Description"
              value={newLot.description}
              onChange={(e) => setNewLot({ ...newLot, description: e.target.value })}
              className="block w-full mb-4 p-2 bg-gray-700 rounded"
            />
            <input
              type="number"
              placeholder="Current Bid"
              value={newLot.current_bid}
              onChange={(e) => setNewLot({ ...newLot, current_bid: parseFloat(e.target.value) })}
              className="block w-full mb-4 p-2 bg-gray-700 rounded"
            />
            <input
              type="number"
              placeholder="Time Left (seconds)"
              value={newLot.time_left}
              onChange={(e) => setNewLot({ ...newLot, time_left: parseInt(e.target.value) })}
              className="block w-full mb-4 p-2 bg-gray-700 rounded"
            />
            <input
              type="file"
              onChange={(e) => setFile(e.target.files[0])}
              className="block w-full mb-4 p-2 bg-gray-700 rounded"
            />
            <button
              onClick={handleAddLot}
              className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-white w-full"
            >
              Add Lot
            </button>
          </div>

          {/* Manage Admins */}
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-semibold mb-4">Manage Admins</h2>
            <ul className="space-y-4">
              {users.map((user) => {
                const isUserAdmin = admins.some((admin) => admin.user_id === user.id);
                return (
                  <li key={user.id} className="flex justify-between items-center bg-gray-700 p-4 rounded-lg">
                    <div>
                      <p className="font-bold">{user.username}</p>
                      <p className="text-sm text-gray-300">{user.email}</p>
                    </div>
                    <div className="flex space-x-2">
                      {isUserAdmin ? (
                        <button
                          disabled
                          className="bg-gray-600 px-4 py-2 rounded text-white cursor-not-allowed"
                        >
                          Already Admin
                        </button>
                      ) : (
                        <button
                          onClick={() => handleMakeAdmin(user.id)}
                          className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded text-white"
                        >
                          Make Admin
                        </button>
                      )}
                      <button
                        onClick={() => handleRemoveAdmin(user.id)}
                        className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded text-white"
                      >
                        Remove Admin
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Manage Lots */}
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-semibold mb-4">Manage Lots</h2>
            <ul className="space-y-4">
              {items.map((item) => (
                <li key={item.id} className="flex justify-between items-center bg-gray-700 p-4 rounded-lg">
                  <div>
                    <p className="font-bold">{item.name}</p>
                    <p className="text-sm text-gray-300">${item.current_bid.toFixed(2)}</p>
                  </div>
                  {item.is_active && (
                    <button
                      onClick={() => handleEndAuction(item.id)}
                      className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded text-white"
                    >
                      End Auction
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Add New Option */}
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-semibold mb-4">Add New Option</h2>
            <input
              type="text"
              placeholder="Option Name"
              value={newOption.name}
              onChange={(e) => setNewOption({ ...newOption, name: e.target.value })}
              className="block w-full mb-4 p-2 bg-gray-700 rounded"
            />
            <input
              type="number"
              placeholder="Cost"
              value={newOption.cost}
              onChange={(e) => setNewOption({ ...newOption, cost: parseFloat(e.target.value) })}
              className="block w-full mb-4 p-2 bg-gray-700 rounded"
            />
            <textarea
              placeholder="Description"
              value={newOption.description}
              onChange={(e) => setNewOption({ ...newOption, description: e.target.value })}
              className="block w-full mb-4 p-2 bg-gray-700 rounded"
            />
            <button
              onClick={handleAddOption}
              className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-white w-full"
            >
              Add Option
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
