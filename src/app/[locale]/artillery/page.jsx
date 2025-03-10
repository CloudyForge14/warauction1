'use client';

import React, { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { useTranslations } from 'next-intl';
import { useSwipeable } from 'react-swipeable';

export default function SendMessage() {
  const [selectedOptions, setSelectedOptions] = useState([]); // Array of selected items
  const [payment, setPayment] = useState('paypal'); // Payment method
  const [email, setEmail] = useState('');
  const [user, setUser] = useState(null);
  const [paymentDetails, setPaymentDetails] = useState(null);
  const [showCartModal, setShowCartModal] = useState(false); // Cart modal
  const [showTextModal, setShowTextModal] = useState(false); // Text input modal
  const [currentItem, setCurrentItem] = useState(null); // Current item for text input
  const [itemQuantity, setItemQuantity] = useState(1); // Quantity for current item
  const [itemMessages, setItemMessages] = useState([{ text: '', urgent: false, video: false }]); // Array of messages with options for current item

  // Array of artillery options
  const artilleryOptions = [
    { id: 1, name: '12mm Artillery Shell', image: '/artillery/10.jpeg', cost: 100 },
    { id: 2, name: '123mm Tank Shell', image: '/artillery/11.jpeg', cost: 150 },
    { id: 3, name: '123mm Artillery Shell', image: '/artillery/1.jpeg', cost: 200 },
    { id: 4, name: '123mm Mortar Shell', image: '/artillery/2.jpg', cost: 120 },
    { id: 5, name: '155mm Howitzer Shell', image: '/artillery/3.jpg', cost: 250 },
  ];

  // For REVENGE slideshow
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const t = useTranslations('SendMessage');

  const images = [
    '/artillery/10.jpeg',
    '/artillery/11.jpeg',
    '/artillery/1.jpeg',
    '/artillery/2.jpg',
    '/artillery/3.jpg',
    '/artillery/4.jpg',
    '/artillery/5.jpg',
    '/artillery/8.jpeg',
    '/artillery/9.jpg',
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
  // For REVENGE slideshow END

  // Add item to cart with messages and options
  const addToCartWithMessages = (option, messages, quantity) => {
    setSelectedOptions((prev) => {
      const isAlreadyAdded = prev.some((item) => item.id === option.id);
      if (isAlreadyAdded) {
        return prev.map((item) =>
          item.id === option.id ? { ...item, quantity: item.quantity + quantity, messages } : item
        );
      } else {
        return [...prev, { ...option, quantity, messages }]; // Add item with quantity and messages
      }
    });
  };

  // Remove item from cart
  const removeFromCart = (optionId) => {
    setSelectedOptions((prev) => prev.filter((item) => item.id !== optionId));
  };

  // Update item quantity in cart
  const updateQuantity = (optionId, quantity) => {
    if (quantity < 1) return; // Minimum quantity is 1
    setSelectedOptions((prev) =>
      prev.map((item) =>
        item.id === optionId ? { ...item, quantity: quantity } : item
      )
    );
  };

  // Update item messages in cart
  const updateMessages = (optionId, messages) => {
    setSelectedOptions((prev) =>
      prev.map((item) =>
        item.id === optionId ? { ...item, messages } : item
      )
    );
  };

  // Calculate total cost of items in cart
  const calculateTotalCartCost = () => {
    return selectedOptions.reduce((total, item) => {
      const baseCost = item.cost * item.quantity;
      const urgentCost = item.messages.reduce((sum, message) => sum + (message.urgent ? 30 : 0), 0);
      const videoCost = item.messages.reduce((sum, message) => sum + (message.video ? 100 : 0), 0);
      return total + baseCost + urgentCost + videoCost;
    }, 0);
  };

  // Handle payment
  const handlePayment = () => {
    toast.success('Payment successful!');
    setShowCartModal(false); // Close cart modal
    setSelectedOptions([]); // Clear cart
  };

  // Handle item click
  const handleItemClick = (option) => {
    setCurrentItem(option);
    setItemQuantity(1);
    setItemMessages([{ text: '', urgent: false, video: false }]); // Reset messages
    setShowTextModal(true);
  };

  // Handle quantity change in text modal
  const handleQuantityChange = (newQuantity) => {
    setItemQuantity(newQuantity);
    // Adjust the number of messages based on the new quantity
    if (newQuantity > itemMessages.length) {
      setItemMessages([...itemMessages, ...Array(newQuantity - itemMessages.length).fill({ text: '', urgent: false, video: false })]);
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
          marginTop: '60px',
          backgroundColor: '#1f2937',
          color: '#fff',
          border: '1px solid #374151',
          borderRadius: '8px',
          boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.3)',
        }}
        progressStyle={{ backgroundColor: '#2563eb' }}
      />

      {/* Cart icon with item count */}
      <div
        className="fixed bottom-4 right-4 bg-blue-600 p-3 rounded-full cursor-pointer hover:bg-blue-700 transition-colors z-50"
        onClick={() => setShowCartModal(true)}
      >
        <span className="text-white font-semibold">🛒 {selectedOptions.length}</span>
      </div>

      {/* Cart modal */}
      {showCartModal && (
        <div
          className="
            fixed inset-0 z-50 flex items-center justify-center
            bg-black bg-opacity-50 
            transition-opacity duration-300 
            animate-fadeIn
          "
        >
          <div
            className="
              bg-gray-800 relative rounded-lg shadow-lg 
              max-w-md w-full p-6 mx-4 lg:mx-0
              transform transition-transform duration-300 
              animate-scaleIn
            "
          >
            <button
              onClick={() => setShowCartModal(false)}
              className="
                absolute right-4 top-4 text-gray-400 hover:text-gray-200 
                transition-colors duration-200
              "
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

            <h2 className="text-xl font-bold mb-4 text-center">Cart</h2>

            {/* Scrollable cart content */}
            <div className="max-h-[60vh] overflow-y-auto pr-2">
              {/* List of items in cart */}
              <div className="space-y-4">
                {selectedOptions.map((option) => (
                  <div key={option.id} className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold">{option.name}</h3>
                        <p className="text-gray-400">${option.cost} (x{option.quantity})</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(option.id, option.quantity - 1)}
                          className="px-2 py-1 bg-gray-700 rounded hover:bg-gray-600"
                        >
                          -
                        </button>
                        <span>{option.quantity}</span>
                        <button
                          onClick={() => updateQuantity(option.id, option.quantity + 1)}
                          className="px-2 py-1 bg-gray-700 rounded hover:bg-gray-600"
                        >
                          +
                        </button>
                        <button
                          onClick={() => removeFromCart(option.id)}
                          className="text-red-500 hover:text-red-400"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                    {/* Messages for each item */}
                    {option.messages.map((message, index) => (
                      <div key={index} className="flex flex-col gap-2">
                        <textarea
                          value={message.text}
                          onChange={(e) => {
                            const newMessages = [...option.messages];
                            newMessages[index].text = e.target.value;
                            updateMessages(option.id, newMessages);
                          }}
                          className="mt-1 p-2 w-full bg-gray-700 rounded-md text-white focus:ring-2 focus:ring-blue-500"
                        />
                        {/* Urgent and Video options for each message */}
                        <div className="mt-2 space-y-2">
                          <div className="flex items-center gap-4">
                            <div className="flex items-center">
                              <input
                                type="checkbox"
                                id={`urgent-${option.id}-${index}`}
                                checked={message.urgent}
                                onChange={(e) => {
                                  const newMessages = [...option.messages];
                                  newMessages[index].urgent = e.target.checked;
                                  updateMessages(option.id, newMessages);
                                }}
                                className="mr-2"
                              />
                              <label htmlFor={`urgent-${option.id}-${index}`} className="flex items-center">
                                Urgent order: $30
                              </label>
                            </div>
                            <div className="flex items-center">
                              <input
                                type="checkbox"
                                id={`video-${option.id}-${index}`}
                                checked={message.video}
                                onChange={(e) => {
                                  const newMessages = [...option.messages];
                                  newMessages[index].video = e.target.checked;
                                  updateMessages(option.id, newMessages);
                                }}
                                className="mr-2"
                              />
                              <label htmlFor={`video-${option.id}-${index}`} className="flex items-center">
                                Firing video: $100
                              </label>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>

            {/* Total cost of items in cart */}
            <div className="mt-6">
              <p className="text-lg font-semibold">
                Subtotal: ${calculateTotalCartCost()}
              </p>
            </div>

            {/* Payment button */}
            <button
              onClick={handlePayment}
              className="
                w-full mt-4 p-3 bg-blue-600 rounded-md font-semibold 
                text-white hover:bg-blue-700 focus:outline-none 
                focus:ring-2 focus:ring-blue-500
              "
            >
              Pay Now
            </button>
          </div>
        </div>
      )}

      {/* Text input modal */}
      {showTextModal && (
        <div
          className="
            fixed inset-0 z-50 flex items-center justify-center
            bg-black bg-opacity-50 
            transition-opacity duration-300 
            animate-fadeIn
          "
        >
          <div
            className="
              bg-gray-800 relative rounded-lg shadow-lg 
              max-w-md w-full p-6 mx-4 lg:mx-0
              transform transition-transform duration-300 
              animate-scaleIn
            "
          >
            <button
              onClick={() => setShowTextModal(false)}
              className="
                absolute right-4 top-4 text-gray-400 hover:text-gray-200 
                transition-colors duration-200
              "
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

            <h2 className="text-xl font-bold mb-4 text-center">Add Text</h2>

            {/* Quantity input */}
            <div className="flex items-center gap-2 mb-4"> Quantity
              <button
                onClick={() => handleQuantityChange(Math.max(1, itemQuantity - 1))}
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

            {/* Text inputs for each message */}
            {itemMessages.map((message, index) => (
              <div key={index} className="flex flex-col gap-2">
                <textarea
                  placeholder={`Message ${index + 1}`}
                  value={message.text}
                  onChange={(e) => {
                    const newMessages = [...itemMessages];
                    newMessages[index].text = e.target.value;
                    setItemMessages(newMessages);
                  }}
                  className="mt-1 p-2 w-full bg-gray-700 rounded-md text-white focus:ring-2 focus:ring-blue-500"
                />
                {/* Urgent and Video options for each message */}
                <div className="mt-2 space-y-2">
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
                      <label htmlFor={`urgent-${index}`} className="flex items-center">
                        Urgent order: $30
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
                      <label htmlFor={`video-${index}`} className="flex items-center">
                        Firing video: $100
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Submit button */}
            <button
              onClick={handleTextSubmit}
              className="
                w-full mt-4 p-3 bg-blue-600 rounded-md font-semibold 
                text-white hover:bg-blue-700 focus:outline-none 
                focus:ring-2 focus:ring-blue-500
              "
            >
              Add to Cart
            </button>
          </div>
        </div>
      )}

      {/* for REVENGE slideshow */}

      <div className=" bg-gray-800 p-6 rounded-lg shadow-lg">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-center">
            {t('title')}
          </h1>

          <h3 className="text-xl md:text-2xl lg:text-3xl font-bold text-center text-gray-300 mt-4">
            {t('subtitle')}
          </h3>
          <p className="text-xs md:text-sm lg:text-base text-gray-400 mt-4 text-center">
            {t('description')}
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
                <img
                  key={index}
                  src={src}
                  alt={`Slide ${index}`}
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
                  className={`w-3 h-3 rounded-full ${
                    index === currentImageIndex ? 'bg-white' : 'bg-gray-400'
                  }`}
                ></div>
              ))}
            </div>
          </div>
        </div>

      {/* Artillery grid */}
      <div className="flex flex-wrap lg:flex-nowrap items-start justify-center min-h-screen bg-gray-900 text-white px-4 lg:px-6 py-12 gap-6">
        <div className="w-full lg:w-2/3 bg-gray-800 p-6 rounded-lg shadow-lg">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-center">
            Choose Artillery
          </h1>

          {/* Grid of artillery options */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
            {artilleryOptions.map((option) => (
              <div
                key={option.id}
                className={`p-4 bg-gray-700 rounded-lg shadow-md cursor-pointer transition-all duration-300 ${
                  selectedOptions.some((item) => item.id === option.id)
                    ? 'ring-2 ring-blue-500'
                    : 'hover:bg-gray-600'
                }`}
                onClick={() => handleItemClick(option)}
              >
                <div className="w-full h-48 overflow-hidden rounded-md mb-4">
                  <img
                    src={option.image}
                    alt={option.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="text-lg font-semibold">{option.name}</h3>
                <p className="text-gray-400">${option.cost}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* OTSTREL */}
      <section className="py-20 bg-gray-800 text-gray-100 lg:-mt-32">
        <div className="max-w-screen-lg mx-auto px-6 flex flex-wrap md:flex-nowrap items-center gap-10">
          <div className="w-full md:w-1/2">
            <h3 className="text-3xl font-bold mb-4">
              {t('about.title')}{' '}
              <span className="text-blue-500 text-4xl">
                {t('about.projectName')}
              </span>
            </h3>
            <p className="text-gray-400 leading-relaxed">
              {t('about.description')}
            </p>
            <p className="text-gray-400 mt-4">{t('about.callToAction')}</p>
          </div>

          <div className="w-full md:w-1/2 h-72 bg-gray-700 rounded-lg overflow-hidden relative flex items-center justify-center">
            <video
              src="/artillery/otstrel.mp4"
              className="w-full h-full object-cover"
              autoPlay
              loop
              muted
            ></video>
          </div>
        </div>
      </section>
      {/* OTSTREL END */}
    </div>
  );
}