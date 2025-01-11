'use client';

import { supabase } from '@/utils/supabase/client';
import { useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import Image from 'next/image';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState('register'); // 'register' or 'verify'
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations('Register');

  const registerUser = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, username }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success('Registration successful! Please verify your email with the OTP.');
        setStep('verify'); // Proceed to OTP verification step
      } else {
        setError(data.error || 'An error occurred during registration.');
        toast.error(data.error || 'An error occurred during registration.');
      }
    } catch (err) {
      toast.error('An error occurred.');
      console.error(err);
    }
  };

  const verifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    console.log('OTP Value:', otp); // Debug OTP value

    try {
      const res = await fetch('/api/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success('Email verified successfully!');
        handleNavigation('/auction'); // Redirect on success
      } else {
        setError(data.error || 'Failed to verify OTP.');
        toast.error(data.error || 'Failed to verify OTP.');
      }
    } catch (err) {
      toast.error('An error occurred during OTP verification.');
      console.error(err);
    }
  };

  const handleNavigation = (path) => {
    const localizedPath = `/${locale}${path}`;
    router.push(localizedPath);
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

      <div className="flex min-h-screen items-center justify-center bg-gray-900 text-white px-6 py-12">
        {step === 'register' ? (
          <div className="text-center">
            <h1 className="text-3xl font-bold">{t('title')}</h1>
            <p className="mt-2 text-lg">{t('subtitle')}</p>
            <form onSubmit={registerUser} className="mt-8 max-w-md mx-auto space-y-4">
              <div>
                <input
                  type="text"
                  placeholder={t('usernamePlaceholder')}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="w-full rounded-md bg-gray-800 text-white px-4 py-2 focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <input
                  type="email"
                  placeholder={t('emailPlaceholder')}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full rounded-md bg-gray-800 text-white px-4 py-2 focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder={t('passwordPlaceholder')}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full rounded-md bg-gray-800 text-white px-4 py-2 focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-200"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  <Image
                    src={showPassword ? '/hide.png' : '/show.png'}
                    alt={showPassword ? 'Hide password' : 'Show password'}
                    width={24}
                    height={24}
                  />
                </button>
              </div>
              {error && <p className="text-red-500">{error}</p>}
              <button
                type="submit"
                className="w-full rounded-md bg-blue-600 py-2 font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {t('registerButton')}
              </button>
            </form>
          </div>
        ) : (
          <div className="text-center">
            <h1 className="text-3xl font-bold">otp</h1> 
            <p className="mt-2 text-lg">otp</p>
            <form onSubmit={verifyOtp} className="mt-8 max-w-md mx-auto space-y-4">
              <div>
                <input
                  type="text"
                  placeholder="Enter OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                  className="w-full rounded-md bg-gray-800 text-white px-4 py-2 focus:ring-2 focus:ring-blue-500"
                />
              </div>
              {error && <p className="text-red-500">{error}</p>}
              <button
                type="submit"
                className="w-full rounded-md bg-blue-600 py-2 font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Verify OTP
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
