'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabase/client';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Modal for adding a lot
const AddLotModal = ({ onSave, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    current_bid: 0,
    min_raise: 10,
    date_of_finishing: '',
    time_of_finishing: '',
    image_url: '',
  });
  const [file, setFile] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let imageUrl = formData.image_url;
  
    if (file) {
      const fileName = `${Date.now()}-${file.name}`;
      const { data, error } = await supabase.storage.from('auction_images').upload(fileName, file);
  
      if (error) {
        console.error('Error uploading file:', error);
        toast.error('Failed to upload image. Please try again.');
        return; // Exit if the file upload fails
      }
  
      // Retrieve the public URL for the uploaded file
      const { data: publicUrlData, error: publicUrlError } = supabase
        .storage
        .from('auction_images')
        .getPublicUrl(fileName);
  
      if (publicUrlError) {
        console.error('Error retrieving public URL:', publicUrlError);
        toast.error('Failed to retrieve image URL. Please try again.');
        return;
      }
  
      imageUrl = publicUrlData.publicUrl; // Set the public URL
    }
  
    // Pass the updated data with the new image_url to onSave
    onSave({ ...formData, image_url: imageUrl });
    onClose();
  };
  

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center">
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-96">
        <h2 className="text-xl font-bold mb-4">Add Lot</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="name"
            placeholder="Name"
            value={formData.name}
            onChange={handleChange}
            className="w-full p-2 bg-gray-700 rounded-md"
          />
          <textarea
            name="description"
            placeholder="Description"
            value={formData.description}
            onChange={handleChange}
            className="w-full p-2 bg-gray-700 rounded-md"
          ></textarea>
          <input
            type="number"
            name="current_bid"
            placeholder="Current Bid"
            value={formData.current_bid}
            onChange={handleChange}
            className="w-full p-2 bg-gray-700 rounded-md"
          />
          <input
            type="number"
            name="min_raise"
            placeholder="Minimum Raise"
            value={formData.min_raise}
            onChange={handleChange}
            className="w-full p-2 bg-gray-700 rounded-md"
          />
          <input
            type="date"
            name="date_of_finishing"
            value={formData.date_of_finishing}
            onChange={handleChange}
            className="w-full p-2 bg-gray-700 rounded-md"
          />
          <input
            type="time"
            name="time_of_finishing"
            value={formData.time_of_finishing}
            onChange={handleChange}
            className="w-full p-2 bg-gray-700 rounded-md"
          />
          <input
            type="file"
            onChange={handleFileChange}
            className="w-full p-2 bg-gray-700 rounded-md"
          />
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 p-2 rounded-md"
          >
            Add Lot
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

