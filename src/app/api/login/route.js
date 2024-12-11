import { supabase } from '@/utils/supabase/client';
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

export async function POST(request) {
  const { email, password } = await request.json();

  // Check if email exists
  const { data: user, error: fetchError } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .single();

  if (fetchError || !user) {
    return NextResponse.json({ error: 'Invalid email or password' }, { status: 400 });
  }

  // Verify password
  const bcrypt = await import('bcryptjs');
  const isValidPassword = await bcrypt.compare(password, user.password);

  if (!isValidPassword) {
    return NextResponse.json({ error: 'Invalid email or password' }, { status: 400 });
  }

  // Generate JWT token
  const token = jwt.sign(
    { id: user.id, email: user.email, username: user.username },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );

  // Successful login
  return NextResponse.json({
    message: 'Login successful',
    token,
    user: { email: user.email, username: user.username },
  });
}
