import { supabase } from '@/utils/supabase/client';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs'; // For password hashing

export async function POST(request) {
  const { email, password, username, captchaToken } = await request.json();

  try {
    // Проверка токена reCAPTCHA
    const secretKey = '6Lfm4r8qAAAAAGAZDjlf_ujRwX-nJNVyXtT-1YK0'; // Замените на ваш reCAPTCHA Secret Key
    const captchaResponse = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `secret=${secretKey}&response=${captchaToken}`,
    });

    const captchaResult = await captchaResponse.json();

    if (!captchaResult.success) {
      return NextResponse.json({ error: 'Invalid reCAPTCHA token.' }, { status: 400 });
    }

    // Проверка на существующий email
    const { data: emailExists, error: emailCheckError } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (emailCheckError && emailCheckError.code !== 'PGRST116') {
      console.error('Error checking email:', emailCheckError.message);
      return NextResponse.json({ error: 'Failed to verify email.' }, { status: 500 });
    }

    if (emailExists) {
      return NextResponse.json({ error: 'User with this email already exists.' }, { status: 400 });
    }

    // Проверка на существующий username
    const { data: usernameExists, error: usernameCheckError } = await supabase
      .from('users')
      .select('id')
      .eq('username', username)
      .single();

    if (usernameCheckError && usernameCheckError.code !== 'PGRST116') {
      console.error('Error checking username:', usernameCheckError.message);
      return NextResponse.json({ error: 'Failed to verify username.' }, { status: 500 });
    }

    if (usernameExists) {
      return NextResponse.json({ error: 'User with this username already exists.' }, { status: 400 });
    }

    // Регистрация пользователя через Supabase auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username },
      },
    });

    console.log('Supabase signUp response:', { data, error });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    const user = data?.user || {};

    // Хэшируем пароль перед сохранением
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Добавление пользователя в таблицу users
    const { error: insertError } = await supabase
      .from('users')
      .insert([
        {
          id: user.id, // id из auth (UUID)
          email: user.email,
          username: user.user_metadata?.username || username,
          password: hashedPassword, // Сохранение хэшированного пароля
          avatar_url: '', // Пустое значение по умолчанию
          is_banned: false, // Устанавливаем флаг бана как false
        },
      ]);

    if (insertError) {
      console.error('Error inserting into users table:', insertError.message);
      return NextResponse.json({ error: 'Failed to save user data.' }, { status: 500 });
    }

    // Возвращаем ответ с токеном
    const token = data?.session?.access_token || null;

    return NextResponse.json({
      message: 'Check your email to confirm registration!',
      token,
      userinfo: { email: user.email, username: user.user_metadata?.username || '' },
    });
  } catch (err) {
    console.error('Unexpected error:', err.message);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
