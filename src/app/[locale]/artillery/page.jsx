'use client';

import React, { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useTranslations } from 'next-intl';
import { useSwipeable } from 'react-swipeable';
import { supabase } from '@/utils/supabase/client';
import { FaTimes } from "react-icons/fa";
// import { useRouter } from 'next/router'; // Импортируем useRouter


export default function SendMessage() {
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [payment, setPayment] = useState('paypal');
  const [email, setEmail] = useState('');
  const [user, setUser] = useState(null);
  const [paymentDetails, setPaymentDetails] = useState(null);
  const [showCartModal, setShowCartModal] = useState(false);
  const [showTextModal, setShowTextModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [itemQuantity, setItemQuantity] = useState(1);
  const [itemMessages, setItemMessages] = useState([{ text: '', urgent: false, video: false }]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [artilleryOptions, setArtilleryOptions] = useState([]); // Состояние для артиллерии из базы данных
  // const router = useRouter(); // Используем useRouter для перенаправления
  const t = useTranslations('SendMessage');

  // Массив фоток для артиллерии
  const artilleryImages = [
    '/artillery/1.jpg',
    '/artillery/2.jpg',
    '/artillery/3.jpg',
    '/artillery/4.jpg',
    '/artillery/5.jpg',
    '/artillery/6.jpg',
    '/artillery/7.jpg',
    '/artillery/8.jpg',
    '/artillery/9.jpg',
    '/artillery/10.jpg',
    '/artillery/11.jpg',
  ];

  // Добавляем useEffect для получения пользователя
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const fetchUser = async () => {
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser();

        if (error) {
          console.log('No user:', error.message);
          // toast.error('Failed to fetch user data. Please try again.');
        } else {
          setUser(user);
          setEmail(user?.email || ''); // Устанавливаем email, если он есть
          localStorage.setItem('user', JSON.stringify(user)); // Сохраняем пользователя в localStorage
        }
      };

      fetchUser();
    }
  }, []);

  // Загрузка артиллерии из базы данных
  useEffect(() => {
    const fetchArtilleryOptions = async () => {
      try {
        const { data, error } = await supabase
          .from('options') // Предположим, что таблица называется 'options'
          .select('*');

        if (error) {
          console.error('Error fetching artillery options:', error.message);
          toast.error('Failed to fetch artillery options. Please try again.');
        } else {
          setArtilleryOptions(data); // Устанавливаем данные в состояние
        }
      } catch (err) {
        console.error('Unexpected error fetching artillery options:', err);
      }
    };

    fetchArtilleryOptions();
  }, []);

  // For REVENGE slideshow
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const images = [
    '/artillery/1.jpg',
    '/artillery/11.jpg',
    '/artillery/1.jpg',
    '/artillery/2.jpg',
    '/artillery/3.jpg',
    '/artillery/4.jpg',
    '/artillery/5.jpg',
    '/artillery/8.jpg',
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

  useEffect(() => {
    setTotalPrice(calculateTotalCartCost());
  }, [selectedOptions]);

  // Fetch payment details from Supabase
  useEffect(() => {
    const fetchPaymentDetails = async () => {
      try {
        const { data, error } = await supabase
          .from('payment')
          .select('*')
          .single();

        if (error) {
          console.error('Error fetching payment details:', error.message);
        } else {
          setPaymentDetails(data);
        }
      } catch (err) {
        console.error('Unexpected error fetching payment details:', err);
      }
    };

    fetchPaymentDetails();
  }, []);

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

  const removeMessage = (optionId, messageIndex) => {
    setSelectedOptions((prev) =>
      prev.map((item) => {
        if (item.id === optionId) {
          // Удаляем сообщение
          const updatedMessages = item.messages.filter((_, index) => index !== messageIndex);
          
          // Если количество сообщений меньше quantity, обновляем quantity
          const updatedQuantity = Math.max(updatedMessages.length, 1); // Минимум 1
  
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
  // Update item quantity in cart
  const updateQuantity = (optionId, newQuantity) => {
    if (newQuantity < 1) return; // Минимальное количество - 1
  
    setSelectedOptions((prev) =>
      prev.map((item) => {
        if (item.id === optionId) {
          // Копируем текущие сообщения
          const currentMessages = item.messages;
  
          // Если новое количество больше текущего, добавляем пустые сообщения
          if (newQuantity > currentMessages.length) {
            const additionalMessages = Array(newQuantity - currentMessages.length)
              .fill()
              .map(() => ({ text: '', urgent: false, video: false }));
            return {
              ...item,
              quantity: newQuantity,
              messages: [...currentMessages, ...additionalMessages],
            };
          }
          // Если новое количество меньше текущего, удаляем лишние сообщения
          else if (newQuantity < currentMessages.length) {
            return {
              ...item,
              quantity: newQuantity,
              messages: currentMessages.slice(0, newQuantity),
            };
          }
          // Если количество не изменилось, просто обновляем quantity
          else {
            return { ...item, quantity: newQuantity };
          }
        }
        return item;
      })
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
  const handlePayment = async () => {
    // const router = useRouter
    if (!user) {
      toast.error('You need to be logged in to proceed with payment.');
      // router.push('/login'); // Перенаправляем на страницу входа
      return;
    }

    if (!email) {
      toast.error('Please provide a valid email address.');
      return;
    }
  
    const totalCost = calculateTotalCartCost(); // Get the total cost
    setTotalPrice(totalCost); // Update the totalPrice state
  
    // Prepare data for the backend
    const orderData = {
      user_id: user?.id, // Ensure user_id is provided
      option_id: selectedOptions[0]?.id, // ID of the selected option
      messages: selectedOptions.flatMap((item) => item.messages), // All messages
      email: email, // Ensure email is provided
      payment_method: payment, // Payment method
      cost: totalCost, // Total cost
      quick: selectedOptions.some((item) => item.messages.some((msg) => msg.urgent)), // Check for urgent messages
      video: selectedOptions.some((item) => item.messages.some((msg) => msg.video)), // Check for video messages
      paypalEmail: paymentDetails.paypal,
      cardNumber: paymentDetails.card
    };
    
    console.log(paymentDetails)

    try {
      // Send data to the backend
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });
  
      if (!response.ok) {
        throw new Error('Failed to create order');
      }
  
      const result = await response.json();
      console.log('Order created:', result);
  
      // Show success notification
      toast.success('Order created successfully!');
  
      // Close the cart modal and open the payment modal
      setShowCartModal(false);
      setShowPaymentModal(true);
    } catch (error) {
      console.error('Error creating order:', error);
      toast.error('Failed to create order. Please try again.');
    }
  };

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
  
    fetchUser();
  }, []);

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
        className="fixed bottom-4 right-4 bg-blue-600 p-3 rounded-md cursor-pointer hover:bg-blue-700 transition-colors z-50"
        onClick={() => setShowCartModal(true)}
      >
        <span className="text-white font-semibold text-2xl">🛒 {selectedOptions.length}</span>
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
                      <div key={index} className="flex flex-col gap-2 relative"> {/* Добавлен relative */}
                        <textarea
                          value={message.text}
                          onChange={(e) => {
                            const newMessages = [...option.messages];
                            newMessages[index].text = e.target.value;
                            updateMessages(option.id, newMessages);
                          }}
                          className="mt-1 p-2 w-full bg-gray-700 rounded-md text-white focus:ring-2 focus:ring-blue-500"
                        />
                        {/* Красная кнопка с крестиком, позиционированная поверх textarea */}
                        <button
                          onClick={() => removeMessage(option.id, index)}
                          className="absolute top-3 right-2 p-2 text-red-600 hover:text-red-400 rounded-xl flex items-center justify-center"
                        >
                          <FaTimes className="w-4 h-4" /> {/* Иконка крестика */}
                        </button>
                        {/* Urgent и Video опции */}
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

            {/* Payment method selection */}
            <div className="mt-4">
              <div className='flex items-center gap-2'>
                <label htmlFor="paymentMethod" className="text-base font-medium whitespace-nowrap">
                  Payment Method
                </label>
                <select
                  id="paymentMethod"
                  value={payment} // Используем существующее состояние `payment`
                  onChange={(e) => setPayment(e.target.value)} // Используем существующий сеттер `setPayment`
                  className="mt-1 p-2 w-full bg-gray-700 rounded-md text-white focus:ring-2 focus:ring-blue-500"
                >
                  <option value="paypal">PayPal</option>
                  <option value="card">Card</option>
                </select>
              </div>
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

      {/* Payment modal */}
      {showPaymentModal && (
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
              onClick={() => setShowPaymentModal(false)}
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

            <h2 className="text-xl font-bold mb-4 text-center">
              {payment === 'paypal' ? 'PayPal Details' : 'Card Details'}
            </h2>

            <div className="text-center">
              {payment === 'paypal' ? (
                <>
                  <p className="text-sm text-gray-300">
                    {t('sendPaymentToPayPal')}
                  </p>
                  <p className="mb-4 text-blue-400 font-semibold">
                    {paymentDetails?.paypal || 'Not Available'}
                  </p>
                </>
              ) : (
                <>
                  <p className="text-sm text-gray-300">
                    {t('sendPaymentToCard')}
                  </p>
                  <p className="mb-4 text-blue-400 font-semibold">
                    {paymentDetails?.card || 'Not Available'}
                  </p>
                  <p className="mb-4 text-sm text-gray-400">
                    {t('cardHolderName')}
                  </p>
                </>
              )}
            </div>

            {/* Используем переменную totalPrice */}
            <p className="text-center mb-4 text-gray-300">
              {t('totalAmount')}
              <span className="font-bold">${totalPrice}</span>
            </p>

            <button
              onClick={() => setShowPaymentModal(false)}
              className="
                block mx-auto bg-blue-600 px-6 py-2 rounded-md 
                text-white font-medium hover:bg-blue-700 
                focus:outline-none focus:ring-2 focus:ring-blue-500
              "
            >
              Close
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
            <div className="flex items-center gap-2 mb-4">
              Quantity
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
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
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
            {artilleryOptions.map((option, index) => (
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
                    src={artilleryImages[index]} // Используем фотки из массива
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
              src="/artillery/otstrel.MP4"
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