'use client'; 

import React, { useState } from 'react';
import { supabase } from '@/utils/supabase/client';
import { ToastContainer, toast } from 'react-toastify';

export const AddOptionModal = ({ onSave, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    cost: 0,
    description: '',
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
    <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-96">
        <h2 className="text-xl font-bold mb-4">Add Option</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-300 mb-1" htmlFor="optionName">
              Option Name
            </label>
            <input
              id="optionName"
              type="text"
              name="name"
              onChange={handleChange}
              placeholder="e.g. Premium Package"
              className="w-full p-2 bg-gray-700 rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-1" htmlFor="optionCost">
              Cost
            </label>
            <input
              id="optionCost"
              type="number"
              name="cost"
              onChange={handleChange}
              placeholder="e.g. 50"
              className="w-full p-2 bg-gray-700 rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-1" htmlFor="optionDesc">
              Description
            </label>
            <textarea
              id="optionDesc"
              name="description"
              onChange={handleChange}
              placeholder="Describe what this option includes"
              className="w-full p-2 bg-gray-700 rounded-md"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 p-2 rounded-md"
          >
            Add Option
          </button>
          <button
            type="button"
            onClick={onClose}
            className="w-full bg-red-600 hover:bg-red-700 p-2 rounded-md mt-2"
          >
            Cancel
          </button>
        </form>
      </div>
    </div>
  );
};