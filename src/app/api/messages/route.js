import { supabase } from '@/utils/supabase/client';

export async function POST(request) {
  try {
    const {
      user_id,
      option_id,
      messages, // Это массив сообщений
      email,
      payment_method,
      cost,
      quick,
      video,
    } = await request.json();

    // Проверка обязательных полей
    const missingFields = [];
    if (!user_id) missingFields.push('user_id');
    if (!option_id) missingFields.push('option_id');
    if (!messages) missingFields.push('messages');
    if (!email) missingFields.push('email');
    if (!payment_method) missingFields.push('payment_method');
    if (!cost) missingFields.push('cost');

    if (missingFields.length > 0) {
      return new Response(
        JSON.stringify({
          error: 'Missing required fields',
          missingFields: missingFields, // Указываем, какие поля отсутствуют
        }),
        { status: 400 }
      );
    }

    // Сохраняем каждое сообщение отдельно
    const newMessages = [];
    for (const msg of messages) {
      const { data: newMessage, error: insertError } = await supabase
        .from('messages')
        .insert({
          user_id,
          option_id,
          message: msg.text, // Сохраняем текст сообщения
          email,
          payment_method,
          cost,
          quick: quick || false, // По умолчанию false, если не указано
          video: msg.video || false, // Используем значение из сообщения
          checked: msg.urgent || false, // Используем значение urgent как checked
        })
        .select('*')
        .single();

      if (insertError) {
        console.error('Error inserting message:', insertError);
        return new Response(JSON.stringify({ error: 'Failed to save message' }), {
          status: 500,
        });
      }

      newMessages.push(newMessage);
    }

    // Возвращаем успешный ответ
    return new Response(
      JSON.stringify({
        message: 'Messages saved successfully',
        data: newMessages,
      }),
      { status: 200 }
    );
  } catch (err) {
    console.error('Internal Server Error:', err);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
    });
  }
}