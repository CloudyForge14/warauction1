import { supabase } from '@/utils/supabase/client';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const body = await request.json();
    const emailOrUsername = body?.emailOrUsername?.trim();
    const password = body?.password;

    if (!emailOrUsername || !password) {
      return NextResponse.json(
        { error: 'Email/Username and Password are required' },
        { status: 400 }
      );
    }

    let user;
    let session;
    let error;

    if (emailOrUsername.includes('@')) {
      console.log('Attempting login with email:', emailOrUsername);

      const result = await supabase.auth.signInWithPassword({
        email: emailOrUsername,
        password,
      });

      console.log('SignIn result for email:', result);

      user = result.data?.user;
      session = result.data?.session;
      error = result.error;
    } else {
      console.log('Attempting login with username:', emailOrUsername);

      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('email')
        .eq('username', emailOrUsername)
        .single();

      console.log('User query result:', { userData, userError });

      if (userError || !userData) {
        return NextResponse.json(
          { error: 'Invalid username or password' },
          { status: 400 }
        );
      }

      const result = await supabase.auth.signInWithPassword({
        email: userData.email,
        password,
      });

      console.log('SignIn result for username:', result);

      user = result.data?.user;
      session = result.data?.session;
      error = result.error;
    }

    // Handle invalid credentials explicitly
    if (error) {
      console.error('Authentication error:', error.message);
      return NextResponse.json(
        { error: 'Invalid email/username or password' },
        { status: 400 }
      );
    }

    if (!session) {
      return NextResponse.json(
        { error: 'Session not created. Please check your credentials.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Login successful',
      token: session.access_token,
      refresh_token: session.refresh_token,
      user,
    });
  } catch (err) {
    console.error('Error processing request:', err);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