// Modal for editing a lot
const EditLotModal = ({ lot, onSave, onClose }) => {
  const [formData, setFormData] = useState(lot);
  const [bidHistory, setBidHistory] = useState([]);
  const [showBidHistory, setShowBidHistory] = useState(false);
  const [file, setFile] = useState(null);
  useEffect(() => {
    if (lot) {
      setFormData(lot);
    }
  }, [lot]);
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const fetchBidHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('bid_history')
        .select('*')
        .eq('auction_item_id', lot.id);

      if (error) {
        toast.error('Error fetching bid history.');
      } else {
        setBidHistory(data);
      }
    } catch (err) {
      console.error('Unexpected error fetching bid history:', err);
    }
  };
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let imageUrl = formData.image_url;
  
    if (file) {
      const fileName = `${Date.now()}-${file.name}`;
      const { data, error } = await supabase.storage.from('auction_images').upload(fileName, file);
  
      if (error) {
        console.error('Error uploading file:', error);
        toast.error('Failed to upload image. Please try again.');
        return; // Exit if the file upload fails
      }
  
      // Retrieve the public URL for the uploaded file
      const { data: publicUrlData, error: publicUrlError } = supabase
        .storage
        .from('auction_images')
        .getPublicUrl(fileName);
  
      if (publicUrlError) {
        console.error('Error retrieving public URL:', publicUrlError);
        toast.error('Failed to retrieve image URL. Please try again.');
        return;
      }
  
      imageUrl = publicUrlData.publicUrl; // Set the public URL
    }
  
    // Pass the updated data with the new image_url to onSave
    onSave({ ...formData, image_url: imageUrl });
    onClose();
  };
  

  const handleOpenBidHistory = () => {
    fetchBidHistory(); // Загружаем данные перед открытием
    setShowBidHistory(true);
  };

  const handleCloseBidHistory = () => {
    setShowBidHistory(false);
  };

  return (
    <>
      <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center">
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-96">
          <h2 className="text-xl font-bold mb-4">Edit Lot</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="name"
            placeholder="Name"
            value={formData.name || ''}
            onChange={handleChange}
            className="w-full p-2 bg-gray-700 rounded-md"
          />
          <textarea
            name="description"
            placeholder="Description"
            value={formData.description || ''}
            onChange={handleChange}
            className="w-full p-2 bg-gray-700 rounded-md"
          ></textarea>
          <input
            type="number"
            name="current_bid"
            placeholder="Current Bid"
            value={formData.current_bid || 0}
            onChange={handleChange}
            className="w-full p-2 bg-gray-700 rounded-md"
          />
          <input
            type="number"
            name="min_raise"
            placeholder="Minimum Raise"
            value={formData.min_raise || 0}
            onChange={handleChange}
            className="w-full p-2 bg-gray-700 rounded-md"
          />
          <input
            type="date"
            name="date_of_finishing"
            value={formData.date_of_finishing || ''}
            onChange={handleChange}
            className="w-full p-2 bg-gray-700 rounded-md"
          />
          <input
            type="time"
            name="time_of_finishing"
            value={formData.time_of_finishing || ''}
            onChange={handleChange}
            className="w-full p-2 bg-gray-700 rounded-md"
          />
          <input
            type="file"
            onChange={handleFileChange}
            className="w-full p-2 bg-gray-700 rounded-md"
          />
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 p-2 rounded-md"
          >
            Save Changes
          </button>
          <button
            type="button"
            onClick={onClose}
            className="w-full bg-red-600 hover:bg-red-700 p-2 rounded-md mt-2"
          >
            Cancel
          </button>
          </form>
          <button
            type="button"
            onClick={handleOpenBidHistory}
            className="w-full bg-gray-600 hover:bg-gray-700 p-2 rounded-md mt-4"
          >
            View Bid History
          </button>
        </div>
      </div>

      {/* Bid History Modal */}
      {showBidHistory && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center">
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-[600px] max-h-[80vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Bid History</h2>
            <ul className="space-y-4">
              {bidHistory.length > 0 ? (
                bidHistory.map((bid) => (
                  <li
                    key={bid.id}
                    className="p-3 bg-gray-700 rounded-md shadow-sm"
                  >
                    <p>
                      <strong>User ID:</strong> {bid.user_id}
                    </p>
                    <p>
                      <strong>Bid Amount:</strong> ${bid.bid_amount}
                    </p>
                    <p>
                      <strong>Bid Time:</strong>{' '}
                      {new Date(bid.bid_time).toLocaleString()}
                    </p>
                  </li>
                ))
              ) : (
                <p className="text-gray-400">No bid history available.</p>
              )}
            </ul>
            <button
              type="button"
              onClick={handleCloseBidHistory}
              className="w-full bg-red-600 hover:bg-red-700 p-2 rounded-md mt-4"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
};
// Modal for editing an option
const EditOptionModal = ({ option, onSave, onClose }) => {
  const [formData, setFormData] = useState(option);
  const [messages, setMessages] = useState([]);
  const [showMessages, setShowMessages] = useState(false);

  useEffect(() => {
    if (option) {
      setFormData(option);
    }
  }, [option]);

  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('option_id', option.id);

      if (error) {
        toast.error('Error fetching messages.');
      } else {
        setMessages(data);
      }
    } catch (err) {
      console.error('Unexpected error fetching messages:', err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData); // Передаем данные для сохранения
  };

  const handleOpenMessages = () => {
    fetchMessages(); // Загружаем данные перед открытием
    setShowMessages(true);
  };

  const handleCloseMessages = () => {
    setShowMessages(false);
  };

  return (
    <>
      <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center">
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-96">
          <h2 className="text-xl font-bold mb-4">Edit Option</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              name="name"
              value={formData.name || ''}
              onChange={handleChange}
              placeholder="Option Name"
              className="w-full p-2 bg-gray-700 rounded-md"
            />
            <input
              type="number"
              name="cost"
              value={formData.cost || 0}
              onChange={handleChange}
              placeholder="Cost"
              className="w-full p-2 bg-gray-700 rounded-md"
            />
            <textarea
              name="description"
              value={formData.description || ''}
              onChange={handleChange}
              placeholder="Description"
              className="w-full p-2 bg-gray-700 rounded-md"
            ></textarea>
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 p-2 rounded-md"
            >
              Save Changes
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-full bg-red-600 hover:bg-red-700 p-2 rounded-md mt-2"
            >
              Cancel
            </button>
          </form>
          <button
            type="button"
            onClick={handleOpenMessages}
            className="w-full bg-gray-600 hover:bg-gray-700 p-2 rounded-md mt-4"
          >
            View Messages
          </button>
        </div>
      </div>

      {/* Messages Modal */}
      {showMessages && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center">
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-[600px] max-h-[80vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Messages</h2>
            <ul className="space-y-4">
              {messages.length > 0 ? (
                messages.map((message) => (
                  <li
                    key={message.id}
                    className="p-3 bg-gray-700 rounded-md shadow-sm"
                  >
                    <p>
                      <strong>User ID:</strong> {message.user_id}
                    </p>
                    <p>
                      <strong>Email:</strong> {message.email}
                    </p>
                    <p>
                      <strong>Payment Method:</strong> {message.payment_method}
                    </p>
                    <p>
                      <strong>Message:</strong> {message.message}
                    </p>
                    <p>
                      <strong>Cost:</strong> ${message.cost.toFixed(2)}
                    </p>
                    <p>
                      <strong>Created At:</strong>{' '}
                      {new Date(message.created_at).toLocaleString()}
                    </p>
                  </li>
                ))
              ) : (
                <p className="text-gray-400">No messages available.</p>
              )}
            </ul>
            <button
              type="button"
              onClick={handleCloseMessages}
              className="w-full bg-red-600 hover:bg-red-700 p-2 rounded-md mt-4"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
};

// Modal for adding an option
const AddOptionModal = ({ onSave, onClose }) => {
  const [formData, setFormData] = useState({ name: '', cost: 0, description: '' });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center">
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-96">
        <h2 className="text-xl font-bold mb-4">Add Option</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="name"
            onChange={handleChange}
            placeholder="Option Name"
            className="w-full p-2 bg-gray-700 rounded-md"
          />
          <input
            type="number"
            name="cost"
            onChange={handleChange}
            placeholder="Cost"
            className="w-full p-2 bg-gray-700 rounded-md"
          />
          <textarea
            name="description"
            onChange={handleChange}
            placeholder="Description"
            className="w-full p-2 bg-gray-700 rounded-md"
          ></textarea>
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

export default function AdminPanel() {
  const [lots, setLots] = useState([]);
  const [options, setOptions] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedLot, setSelectedLot] = useState(null);
  const [modal, setModal] = useState({ type: '', data: null });
  const [isAdmin, setIsAdmin] = useState(false);

  const fetchLots = async () => {
    const { data, error } = await supabase.from('auction_items').select('*');
    if (error) toast.error('Error fetching lots.');
    else setLots(data);
  };

  const fetchOptions = async () => {
    const { data, error } = await supabase.from('options').select('*');
    if (error) toast.error('Error fetching options.');
    else setOptions(data);
  };

  const fetchUsers = async () => {
    const { data, error } = await supabase
      .from('users')
      .select(`
        id,
        username,
        is_banned,
        admins (id) // Подключаем таблицу admins через связь
      `);
  
    if (error) {
      toast.error('Error fetching users.');
      console.error('Fetch users error:', error);
      return;
    }
  
    // Добавляем is_admin для каждого пользователя
    const enrichedUsers = data.map((user) => ({
      ...user,
      is_admin: user.admins.length > 0, // Если запись в admins есть, то это админ
    }));
  
    setUsers(enrichedUsers);
    console.log('Fetched users:', enrichedUsers);
  };
  
  

  const handleAddLot = async (newData) => {
    try {
      // Input validation
      if (!newData.name || !newData.date_of_finishing || !newData.time_of_finishing) {
        toast.error('Please fill in all required fields: Name, Date, and Time.');
        return;
      }
  
      if (newData.current_bid < 0 || newData.min_raise < 0) {
        toast.error('Bid values must be positive.');
        return;
      }
  
      // Insert data into Supabase
      const { error } = await supabase.from('auction_items').insert(newData);
  
      if (error) {
        // Handle specific errors
        if (error.code === '23505') {
          toast.error('A lot with the same name already exists.');
        } else if (error.code === '23503') {
          toast.error('Referenced data not found.');
        } else {
          // Generic error message
          toast.error(`Error adding lot: ${error.message}`);
        }
        console.error('Supabase error:', error);
      } else {
        fetchLots();
        toast.success('Lot added successfully.');
      }
    } catch (err) {
      // Catch unexpected errors
      console.error('Unexpected error:', err);
      toast.error('An unexpected error occurred. Please try again.');
    }
  };
  

  const handleEditLot = async (updatedData) => {
    try {
      // Input validation
      if (!updatedData.name || !updatedData.date_of_finishing || !updatedData.time_of_finishing) {
        toast.error('Please fill in all required fields: Name, Date, and Time.');
        return;
      }
  
      if (updatedData.current_bid < 0 || updatedData.min_raise < 0) {
        toast.error('Bid values must be positive.');
        return;
      }
  
      // Update the lot in Supabase
      const { error } = await supabase
        .from('auction_items')
        .update({
          name: updatedData.name,
          description: updatedData.description,
          current_bid: updatedData.current_bid,
          min_raise: updatedData.min_raise,
          date_of_finishing: updatedData.date_of_finishing,
          time_of_finishing: updatedData.time_of_finishing,
          image_url: updatedData.image_url,
        })
        .eq('id', updatedData.id); // Update by ID
  
      if (error) {
        // Handle specific errors
        if (error.code === '23505') {
          toast.error('A lot with the same name already exists.');
        } else if (error.code === '23503') {
          toast.error('Referenced data not found.');
        } else {
          // Generic error message
          toast.error(`Error editing lot: ${error.message}`);
        }
        console.error('Supabase error:', error);
      } else {
        fetchLots(); // Refresh the list of lots
        setModal({ type: '', data: null });
        toast.success('Lot updated successfully.');
      }
    } catch (err) {
      // Catch unexpected errors
      console.error('Unexpected error:', err);
      toast.error('An unexpected error occurred. Please try again.');
    }
  };
  
  
  const handleEditOption = async (updatedData) => {
    const { error } = await supabase
      .from('options')
      .update({
        name: updatedData.name,
        cost: updatedData.cost,
        description: updatedData.description,
      })
      .eq('id', updatedData.id); // Важно обновлять по ID
  
    if (error) {
      toast.error('Error editing option.');
    } else {
      fetchOptions(); // Обновляем список опций
      setModal({ type: '', data: null });
      toast.success('Option updated successfully.');
    }
  };
  

  const handleAddOption = async (newData) => {
    const { error } = await supabase.from('options').insert(newData);
    if (error) toast.error('Error adding option.');
    else {
      fetchOptions();
      toast.success('Option added successfully.');
    }
  };

  const handleBanUser = async (userId, isBanned) => {
    const { error } = await supabase
      .from('users')
      .update({ is_banned: isBanned })
      .eq('id', userId);
  
    if (error) {
      toast.error('Failed to update user ban status.');
    } else {
      toast.success(isBanned ? 'User banned successfully.' : 'User unbanned successfully.');
      fetchUsers(); // Обновить список пользователей
    }
  };
  const handleDeleteLot = async (lotId) => {
    const { error } = await supabase
      .from('auction_items')
      .delete()
      .eq('id', lotId);
  
    if (error) {
      toast.error('Error deleting lot.');
    } else {
      toast.success('Lot deleted successfully.');
      fetchLots(); // Обновление списка лотов
    }
  };
  const handleDeleteOption = async (optionId) => {
    const { error } = await supabase
      .from('options')
      .delete()
      .eq('id', optionId);
  
    if (error) {
      toast.error('Error deleting option.');
      console.log(error)
    } else {
      toast.success('Option deleted successfully.');
      fetchOptions(); // Обновление списка опций
    }
  };
    
  const handlePromoteUser = async (userId) => {
    const { error } = await supabase.from('admins').insert({ user_id: userId });
  
    if (error) {
      toast.error('Failed to promote user.');
    } else {
      toast.success('User promoted to admin successfully.');
      fetchUsers();
    }
  };
  
  const handleDemoteUser = async (userId) => {
    const { error } = await supabase.from('admins').delete().eq('user_id', userId);
  
    if (error) {
      toast.error('Failed to demote user.');
    } else {
      toast.success('User demoted successfully.');
      fetchUsers();
    }
  };
  

  useEffect(() => {
    //checking if user an admin
    const checkAdmin = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user) {
        toast.error('Unable to verify admin status.');
        return;
      }
      const { data } = await supabase.from('admins').select('*').eq('user_id', user.id).single();
      setIsAdmin(!!data);
    };

    checkAdmin();
    fetchLots();
    fetchOptions();
    fetchUsers();
    console.log('Options:', options);

  }, []);

  if (!isAdmin) {
    return <p className="text-red-500 text-center mt-10">Access denied. Admin only.</p>;
  }

  return (
    <div className="p-6 bg-gray-900 text-white">
      <ToastContainer />
      <h1 className="text-3xl font-bold mb-6">Admin Panel</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Section title="Lots">
  <ul>
    {lots.map((lot) => (
      <Item
        key={lot.id}
        title={lot.name}
        subtitle={`Current Bid: $${lot.current_bid}`}
        onClick={() => {
          console.log('Editing lot:', lot);
          setModal({ type: 'edit-lot', data: lot });
        }}
        onDelete={() => handleDeleteLot(lot.id)}
      >
        {lot.image_url && (
          <img
            src={lot.image_url}
            alt={lot.name}
            className="w-full h-48 object-cover rounded-md mt-2"
          />
        )}
      </Item>
    ))}
  </ul>
  <button
    onClick={() => setModal({ type: 'add-lot', data: null })}
    className="w-full mt-4 p-2 bg-blue-600 rounded-md hover:bg-blue-700"
  >
    Add Lot
  </button>
</Section>




<Section title="Options">
  <ul>
    {options.map((option) => (
      <Item
        key={option.id}
        title={option.name}
        subtitle={`Cost: $${option.cost}`}
        onClick={() => {
          console.log('Editing option:', option);
          setModal({ type: 'edit-option', data: option });
        }}
        onDelete={() => handleDeleteOption(option.id)}
      />
    ))}
  </ul>
  <button
    onClick={() => setModal({ type: 'add-option', data: null })}
    className="w-full mt-4 p-2 bg-blue-600 rounded-md hover:bg-blue-700"
  >
    Add Option
  </button>
</Section>



        <Section title="Users">
  <ul>
    {users.map((user) => (
      <Item
        key={user.id}
        title={user.username}
        subtitle={user.is_banned ? 'Banned' : user.is_admin ? 'Admin' : 'Active'}
      >
        <div className="mt-2 flex space-x-2">
          {/* Кнопка Ban/Unban */}
          <button
            onClick={() => handleBanUser(user.id, !user.is_banned)}
            className={`p-1 rounded-md ${
              user.is_banned ? 'bg-green-600' : 'bg-red-600'
            }`}
          >
            {user.is_banned ? 'Unban' : 'Ban'}
          </button>

          {/* Кнопка Promote/Demote */}
          {user.is_banned ? null : (
            <button
              onClick={() =>
                user.is_admin
                  ? handleDemoteUser(user.id)
                  : handlePromoteUser(user.id)
              }
              className={`p-1 rounded-md ${
                user.is_admin ? 'bg-gray-600' : 'bg-blue-600'
              }`}
            >
              {user.is_admin ? 'Demote' : 'Promote'}
            </button>
          )}
        </div>
      </Item>
    ))}
  </ul>
</Section>


      </div>

      {modal.type === 'add-lot' && (
        <AddLotModal
          onSave={handleAddLot}
          onClose={() => setModal({ type: '', data: null })}
        />
      )}
{modal.type === 'edit-lot' && modal.data && (
  <EditLotModal
    lot={modal.data}
    onSave={handleEditLot}
    onClose={() => setModal({ type: '', data: null })}
  />
)}
      {modal.type === 'add-option' && (
        <AddOptionModal
          onSave={handleAddOption}
          onClose={() => setModal({ type: '', data: null })}
        />
      )}
{modal.type === 'edit-option' && modal.data && (
  <EditOptionModal
    option={modal.data}
    onSave={handleEditOption}
    onClose={() => setModal({ type: '', data: null })}
  />
)}
    </div>
  );
}

const Section = ({ title, children, onClick}) => (
  <div className="bg-gray-800 p-4 rounded-lg shadow-md">
    
    <h2 className="text-xl font-bold mb-3">{title}</h2>
    {children}
  </div>
);
const Item = ({ title, subtitle, children, onClick, onDelete }) => (
  <li
    className="p-3 bg-gray-700 hover:bg-gray-600 rounded-lg cursor-pointer"
    onClick={onClick} // Поддержка кликов, если нужно
  >
    <h3 className="text-lg font-semibold">{title}</h3>
    <p className="text-sm text-gray-400">{subtitle}</p>
    <div className="mt-2 flex justify-between items-center">
      {children && <div>{children}</div>}
      {onDelete && (
        <button
          onClick={(e) => {
            e.stopPropagation(); // Предотвращаем вызов onClick родителя
            onDelete();
          }}
          className="p-1 bg-red-600 rounded-md hover:bg-red-700 text-sm"
        >
          Delete
        </button>
      )}
    </div>
  </li>
);




