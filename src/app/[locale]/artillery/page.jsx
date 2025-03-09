'use client';

import React, { useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function SendMessage() {
  const [selectedOptions, setSelectedOptions] = useState([]); // Массив выбранных товаров
  const [message, setMessage] = useState('');
  const [showCartModal, setShowCartModal] = useState(false); // Модальное окно корзины

  // Массив с названиями, характеристиками и изображениями артиллерии
  const artilleryOptions = [
    { id: 1, name: '12mm Artillery Shell', image: '/artillery/10.jpeg', cost: 100 },
    { id: 2, name: '123mm Tank Shell', image: '/artillery/11.jpeg', cost: 150 },
    { id: 3, name: '123mm Artillery Shell', image: '/artillery/1.jpeg', cost: 200 },
    { id: 4, name: '123mm Mortar Shell', image: '/artillery/2.jpg', cost: 120 },
    { id: 5, name: '155mm Howitzer Shell', image: '/artillery/3.jpg', cost: 250 },
  ];

  // Добавление товара в корзину
  const addToCart = (option) => {
    setSelectedOptions((prev) => {
      const isAlreadyAdded = prev.some((item) => item.id === option.id);
      if (isAlreadyAdded) {
        return prev.filter((item) => item.id !== option.id); // Удаляем, если уже добавлен
      } else {
        return [...prev, option]; // Добавляем, если еще не в корзине
      }
    });
  };

  // Удаление товара из корзины
  const removeFromCart = (optionId) => {
    setSelectedOptions((prev) => prev.filter((item) => item.id !== optionId));
  };

  // Общая стоимость товаров в корзине
  const calculateTotalCartCost = () => {
    return selectedOptions.reduce((total, item) => total + item.cost, 0);
  };

  // Обработка оплаты
  const handlePayment = () => {
    toast.success('Оплата прошла успешно!');
    setShowCartModal(false); // Закрываем корзину
    setSelectedOptions([]); // Очищаем корзину
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

      {/* Иконка корзины с количеством товаров */}
      <div
        className="fixed bottom-4 right-4 bg-blue-600 p-3 rounded-full cursor-pointer hover:bg-blue-700 transition-colors z-50"
        onClick={() => setShowCartModal(true)}
      >
        <span className="text-white font-semibold">🛒 {selectedOptions.length}</span>
      </div>

      {/* Модальное окно корзины */}
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
              max-w-md w-full p-6 
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

            <h2 className="text-xl font-bold mb-4 text-center">Корзина</h2>

            {/* Список товаров в корзине */}
            <div className="space-y-4">
              {selectedOptions.map((option) => (
                <div key={option.id} className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">{option.name}</h3>
                    <p className="text-gray-400">${option.cost}</p>
                  </div>
                  <button
                    onClick={() => removeFromCart(option.id)}
                    className="text-red-500 hover:text-red-400"
                  >
                    Удалить
                  </button>
                </div>
              ))}
            </div>

            {/* Общая стоимость */}
            <div className="mt-6">
              <p className="text-lg font-semibold">
                Итого: ${calculateTotalCartCost()}
              </p>
            </div>

            {/* Поле для сообщения */}
            <div className="mt-4">
              <label htmlFor="message" className="block text-sm font-medium">
                Сообщение (опционально)
              </label>
              <textarea
                id="message"
                placeholder="Введите ваше сообщение..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="mt-1 p-2 w-full bg-gray-700 rounded-md text-white focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Кнопка оплаты */}
            <button
              onClick={handlePayment}
              className="
                w-full mt-4 p-3 bg-blue-600 rounded-md font-semibold 
                text-white hover:bg-blue-700 focus:outline-none 
                focus:ring-2 focus:ring-blue-500
              "
            >
              Оплатить
            </button>
          </div>
        </div>
      )}

      {/* Остальная часть кода (грид артиллерии и т.д.) */}
      <div className="flex flex-wrap lg:flex-nowrap items-start justify-center min-h-screen bg-gray-900 text-white px-6 py-12 gap-6">
        <div className="w-full lg:w-2/3 bg-gray-800 p-6 rounded-lg shadow-lg">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-center">
            Выберите артиллерию
          </h1>

          {/* Грид выбора артиллерии */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
            {artilleryOptions.map((option) => (
              <div
                key={option.id}
                className={`p-4 bg-gray-700 rounded-lg shadow-md cursor-pointer transition-all duration-300 ${
                  selectedOptions.some((item) => item.id === option.id)
                    ? 'ring-2 ring-blue-500'
                    : 'hover:bg-gray-600'
                }`}
                onClick={() => addToCart(option)}
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
    </div>
  );
}