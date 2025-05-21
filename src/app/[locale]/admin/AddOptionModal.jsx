'use client';

import React, { useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { supabase } from '@/utils/supabase/client'; // Импортируем Supabase клиент

export const AddOptionModal = ({ onSave, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    cost: 0,
    description: '',
    order: 0,
    image_url: '', // URL изображения после загрузки
  });
  const [isUploading, setIsUploading] = useState(false); // Состояние загрузки файла

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Обработка загрузки файла
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);

    try {
      // Генерируем уникальное имя файла
      const fileName = `${Date.now()}-${file.name}`;

      // Загружаем файл в Supabase Storage
      const { data, error } = await supabase.storage
        .from('options-images') // Название бакета в Supabase Storage
        .upload(fileName, file);

      if (error) {
        throw error;
      }

      // Получаем публичный URL загруженного файла
      const { data: publicUrl } = supabase.storage
        .from('options-images')
        .getPublicUrl(data.path);

      // Обновляем состояние с URL изображения
      setFormData((prev) => ({ ...prev, image_url: publicUrl.publicUrl }));
      toast.success('Image uploaded successfully!');
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error('Failed to upload image.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.cost || !formData.order) {
      toast.error('Please fill in all required fields: Name, Cost, and Order.');
      return;
    }
    // В handleSubmit (AddLotModal.jsx и EditLotModal.jsx)
    if (formData.max_length && formData.description.length > formData.max_length) {
      toast.error(`Description exceeds maximum length of ${formData.max_length} characters`);
      return;
    }
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-gray-800 text-white w-full max-w-xl p-6 md:p-8 rounded-md shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition"
        >
          ✕
        </button>

        <h2 className="text-2xl font-bold border-b border-gray-700 pb-2 mb-4">
          Add New Option
        </h2>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Левая колонка */}
          <div className="flex flex-col">
            <label htmlFor="optionName" className="text-sm font-medium mb-1">
              Option Name
            </label>
            <input
              id="optionName"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. Premium Package"
              className="p-2 bg-gray-700 rounded-md focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="flex flex-col">
            <label htmlFor="optionCost" className="text-sm font-medium mb-1">
              Cost
            </label>
            <input
              id="optionCost"
              type="number"
              name="cost"
              value={formData.cost}
              onChange={handleChange}
              placeholder="e.g. 50"
              className="p-2 bg-gray-700 rounded-md focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Правая колонка */}
          <div className="flex flex-col">
            <label htmlFor="optionOrder" className="text-sm font-medium mb-1">
              Order
            </label>
            <input
              id="optionOrder"
              type="number"
              name="order"
              value={formData.order}
              onChange={handleChange}
              placeholder="e.g. 1"
              className="p-2 bg-gray-700 rounded-md focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Поле для загрузки файла */}
          <div className="md:col-span-2 flex flex-col">
            <label htmlFor="optionImage" className="text-sm font-medium mb-1">
              Upload Image
            </label>
            <input
              id="optionImage"
              type="file"
              accept="image/*" // Только изображения
              onChange={handleFileUpload}
              className="p-2 bg-gray-700 rounded-md focus:ring-2 focus:ring-blue-500"
              disabled={isUploading}
            />
            {isUploading && <p className="text-sm text-gray-400 mt-1">Uploading...</p>}
            {formData.image_url && (
              <div className="mt-2">
                <img
                  src={formData.image_url}
                  alt="Preview"
                  className="w-20 h-20 object-cover rounded-md"
                />
              </div>
            )}
          </div>

          {/* Описание (на всю ширину) */}
          <div className="md:col-span-2 flex flex-col">
            <label htmlFor="optionDesc" className="text-sm font-medium mb-1">
              Description
            </label>
            <textarea
              id="optionDesc"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe what this option includes"
              className="p-2 bg-gray-700 rounded-md focus:ring-2 focus:ring-blue-500 h-24"
            />
          </div>

          {/* Кнопки внизу */}
          <div className="md:col-span-2 flex justify-end space-x-2 mt-2">
            <button
              type="button"
              onClick={onClose}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition"
              disabled={isUploading}
            >
              {isUploading ? 'Uploading...' : 'Add Option'}
            </button>
          </div>
        </form>
      </div>

      <ToastContainer />
    </div>
  );
};