import { supabase } from '@/utils/supabase/client';
import { NextResponse } from 'next/server';

export async function POST(request) {
  const { email } = await request.json();

  const { data: user, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .single();

  if (error || !user) {
    return NextResponse.json({ error: 'User not found.' }, { status: 404 });
  }

  const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
  const otpExpiresAt = new Date(Date.now() + 15 * 60 * 1000);

  const { error: updateError } = await supabase
    .from('users')
    .update({ otp_code: otpCode, otp_expires_at: otpExpiresAt })
    .eq('id', user.id);

  if (updateError) {
    return NextResponse.json({ error: 'Failed to update OTP.' }, { status: 500 });
  }

  // Send OTP via email
  const emailResult = await sendEmail(
    email,
    `Your OTP Code: ${otpCode}`,
    `Your OTP code is: ${otpCode}\nThis code will expire in 15 minutes.`,
    `<p>Your OTP code is: <strong>${otpCode}</strong>. This code will expire in 15 minutes.</p>`
  );

  if (!emailResult.success) {
    return NextResponse.json({ error: 'Failed to send OTP email.' }, { status: 500 });
  }

  return NextResponse.json({ message: 'OTP resent successfully.' });
}
