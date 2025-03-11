import { supabase } from '@/utils/supabase/client';

export async function GET() {
  try {
    // Fetch specific fields from Supabase
    const { data: options, error } = await supabase
      .from('options') // Table name
      .select('id, name, description, cost, order')
      .order('order', { ascending: true }); // Change to false for descending order

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

export async function POST(request) {
  try {
    const { user_id, option_id, messages, email, payment_method, cost, quick, video } =
      await request.json();

    // Валидация данных
    if (!user_id || !option_id || !messages || !email || !payment_method || !cost) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
      });
    }

    // Сохраняем заказ в таблицу messages
    const { data: order, error: orderError } = await supabase
      .from('messages')
      .insert([
        {
          user_id,
          option_id,
          message: JSON.stringify(messages), // Сохраняем сообщения как JSON
          email,
          payment_method,
          cost,
          quick: quick || false, // По умолчанию false
          video: video || false, // По умолчанию false
        },
      ])
      .select();

    if (orderError) {
      return new Response(JSON.stringify({ error: 'Failed to create order' }), {
        status: 500,
      });
    }

    // Возвращаем успешный ответ
    return new Response(JSON.stringify(order), { status: 201 });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
    });
  }
}