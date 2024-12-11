import { supabase } from '@/utils/supabase/client';
import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export async function POST(request) {
  const { email, password, username } = await request.json();

  // Check if username or email is already taken
  const { data: existingUser, error: findError } = await supabase
    .from('users')
    .select('id, email, username')
    .or(`username.eq.${username},email.eq.${email}`)
    .single();

  if (existingUser) {
    const conflictField = existingUser.username === username ? 'Username' : 'Email';
    return NextResponse.json({ error: `${conflictField} is already taken` }, { status: 400 });
  }

  if (findError && findError.code !== 'PGRST116') {
    return NextResponse.json({ error: 'An error occurred' }, { status: 500 });
  }

  // Hash the password
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  // Insert user into the database
  const { data: newUser, error: insertError } = await supabase
    .from('users')
    .insert({ email, password: hashedPassword, username })
    .select('*')
    .single();

  if (insertError) {
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
  }

  // Generate JWT token
  const token = jwt.sign(
    { id: newUser.id, email: newUser.email, username: newUser.username },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );

  return NextResponse.json({
    message: 'User created successfully',
    token,
    user: { email: newUser.email, username: newUser.username },
  });
}
