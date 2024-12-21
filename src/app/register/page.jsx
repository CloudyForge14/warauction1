'use client';

import { supabase } from '@/utils/supabase/client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

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
        // Save token and user info in localStorage
        if (typeof window !== 'undefined') {
          localStorage.setItem('authToken', data.token);
          localStorage.setItem('user', JSON.stringify(data.user));
          localStorage.setItem('refreshToken', data.refresh_token);
        }

        const { error } = await supabase.auth.setSession({
          access_token: data.token,
          refresh_token: data.refresh_token,
        });

        if (error) {
          toast.error(`Error setting session: ${error.message}`);
          return;
        }

        toast.success('Registration successful!');
        router.push('/auction'); // Redirect to your desired page
      } else {
        setError(data.error || 'Something went wrong');
        toast.error(data.error || 'Something went wrong');
      }
    } catch (err) {
      toast.error('An unexpected error occurred.');
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
          <h1 className="text-3xl font-bold">Join the Community</h1>
          <p className="mt-2 text-lg">Stand with Ukraine during challenging times</p>
          <form onSubmit={registerUser} className="mt-8 max-w-md mx-auto space-y-4">
            <div>
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full rounded-md bg-gray-800 text-white px-4 py-2 focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-md bg-gray-800 text-white px-4 py-2 focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <input
                type="password"
                placeholder="Password"
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
              Register
            </button>
          </form>
          <p className="mt-4 text-sm">
            Already have an account?{' '}
            <a href="/login" className="text-blue-500 hover:underline">
              Login here
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
