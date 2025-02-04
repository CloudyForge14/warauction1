'use client';

import React, { useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export const AddOptionModal = ({ onSave, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    cost: 0,
    description: '',
    order: 0,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    // Тёмный полупрозрачный фон (как раньше)
    <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50">
      {/* Тёмный контейнер формы */}
      <div className="bg-gray-800 text-white w-full max-w-xl p-6 md:p-8 rounded-md shadow-2xl relative">
        {/* Кнопка закрытия (крестик) в правом верхнем углу */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition"
        >
          ✕
        </button>

        <h2 className="text-2xl font-bold border-b border-gray-700 pb-2 mb-4">
          Add New Option
        </h2>

        {/* Используем grid для более современного вида */}
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
              onChange={handleChange}
              placeholder="e.g. Premium Package"
              className="p-2 bg-gray-700 rounded-md focus:ring-2 focus:ring-blue-500"
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
              onChange={handleChange}
              placeholder="e.g. 50"
              className="p-2 bg-gray-700 rounded-md focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Одна колонка на всю ширину для description */}
          <div className="md:col-span-2 flex flex-col">
            <label htmlFor="optionDesc" className="text-sm font-medium mb-1">
              Description
            </label>
            <textarea
              id="optionDesc"
              name="description"
              onChange={handleChange}
              placeholder="Describe what this option includes"
              className="p-2 bg-gray-700 rounded-md focus:ring-2 focus:ring-blue-500 h-24"
            />
          </div>

          {/* Одна колонка на всю ширину для order */}
          <div className="md:col-span-2 flex flex-col">
            <label htmlFor="optionOrder" className="text-sm font-medium mb-1">
              Order
            </label>
            <input
              id="optionOrder"
              type="number"
              name="order"
              onChange={handleChange}
              placeholder="e.g. 1"
              className="p-2 bg-gray-700 rounded-md focus:ring-2 focus:ring-blue-500"
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
            >
              Add Option
            </button>
          </div>
        </form>
      </div>

      <ToastContainer />
    </div>
  );
};
