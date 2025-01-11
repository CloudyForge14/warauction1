import { supabase } from '@/utils/supabase/client';
import { NextResponse } from 'next/server';

export async function POST(request) {
  const { email, otpCode } = await request.json();  
  console.log(otpCode)

  
  const { data: user, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .single();

  if (error || !user) {
    return NextResponse.json({ error: 'User not found.' }, { status: 404 });
  }

  if (user.otp_code !== otpCode) {
    return NextResponse.json({ error: 'Invalid OTP.' }, { status: 400 });
  }

  if (new Date() > new Date(user.otp_expires_at)) {
    return NextResponse.json({ error: 'OTP has expired.' }, { status: 400 });
  }

  // OTP verified successfully, update user
  const { error: updateError } = await supabase
    .from('users')
    .update({ otp_code: null, otp_expires_at: null })
    .eq('id', user.id);

  if (updateError) {
    return NextResponse.json({ error: 'Failed to update user.' }, { status: 500 });
  }

  return NextResponse.json({ message: 'Email verified successfully.' });
}
