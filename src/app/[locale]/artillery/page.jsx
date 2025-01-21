'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '../component/navbar';
import jwt from 'jsonwebtoken';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useTranslations } from 'next-intl';
import { supabase } from '@/utils/supabase/client';
import { useSwipeable } from 'react-swipeable';

export default function SendMessage() {
  const [options, setOptions] = useState([]);
  const [selectedOption, setSelectedOption] = useState('');
  const [message, setMessage] = useState('');
  const [payment, setPayment] = useState('paypal');
  const [email, setEmail] = useState('');
  const [user, setUser] = useState(null);

  // Новые флаги
  const [isQuick, setIsQuick] = useState(false);
  const [includeVideo, setIncludeVideo] = useState(false);

  // Модалка
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  // Слайдер
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
    trackMouse: true, // Enables mouse drag support
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const fetchUser = async () => {
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser();

        if (error) {
          console.error('Error fetching user:', error.message);
        } else {
          setUser(user);
          setEmail(user?.email || ''); // Автоматически заполняем email
          localStorage.setItem('user', JSON.stringify(user));
        }
      };

      fetchUser();
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [images.length]);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const response = await fetch('/api/artillery');
        if (!response.ok) throw new Error(t('errors.fetchOptions'));
        const data = await response.json();
        setOptions(data);

        if (data.length > 0) {
          setSelectedOption(data[0]?.id);
        }
      } catch (error) {
        toast.error(t('errors.fetchOptionsRetry'));
      }
    };

    fetchOptions();
  }, [t]);

  const getUserFromLocalStorage = () => {
    if (typeof window !== 'undefined') {
      try {
        const userData = localStorage.getItem('user');
        return userData ? JSON.parse(userData) : null;
      } catch (error) {
        console.error('Error parsing user from localStorage:', error);
        return null;
      }
    }
    return null;
  };

  const calculateMessageCost = () => {
    if (!message) return 0;

    // Пример проверки на сложные языки
    const complexLanguagesRegex =
      /[\u4E00-\u9FFF\u3040-\u30FF\uAC00-\uD7AF\u0E00-\u0E7F\u10A0-\u10FF]/; // Chinese, Japanese, Korean, Thai, Georgian
    const isComplexLanguage = complexLanguagesRegex.test(message);

    let cost = 0;

    if (isComplexLanguage) {
      const charCount = message.length;
      const additionalChars = Math.max(0, charCount - 7); // После 7 символов
      cost = additionalChars * 5; // Минимум $40, потом +$5 за каждый символ
    } else {
      const charCount = message.length;
      if (charCount <= 28) {
        cost = (charCount - 18) * 2; // +$2 за каждый символ после 18
      } else {
        const additionalChars = Math.max(0, charCount - 28);
        cost = 20 + additionalChars * 5; // +$5 за каждый символ после 28
      }
    }

    return cost;
  };

  const getAuthTokenFromLocalStorage = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('authToken') || null;
    }
    return null;
  };

  useEffect(() => {
    const token = getAuthTokenFromLocalStorage();
    if (token) {
      const decoded = jwt.decode(token);
      setUser(decoded);
    }
  }, []);

  const calculateTotalCost = () => {
    const selectedOptionDetails = options.find(
      (opt) => opt.id === selectedOption
    );
    const baseCost = selectedOptionDetails?.cost || 0;
    const messageCost = calculateMessageCost();
    const quickCost = isQuick ? 30 : 0;
    const videoCost = includeVideo ? 100 : 0;

    return baseCost + messageCost + quickCost + videoCost;
  };

  const username = getUserFromLocalStorage()?.user_metadata?.username || 'Guest';
  console.log('Username:', username);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const userData = getUserFromLocalStorage();
    const user_id = userData?.id;
    const username = userData?.user_metadata?.username || 'User';

    if (!user_id) {
      toast.error('User ID not found. Please log in again.');
      return;
    }
    if (!selectedOption) {
      toast.error('Please select an artillery option.');
      return;
    }
    if (!message.trim()) {
      toast.error('Message cannot be empty.');
      return;
    }
    if (!email.trim()) {
      toast.error('Email cannot be empty.');
      return;
    }

    const totalCost = calculateTotalCost();

    const messageData = {
      user_id,
      option_id: selectedOption,
      message,
      email,
      payment_method: payment,
      cost: totalCost,
      username,
      quick: isQuick,
      video: includeVideo,
    };

    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(messageData),
      });

      if (!response.ok) {
        const errorResponse = await response.json();
        console.error('Error:', errorResponse.error);
        throw new Error(errorResponse.error || 'Failed to send the message');
      }

      // Если всё ок — показать тост
      toast.success(`Message sent successfully! Total cost: $${totalCost}`);

      // Очищаем форму
      setMessage('');

      // И открываем модалку
      setShowPaymentModal(true);
    } catch (error) {
      console.error('Error submitting message:', error);
      toast.error('Failed to submit the message. Please try again.');
    }
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

      {/* Модальное окно с реквизитами */}
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
        max-w-sm w-full p-6 
        transform transition-transform duration-300 
        animate-scaleIn
      "
    >
      {/* Иконка закрытия в правом верхнем углу */}
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
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
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
              Отправьте оплату на PayPal:
            </p>
            <p className="mb-4 text-blue-400 font-semibold">
              example@paypal.com
            </p>
          </>
        ) : (
          <>
            <p className="text-sm text-gray-300">
              Отправьте оплату на карту:
            </p>
            <p className="mb-4 text-blue-400 font-semibold">
              1234 5678 9012 3456
            </p>
            <p className="mb-4 text-sm text-gray-400">
              Имя держателя: JOHN DOE
            </p>
          </>
        )}
      </div>

      <p className="text-center mb-4 text-gray-300">
        Общая сумма: <span className="font-bold">${calculateTotalCost()}</span>
      </p>
      
      <button
        onClick={() => setShowPaymentModal(false)}
        className="
          block mx-auto bg-blue-600 px-6 py-2 rounded-md 
          text-white font-medium hover:bg-blue-700 
          focus:outline-none focus:ring-2 focus:ring-blue-500
        "
      >
        Закрыть
      </button>
    </div>
  </div>
)}


      {/* Основной контейнер */}
      <div className="flex flex-wrap lg:flex-nowrap items-start justify-center min-h-screen bg-gray-900 text-white px-6 py-12 gap-6">
        
        {/* Первый блок (Слайдер) */}
        <div className="w-full lg:w-2/3 bg-gray-800 p-6 rounded-lg shadow-lg">
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

            {/* Кнопки навигации */}
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

            {/* Индикаторы (точки) */}
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

        {/* Второй блок (форма) */}
        <div className="w-full lg:w-1/3 bg-gray-800 p-6 rounded-lg shadow-lg">
          <form onSubmit={handleSubmit} className="space-y-9">
            <div>
              <label htmlFor="message" className="block text-sm font-medium">
                {t('form.message')}
              </label>
              <input
                type="text"
                id="message"
                placeholder="Enter your message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
                maxLength={35}
                className="mt-1 p-2 w-full bg-gray-700 rounded-md text-white focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex flex-col md:flex-row md:space-x-4 space-y-4 md:space-y-0">
              <div className="md:w-1/2">
                <label htmlFor="option" className="block text-sm font-medium">
                  {t('form.option')}
                </label>
                <select
                  id="option"
                  value={selectedOption}
                  onChange={(e) => setSelectedOption(Number(e.target.value))}
                  className="p-2 w-full bg-gray-700 rounded-md text-white focus:ring-2 focus:ring-blue-500"
                >
                  {options.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.name} - ${option.cost}
                    </option>
                  ))}
                </select>
              </div>
              <div className="md:w-1/2">
                <label htmlFor="payment" className="block text-sm font-medium">
                  {t('form.payment')}
                </label>
                <select
                  id="payment"
                  value={payment}
                  onChange={(e) => setPayment(e.target.value)}
                  className="p-2 w-full bg-gray-700 rounded-md text-white focus:ring-2 focus:ring-blue-500"
                >
                  <option value="paypal">{t('form.paymentPayPal')}</option>
                  <option value="visa">{t('form.paymentCard')}</option>
                </select>
              </div>
            </div>

            {/* Чекбоксы */}
            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="quick"
                  checked={isQuick}
                  onChange={(e) => setIsQuick(e.target.checked)}
                  className="mr-2"
                />
                <label htmlFor="quick" className="flex items-center">
                  {t('form.quick')}
                  <span
                    title={t('form.quickTitle')}
                    className="ml-1 text-blue-500 cursor-pointer"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      x="0px"
                      y="0px"
                      width="25"
                      height="25"
                      viewBox="0 30 350 190"
                      style={{ fill: '#FFFFFF' }}
                    >
                      <g
                        fill="#ffffff"
                        fillRule="nonzero"
                        stroke="none"
                        strokeWidth="1"
                        strokeLinecap="butt"
                        strokeLinejoin="miter"
                        strokeMiterlimit="10"
                        fontFamily="none"
                        fontWeight="none"
                        fontSize="none"
                        textAnchor="none"
                        style={{ mixBlendMode: 'normal' }}
                      >
                        <g transform="scale(5.33333,5.33333)">
                          <path d="M24,4c-11.02793,0 -20,8.97207 -20,20c0,11.02793 8.97207,20 20,20c11.02793,0 20,-8.97207 20,-20c0,-11.02793 -8.97207,-20 -20,-20zM24,7c9.40662,0 17,7.59339 17,17c0,9.40661 -7.59338,17 -17,17c-9.40661,0 -17,-7.59339 -17,-17c0,-9.40661 7.59339,-17 17,-17zM24,14c-1.10457,0 -2,0.89543 -2,2c0,1.10457 0.89543,2 2,2c1.10457,0 2,-0.89543 2,-2c0,-1.10457 -0.89543,-2 -2,-2zM23.97656,20.97852c-0.82766,0.01293 -1.48843,0.69381 -1.47656,1.52148v11c-0.00765,0.54095 0.27656,1.04412 0.74381,1.31683c0.46725,0.27271 1.04514,0.27271 1.51238,0c0.46725,-0.27271 0.75146,-0.77588 0.74381,-1.31683v-11c0.00582,-0.40562 -0.15288,-0.7963 -0.43991,-1.08296c-0.28703,-0.28666 -0.67792,-0.44486 -1.08353,-0.43852z"></path>
                        </g>
                      </g>
                    </svg>
                  </span>
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="video"
                  checked={includeVideo}
                  onChange={(e) => setIncludeVideo(e.target.checked)}
                  className="mr-2"
                />
                <label htmlFor="video" className="flex items-center">
                  {t('form.video')}
                  <span
                    title={t('form.videoTitle')}
                    className="ml-1 text-blue-500 cursor-pointer"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      x="0px"
                      y="0px"
                      width="25"
                      height="25"
                      viewBox="0 30 350 190"
                      style={{ fill: '#FFFFFF' }}
                    >
                      <g
                        fill="#ffffff"
                        fillRule="nonzero"
                        stroke="none"
                        strokeWidth="1"
                        strokeLinecap="butt"
                        strokeLinejoin="miter"
                        strokeMiterlimit="10"
                        fontFamily="none"
                        fontWeight="none"
                        fontSize="none"
                        textAnchor="none"
                        style={{ mixBlendMode: 'normal' }}
                      >
                        <g transform="scale(5.33333,5.33333)">
                          <path d="M24,4c-11.02793,0 -20,8.97207 -20,20c0,11.02793 8.97207,20 20,20c11.02793,0 20,-8.97207 20,-20c0,-11.02793 -8.97207,-20 -20,-20zM24,7c9.40662,0 17,7.59339 17,17c0,9.40661 -7.59338,17 -17,17c-9.40661,0 -17,-7.59339 -17,-17c0,-9.40661 7.59339,-17 17,-17zM24,14c-1.10457,0 -2,0.89543 -2,2c0,1.10457 0.89543,2 2,2c1.10457,0 2,-0.89543 2,-2c0,-1.10457 -0.89543,-2 -2,-2zM23.97656,20.97852c-0.82766,0.01293 -1.48843,0.69381 -1.47656,1.52148v11c-0.00765,0.54095 0.27656,1.04412 0.74381,1.31683c0.46725,0.27271 1.04514,0.27271 1.51238,0c0.46725,-0.27271 0.75146,-0.77588 0.74381,-1.31683v-11c0.00582,-0.40562 -0.15288,-0.7963 -0.43991,-1.08296c-0.28703,-0.28666 -0.67792,-0.44486 -1.08353,-0.43852z"></path>
                        </g>
                      </g>
                    </svg>
                  </span>
                </label>
              </div>
            </div>

            {/* Сумма заказа */}
            <div className="p-4 bg-gray-700 rounded-md">
              <h2 className="text-lg font-semibold">{t('summary.title')}</h2>
              <p>
                {t('summary.baseCost')}:{' '}
                ${options.find((opt) => opt.id === selectedOption)?.cost || 0}
              </p>
              <p>{t('summary.messageCost', { cost: calculateMessageCost() })}</p>
              {isQuick && <p>{t('form.quick')}</p>}
              {includeVideo && <p>{t('form.video')}</p>}
              <hr className="my-2 border-gray-600" />
              <p className="font-bold">
                {t('summary.totalCost', { total: calculateTotalCost() })}
              </p>
            </div>

            <button
              type="submit"
              className="w-full p-3 bg-blue-600 rounded-md font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {t('form.submit')}
            </button>
          </form>
        </div>
      </div>

      {/* Третий блок (про проект + видео) */}
      <section className="py-20 bg-gray-800 text-gray-100 lg:-mt-32">
        <div className="max-w-screen-lg mx-auto px-6 flex flex-wrap md:flex-nowrap items-center gap-10">
          {/* Текстовый блок */}
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

          {/* Секция с видео */}
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
