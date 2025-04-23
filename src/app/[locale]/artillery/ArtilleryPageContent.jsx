"use client";

import React, { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useTranslations } from "next-intl";
import { useSwipeable } from "react-swipeable";
import { supabase } from "@/utils/supabase/client";
import { FaTimes } from "react-icons/fa";
import Image from "next/image";

export default function SendMessage() {
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [payment, setPayment] = useState("paypal");
  const [email, setEmail] = useState("");
  const [user, setUser] = useState(null);
  const [paymentDetails, setPaymentDetails] = useState(null);
  const [showCartModal, setShowCartModal] = useState(false);
  const [showTextModal, setShowTextModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [itemQuantity, setItemQuantity] = useState(1);
  const [itemMessages, setItemMessages] = useState([
    { text: "", urgent: false, video: false },
  ]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [artilleryOptions, setArtilleryOptions] = useState([]);
  const t = useTranslations("SendMessage");
  const [viewImageModal, setViewImageModal] = useState({
    isOpen: false,
    imageUrl: "",
  });

  // Fetch user data
  useEffect(() => {
    if (typeof window !== "undefined") {
      const fetchUser = async () => {
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser();
        if (error) {
          console.log("No user:", error.message);
        } else {
          setUser(user);
          setEmail(user?.email || "");
          localStorage.setItem("user", JSON.stringify(user));
        }
      };
      fetchUser();
    }
  }, []);

  // Fetch artillery options
  useEffect(() => {
    const fetchArtilleryOptions = async () => {
      try {
        const { data, error } = await supabase.from("options").select("*");
        if (error) {
          console.error("Error fetching artillery options:", error.message);
          toast.error("Failed to fetch artillery options. Please try again.");
        } else {
          // Сортируем данные по полю order
          const sortedData = data.sort((a, b) => a.order - b.order);
          setArtilleryOptions(sortedData);
        }
      } catch (err) {
        console.error("Unexpected error fetching artillery options:", err);
      }
    };
    fetchArtilleryOptions();
  }, []);

  // Slideshow logic
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const images = [
    "/artillery/1.jpg",
    "/artillery/999.jpg",
    "/artillery/11.jpg",
    "/artillery/998.jpg",
    "/artillery/4.jpg",
    "/artillery/997.jpg",
    "/artillery/8.jpg",
    "/artillery/9.jpg",
  ];

  const swipeHandlers = useSwipeable({
    onSwipedLeft: () =>
      setCurrentImageIndex((prevIndex) =>
        prevIndex === images.length - 1 ? 0 : prevIndex + 1
      ),
    onSwipedRight: () =>
      setCurrentImageIndex((prevIndex) =>
        prevIndex === 0 ? images.length - 1 : prevIndex - 1
      ),
    trackMouse: true,
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [images.length]);

  const ViewImageModal = ({ imageUrl, onClose }) => {
    return (
      <div
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-90"
        onClick={onClose} // Закрыть модальное окно при клике вне изображения
      >
        <div className="relative max-w-[90vw] max-h-[90vh] p-4">
          <div className="relative w-full h-full flex items-center justify-center">
            <img
              src={imageUrl}
              alt="Enlarged image"
              className="max-w-full max-h-full object-contain"
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

  const calculateMessageCost = (message) => {
    let cost = 0;

    // Считаем стоимость текста (минимум 0)
    if (message?.text) {
      const charCount = message.text.length;
      const complexLanguagesRegex =
        /[\u4E00-\u9FFF\u3040-\u30FF\uAC00-\uD7AF\u0E00-\u0E7F\u10A0-\u10FF]/;
      const isComplexLanguage = complexLanguagesRegex.test(message.text);

      if (isComplexLanguage) {
        cost = Math.max(0, (charCount - 7) * 5); // Минимум 0
      } else {
        if (charCount <= 28) {
          cost = Math.max(0, (charCount - 18) * 2); // Минимум 0
        } else {
          cost = 20 + (charCount - 28) * 5;
        }
      }
    }

    // Добавляем фиксированные стоимости
    if (message.urgent) cost += 30;
    if (message.video) cost += 100;

    return cost;
  };

  const calculateTotalCartCost = (selectedOptions) => {
    if (!Array.isArray(selectedOptions)) return 0;

    return selectedOptions.reduce((total, item) => {
      const baseCost = item.cost * item.quantity;
      const messagesCost = item.messages.reduce(
        (sum, message) => sum + calculateMessageCost(message),
        0
      );
      return total + baseCost + messagesCost;
    }, 0);
  };

  useEffect(() => {
    setTotalPrice(calculateTotalCartCost(selectedOptions));
  }, [selectedOptions]);

  // Fetch payment details
  useEffect(() => {
    const fetchPaymentDetails = async () => {
      try {
        const { data, error } = await supabase
          .from("payment")
          .select("*")
          .single();
        if (error) {
          console.error("Error fetching payment details:", error.message);
        } else {
          setPaymentDetails(data);
        }
      } catch (err) {
        console.error("Unexpected error fetching payment details:", err);
      }
    };
    fetchPaymentDetails();
  }, []);

  // Add item to cart
  const addToCartWithMessages = (option, messages, quantity) => {
    setSelectedOptions((prev) => {
      const isAlreadyAdded = prev.some((item) => item.id === option.id);
      if (isAlreadyAdded) {
        return prev.map((item) =>
          item.id === option.id
            ? { ...item, quantity: item.quantity + quantity, messages }
            : item
        );
      } else {
        return [...prev, { ...option, quantity, messages }];
      }
    });
  };

  // Remove item from cart
  const removeFromCart = (optionId) => {
    setSelectedOptions((prev) => prev.filter((item) => item.id !== optionId));
  };

  // Remove message from item
  const removeMessage = (optionId, messageIndex) => {
    setSelectedOptions((prev) =>
      prev.map((item) => {
        if (item.id === optionId) {
          const updatedMessages = item.messages.filter(
            (_, index) => index !== messageIndex
          );
          const updatedQuantity = Math.max(updatedMessages.length, 1);
          return {
            ...item,
            messages: updatedMessages,
            quantity: updatedQuantity,
          };
        }
        return item;
      })
    );
  };

  // Update item quantity
  const updateQuantity = (optionId, newQuantity) => {
    if (newQuantity < 1) return;

    setSelectedOptions((prev) =>
      prev.map((item) => {
        if (item.id === optionId) {
          const currentMessages = item.messages;
          if (newQuantity > currentMessages.length) {
            const additionalMessages = Array(
              newQuantity - currentMessages.length
            )
              .fill()
              .map(() => ({ text: "", urgent: false, video: false }));
            return {
              ...item,
              quantity: newQuantity,
              messages: [...currentMessages, ...additionalMessages],
            };
          } else if (newQuantity < currentMessages.length) {
            return {
              ...item,
              quantity: newQuantity,
              messages: currentMessages.slice(0, newQuantity),
            };
          } else {
            return { ...item, quantity: newQuantity };
          }
        }
        return item;
      })
    );
  };

  // Update item messages
  const updateMessages = (optionId, messages) => {
    setSelectedOptions((prev) =>
      prev.map((item) => (item.id === optionId ? { ...item, messages } : item))
    );
  };

  // Handle payment
  const handlePayment = async () => {
    if (!user) {
      toast.error("You need to be logged in to proceed with payment.");
      return;
    }

    if (!email) {
      toast.error("Please provide a valid email address.");
      return;
    }

    const totalCost = calculateTotalCartCost(selectedOptions);
    setTotalPrice(totalCost);

    const orderData = {
      user_id: user?.id,
      option_id: selectedOptions[0]?.id,
      messages: selectedOptions.flatMap((item) => item.messages),
      email: email,
      payment_method: payment,
      cost: totalCost,
      quick: selectedOptions.some((item) =>
        item.messages.some((msg) => msg.urgent)
      ),
      video: selectedOptions.some((item) =>
        item.messages.some((msg) => msg.video)
      ),
      paypalEmail: paymentDetails?.paypal,
      cardNumber: paymentDetails?.card,
      ethAddress: paymentDetails?.eth,
      btcAddress: paymentDetails?.btc,
    };

    try {
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) throw new Error("Failed to create order");

      const result = await response.json();
      console.log("Order created:", result);

      toast.success("Order created successfully!");
      setShowCartModal(false);
      setShowPaymentModal(true);
    } catch (error) {
      console.error("Error creating order:", error);
      toast.error("Failed to create order. Please try again.");
    }
  };

  // Handle item click
  const handleItemClick = (option) => {
    setCurrentItem(option);
    setItemQuantity(1);
    setItemMessages([{ text: "", urgent: false, video: false }]);
    setShowTextModal(true);
  };

  // Handle quantity change
  const handleQuantityChange = (newQuantity) => {
    setItemQuantity(newQuantity);
    if (newQuantity > itemMessages.length) {
      setItemMessages([
        ...itemMessages,
        ...Array(newQuantity - itemMessages.length).fill({
          text: "",
          urgent: false,
          video: false,
        }),
      ]);
    } else if (newQuantity < itemMessages.length) {
      setItemMessages(itemMessages.slice(0, newQuantity));
    }
  };

  // Handle text submission
  const handleTextSubmit = () => {
    addToCartWithMessages(currentItem, itemMessages, itemQuantity);
    setShowTextModal(false);
  };

  return (
    <div>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        closeOnClick
        pauseOnHover
        draggable
        theme="dark"
        toastStyle={{
          marginTop: "60px",
          backgroundColor: "#1f2937",
          color: "#fff",
          border: "1px solid #374151",
          borderRadius: "8px",
          boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.3)",
        }}
        progressStyle={{ backgroundColor: "#2563eb" }}
      />

      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Service",
          name: "Project Revenge",
          description: "Artillery message delivery service",
          offers: {
            "@type": "Offer",
            price: "500",
            priceCurrency: "USD",
          },
        })}
      </script>

      {viewImageModal.isOpen && (
        <ViewImageModal
          imageUrl={viewImageModal.imageUrl}
          onClose={() => setViewImageModal({ isOpen: false, imageUrl: "" })}
        />
      )}

      {/* Cart icon */}
      <div
        className="fixed bottom-6 right-6 cursor-pointer z-50"
        onClick={() => setShowCartModal(true)}
      >
        <div className="relative">
          <div className="bg-blue-600 py-3 pr-3 pl-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center shadow-lg">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="feather feather-shopping-cart"
            >
              <circle cx="9" cy="21" r="1"></circle>
              <circle cx="20" cy="21" r="1"></circle>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
            </svg>
          </div>
          <span className="absolute -top-3 -right-3 bg-red-500 text-white text-sm rounded-full px-3 py-1.5 font-semibold shadow-sm">
            {selectedOptions.length}
          </span>
        </div>
      </div>

      {/* Cart modal */}
      {showCartModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-xl mx-4 max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-gray-700 flex justify-between items-center">
              <h2 className="text-2xl font-bold">Your Cart</h2>
              <button
                onClick={() => setShowCartModal(false)}
                className="text-gray-400 hover:text-white text-xl"
              >
                <FaTimes />
              </button>
            </div>

            {/* Items - scrollable area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {selectedOptions.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  Your cart is empty
                </div>
              ) : (
                selectedOptions.map((option) => (
                  <div key={option.id} className="bg-gray-700 rounded-lg p-4">
                    <div className="relative w-full h-48 mb-4 rounded-3xl overflow-hidden bg-gray-700">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Image
                          src={option.image_url}
                          alt={option.name}
                          width={400}
                          height={300}
                          className="max-w-full max-h-full object-contain rounded-3xl"
                          onClick={() =>
                            setViewImageModal({
                              isOpen: true,
                              imageUrl: option.image_url,
                            })
                          }
                        />
                      </div>
                    </div>

                    {/* Product info and controls in one row */}
                    <div className="flex justify-between items-center mt-2">
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-semibold">{option.name}</h3>
                        {/* <span className="text-gray-400 text-lg">${option.cost}</span> */}
                      </div>

                      <div className="flex items-center gap-3">
                        {/* Quantity controls */}
                        <div className="flex items-cente rounded text-lg">
                          <button
                            onClick={() =>
                              updateQuantity(option.id, option.quantity - 1)
                            }
                            className="px-3 py-1 hover:bg-gray-500 rounded-l bg-gray-600"
                          >
                            —
                          </button>
                          <span className="px-3 py-1 min-w-[20px] text-center bg-gray-600">
                            {option.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateQuantity(option.id, option.quantity + 1)
                            }
                            className="px-3 py-1 hover:bg-gray-500 rounded-r bg-gray-600"
                          >
                            +
                          </button>
                        </div>

                        {/* Remove button */}
                        <button
                          onClick={() => removeFromCart(option.id)}
                          className="text-red-500 hover:text-red-400 p-1"
                        >
                          <FaTimes className="w-5 h-5" />
                        </button>
                      </div>
                    </div>

                    {/* Messages */}
                    <div className="mt-3 space-y-3">
                      {option.messages.map((message, index) => (
                        <div
                          key={index}
                          className="bg-gray-800 rounded-md p-3 pt-4 relative"
                        >
                          <button
                            onClick={() => removeMessage(option.id, index)}
                            className="absolute top-6 right-5 text-red-500 hover:text-red-400"
                          >
                            <FaTimes className="w-4 h-4" />
                          </button>

                          <textarea
                            value={message.text}
                            onChange={(e) => {
                              const newMessages = [...option.messages];
                              newMessages[index].text = e.target.value;
                              updateMessages(option.id, newMessages);
                            }}
                            className="w-full p-2 bg-gray-700 rounded text-base mb-2"
                            rows={3}
                            maxLength={35}
                          />

                          <div className="flex flex-wrap gap-4 items-center">
                            <label className="flex items-center text-base">
                              <input
                                type="checkbox"
                                checked={message.urgent}
                                onChange={(e) => {
                                  const newMessages = [...option.messages];
                                  newMessages[index].urgent = e.target.checked;
                                  updateMessages(option.id, newMessages);
                                }}
                                className="mr-2"
                              />
                              Urgent order (+$30)
                            </label>
                            <label className="flex items-center text-base">
                              <input
                                type="checkbox"
                                checked={message.video}
                                onChange={(e) => {
                                  const newMessages = [...option.messages];
                                  newMessages[index].video = e.target.checked;
                                  updateMessages(option.id, newMessages);
                                }}
                                className="mr-2"
                              />
                              Firing video (+$100)
                            </label>
                            <div className="text-base font-semibold ml-auto">
                              Price: $
                              {option.cost + calculateMessageCost(message)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            {selectedOptions.length > 0 && (
              <div className="border-t border-gray-700 p-4">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-lg font-semibold">Subtotal:</span>
                  <span className="text-xl font-bold">
                    ${calculateTotalCartCost(selectedOptions)}
                  </span>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">
                    Payment Method
                  </label>
                  <select
                    value={payment}
                    onChange={(e) => setPayment(e.target.value)}
                    className="w-full p-2 bg-gray-700 rounded border border-gray-600"
                  >
                    <option value="paypal">PayPal</option>
                    <option value="card">Credit Card</option>
                    <option value="eth">Ethereum (ETH)</option>
                    <option value="btc">Bitcoin (BTC)</option>
                  </select>
                </div>

                <button
                  onClick={handlePayment}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 rounded font-semibold"
                >
                  Proceed to Payment (${calculateTotalCartCost(selectedOptions)}
                  )
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Text input modal */}
      {showTextModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 transition-opacity duration-300 animate-fadeIn">
          <div className="bg-gray-800 relative rounded-lg shadow-lg max-w-md w-full p-6 mx-4 lg:mx-0 transform transition-transform duration-300 animate-scaleIn">
            <button
              onClick={() => setShowTextModal(false)}
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-200 transition-colors duration-200"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            <h2 className="text-xl font-bold mb-2 text-center">Add to Cart</h2>

            {/* Отображаем название и базовую цену товара */}
            <div className="mb-4 p-3 bg-gray-700 rounded-md">
              <h3 className="text-lg font-semibold">{currentItem?.name}</h3>
              <p className="text-gray-300">
                Base price:{" "}
                <span className="font-bold">${currentItem?.cost}</span>
              </p>
            </div>

            <div className="flex items-center gap-2 mb-4">
              Quantity
              <button
                onClick={() =>
                  handleQuantityChange(Math.max(1, itemQuantity - 1))
                }
                className="px-2 py-1 bg-gray-700 rounded hover:bg-gray-600"
              >
                -
              </button>
              <span>{itemQuantity}</span>
              <button
                onClick={() => handleQuantityChange(itemQuantity + 1)}
                className="px-2 py-1 bg-gray-700 rounded hover:bg-gray-600"
              >
                +
              </button>
            </div>

            {itemMessages.map((message, index) => (
              <div
                key={index}
                className="flex flex-col gap-2 mb-4 p-3 bg-gray-700 rounded-md"
              >
                <textarea
                  placeholder={`Message ${index + 1}`}
                  value={message.text}
                  onChange={(e) => {
                    const newMessages = [...itemMessages];
                    newMessages[index].text = e.target.value;
                    setItemMessages(newMessages);
                  }}
                  maxLength={35}
                  required
                  className="mt-1 p-2 w-full bg-gray-600 rounded-md text-white focus:ring-2 focus:ring-blue-500"
                />

                <div className="flex justify-between items-center mt-2">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id={`urgent-${index}`}
                        checked={message.urgent}
                        onChange={(e) => {
                          const newMessages = [...itemMessages];
                          newMessages[index].urgent = e.target.checked;
                          setItemMessages(newMessages);
                        }}
                        className="mr-2"
                      />
                      <label htmlFor={`urgent-${index}`} className="text-sm">
                        Urgent (+$30)
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id={`video-${index}`}
                        checked={message.video}
                        onChange={(e) => {
                          const newMessages = [...itemMessages];
                          newMessages[index].video = e.target.checked;
                          setItemMessages(newMessages);
                        }}
                        className="mr-2"
                      />
                      <label htmlFor={`video-${index}`} className="text-sm">
                        Video (+$100)
                      </label>
                    </div>
                  </div>
                  <div className="text-sm font-semibold">
                    Price: ${currentItem?.cost + calculateMessageCost(message)}
                  </div>
                </div>
              </div>
            ))}

            {/* Блок с итоговой ценой */}
            <div className="mt-4 p-3 bg-blue-900 rounded-md">
              <div className="flex justify-between items-center">
                <span className="font-bold text-lg">TOTAL:</span>
                <span className="font-bold text-xl">
                  $
                  {currentItem?.cost * itemQuantity +
                    itemMessages.reduce(
                      (sum, message) => sum + calculateMessageCost(message),
                      0
                    )}
                </span>
              </div>
              <div className="text-sm text-blue-200 mt-1">
                (Base: ${currentItem?.cost} × {itemQuantity} + Messages &
                Options)
              </div>
            </div>

            <button
              onClick={handleTextSubmit}
              className="w-full mt-4 p-3 bg-blue-600 rounded-md font-semibold text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Add to Cart
            </button>
          </div>
        </div>
      )}

      {/* Slideshow */}
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-center">
          {t("title")}
        </h1>
        <h3 className="text-xl md:text-2xl lg:text-3xl font-bold text-center text-gray-300 mt-4">
          {t("subtitle")}
        </h3>
        <p className="text-xs md:text-sm lg:text-base text-gray-400 mt-4 text-center">
          {t("description")}
        </p>

        <div
          {...swipeHandlers}
          className="mt-6 w-full lg:w-3/4 mx-auto relative rounded-lg overflow-hidden bg-gray-700 aspect-video"
        >
          <div
            className="flex h-full transition-transform duration-500 ease-in-out"
            style={{ transform: `translateX(-${currentImageIndex * 100}%)` }}
          >
            {images.map((src, index) => (
              <Image
                key={index}
                src={src}
                alt={`Slide ${index}`}
                width={800}
                height={450}
                className="w-full h-full object-cover flex-shrink-0"
              />
            ))}
          </div>

          <button
            onClick={() =>
              setCurrentImageIndex((prevIndex) =>
                prevIndex === 0 ? images.length - 1 : prevIndex - 1
              )
            }
            className="absolute top-1/2 left-2 transform -translate-y-1/2 bg-gray-800 text-white p-2 rounded-full shadow-md hover:bg-gray-600 z-10"
          >
            ‹
          </button>
          <button
            onClick={() =>
              setCurrentImageIndex((prevIndex) =>
                prevIndex === images.length - 1 ? 0 : prevIndex + 1
              )
            }
            className="absolute top-1/2 right-2 transform -translate-y-1/2 bg-gray-800 text-white p-2 rounded-full shadow-md hover:bg-gray-600 z-10"
          >
            ›
          </button>

          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
            {images.map((_, index) => (
              <div
                key={index}
                className={`w-3 h-3 rounded-full ${index === currentImageIndex ? "bg-white" : "bg-gray-400"}`}
              ></div>
            ))}
          </div>
        </div>
      </div>

      {/* Artillery grid */}
      <div className="flex flex-wrap lg:flex-nowrap items-start justify-center min-h-screen bg-gray-900 text-white px-4 lg:px-6 py-12 gap-6 mb-20">
        <div className="w-full lg:w-2/3 bg-gray-800 p-6 rounded-lg shadow-lg">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-center">
            Choose Artillery
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
            {artilleryOptions.map((option) => (
              <div
                key={option.id}
                className={`p-4 bg-gray-700 rounded-lg shadow-md cursor-pointer transition-all duration-300 ${
                  selectedOptions.some((item) => item.id === option.id)
                    ? "ring-2 ring-blue-500"
                    : "hover:bg-gray-600"
                }`}
              >
                <div
                  className="w-full h-48 overflow-hidden rounded-md mb-4"
                  onClick={(e) => {
                    e.stopPropagation(); // Останавливаем всплытие события
                    setViewImageModal({
                      isOpen: true,
                      imageUrl: option.image_url,
                    });
                  }}
                >
                  <Image
                    src={option.image_url}
                    alt={option.name}
                    width={300}
                    height={200}
                    className="w-full h-full object-cover cursor-pointer"
                  />
                </div>
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <h3 className="text-lg font-semibold">{option.name}</h3>
                    <p className="text-gray-400">${option.cost}</p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation(); // Останавливаем всплытие события
                      handleItemClick(option);
                    }}
                    className="mt-2 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md whitespace-nowrap"
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* OTSTREL section */}
      <section className="py-20 bg-gray-800 text-gray-100 lg:-mt-32">
        <div className="max-w-screen-lg mx-auto px-6 flex flex-wrap md:flex-nowrap items-center gap-10">
          <div className="w-full md:w-1/2">
            <h3 className="text-3xl font-bold mb-4">
              {t("about.title")}{" "}
              <span className="text-blue-500 text-4xl">
                {t("about.projectName")}
              </span>
            </h3>
            <p className="text-gray-400 leading-relaxed">
              {t("about.description")}
            </p>
            <p className="text-gray-400 mt-4">{t("about.callToAction")}</p>
          </div>

          <div className="w-full md:w-1/2 h-72 bg-gray-700 rounded-lg overflow-hidden relative flex items-center justify-center">
            <video
              src="/artillery/otstrel.MP4"
              className="w-full h-full object-cover"
              autoPlay
              loop
              muted
            ></video>
          </div>
        </div>
      </section>
    </div>
  );
}
