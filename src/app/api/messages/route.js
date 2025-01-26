import { supabase } from '@/utils/supabase/client';
import { sendEmail } from '@/utils/sendEmail/sender';
import { templates } from '@/utils/sendEmail/emailTemplates';

export async function POST(request) {
  try {
    const {
      user_id,
      option_id,
      message,
      email,
      payment_method,
      cost,
      username,
      quick,
      video,
      paypalEmail, // Extract paypalEmail from the request body
      cardNumber, // Extract cardNumber from the request body
    } = await request.json();

    console.log('Received request with payment method:', payment_method); // Debugging
    console.log('PayPal Email:', paypalEmail); // Debugging
    console.log('Card Number:', cardNumber); // Debugging

    // Validate required fields
    if (!user_id || !option_id || !message || !email || !payment_method || !cost || !username) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400 });
    }

    // Insert message into the database
    const { data: newMessage, error: insertError } = await supabase
      .from('messages')
      .insert({
        user_id,
        option_id,
        message,
        email,
        payment_method,
        cost,
        quick, // Include quick option
        video, // Include video option
      })
      .select('*')
      .single();

    if (insertError) {
      console.error('Error inserting message:', insertError);
      return new Response(JSON.stringify({ error: 'Failed to save message' }), { status: 500 });
    }

    // Send email notification based on payment method
    const template = templates['messageAccepted'];
    let emailContent;

    if (payment_method === 'paypal') {
      emailContent = {
        subject: template.subject,
        text: template.textWithPayPal(username, 'Artillery Shell', message, paypalEmail),
        html: template.htmlWithPayPal(username, 'Artillery Shell', message, paypalEmail),
      };
    } else if (payment_method === 'card') {
      if (!template.textWithCard || !template.htmlWithCard) {
        console.error('Template functions for card payment are missing.'); // Debugging
        return new Response(JSON.stringify({ error: 'Email template for card payment is not defined' }), { status: 500 });
      }

      emailContent = {
        subject: template.subject,
        text: template.textWithCard(username, 'Artillery Shell', message, cardNumber),
        html: template.htmlWithCard(username, 'Artillery Shell', message, cardNumber),
      };
    } else {
      console.error('Invalid payment method:', payment_method); // Debugging
      return new Response(JSON.stringify({ error: 'Invalid payment method' }), { status: 400 });
    }

    console.log('Email Content:', emailContent); // Debugging

    if (!emailContent) {
      console.error('Email content is undefined.'); // Debugging
      return new Response(JSON.stringify({ error: 'Failed to construct email content' }), { status: 500 });
    }

    const emailResult = await sendEmail(
      email,
      emailContent.subject,
      emailContent.text,
      emailContent.html
    );

    if (!emailResult.success) {
      console.error('Error sending email:', emailResult.error);
      return new Response(JSON.stringify({ error: 'Email notification failed' }), { status: 500 });
    }

    return new Response(
      JSON.stringify({
        message: 'Message saved and email sent successfully',
        data: newMessage,
      }),
      { status: 200 }
    );
  } catch (err) {
    console.error('Internal Server Error:', err);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
  }
}