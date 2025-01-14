'use client';

import { useState } from 'react';
import { supabase } from '@/utils/supabase/client';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useTranslations } from 'next-intl';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const t = useTranslations('ForgotPassword');

  const handleForgotPassword = async (e) => {
    e.preventDefault();

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        toast.error(t('errorSendingEmail'));
        console.error(error);
      } else {
        toast.success(t('emailSent'));
      }
    } catch (err) {
      toast.error(t('errorUnexpected'));
      console.error(err);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-900 text-white px-6 py-12">
      <ToastContainer position="top-right" autoClose={3000} theme="dark" />
      <div className="text-center">
        <h1 className="text-3xl font-bold">{t('resetPassword')}</h1>
        <p className="mt-2 text-lg">{t('enterEmail')}</p>
        <form onSubmit={handleForgotPassword} className="mt-8 max-w-md mx-auto space-y-4">
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
          <button
            type="submit"
            className="w-full rounded-md bg-blue-600 py-2 font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {t('sendResetLink')}
          </button>
        </form>
      </div>
    </div>
  );
}
