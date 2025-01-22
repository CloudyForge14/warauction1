'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabase/client';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';

export default function ResetPassword() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [accessToken, setAccessToken] = useState('');
  const router = useRouter();
  const t = useTranslations('ResetPassword'); // Localization

  useEffect(() => {
    // Extract the access_token from the URL hash
    const hash = window.location.hash;
    const params = new URLSearchParams(hash.substring(1)); // Remove '#' and parse
    const token = params.get('access_token');

    if (!token) {
      toast.error(t('invalidOrExpiredToken'));
      return;
    }

    setAccessToken(token);
  }, [t]);

  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (!accessToken) {
      toast.error(t('invalidOrExpiredToken'));
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error(t('passwordsDoNotMatch'));
      return;
    }

    try {
      // Use the access token to update the password
      const { data, error } = await supabase.auth.updateUser(accessToken, {
        password: newPassword,
      });

      if (error) {
        toast.error(error.message);
        return;
      }

      toast.success(t('passwordResetSuccess'));
      setTimeout(() => {
        router.push('/en/auction'); // Redirect to login page
      }, 3000);
    } catch (err) {
      toast.error(t('errorUnexpected'));
      console.error(err);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-900 text-white px-6 py-12">
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
      <div className="text-center">
        <h1 className="text-3xl font-bold">{t('resetPassword')}</h1>
        <p className="mt-2 text-lg">{t('setNewPassword')}</p>
        <form onSubmit={handleResetPassword} className="mt-8 max-w-md mx-auto space-y-4">
          <div>
            <input
              type="password"
              placeholder={t('newPasswordPlaceholder')}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              className="w-full rounded-md bg-gray-800 text-white px-4 py-2 focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <input
              type="password"
              placeholder={t('confirmPasswordPlaceholder')}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full rounded-md bg-gray-800 text-white px-4 py-2 focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-md bg-blue-600 py-2 font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {t('resetPasswordButton')}
          </button>
        </form>
      </div>
    </div>
  );
}
