import { sendEmail } from '@/utils/sendEmail/sender';
import { templates } from '@/utils/sendEmail/emailTemplates';
import { supabase } from '@/utils/supabase/client';

export async function POST(request, context) {
  // 1. Берём id из context
  const { id } = await context.params;
  if (!id) {
    return new Response(JSON.stringify({ error: 'Item ID is missing.' }), { status: 400 });
  }

  // 2. Токен из headers
  const authHeader = request.headers.get('Authorization');
  const token = authHeader ? authHeader.replace('Bearer ', '').trim() : null;
  if (!token) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  // 3. Вытаскиваем newBid И paymentType из тела запроса
  const { newBid, paymentType } = await request.json();

  // 4. Проверка newBid
  if (!newBid || isNaN(newBid)) {
    return new Response(JSON.stringify({ error: 'Invalid bid amount.' }), { status: 400 });
  }

  try {
    // 5. Получаем юзера по токену
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), { status: 401 });
    }

    // 6. Ищем лот
    const { data: item, error: itemError } = await supabase
      .from('auction_items')
      .select('*')
      .eq('id', id)
      .single();

    if (itemError || !item) {
      return new Response(JSON.stringify({ error: 'Auction item not found' }), { status: 404 });
    }

    // 7. Проверяем, что newBid больше текущей ставки
    if (newBid <= item.current_bid) {
      return new Response(JSON.stringify({ error: 'Bid must be higher than the current bid' }), { status: 400 });
    }

    const previousHighestBidderEmail = item.current_bid_user_email;
    const previousHighestBidderName = item.current_bid_user_name;

    // 8. Обновляем текущую ставку в таблице auction_items
    const { data: updatedItem, error: updateError } = await supabase
      .from('auction_items')
      .update({
        current_bid: newBid,
        current_bid_user_email: user.email,
        current_bid_user_name: user.user_metadata.username,
      })
      .eq('id', id)
      .select();

    if (updateError) {
      return new Response(JSON.stringify({ error: 'Failed to place bid' }), { status: 500 });
    }

    // 9. Пишем запись в bid_history
    const { error: historyError } = await supabase
      .from('bid_history')
      .insert({
        user_id: user.id,
        auction_item_id: id,
        bid_amount: newBid,
        payment_type: paymentType, // <-- наконец-то paymentType
      });

    if (historyError) {
      console.error('Failed to log bid history:', historyError);
    }

    // 10. Уведомляем текущего победителя
    await sendEmail(
      user.email,
      templates.bidAccepted.subject,
      templates.bidAccepted.text(user.user_metadata.username, item.name, newBid),
      templates.bidAccepted.html(user.user_metadata.username, item.name, newBid)
    );

    // 11. Уведомляем предыдущего highestBidder'а, если есть
    if (previousHighestBidderEmail && previousHighestBidderName) {
      await sendEmail(
        previousHighestBidderEmail,
        templates.bidOvertaken.subject,
        templates.bidOvertaken.text(previousHighestBidderName, item.name, newBid),
        templates.bidOvertaken.html(previousHighestBidderName, item.name, newBid)
      );
    }

    return new Response(JSON.stringify(updatedItem), { status: 200 });
  } catch (err) {
    console.error("Internal Server Error:", err);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
  }
}
