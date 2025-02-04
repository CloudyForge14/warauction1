'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabase/client';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export const EditLotModal = ({ lot, onSave, onClose }) => {
  const [formData, setFormData] = useState(lot);
  const [file, setFile] = useState(null);

  useEffect(() => {
    if (lot) setFormData(lot);
  }, [lot]);

  const handleFileChange = (e) => setFile(e.target.files[0]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let imageUrl = formData.image_url;

    // Загрузка файла, если выбран
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

    // Вызываем onSave с обновлёнными данными
    onSave({ ...formData, image_url: imageUrl });
    onClose();
  };

  return (
    // Фон с отступами, чтобы на маленьких экранах был небольшой отступ
    <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50 p-4 sm:p-6">
      {/* Контейнер модального окна с max-h-[90vh] и overflow-y-auto для скроллинга */}
      <div className="bg-gray-800 text-white w-full max-w-2xl p-6 sm:p-8 rounded-lg shadow-lg relative max-h-[90vh] overflow-y-auto">
        {/* Кнопка-крестик для закрытия */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-300 hover:text-white transition text-2xl sm:text-3xl"
        >
          ✕
        </button>

        <h2 className="text-xl sm:text-2xl font-bold mb-4 border-b border-gray-700 pb-2">
          Edit Lot
        </h2>

        {/* Форма: одна колонка на маленьких экранах, две на md и выше */}
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Левая колонка */}
          <div className="flex flex-col">
            <label className="block text-sm sm:text-base text-gray-300 mb-1" htmlFor="lotName">
              Lot Name
            </label>
            <input
              id="lotName"
              type="text"
              name="name"
              placeholder="e.g. Rare Artifact"
              value={formData.name || ''}
              onChange={handleChange}
              className="p-2 bg-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex flex-col">
            <label className="block text-sm sm:text-base text-gray-300 mb-1" htmlFor="currentBid">
              Current Bid
            </label>
            <input
              id="currentBid"
              type="number"
              name="current_bid"
              placeholder="e.g. 50"
              value={formData.current_bid || 0}
              onChange={handleChange}
              className="p-2 bg-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Правая колонка */}
          <div className="flex flex-col">
            <label className="block text-sm sm:text-base text-gray-300 mb-1" htmlFor="minRaise">
              Minimum Raise
            </label>
            <input
              id="minRaise"
              type="number"
              name="min_raise"
              placeholder="e.g. 10"
              value={formData.min_raise || 0}
              onChange={handleChange}
              className="p-2 bg-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex flex-col">
            <label className="block text-sm sm:text-base text-gray-300 mb-1" htmlFor="lotOrder">
              Order
            </label>
            <input
              id="lotOrder"
              type="number"
              name="order"
              placeholder="e.g. 1"
              value={formData.order || 0}
              onChange={handleChange}
              className="p-2 bg-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Полная ширина для Description */}
          <div className="md:col-span-2 flex flex-col">
            <label className="block text-sm sm:text-base text-gray-300 mb-1" htmlFor="lotDesc">
              Description
            </label>
            <textarea
              id="lotDesc"
              name="description"
              placeholder="Short description of the lot"
              value={formData.description || ''}
              onChange={handleChange}
              className="p-2 bg-gray-700 rounded-md h-24 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex flex-col">
            <label className="block text-sm sm:text-base text-gray-300 mb-1" htmlFor="finishingDate">
              Finishing Date
            </label>
            <input
              id="finishingDate"
              type="date"
              name="date_of_finishing"
              value={formData.date_of_finishing || ''}
              onChange={handleChange}
              className="p-2 bg-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex flex-col">
            <label className="block text-sm sm:text-base text-gray-300 mb-1" htmlFor="finishingTime">
              Finishing Time
            </label>
            <input
              id="finishingTime"
              type="time"
              name="time_of_finishing"
              value={formData.time_of_finishing || ''}
              onChange={handleChange}
              className="p-2 bg-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Поле для загрузки новой картинки */}
          <div className="flex flex-col">
            <label className="block text-sm sm:text-base text-gray-300 mb-1">
              Update Image (optional)
            </label>
            <input
              type="file"
              onChange={handleFileChange}
              className="p-2 bg-gray-700 rounded-md"
            />
          </div>

          {/* Поля PayPal и Card на всю ширину */}
          <div className="md:col-span-2 flex flex-col">
            <label className="block text-sm sm:text-base text-gray-300 mb-1" htmlFor="lotPaypal">
              Paypal
            </label>
            <input
              id="lotPaypal"
              type="text"
              name="paypal"
              placeholder="Paypal Email"
              value={formData.paypal || ''}
              onChange={handleChange}
              className="p-2 bg-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="md:col-span-2 flex flex-col">
            <label className="block text-sm sm:text-base text-gray-300 mb-1" htmlFor="card">
              Card Number
            </label>
            <input
              id="card"
              type="text"
              name="card"
              placeholder="Card Number"
              value={formData.card || ''}
              onChange={handleChange}
              className="p-2 bg-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Кнопки на всю ширину (col-span-2) */}
          <div className="md:col-span-2 flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="bg-red-600 hover:bg-red-700 p-2 rounded-md w-full sm:w-1/2"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 p-2 rounded-md w-full sm:w-1/2"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
