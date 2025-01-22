'use client';

import { useState, useRef } from 'react';
import { supabase } from '@/utils/supabase/client';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useTranslations } from 'next-intl';
import ReCAPTCHA from 'react-google-recaptcha';

const SITE_KEY = '6Lfm4r8qAAAAAPxS9jjb-W5uT7Sj0RFsX5jlmVNd';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const t = useTranslations('ForgotPassword');
  const recaptchaRef = useRef(null); // Реф для сброса капчи
  const [captchaToken, setCaptchaToken] = useState(null);

  const handleCaptchaChange = (token) => {
    setCaptchaToken(token);
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
  
    if (!captchaToken) {
      toast.error('Please verify the reCAPTCHA.');
      return;
    }
  
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'https://cloudyforge.com/en/reset-password',
      });
      
  
      if (error) {
        if (
          error.message.includes(
            'For security purposes, you can only request this after'
          )
        ) {
          toast.error('You need to wait before requesting a password reset again. Please try later.');
        } else {
          toast.error(t('errorSendingEmail'));
        }
        console.error(error);
      } else {
        toast.success(t('emailSent'));
      }
    } catch (err) {
      toast.error(t('errorUnexpected'));
      console.error(err);
    } finally {
      // Сбрасываем капчу после завершения действия
      if (recaptchaRef.current) recaptchaRef.current.reset();
      setCaptchaToken(null); // Сбрасываем состояние токена
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

          {/* Google reCAPTCHA */}
          <ReCAPTCHA
            sitekey={SITE_KEY}
            onChange={handleCaptchaChange}
            ref={recaptchaRef} // Привязываем реф для сброса
          />

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
