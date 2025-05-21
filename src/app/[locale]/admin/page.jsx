'use client';

import React, { useState, useEffect } from "react";
import { supabase } from "@/utils/supabase/client";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useQuery } from "@tanstack/react-query";
import { AddLotModal } from "./AddLotModal";
import { EditLotModal } from "./EditLotModal";
import { EditOptionModal } from "./EditOptionModal";
import { AddOptionModal } from "./AddOptionModal";
import Image from 'next/image';

export default function AdminPanel() {
  const [lots, setLots] = useState([]);
  const [lotHistories, setLotHistories] = useState({});
  const [options, setOptions] = useState([]);
  const [optionMessages, setOptionMessages] = useState({});
  const [users, setUsers] = useState({ active: [], banned: [] });
  const [modal, setModal] = useState({ type: "", data: null });
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeTab, setActiveTab] = useState("lots");
  const [movedOptionId, setMovedOptionId] = useState(null);


  // --- Payment info ---
  const [paymentInfo, setPaymentInfo] = useState({ 
    card: "", 
    paypal: "", 
    eth: "", 
    btc: "" 
  });
  const [paymentId, setPaymentId] = useState(null);

  // ======== Fetch Functions ========
  const fetchLots = async () => {
    const { data, error } = await supabase
      .from("auction_items")
      .select("*")
      .order("order", { ascending: true });
    if (error) toast.error("Error fetching lots.");
    else setLots(data);
  };

  const calculateTotalBids = (lots) => {
    return lots.reduce((total, lot) => total + (lot.current_bid || 0), 0);
  };

  useEffect(() => {
    fetchLots();
  }, []);
  
  useEffect(() => {
    const totalBids = calculateTotalBids(lots);
    // Можно сохранить это значение в состоянии, если нужно использовать его в других компонентах
  }, [lots]);

  const ViewImageModal = ({ imageUrl, onClose }) => {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90"
        onClick={onClose} // Закрыть модальное окно при клике вне изображения
      >
        <div className="relative max-w-[90vw] max-h-[90vh] p-4">
          <div className="relative w-full h-full flex items-center justify-center">
            <Image
              src={imageUrl}
              alt="Enlarged lot image"
              width={800} // Ширина изображения
              height={600} // Высота изображения
              style={{
                objectFit: 'contain', // Сохраняем пропорции
                maxWidth: '100%', // Ограничиваем ширину
                maxHeight: '90vh', // Ограничиваем высоту
              }}
              quality={100} // Максимальное качество
            />
          </div>
          <button
            onClick={onClose}
            className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-full"
          >
            &times;
          </button>
        </div>
      </div>
    );
  };

  const fetchLotHistory = async (lotId) => {
    try {
      const { data, error } = await supabase
        .from("bid_history")
        .select(`
          *,
          users ( username, email ),
          auction_items ( name )
        `)
        .eq("auction_item_id", lotId)
        .order("bid_time", { ascending: false });
      if (error) {
        toast.error("Error fetching bid history.");
        return [];
      }
      return data;
    } catch (err) {
      console.error("Unexpected error fetching bid history:", err);
      return [];
    }
  };

  const fetchOptions = async () => {
    const { data, error } = await supabase
      .from('options')
      .select('*')
      .select("*, max_length, video_off")
      .order('order', { ascending: true });
  
    if (error) toast.error('Error fetching options.');
    else setOptions(data);
  };

  const fetchOptionMessages = async (optionId) => {
    try {
      const { data, error } = await supabase
        .from("messages")
        .select("*, users ( username, email ), options ( name )")
        .eq("option_id", optionId)
        .order("id", { ascending: false });
      if (error) {
        toast.error("Error fetching messages.");
        return [];
      }
      return data;
    } catch (err) {
      console.error("Unexpected error fetching messages:", err);
      return [];
    }
  };

  const fetchUsers = async () => {
    const { data, error } = await supabase
      .from("users")
      .select(`
        id,
        username,
        email,
        is_banned,
        admins (id)
      `);
    if (error) {
      toast.error("Error fetching users.");
      console.error("Fetch users error:", error);
      return;
    }
  
    // Обогащаем данные (добавляем поле is_admin)
    const enrichedUsers = data.map((user) => ({
      ...user,
      is_admin: user.admins.length > 0,
    }));
  
    // Сохраняем в состоянии
    setUsers(enrichedUsers);
  };

  const fetchPaymentInfo = async () => {
    try {
      const { data, error } = await supabase.from("payment").select("*").single();
      if (error) {
        toast.error("Error fetching payment data.");
        console.error("Fetch payment error:", error);
        return;
      }
      if (data) {
        setPaymentInfo({ 
          card: data.card || "", 
          paypal: data.paypal || "",
          eth: data.eth || "",
          btc: data.btc || ""
        });
        setPaymentId(data.id);
      }
    } catch (err) {
      console.error("Unexpected error fetching payment info:", err);
    }
  };

  // ======== CRUD (Lots/Options) ========
  const handleAddLot = async (newData) => {
    try {
      if (!newData.name || !newData.date_of_finishing || !newData.time_of_finishing) {
        toast.error("Please fill in all required fields: Name, Date, and Time.");
        return;
      }
      if (newData.current_bid < 0 || newData.min_raise < 0) {
        toast.error("Bid values must be positive.");
        return;
      }
      const { error } = await supabase.from("auction_items").insert(newData);
      if (error) {
        toast.error(`Error adding lot: ${error.message}`);
        console.error("Supabase error:", error);
      } else {
        fetchLots();
        toast.success("Lot added successfully.");
      }
    } catch (err) {
      console.error("Unexpected error:", err);
      toast.error("An unexpected error occurred. Please try again.");
    }
  };

  const handleFinishAuction = async (lotId) => {
    try {
      const response = await fetch("/api/winner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ auctionId: lotId }),
      });
      const result = await response.json();
      if (response.ok) {
        toast.success(`Auction finished: ${result.message}`);
        fetchLots();
      } else {
        toast.error(`Error finishing auction: ${result.error}`);
      }
    } catch (err) {
      console.error("Error finishing auction:", err);
      toast.error("An unexpected error occurred.");
    }
  };
  const notifyAuctionStart = async () => {
    try {
      const res = await fetch("/api/notify-auction-start", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        toast.success("Auction start notifications sent successfully!");
      } else {
        toast.error(data.error || "Error sending notifications.");
      }
    } catch (error) {
      console.error("Failed to notify users:", error);
      toast.error("An unexpected error occurred while sending notifications.");
    }
  };
  const notifyNewOptions = async () => {
    try {
      const res = await fetch("/api/notify-new-options", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        toast.success("New Options notifications sent successfully!");
      } else {
        toast.error(data.error || "Error sending notifications.");
      }
    } catch (error) {
      console.error("Failed to notify users:", error);
      toast.error("An unexpected error occurred while sending notifications.");
    }
  }

  const toggleLotActiveStatus = async (lotId, isActive) => {
    try {
      const { error } = await supabase
        .from("auction_items")
        .update({ is_active: isActive })
        .eq("id", lotId);
      if (error) {
        toast.error("Error updating lot status.");
        console.error("Supabase error:", error);
      } else {
        fetchLots();
        toast.success(`Lot ${isActive ? "activated" : "deactivated"} successfully.`);
      }
    } catch (err) {
      console.error("Unexpected error:", err);
      toast.error("An unexpected error occurred. Please try again.");
    }
  };

  const handleEditLot = async (updatedData) => {
    try {
      if (!updatedData.name || !updatedData.date_of_finishing || !updatedData.time_of_finishing) {
        toast.error("Please fill in all required fields: Name, Date, and Time.");
        return;
      }
      if (updatedData.current_bid < 0 || updatedData.min_raise < 0) {
        toast.error("Bid values must be positive.");
        return;
      }
      const { error } = await supabase
        .from("auction_items")
        .update({
          name: updatedData.name,
          description: updatedData.description,
          current_bid: updatedData.current_bid,
          min_raise: updatedData.min_raise,
          date_of_finishing: updatedData.date_of_finishing,
          time_of_finishing: updatedData.time_of_finishing,
          image_url: updatedData.image_url,
          paypal: updatedData.paypal,
          card: updatedData.card,
          order: updatedData.order,
          time_left: -1,
          btc: updatedData.btc,
          eth: updatedData.eth,
        })
        .eq("id", updatedData.id);
      if (error) {
        toast.error(`Error editing lot: ${error.message}`);
        console.error("Supabase error:", error);
      } else {
        fetchLots();
        setModal({ type: "", data: null });
        toast.success("Lot updated successfully.");
      }
    } catch (err) {
      console.error("Unexpected error:", err);
      toast.error("An unexpected error occurred. Please try again.");
    }
  };

  const handleDeleteLot = async (lotId) => {
    const { error } = await supabase.from("auction_items").delete().eq("id", lotId);
    if (error) {
      toast.error("Error deleting lot.");
    } else {
      toast.success("Lot deleted successfully.");
      fetchLots();
    }
  };



  // Добавим useEffect для автоматической сортировки опций
  useEffect(() => {
    // Проверяем, нужно ли сортировать
    const isSorted = options.every((option, index, array) => 
      index === 0 || option.order >= array[index - 1].order
    );
  
    // Если массив не отсортирован, сортируем и обновляем состояние
    if (!isSorted) {
      const sortedOptions = [...options].sort((a, b) => a.order - b.order);
      setOptions(sortedOptions);
    }
  }, [options]); // Эффект срабатывает при изменении options

  const handleMoveUp = async (optionId) => {
    const optionIndex = options.findIndex((opt) => opt.id === optionId);
    if (optionIndex <= 0) return;
  
    const updatedOptions = [...options];
    const prevOption = updatedOptions[optionIndex - 1];
    const currentOption = updatedOptions[optionIndex];
  
    const newOrder = prevOption.order;
    prevOption.order = currentOption.order;
    currentOption.order = newOrder;
  
    try {
      await supabase
        .from('options')
        .update({ order: currentOption.order })
        .eq('id', currentOption.id);
  
      await supabase
        .from('options')
        .update({ order: prevOption.order })
        .eq('id', prevOption.id);
  
      setOptions(updatedOptions);
      setMovedOptionId(optionId); // Устанавливаем ID перемещенной опции
      setTimeout(() => setMovedOptionId(null), 1000); // Сбрасываем через 1 секунду
    } catch (error) {
      console.error('Error updating order:', error);
      toast.error('Failed to update order.');
    }
  };
  
  const handleMoveDown = async (optionId) => {
    const optionIndex = options.findIndex((opt) => opt.id === optionId);
    if (optionIndex >= options.length - 1) return;
  
    const updatedOptions = [...options];
    const nextOption = updatedOptions[optionIndex + 1];
    const currentOption = updatedOptions[optionIndex];
  
    const newOrder = nextOption.order;
    nextOption.order = currentOption.order;
    currentOption.order = newOrder;
  
    try {
      await supabase
        .from('options')
        .update({ order: currentOption.order })
        .eq('id', currentOption.id);
  
      await supabase
        .from('options')
        .update({ order: nextOption.order })
        .eq('id', nextOption.id);
  
      setOptions(updatedOptions);
      setMovedOptionId(optionId); // Устанавливаем ID перемещенной опции
      setTimeout(() => setMovedOptionId(null), 1000); // Сбрасываем через 1 секунду
    } catch (error) {
      console.error('Error updating order:', error);
      toast.error('Failed to update order.');
    }
  };

  const handleAddOption = async (newData) => {
    try {
      const { error } = await supabase.from("options").insert(newData);
      if (error) {
        toast.error("Error adding option.");
        console.error(error);
      } else {
        fetchOptions(); // Обновляем список опций
        toast.success("Option added successfully.");
      }
    } catch (err) {
      console.error("Unexpected error:", err);
      toast.error("An unexpected error occurred. Please try again.");
    }
  };

  const handleEditOption = async (updatedData) => {
    try {
      const { error } = await supabase
        .from("options")
        .update({
          name: updatedData.name,
          cost: updatedData.cost,
          description: updatedData.description,
          order: updatedData.order,
          image_url: updatedData.image_url, // Обновляем URL изображения
        })
        .eq("id", updatedData.id);
  
      if (error) {
        toast.error("Error editing option.");
      } else {
        fetchOptions(); // Обновляем список опций
        toast.success("Option updated successfully.");
      }
    } catch (err) {
      console.error("Unexpected error:", err);
      toast.error("An unexpected error occurred. Please try again.");
    }
  };1

  const handleDeleteOption = async (optionId) => {
    const { error } = await supabase.from("options").delete().eq("id", optionId);
    if (error) {
      toast.error("Error deleting option.");
      console.log(error);
    } else {
      toast.success("Option deleted successfully.");
      fetchOptions();
    }
  };

  const handleSavePaymentInfo = async () => {
    if (!paymentId) {
      toast.error("No payment record found to update.");
      return;
    }
    try {
      const { error } = await supabase
        .from("payment")
        .update({ 
          card: paymentInfo.card, 
          paypal: paymentInfo.paypal,
          eth: paymentInfo.eth,
          btc: paymentInfo.btc
        })
        .eq("id", paymentId);
      if (error) {
        toast.error("Error updating payment info.");
        console.error("Payment update error:", error);
      } else {
        toast.success("Payment info updated successfully!");
      }
    } catch (err) {
      console.error("Unexpected error updating payment info:", err);
      toast.error("An unexpected error occurred while saving payment info.");
    }
  };

  const handleBanUser = async (userId, isBanned) => {
    const { error } = await supabase
      .from("users")
      .update({ is_banned: isBanned })
      .eq("id", userId);
  
    if (error) {
      console.error("Error updating ban status:", error);
      toast.error("Failed to update user ban status.");
    } else {
      toast.success(isBanned ? "User banned successfully." : "User unbanned successfully.");
  
      // Обновляем состояние
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === userId ? { ...user, is_banned: isBanned } : user
        )
      );
    }
  };

  const handlePromoteUser = async (userId) => {
    const { error } = await supabase.from("admins").insert({ user_id: userId });
    if (error) {
      toast.error("Failed to promote user.");
    } else {
      toast.success("User promoted to admin successfully.");
      fetchUsers();
    }
  };

  const handleDemoteUser = async (userId) => {
    const { error } = await supabase.from("admins").delete().eq("user_id", userId);
    if (error) {
      toast.error("Failed to demote user.");
    } else {
      toast.success("User demoted successfully.");
      fetchUsers();
    }
  };

  const handleViewHistory = async (lotId) => {
    if (lotHistories[lotId]) {
      setLotHistories((prev) => {
        const copy = { ...prev };
        delete copy[lotId];
        return copy;
      });
    } else {
      const bids = await fetchLotHistory(lotId);
      setLotHistories((prev) => ({ ...prev, [lotId]: bids }));
    }
  };

  const handleViewMessages = async (optionId) => {
    if (optionMessages[optionId]) {
      setOptionMessages((prev) => {
        const copy = { ...prev };
        delete copy[optionId];
        return copy;
      });
    } else {
      const msgs = await fetchOptionMessages(optionId);
      setOptionMessages((prev) => ({ ...prev, [optionId]: msgs }));
    }
  };

  // ======== Check Admin on mount ========
  useEffect(() => {
    const checkAdmin = async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();
      if (error || !user) {
        toast.error("Unable to verify admin status.");
        return;
      }
      const { data: adminData } = await supabase
        .from("admins")
        .select("*")
        .eq("user_id", user.id)
        .single();
      setIsAdmin(!!adminData);
    };
    checkAdmin();
    fetchLots();
    fetchOptions();
    fetchUsers();
    fetchPaymentInfo();
  }, []);

  if (!isAdmin) {
    return (
      <p className="text-red-500 text-center mt-10 bg-gray-700 p-4">
        Access denied. Admin only.
      </p>
    );
  }

  // =============== Sidebar Components ===============
  // (MessageSidebar и BidHistorySidebar определены ниже)

  // =============== Helper Components for Tabs ===============
  const Section = ({ children }) => (
    <div className="bg-gray-800 p-4 sm:p-6 rounded-lg shadow-md">{children}</div>
  );

  const Item = ({ title, subtitle, children, onClick, onDelete }) => (
    <div
      className="p-3 bg-gray-700 hover:bg-gray-600 rounded-lg cursor-pointer"
      onClick={onClick}
    >
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="text-sm text-gray-400">{subtitle}</p>
      <div className="mt-2 flex justify-between items-center">
        {children && <div>{children}</div>}
        {onDelete && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="p-1 bg-red-600 rounded-md hover:bg-red-700 text-sm"
          >
            Delete
          </button>
        )}
      </div>
    </div>
  );

  // =============== New Design for Lots Tab ===============
  const renderLotsTab = () => {
  const totalBids = calculateTotalBids(lots);

  return (
    <Section>
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4">
        <div>
          <h2 className="text-xl font-bold">Lots</h2>
          <p className="text-sm text-gray-400">
            Total Bids: ${totalBids.toFixed(2)}
          </p>
        </div>
        <div>
          <button
            onClick={notifyAuctionStart}
            className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 mr-2 rounded-md"
          >
            Notify "Auction Start"
          </button>
          <button
            onClick={() => setModal({ type: "add-lot", data: null })}
            className="p-2 bg-blue-600 rounded-md hover:bg-blue-700 mt-2 sm:mt-0"
          >
            Add Lot
          </button>
        </div>
      </div>

      {/* Остальной код для отображения лотов */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {lots.map((lot) => (
          <div 
            key={lot.id}
            className="bg-gray-700 rounded-lg shadow-md overflow-hidden flex flex-col"
          >
            {lot.image_url && (
              <div 
                className="w-full h-48 relative cursor-pointer" // Добавляем cursor-pointer
                onClick={() => setModal({ type: "view-image", data: lot.image_url })}
              >
                <Image
                  src={lot.image_url}
                  alt={lot.name}
                  fill
                  style={{ objectFit: 'contain' }}
                  quality={75}
                  loading="lazy"
                />
              </div>
            )}
            <div className="p-4 flex-grow flex flex-col">
              <h3 className="text-lg font-bold text-white">{lot.name}</h3>
              <p className="text-sm text-gray-300">Order: {lot.order || 0}</p>
              <p className="text-sm text-gray-300">Current Bid: ${lot.current_bid}</p>
              <p className="text-sm text-gray-300 whitespace-pre-line">
                {lot.description}
              </p>
              <div className="mt-auto pt-4 border-t border-gray-600">
                <div className="flex justify-between">
                  <button
                    onClick={() => setModal({ type: "edit-lot", data: lot })}
                    className="bg-yellow-600 hover:bg-yellow-500 text-white px-3 py-1 rounded-md text-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteLot(lot.id)}
                    className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-md text-sm"
                  >
                    Delete
                  </button>
                </div>
                <div className="flex justify-between mt-2">
                  <button
                    onClick={() => toggleLotActiveStatus(lot.id, !lot.is_active)} // 
                    className={`px-3 py-1 rounded-md text-sm ${
                      lot.is_active
                        ? "bg-red-600 hover:bg-red-500"
                        : "bg-green-600 hover:bg-green-500"
                    }`}
                  >
                    {lot.is_active ? "Deactivate" : "Activate"}
                  </button>
                  <button
                    onClick={() => handleFinishAuction(lot.id)}
                    className="bg-purple-600 hover:bg-purple-500 text-white px-3 py-1 rounded-md text-sm"
                  >
                    Finish Auction
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
};

  // =============== OPTIONS TAB ===============
  const renderOptionsTab = () => (
    <Section>
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4">
        <h2 className="text-xl font-bold">
          {activeTab === "options" ? "All Messages" : "Options"}
        </h2>
        <button 
          onClick={notifyNewOptions}
          className="p-2 bg-green-600 rounded-md hover:bg-green-700 mt-2 sm:mt-0"
        >
          Notify About New Options
        </button>
        <button
          onClick={() => setModal({ type: "add-option", data: null })}
          className="p-2 bg-blue-600 rounded-md hover:bg-blue-700 mt-2 sm:mt-0"
        >
          Add Option
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {options.map((option) => {
          const showMessages = !!optionMessages[option.id];
          return (
            <Item
              key={option.id}
              title={option.name}
              subtitle={`Order: ${option.order || 0} | Cost: $${option.cost}`}
              onDelete={() => handleDeleteOption(option.id)}
            >
              {option.image_url && (
                <div className="w-full h-32 relative mb-2">
                  <Image
                    src={option.image_url}
                    alt={option.name}
                    fill
                    style={{ objectFit: 'cover' }}
                    className="rounded-md"
                  />
                </div>
              )}
              <div className="flex flex-col items-start space-y-2 mt-2">
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewMessages(option.id);
                    }}
                    className="p-1 bg-yellow-600 hover:bg-yellow-500 rounded text-sm"
                  >
                    {showMessages ? "Hide Messages" : "View Messages"}
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setModal({ type: "edit-option", data: option });
                    }}
                    className="p-1 bg-indigo-600 hover:bg-indigo-500 rounded text-sm"
                  >
                    Edit Option
                  </button>
                </div>
                {/* Кнопки для перемещения вверх и вниз */}
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMoveUp(option.id);
                    }}
                    className="p-1 bg-green-600 hover:bg-green-500 rounded text-sm"
                  >
                    Move Up
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMoveDown(option.id);
                    }}
                    className="p-1 bg-yellow-600 hover:bg-yellow-500 rounded text-sm"
                  >
                    Move Down
                  </button>
                </div>
                {showMessages && (
                  <div className="mt-3 bg-gray-600 p-2 rounded w-full">
                    <p className="font-semibold">Messages:</p>
                    {optionMessages[option.id] && optionMessages[option.id].length > 0 ? (
                      <ul className="mt-2 space-y-2">
                        {optionMessages[option.id].map((msg) => (
                          <li key={msg.id} className="bg-gray-700 p-2 rounded">
                            <p>
                              <strong>Username:</strong> {msg.users?.username}
                            </p>
                            <p>
                              <strong>Email:</strong> {msg.email}
                            </p>
                            <p>
                              <strong>Payment Method:</strong> {msg.payment_method}
                            </p>
                            <p>
                              <strong>Message:</strong> {msg.message}
                            </p>
                            <p>
                              <strong>Cost:</strong> ${msg.cost.toFixed(2)}
                            </p>
                            <p>
                              <strong>Created At:</strong> {new Date(msg.created_at).toLocaleString()}
                            </p>
                            <p className="text-xs text-gray-300">
                              Option: {msg.options?.name || "N/A"}
                            </p>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-gray-300">No messages.</p>
                    )}
                  </div>
                )}
              </div>
            </Item>
          );
        })}
      </div>
    </Section>
  );

  // =============== USERS TAB ===============
  const renderUsersTab = () => {
    // Фильтруем пользователей на активных и забаненных
    const activeUsers = users.filter((user) => !user.is_banned);
    const bannedUsers = users.filter((user) => user.is_banned);
  
    return (
      <Section>
        {/* Секция активных пользователей */}
        <h2 className="text-xl font-bold mb-4">
          Active Users ({activeUsers.length})
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          {activeUsers.map((user) => (
            <div
              key={user.id}
              className="p-3 bg-gray-700 hover:bg-gray-600 rounded-lg cursor-pointer"
            >
              <h3 className="text-lg font-semibold">{user.username}</h3>
              <h3 className="text-base text-gray-400">{user.email}</h3>
              <p
                className={`text-sm ${
                  user.is_admin
                    ? "text-yellow-500 font-bold"
                    : "text-gray-400"
                }`}
              >
                {user.is_admin ? "Admin" : "Active"}
              </p>
              <div className="mt-2 flex space-x-2">
                <button
                  onClick={() => handleBanUser(user.id, !user.is_banned)}
                  className={`p-1 rounded-md bg-red-600 text-sm`}
                >
                  Ban
                </button>
                {!user.is_banned && (
                  <button
                    onClick={() =>
                      user.is_admin
                        ? handleDemoteUser(user.id)
                        : handlePromoteUser(user.id)
                    }
                    className={`p-1 rounded-md ${
                      user.is_admin ? "bg-gray-600" : "bg-blue-600"
                    } text-sm`}
                  >
                    {user.is_admin ? "Demote" : "Promote"}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
  
        {/* Секция забаненных пользователей */}
        <h2 className="text-xl font-bold mb-4">
          Banned Users ({bannedUsers.length})
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {bannedUsers.map((user) => (
            <div
              key={user.id}
              className="p-3 bg-gray-700 hover:bg-gray-600 rounded-lg cursor-pointer"
            >
              <h3 className="text-lg font-semibold">{user.username}</h3>
              <h3 className="text-base text-gray-400">{user.email}</h3>
              <p className="text-sm text-red-500">Banned</p>
              <div className="mt-2 flex space-x-2">
                <button
                  onClick={() => handleBanUser(user.id, !user.is_banned)}
                  className={`p-1 rounded-md bg-green-600 text-sm`}
                >
                  Unban
                </button>
              </div>
            </div>
          ))}
        </div>
      </Section>
    );
  };

  // =============== PAYMENT TAB ===============
  const renderPaymentTab = () => (
    <Section>
      <h2 className="text-xl font-bold mb-4">Payment Info</h2>
      {paymentId ? (
        <>
          <div className="mb-4">
            <label className="block text-sm font-medium">Card:</label>
            <input
              type="text"
              value={paymentInfo.card}
              onChange={(e) =>
                setPaymentInfo({ ...paymentInfo, card: e.target.value })
              }
              className="mt-1 p-2 w-full bg-gray-700 rounded-md focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium">PayPal:</label>
            <input
              type="text"
              value={paymentInfo.paypal}
              onChange={(e) =>
                setPaymentInfo({ ...paymentInfo, paypal: e.target.value })
              }
              className="mt-1 p-2 w-full bg-gray-700 rounded-md focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium">Ethereum Address:</label>
            <input
              type="text"
              value={paymentInfo.eth}
              onChange={(e) =>
                setPaymentInfo({ ...paymentInfo, eth: e.target.value })
              }
              className="mt-1 p-2 w-full bg-gray-700 rounded-md focus:ring-2 focus:ring-blue-500"
              placeholder="0x..."
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium">Bitcoin Address:</label>
            <input
              type="text"
              value={paymentInfo.btc}
              onChange={(e) =>
                setPaymentInfo({ ...paymentInfo, btc: e.target.value })
              }
              className="mt-1 p-2 w-full bg-gray-700 rounded-md focus:ring-2 focus:ring-blue-500"
              placeholder="bc1q..."
            />
          </div>
          <button
            onClick={handleSavePaymentInfo}
            className="p-2 bg-blue-600 rounded-md hover:bg-blue-700"
          >
            Save Payment Info
          </button>
        </>
      ) : (
        <p className="text-gray-400">No payment record found in the database.</p>
      )}
    </Section>
  );

  // =============== RENDER ===============
  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-gray-900 text-white min-h-screen">
      <ToastContainer />
      <h1 className="text-2xl sm:text-3xl font-bold mb-4">Admin Panel</h1>
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left Sidebar: зависит от активной вкладки */}
        <div className="w-full lg:w-1/4">
          {activeTab === "options" ? (
            <MessageSidebar header="All Messages" />
          ) : (
            <BidHistorySidebar />
          )}
        </div>
        {/* Right Main Content: Tabs */}
        <div className="w-full lg:w-3/4">
          {/* Tabs */}
          <ul className="flex space-x-4 border-b border-gray-700 mb-6">
            <li>
              <button
                className={`pb-2 ${
                  activeTab === "lots"
                    ? "border-b-2 border-blue-500 text-blue-400"
                    : "text-gray-400"
                }`}
                onClick={() => setActiveTab("lots")}
              >
                Lots
              </button>
            </li>
            <li>
              <button
                className={`pb-2 ${
                  activeTab === "options"
                    ? "border-b-2 border-blue-500 text-blue-400"
                    : "text-gray-400"
                }`}
                onClick={() => setActiveTab("options")}
              >
                Options
              </button>
            </li>
            <li>
              <button
                className={`pb-2 ${
                  activeTab === "users"
                    ? "border-b-2 border-blue-500 text-blue-400"
                    : "text-gray-400"
                }`}
                onClick={() => setActiveTab("users")}
              >
                Users
              </button>
            </li>
            <li>
              <button
                className={`pb-2 ${
                  activeTab === "payment"
                    ? "border-b-2 border-blue-500 text-blue-400"
                    : "text-gray-400"
                }`}
                onClick={() => setActiveTab("payment")}
              >
                Payment
              </button>
            </li>
          </ul>
          {/* Tab Content */}
          {activeTab === "lots" && renderLotsTab()}
          {activeTab === "options" && renderOptionsTab()}
          {activeTab === "users" && renderUsersTab()}
          {activeTab === "payment" && renderPaymentTab()}
        </div>
      </div>
      {/* Modals */}
      {modal.type === "add-lot" && (
        <AddLotModal
          onSave={handleAddLot}
          onClose={() => setModal({ type: "", data: null })}
        />
      )}
      {modal.type === "edit-lot" && modal.data && (
        <EditLotModal
          lot={modal.data}
          onSave={handleEditLot}
          onClose={() => setModal({ type: "", data: null })}
        />
      )}
      {modal.type === "add-option" && (
        <AddOptionModal
          onSave={handleAddOption}
          onClose={() => setModal({ type: "", data: null })}
        />
      )}
      {modal.type === "edit-option" && modal.data && (
        <EditOptionModal
          option={modal.data}
          onSave={handleEditOption}
          onClose={() => setModal({ type: "", data: null })}
          onMoveUp={() => handleMoveUp(modal.data.id)}
          onMoveDown={() => handleMoveDown(modal.data.id)}
        />
      )}
      {modal.type === "view-image" && (
        <ViewImageModal
          imageUrl={modal.data}
          onClose={() => setModal({ type: "", data: null })}
        />
      )}
    </div>
  );
}

// MessageSidebar Component using React Query (for "All Messages")
const MessageSidebar = ({ header = "Messages" }) => {
  const { data: messages, isLoading, error, refetch } = useQuery({
    queryKey: ["messages"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("messages")
        .select("*, users ( username, email ), options ( name )")
        .order("created_at", { ascending: false });
      if (error) throw new Error(error.message);
      return data;
    },
    refetchInterval: 10000,
  });

  const markAllAsRead = async () => {
    const { error } = await supabase
      .from("messages")
      .update({ checked: true })
      .eq("checked", false);
    if (error) {
      toast.error("Failed to mark messages as read");
    } else {
      refetch();
    }
  };

  if (isLoading)
    return <div className="text-sm text-white">Loading messages...</div>;
  if (error)
    return <div className="text-sm text-red-500">Error loading messages</div>;

  return (
    <div className="w-full bg-gray-800 p-4 rounded-lg shadow-md mb-6">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4 border-b border-gray-600 pb-2">
        <h3 className="text-xl font-bold text-white">{header}</h3>
        <button
          onClick={markAllAsRead}
          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md text-sm mt-2 sm:mt-0"
        >
          Read All
        </button>
      </div>
      <ul className="space-y-2 max-h-[70vh] overflow-y-auto">
        {messages.map((msg) => (
          <li
            key={msg.id}
            className={`p-2 rounded flex justify-between items-center border-l-4 transition-all shadow-sm hover:shadow-md ${
              !msg.checked
                ? "border-green-500 bg-gray-700"
                : "border-gray-600 bg-gray-700"
            }`}
          >
            <div className="pl-2">
              <p className="text-sm font-semibold text-white">
                {msg.users?.username || "Unknown User"}
              </p>
              <p className="text-xs text-gray-300">
                {msg.users?.email || ""}
              </p>
              <p className="text-xs text-white">
                Cost: ${msg.cost.toFixed(2)}
              </p>
              <p className="text-xs text-gray-300">
                {new Date(msg.created_at).toLocaleString()}
              </p>
              {/* Информация об option */}
              <p className="text-xs text-gray-300">
                Option: {msg.options?.name || "N/A"}
              </p>
            </div>
            <div className="flex items-center">
              {!msg.checked && (
                <span className="text-xs text-green-400 font-bold mr-1">
                  New
                </span>
              )}
              <input
                type="checkbox"
                checked={msg.checked}
                onChange={async () => {
                  const { error } = await supabase
                    .from("messages")
                    .update({ checked: !msg.checked })
                    .eq("id", msg.id);
                  if (error) {
                    toast.error("Failed to update message status");
                  } else {
                    refetch();
                  }
                }}
                className="form-checkbox h-4 w-4 text-blue-500"
              />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

// BidHistorySidebar Component using React Query (for "Bid History")
const BidHistorySidebar = () => {
  const { data: bids, isLoading, error, refetch } = useQuery({
    queryKey: ["bidHistory"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bid_history")
        .select("*, users ( username, email ), auction_items ( name )")
        .order("bid_time", { ascending: false });
      if (error) throw new Error(error.message);
      return data;
    },
    refetchInterval: 10000,
  });

  const markAllAsRead = async () => {
    const { error } = await supabase
      .from("bid_history")
      .update({ checked: true })
      .eq("checked", false);
    if (error) {
      toast.error("Failed to mark bid history as read");
    } else {
      refetch();
    }
  };

  if (isLoading)
    return <div className="text-sm text-white">Loading bid history...</div>;
  if (error)
    return <div className="text-sm text-red-500">Error loading bid history</div>;

  return (
    <div className="w-full bg-gray-800 p-4 rounded-lg shadow-md mb-6">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4 border-b border-gray-600 pb-2">
        <h3 className="text-xl font-bold text-white">Bid History</h3>
        <button
          onClick={markAllAsRead}
          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md text-sm mt-2 sm:mt-0"
        >
          Read All
        </button>
      </div>
      <ul className="space-y-2 max-h-[70vh] overflow-y-auto">
        {bids.map((bid) => (
          <li
            key={bid.id}
            className={`p-2 rounded flex justify-between items-center border-l-4 transition-all shadow-sm hover:shadow-md ${
              !bid.checked
                ? "border-green-500 bg-gray-700"
                : "border-gray-600 bg-gray-700"
            }`}
          >
            <div className="pl-2 flex flex-col">
              <p className="text-sm font-semibold text-white">
                {bid.users?.username || "Unknown User"}
              </p>
              <p className="text-xs text-gray-300">
                {bid.users?.email || ""}
              </p>
              <p className="text-xs text-white">
                Bid: ${bid.bid_amount.toFixed(2)}
              </p>
              <p className="text-xs text-gray-300">
                {new Date(bid.bid_time).toLocaleString()}
              </p>
              <p className="text-xs text-gray-300">
                Lot: {bid.auction_items?.name || "N/A"}
              </p>
            </div>
            <div className="flex items-center">
              {!bid.checked && (
                <span className="text-xs text-green-400 font-bold mr-1">
                  New
                </span>
              )}
              <input
                type="checkbox"
                checked={bid.checked}
                onChange={async () => {
                  const { error } = await supabase
                    .from("bid_history")
                    .update({ checked: !bid.checked })
                    .eq("id", bid.id);
                  if (error) {
                    toast.error("Failed to update bid status");
                  } else {
                    refetch();
                  }
                }}
                className="form-checkbox h-4 w-4 text-blue-500"
              />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};
