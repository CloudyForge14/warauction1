'use client';

import { useState } from 'react';
import { supabase } from '@/utils/supabase/client';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();
  const t = useTranslations('Login');
  const locale = useLocale(); // Get the current locale
  const handleNavigation = (path) => {
    const localizedPath = `/${locale}${path}`; // Prepend the locale to the path
    router.push(localizedPath); // Navigate to the localized path
  };
  const loginUser = async (e) => {
    e.preventDefault();
    setError('');
  
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          emailOrUsername: email, // Use the key expected by the back end
          password,
        }),
      });
  
      const data = await response.json();
  
      if (response.ok) {
        if (typeof window !== 'undefined') {
          localStorage.setItem('authToken', data.token);
          localStorage.setItem('refreshToken', data.refresh_token);
          localStorage.setItem('user', JSON.stringify(data.user));
        }
  
        const { error } = await supabase.auth.setSession({
          access_token: data.token,
          refresh_token: data.refresh_token,
        });
  
        if (error) {
          toast.error(`Error setting session: ${error.message}`);
          return;
        }
  
        toast.success(t('loginSuccessful'));
        handleNavigation('/auction');
      } else {
        setError(data.error || t('errorLoginFailed'));
        toast.error(data.error || t('errorLoginFailed'));
      }
    } catch (err) {
      toast.error(t('errorUnexpected'));
      console.error(err);
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
      <div className="flex min-h-screen items-center justify-center bg-gray-900 text-white px-6 py-12">
        <div className="text-center -mt-64">
          <h1 className="text-3xl font-bold">{t('welcomeBack')}</h1>
          <p className="mt-2 text-lg">{t('logInToAccount')}</p>
          <form onSubmit={loginUser} className="mt-8 max-w-md mx-auto space-y-4">
<div>
  <input
    type="text"
    name="emailOrUsername" // Ensure the name matches the back-end key
                placeholder={t('emailPlaceholder')}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-md bg-gray-800 text-white px-4 py-2 focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <input
                type="password"
                placeholder={t('passwordPlaceholder')}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full rounded-md bg-gray-800 text-white px-4 py-2 focus:ring-2 focus:ring-blue-500"
              />
            </div>
            {error && <p className="text-red-500">{error}</p>}
            <button
              type="submit"
              className="w-full rounded-md bg-blue-600 py-2 font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {t('loginButton')}
            </button>
          </form>
            <Link href="/forgotpassword" className="text-blue-500 hover:underline">
            <p className="mt-4 text-sm">
            {t('forgotPassword')}
          </p>
            </Link>
          <p className="mt-2 text-sm">
            {t('dontHaveAccount')}{' '}
            <Link href="/register" className="text-blue-500 hover:underline">
              {t('loginHere')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
