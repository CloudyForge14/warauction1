import { supabase } from '@/utils/supabase/client';
import { NextResponse } from 'next/server';

export async function POST(request) {
  const { email, password } = await request.json();

  // Авторизация через Supabase
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return NextResponse.json({ error: 'Invalid email or password' }, { status: 400 });
  }

  return NextResponse.json({
    message: 'Login successful',
    token: data.session.access_token,   // access_token
    refresh_token: data.session.refresh_token, // refresh_token
    user: data.user,
  });
}
