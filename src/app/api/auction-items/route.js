import { supabase } from '@/utils/supabase/client';

export async function GET() {
  try {
    // Получаем данные из базы
    const { data, error } = await supabase
      .from('auction_items')
      .select('*')
      .eq('is_active', true)
      .order('order', { ascending: true }); // Change to false for descending order

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }

    // Проверяем и обновляем time_left для каждого активного лота
    const updatedItems = data.map((item) => {
      const now = new Date();
      const finishDateTime = new Date(
        `${item.date_of_finishing}T${item.time_of_finishing}`
      );

      const timeLeftInSeconds = Math.max(
        Math.floor((finishDateTime - now) / 1000),
        0
      ); // В секундах, не менее 0

      // Обновляем поле time_left в объекте, если оно отличается
      if (item.time_left !== timeLeftInSeconds) {
        item.time_left = timeLeftInSeconds;
      }

      return item;
    });

    // Синхронизируем с базой только если время изменилось
    const updates = updatedItems.filter(
      (item, index) => data[index].time_left !== item.time_left
    );

    if (updates.length > 0) {
      const { error: updateError } = await supabase
        .from('auction_items')
        .upsert(updates);

      if (updateError) {
        return new Response(
          JSON.stringify({ error: `Failed to update time_left: ${updateError.message}` }),
          { status: 500 }
        );
      }
    }

    // Возвращаем обновлённые данные
    return new Response(JSON.stringify(updatedItems), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
  }
}
