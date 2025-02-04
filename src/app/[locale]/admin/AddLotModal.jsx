'use client';  // <-- очень важно

import React, { useState } from 'react';
import { supabase } from '@/utils/supabase/client';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export const AddLotModal = ({ onSave, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    current_bid: 0,
    min_raise: 10,
    date_of_finishing: '',
    time_of_finishing: '',
    image_url: '',
    paypal: '',
    card: '',
  });
  const [file, setFile] = useState(null);

  const handleFileChange = (e) => setFile(e.target.files[0]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let imageUrl = formData.image_url;

    if (file) {
      const fileName = `${Date.now()}-${file.name}`;
      const { error } = await supabase.storage
        .from('auction_images')
        .upload(fileName, file);

      if (error) {
        console.error('Error uploading file:', error);
        toast.error('Failed to upload image. Please try again.');
        return;
      }

      const { data: publicUrlData, error: publicUrlError } = supabase
        .storage
        .from('auction_images')
        .getPublicUrl(fileName);

      if (publicUrlError) {
        console.error('Error retrieving public URL:', publicUrlError);
        toast.error('Failed to retrieve image URL. Please try again.');
        return;
      }

      imageUrl = publicUrlData.publicUrl;
    }

    onSave({ ...formData, image_url: imageUrl });
    onClose();
  };

  return (
    // Тёмный оверлей (цвета без изменений)
    <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50">
      {/* Тёмный контейнер модалки (цвета тоже без изменений) */}
      <div className="bg-gray-800 p-6 md:p-8 rounded-lg shadow-lg w-full max-w-2xl relative">
        {/* Кнопка-крестик для закрытия в углу */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-300 hover:text-white transition"
        >
          ✕
        </button>

        <h2 className="text-xl font-bold mb-4 border-b border-gray-700 pb-2">
          Add Lot
        </h2>
        
        {/* Используем grid для раскладки на две колонки на больших экранах */}
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Левая колонка */}
          <div className="flex flex-col">
            <label className="block text-sm text-gray-300 mb-1" htmlFor="lotName">
              Lot Name
            </label>
            <input
              id="lotName"
              type="text"
              name="name"
              placeholder="e.g. Rare Artifact"
              value={formData.name}
              onChange={handleChange}
              className="p-2 bg-gray-700 rounded-md"
            />
          </div>

          <div className="flex flex-col">
            <label className="block text-sm text-gray-300 mb-1" htmlFor="finishingDate">
              Finishing Date
            </label>
            <input
              id="finishingDate"
              type="date"
              name="date_of_finishing"
              value={formData.date_of_finishing}
              onChange={handleChange}
              className="p-2 bg-gray-700 rounded-md"
            />
          </div>

          <div className="flex flex-col">
            <label className="block text-sm text-gray-300 mb-1" htmlFor="currentBid">
              Current Bid
            </label>
            <input
              id="currentBid"
              type="number"
              name="current_bid"
              placeholder="e.g. 50"
              value={formData.current_bid}
              onChange={handleChange}
              className="p-2 bg-gray-700 rounded-md"
            />
          </div>

          <div className="flex flex-col">
            <label className="block text-sm text-gray-300 mb-1" htmlFor="minRaise">
              Minimum Raise
            </label>
            <input
              id="minRaise"
              type="number"
              name="min_raise"
              placeholder="e.g. 10"
              value={formData.min_raise}
              onChange={handleChange}
              className="p-2 bg-gray-700 rounded-md"
            />
          </div>

          {/* Правая колонка */}
          <div className="flex flex-col md:col-span-2">
            <label className="block text-sm text-gray-300 mb-1" htmlFor="lotDesc">
              Description
            </label>
            <textarea
              id="lotDesc"
              name="description"
              placeholder="Short description of the lot"
              value={formData.description}
              onChange={handleChange}
              className="p-2 bg-gray-700 rounded-md h-24"
            />
          </div>

          <div className="flex flex-col">
            <label className="block text-sm text-gray-300 mb-1" htmlFor="finishingTime">
              Finishing Time
            </label>
            <input
              id="finishingTime"
              type="time"
              name="time_of_finishing"
              value={formData.time_of_finishing}
              onChange={handleChange}
              className="p-2 bg-gray-700 rounded-md"
            />
          </div>

          <div className="flex flex-col">
            <label className="block text-sm text-gray-300 mb-1">
              Image (optional)
            </label>
            <input
              type="file"
              onChange={handleFileChange}
              className="p-2 bg-gray-700 rounded-md"
            />
          </div>

          {/* Поля PayPal и Card во всю ширину */}
          <div className="md:col-span-2 flex flex-col">
            <label className="block text-sm text-gray-300 mb-1" htmlFor="lotPaypal">
              Paypal
            </label>
            <textarea
              id="lotPaypal"
              name="paypal"
              placeholder="Paypal email"
              value={formData.paypal}
              onChange={handleChange}
              className="p-2 bg-gray-700 rounded-md"
            />
          </div>
          <div className="md:col-span-2 flex flex-col">
            <label className="block text-sm text-gray-300 mb-1" htmlFor="lotCard">
              Card
            </label>
            <textarea
              id="lotCard"
              name="card"
              placeholder="Card Number"
              value={formData.card}
              onChange={handleChange}
              className="p-2 bg-gray-700 rounded-md"
            />
          </div>

          {/* Кнопки "Add Lot" и "Cancel" на всю ширину (col-span-2) */}
          <div className="md:col-span-2 flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="bg-red-600 hover:bg-red-700 p-2 rounded-md mt-2 w-1/2"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 p-2 rounded-md mt-2 w-1/2"
            >
              Add Lot
            </button>
          </div>
        </form>
      </div>

      <ToastContainer />
    </div>
  );
};
