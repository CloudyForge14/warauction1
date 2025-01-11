import { supabase } from '@/utils/supabase/client';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs'; // For password hashing
import { templates } from '@/utils/sendEmail/emailTemplates';
import { sendEmail } from '@/utils/sendEmail/sender';

export async function POST(request) {
  const { email, password, username } = await request.json();

  // Generate a 6-digit OTP
  const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
  const otpExpiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15-minute expiration

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { username } },
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  const user = data?.user || {};

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    // Save user with OTP and expiration
    const { error: insertError } = await supabase
      .from('users')
      .insert([
        {
          id: user.id,
          email: user.email,
          username: user.user_metadata?.username || username,
          password: hashedPassword,
          otp_code: otpCode,
          otp_expires_at: otpExpiresAt,
        },
      ]);

    if (insertError) {
      return NextResponse.json({ error: 'Failed to save user data.' }, { status: 500 });
    }

    // Send OTP via email
    const template = templates['welcome']; // Use your custom OTP email template
    const emailResult = await sendEmail(
      email,
      `Your OTP Code: ${otpCode}`,
      `Hi ${username},\n\nYour OTP code is: ${otpCode}\n\nThis code will expire in 15 minutes.`,
      `<h1>Hi ${username},</h1><p>Your OTP code is: <strong>${otpCode}</strong></p><p>This code will expire in 15 minutes.</p>`
    );

    if (!emailResult.success) {
      console.error('Error sending email:', emailResult.error);
      return NextResponse.json({ error: 'Failed to send OTP email.' }, { status: 500 });
    }

    return NextResponse.json({ message: 'OTP sent successfully. Please verify your email.' });
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
