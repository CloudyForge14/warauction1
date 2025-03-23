import React, { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabase/client';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export const EditOptionModal = ({ option, onSave, onClose, onMoveUp, onMoveDown }) => {
  const [formData, setFormData] = useState(option);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (option) setFormData(option);
  }, [option]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);

    try {
      const fileName = `${Date.now()}-${file.name}`;
      const { data, error } = await supabase.storage
        .from('options-images')
        .upload(fileName, file);

      if (error) throw error;

      const { data: publicUrl } = supabase.storage
        .from('options-images')
        .getPublicUrl(data.path);

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
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-gray-800 text-white w-full max-w-2xl p-8 rounded-lg shadow-lg relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-300 hover:text-white transition">
          ✕
        </button>

        <h2 className="text-xl font-bold mb-4 border-b border-gray-700 pb-2">Edit Option</h2>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col">
            <label className="block text-sm text-gray-300 mb-1" htmlFor="optionName">
              Option Name
            </label>
            <input
              id="optionName"
              type="text"
              name="name"
              value={formData.name || ''}
              onChange={handleChange}
              placeholder="e.g. Premium Package"
              className="p-2 bg-gray-700 rounded-md"
            />
          </div>

          <div className="flex flex-col">
            <label className="block text-sm text-gray-300 mb-1" htmlFor="optionCost">
              Cost
            </label>
            <input
              id="optionCost"
              type="number"
              name="cost"
              value={formData.cost || 0}
              onChange={handleChange}
              placeholder="e.g. 100"
              className="p-2 bg-gray-700 rounded-md"
            />
          </div>

          <div className="md:col-span-2 flex flex-col">
            <label className="block text-sm text-gray-300 mb-1" htmlFor="optionDesc">
              Description
            </label>
            <textarea
              id="optionDesc"
              name="description"
              value={formData.description || ''}
              onChange={handleChange}
              placeholder="Description of the option"
              className="p-2 bg-gray-700 rounded-md h-24"
            />
          </div>

          <div className="flex flex-col">
            <label className="block text-sm text-gray-300 mb-1" htmlFor="optionOrder">
              Order
            </label>
            <input
              id="optionOrder"
              type="number"
              name="order"
              value={formData.order || 0}
              onChange={handleChange}
              placeholder="e.g. 1"
              className="p-2 bg-gray-700 rounded-md"
            />
          </div>

          <div className="md:col-span-2 flex flex-col">
            <label className="block text-sm text-gray-300 mb-1" htmlFor="optionImage">
              Upload Image
            </label>
            <input
              id="optionImage"
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="p-2 bg-gray-700 rounded-md"
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

          <div className="md:col-span-2 flex justify-end space-x-2 mt-2">
            <button
              type="button"
              onClick={onClose}
              className="bg-red-600 hover:bg-red-700 p-2 rounded-md w-1/2"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 p-2 rounded-md w-1/2"
              disabled={isUploading}
            >
              {isUploading ? 'Uploading...' : 'Save Changes'}
            </button>
          </div>
        </form>

        <div className="mt-4 flex justify-between">
          <button
            onClick={onMoveUp}
            className="bg-green-600 hover:bg-green-700 p-2 rounded-md"
          >
            Move Up
          </button>
          <button
            onClick={onMoveDown}
            className="bg-yellow-600 hover:bg-yellow-700 p-2 rounded-md"
          >
            Move Down
          </button>
        </div>
      </div>
    </div>
  );
};