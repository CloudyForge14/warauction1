'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabase/client';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useTranslations } from 'next-intl';

export default function Profile() {
  const t = useTranslations('Profile');
  const [user, setUser] = useState(null);
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  // При загрузке страницы получаем user из Supabase
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const fetchUser = async () => {
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser();
        if (!error && user) {
          setUser(user);
          localStorage.setItem('user', JSON.stringify(user)); // сохраним в localStorage
        }
      };
      fetchUser();
    }
  }, []);

  // Обновим token (при желании, если нужно)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const refreshSession = async () => {
        const { data, error } = await supabase.auth.refreshSession();
        if (!error) {
          localStorage.setItem('authToken', data.session.access_token);
          console.log('Token refreshed successfully.');
        }
      };
      refreshSession();
    }
  }, []);

  // Загрузка аватара
  const updateAvatarInMetadata = async (avatarUrl) => {
    try {
      const { error } = await supabase.auth.updateUser({
        data: { avatar_url: avatarUrl },
      });

      if (error) {
        toast.error(t('toastAvatarError'));
        return;
      }

      // Обновим состояние user
      const {
        data: { user: freshUser },
        error: fetchError,
      } = await supabase.auth.getUser();
      if (fetchError) throw fetchError;

      setUser(freshUser);
      toast.success(t('toastAvatarSuccess'));

      // При желании, можно перезагрузить страницу
      // window.location.reload();
    } catch (error) {
      toast.error(t('toastUnexpectedError'));
    } finally {
      setUploading(false);
    }
  };

  // Обработка загрузки файла-аватара
  const uploadAvatar = async (file) => {
    try {
      setUploading(true);
      if (!user) throw new Error('User not authenticated');

      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}/avatar.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) {
        throw uploadError;
      }

      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
      await updateAvatarInMetadata(data.publicUrl);
    } catch (error) {
      toast.error(`Error uploading avatar: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) uploadAvatar(file);
  };

  // Изменение username
  const updateUsername = async () => {
    try {
      setLoading(true);
      if (!user) return;

      // Старая логика изменения username через Supabase
      const { error: authError } = await supabase.auth.updateUser({
        data: { username: newUsername },
      });
      if (authError) {
        toast.error(t('toastUsernameError'));
        return;
      }

      // Также, возможно, нужно обновить в таблице 'users' (если у вас она есть)
      // В таком случае:
      const userId = user.id;
      const { error: dbError } = await supabase
        .from('users')
        .update({ username: newUsername })
        .eq('id', userId);

      if (dbError) {
        toast.error(t('toastUsernameError'));
        return;
      }

      toast.success(t('toastUsernameSuccess'));
      setNewUsername('');

      // Обновляем user 
      const {
        data: { user: updatedUser },
      } = await supabase.auth.getUser();
      setUser(updatedUser);

      // <-- NEW: Email notify (шлём на /api/sendEmail)
      await fetch('/api/sendEmail', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email,
          username: newUsername,
          templateType: 'usernameChanged', // допустим, у вас такой шаблон
        }),
      });
      // Можно обработать response, если надо

    } catch (error) {
      console.error(error);
      toast.error(t('toastUsernameError'));
    } finally {
      setLoading(false);
    }
  };

  // Изменение пароля
  const changePassword = async () => {
    try {
      setPasswordLoading(true);
      if (!user) return;

      // Меняем пароль через Supabase
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        toast.error(t('toastPasswordError'));
        return;
      }

      toast.success(t('toastPasswordSuccess'));
      setNewPassword('');

      // <-- NEW: Email notify (шлём на /api/sendEmail)
      await fetch('/api/sendEmail', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email,
          username: user.user_metadata?.username || 'User',
          templateType: 'passwordChanged', // допустим, у вас такой шаблон
        }),
      });
    } catch (error) {
      toast.error(t('toastUnexpectedError'));
      console.error(error);
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-900 text-white">
      <ToastContainer
        position="top-left"
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
      <div className="flex-grow flex flex-col items-center justify-start mt-24">
        <div className="p-8 bg-gray-800 rounded-lg shadow-lg w-full max-w-md">
          <h1 className="text-3xl font-bold text-center mb-8">{t('title')}</h1>

          {user ? (
            <div className="text-center">
              {/* Аватар */}
              <div className="mb-6 relative inline-block">
                <img
                  src={
                    user.user_metadata?.avatar_url ||
                    'https://xerkmpqjygwvwzgiysep.supabase.co/storage/v1/object/public/avatars/placeholder.png'
                  }
                  alt="Avatar"
                  className="w-32 h-32 mx-auto rounded-full border-4 border-blue-500 object-cover"
                />
                <label className="absolute bottom-0 right-0 bg-blue-600 text-white rounded-full p-2 cursor-pointer hover:bg-blue-500 transition">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                    disabled={uploading}
                  />
                  {uploading ? '...' : '📤'}
                </label>
              </div>

              {/* Username */}
              <div className="mb-4">
                <label htmlFor="username" className="block text-sm font-medium mb-2">
                  Username
                </label>
                <input
                  type="text"
                  id="username"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  placeholder={user.user_metadata?.username || t('usernamePlaceholder')}
                  className="w-full p-3 rounded bg-gray-700 text-white border border-gray-600"
                />
                <button
                  onClick={updateUsername}
                  className={`mt-3 w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-500 transition ${
                    loading ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  disabled={loading}
                >
                  {loading ? t('usernameUpdating') : t('usernameSaveButton')}
                </button>
              </div>

              {/* Пароль */}
              <div className="mb-4">
                <label htmlFor="newPassword" className="block text-sm font-medium mb-2">
                  {t('newPasswordLabel')}
                </label>
                <input
                  type="password"
                  id="newPassword"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder={t('newPasswordPlaceholder')}
                  className="w-full p-3 rounded bg-gray-700 text-white border border-gray-600"
                />
                <button
                  onClick={changePassword}
                  className={`mt-3 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-500 transition ${
                    passwordLoading ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  disabled={passwordLoading}
                >
                  {passwordLoading
                    ? t('changePasswordUpdating')
                    : t('changePasswordButton')}
                </button>
              </div>

              {/* Email */}
              <div className="mt-6">
                <p className="text-sm text-gray-400">
                  <strong>Email:</strong> {user.email}
                </p>
                <p className="text-sm text-gray-400">
                  <strong>{t('currentUsernameLabel')}</strong>{' '}
                  {user.user_metadata?.username || t('notSet')}
                </p>
              </div>
            </div>
          ) : (
            <p className="text-center text-gray-400">{t('logInPrompt')}</p>
          )}
        </div>
      </div>
    </div>
  );
}
