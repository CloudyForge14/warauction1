import { supabase } from '@/utils/supabase/client';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs'; // For password hashing

export async function POST(request) {
  const { email, password, username } = await request.json();

  // Регистрация пользователя
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

  try {
    // Хэшируем пароль перед сохранением
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Добавление в таблицу users
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
  } catch (err) {
    console.error('Unexpected error:', err.message);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }

  // Возвращаем ответ с токеном
  const token = data?.session?.access_token || null;

  return NextResponse.json({
    message: 'Check your email to confirm registration!',
    token,

    userinfo: { email: user.email, username: user.user_metadata?.username || '' },
  });
}
