import { supabase } from '@/utils/supabase/client';
import { sendEmail } from '@/utils/sendEmail/sender';
import { templates } from '@/utils/sendEmail/emailTemplates';

export async function POST(request) {
  try {
    const orderData = await request.json();

    // Деструктуризация данных заказа
    const {
      user_id,
      option_id,
      messages,
      email,
      payment_method,
      cost,
      quick,
      video,
      paypalEmail,
      cardNumber,
    } = orderData;

    console.log('Received order data:', orderData); // Debugging

    // Валидация обязательных полей
    if (
      !user_id ||
      !option_id ||
      !messages ||
      !email ||
      !payment_method ||
      !cost
    ) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
      });
    }

    // Вставка сообщений в базу данных
    const { data: newMessages, error: insertError } = await supabase
      .from('messages')
      .insert(
        messages.map((msg) => ({
          user_id,
          option_id,
          message: msg.text,
          email,
          payment_method,
          cost,
          quick: msg.urgent || quick,
          video: msg.video || video,
        }))
      )
      .select('*');

    if (insertError) {
      console.error('Error inserting messages:', insertError);
      return new Response(JSON.stringify({ error: 'Failed to save messages' }), {
        status: 500,
      });
    }

    // Отправка email пользователю
    const template = templates['messageAccepted'];
    let emailContent;

    if (payment_method === 'paypal') {
      emailContent = {
        subject: template.subject,
        text: template.textWithPayPal(email, 'Artillery Shell', messages[0].text, paypalEmail),
        html: template.htmlWithPayPal(email, 'Artillery Shell', messages[0].text, paypalEmail),
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
        text: template.textWithCard(email, 'Artillery Shell', messages[0].text, cardNumber),
        html: template.htmlWithCard(email, 'Artillery Shell', messages[0].text, cardNumber),
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

    // Отправка email пользователю
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

    // Отправка email администратору
    const adminSubject = 'New Ammunition Request Received';
    const adminText = `
Hello, CloudyForge Team!

A new request has been received.

Username: ${email}
User Email: ${email}
Payment Method: ${payment_method}
Messages: ${messages.map((msg) => msg.text).join(', ')}
Quick: ${quick}
Video: ${video}
Cost: ${cost}

Check the "messages" table for more details.
`;

    const adminHtml = `
<h1>New Ammunition Request Received</h1>
<p><strong>Username:</strong> ${email}</p>
<p><strong>User Email:</strong> ${email}</p>
<p><strong>Payment Method:</strong> ${payment_method}</p>
<p><strong>Messages:</strong> ${messages.map((msg) => msg.text).join(', ')}</p>
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
    }

    return new Response(
      JSON.stringify({
        message: 'Messages saved and email sent successfully',
        data: newMessages,
      }),
      { status: 200 }
    );
  } catch (err) {
    console.error('Internal Server Error:', err);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
  }
}

// GET запрос остается без изменений
export async function GET() {
  try {
    const { data: options, error } = await supabase
      .from('options') // Таблица в Supabase
      .select('id, name, description, cost, order')
      .order('order', { ascending: true });

    if (error) {
      return new Response(JSON.stringify({ error: 'Failed to fetch options' }), {
        status: 500,
      });
    }

    return new Response(JSON.stringify(options), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
    });
  }
}