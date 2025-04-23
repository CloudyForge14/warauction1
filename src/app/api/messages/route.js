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
      ethAddress,
      btcAddress,
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

    // Fetch the username from the users table
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('username')
      .eq('id', user_id)
      .single();

    if (userError) {
      console.error('Error fetching user data:', userError);
      return new Response(JSON.stringify({ error: 'Failed to fetch user data' }), {
        status: 500,
      });
    }

    // Fetch the option name from the options table
    const { data: optionData, error: optionError } = await supabase
      .from('options')
      .select('name')
      .eq('id', option_id)
      .single();

    if (optionError) {
      console.error('Error fetching option data:', optionError);
      return new Response(JSON.stringify({ error: 'Failed to fetch option data' }), {
        status: 500,
      });
    }

    const username = userData.username;
    const optionName = optionData.name; // Get the actual option name

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

    switch (payment_method) {
      case 'paypal':
        if (!paypalEmail) {
          return new Response(JSON.stringify({ error: 'PayPal email is required' }), {
            status: 400,
          });
        }
        emailContent = {
          subject: template.subject,
          text: template.textWithPayPal(username, optionName, messages[0].text, paypalEmail),
          html: template.htmlWithPayPal(username, optionName, messages[0].text.replace(/\n/g, '<br />'), paypalEmail),
        };
        break;
      case 'card':
        if (!cardNumber) {
          return new Response(JSON.stringify({ error: 'Card number is required' }), {
            status: 400,
          });
        }
        emailContent = {
          subject: template.subject,
          text: template.textWithCard(username, optionName, messages[0].text, cardNumber),
          html: template.htmlWithCard(username, optionName, messages[0].text.replace(/\n/g, '<br />'), cardNumber),
        };
        break;
      case 'eth':
        emailContent = {
          subject: template.subject,
          text: template.textWithETH(username, optionName, messages[0].text, ethAddress),
          html: template.htmlWithETH(username, optionName, messages[0].text.replace(/\n/g, '<br />'), ethAddress),
        };
        break;
      case 'btc':
        emailContent = {
          subject: template.subject,
          text: template.textWithBTC(username, optionName, messages[0].text, btcAddress),
          html: template.htmlWithBTC(username, optionName, messages[0].text.replace(/\n/g, '<br />'), btcAddress),
        };
        break;
      default:
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

Username: ${username}
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
<p><strong>Username:</strong> ${username}</p>
<p><strong>User Email:</strong> ${email}</p>
<p><strong>Payment Method:</strong> ${payment_method}</p>
<p><strong>Messages:</strong> ${messages.map((msg) => msg.text.replace(/\n/g, '<br />')).join(', ')}</p>
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

export async function GET() {
  try {
    const { data: options, error } = await supabase
      .from('options')
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