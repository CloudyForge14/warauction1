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
      paypalEmail,
      cardNumber,
    } = await request.json();

    console.log('Received request with payment method:', payment_method); // Debugging
    console.log('PayPal Email:', paypalEmail); // Debugging
    console.log('Card Number:', cardNumber); // Debugging

    // Validate required fields
    if (
      !user_id ||
      !option_id ||
      !message ||
      !email ||
      !payment_method ||
      !cost ||
      !username
    ) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
      });
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
        quick,
        video,
      })
      .select('*')
      .single();

    if (insertError) {
      console.error('Error inserting message:', insertError);
      return new Response(JSON.stringify({ error: 'Failed to save message' }), {
        status: 500,
      });
    }

    // Отправляем письмо пользователю
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
        console.error('Template functions for card payment are missing.');
        return new Response(
          JSON.stringify({ error: 'Email template for card payment is not defined' }),
          { status: 500 }
        );
      }

      emailContent = {
        subject: template.subject,
        text: template.textWithCard(username, 'Artillery Shell', message, cardNumber),
        html: template.htmlWithCard(username, 'Artillery Shell', message, cardNumber),
      };
    } else {
      console.error('Invalid payment method:', payment_method);
      return new Response(JSON.stringify({ error: 'Invalid payment method' }), {
        status: 400,
      });
    }

    console.log('Email Content:', emailContent);

    if (!emailContent) {
      console.error('Email content is undefined.');
      return new Response(
        JSON.stringify({ error: 'Failed to construct email content' }),
        { status: 500 }
      );
    }

    // 1) Письмо пользователю
    const emailResult = await sendEmail(
      email,
      emailContent.subject,
      emailContent.text,
      emailContent.html
    );

    if (!emailResult.success) {
      console.error('Error sending email to user:', emailResult.error);
      return new Response(JSON.stringify({ error: 'Email notification failed' }), {
        status: 500,
      });
    }

    // 2) Письмо админу (cloudyforge@gmail.com) с информацией о новом сообщении
    const adminSubject = 'New Ammunition Request Received';
    const adminText = `
Hello, CloudyForge Team!

A new request has been received.

Username: ${username}
User Email: ${email}
Payment Method: ${payment_method}
Message: ${message}
Quick: ${quick}
Video: ${video}
Cost: ${cost}

Check the "messages" table for more details.
`;

    const adminHtml = `
<h1>New Ammunition Request Received</h1>
<p><strong>Username:</strong> ${username}</p>
<p><strong>User Email:</strong> ${email}</p>
<p><strong>Payment Method:</strong> ${payment_method}</p>
<p><strong>Message:</strong> ${message}</p>
<p><strong>Quick:</strong> ${quick}</p>
<p><strong>Video:</strong> ${video}</p>
<p><strong>Cost:</strong> ${cost}</p>
<p>Check the "messages" table for more details.</p>
`;

    const adminEmailResult = await sendEmail(
      'cloudyforge@gmail.com',
      adminSubject,
      adminText,
      adminHtml
    );

    if (!adminEmailResult.success) {
      console.error('Error sending email to admin:', adminEmailResult.error);
      // Возвращаем 200, чтобы пользователь не думал, что возникла ошибка.
      // Можно, если нужно, вернуть 500, но тут оставим всё успешным для UX.
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
