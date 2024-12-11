'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '../component/navbar';
import jwt from 'jsonwebtoken';

export default function SendMessage() {
  const [message, setMessage] = useState('');
  const [option, setOption] = useState('ak');
  const [payment, setPayment] = useState('visa');
  const [email, setEmail] = useState('');
  const [user, setUser] = useState(null);

  const optionsConfig = {
    ak: { name: 'AK-47 Support', cost: 500 },
    ks: { name: 'KS Assistance', cost: 700 },
    wr: { name: 'WR Backup', cost: 1000 },
  };

  useEffect(() => {
    try {
      const token = localStorage.getItem('authToken');
      if (token) {
        const decoded = jwt.decode(token);
        setUser(decoded);
        console.log('User decoded:', decoded);
      } else {
        setUser(null);
      }
    } catch (err) {
      console.error('Error decoding token:', err);
      setUser(null);
    }
  }, []);

  const calculateTotalCost = () => {
    const baseCost = optionsConfig[option].cost;
    const messageCost = message.length * 5;
    return baseCost + messageCost;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!user) {
      alert('Please log in to send a message.');
      return;
    }

    // Add your message submission logic here
    console.log('Message sent:', { message, option, payment, email });
    alert(`Message sent! Total cost: $${calculateTotalCost()}`);
  };

  return (
    <div>
      <Navbar />
      <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white px-6 py-12">
        <form
          onSubmit={handleSubmit}
          className="space-y-4 bg-gray-800 rounded-lg p-8 shadow-lg w-full max-w-md"
        >
          <h1 className="text-2xl font-bold text-center">
            Send Your Message to Russian Invaders!
          </h1>
          <div>
            <label htmlFor="message" className="block text-sm font-medium">
              Message
            </label>
            <input
              type="text"
              id="message"
              placeholder="Enter your message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
              className="mt-1 p-2 w-full bg-gray-700 rounded-md text-white focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex space-x-4">
            <div className="w-1/2">
              <label htmlFor="option" className="block text-sm font-medium">
                Option
              </label>
              <select
                id="option"
                value={option}
                onChange={(e) => setOption(e.target.value)}
                className="mt-1 p-2 w-full bg-gray-700 rounded-md text-white focus:ring-2 focus:ring-blue-500"
              >
                {Object.keys(optionsConfig).map((key) => (
                  <option key={key} value={key}>
                    {optionsConfig[key].name} - ${optionsConfig[key].cost}
                  </option>
                ))}
              </select>
            </div>
            <div className="w-1/2">
              <label htmlFor="payment" className="block text-sm font-medium">
                Payment Method
              </label>
              <select
                id="payment"
                value={payment}
                onChange={(e) => setPayment(e.target.value)}
                className="mt-1 p-2 w-full bg-gray-700 rounded-md text-white focus:ring-2 focus:ring-blue-500"
              >
                <option value="visa">Visa</option>
                <option value="mastercard">MasterCard</option>
                <option value="paypal">PayPal</option>
              </select>
            </div>
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium">
              Email
            </label>
            <input
              type="email"
              id="email"
              placeholder="Enter your email..."
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 p-2 w-full bg-gray-700 rounded-md text-white focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-gray-400 text-xs mt-1">
              We will send you a confirmation that your message has been
              received.
            </p>
          </div>
          <div className="mt-4 p-4 bg-gray-700 rounded-md text-white">
            <h2 className="text-lg font-semibold">Cost Summary</h2>
            <p>Base Cost (Option): ${optionsConfig[option].cost}</p>
            <p>Message Cost ($5 per character): ${message.length * 5}</p>
            <hr className="my-2 border-gray-600" />
            <p className="font-bold">Total Cost: ${calculateTotalCost()}</p>
          </div>
          <button
            type="submit"
            className="w-full mt-4 p-2 bg-blue-600 rounded-md font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Send Message
          </button>
        </form>
      </div>
    </div>
  );
}
