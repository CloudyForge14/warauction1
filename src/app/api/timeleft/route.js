import { supabase } from "@/utils/supabase/client";

export async function POST(request) {
  try {
    // 1. Получаем все записи с time_left, исключая null
    const { data: auctionItems, error: fetchError } = await supabase
      .from("auction_items")
      .select("id, time_left")
      .not("time_left", "is", null); // Исключаем записи, где time_left равен null

    if (fetchError) {
      console.error("Error fetching auction items:", fetchError);
      return new Response(JSON.stringify({ error: fetchError.message }), {
        status: 400,
      });
    }

    // 2. Если записей нет, возвращаем сообщение
    if (!auctionItems || auctionItems.length === 0) {
      return new Response(
        JSON.stringify({ message: "No auction items found with time_left." }),
        { status: 200 }
      );
    }

    // 3. Декрементируем time_left на 60 для каждой записи
    for (const item of auctionItems) {
      const newTimeLeft = item.time_left - 60;

      const { error: updateError } = await supabase
        .from("auction_items")
        .update({ time_left: newTimeLeft })
        .eq("id", item.id);

      if (updateError) {
        console.error(`Error updating item ID=${item.id}:`, updateError);
        continue; // Продолжаем обработку других записей, даже если одна не удалась
      }
    }

    // 4. Возвращаем успешный результат
    return new Response(
      JSON.stringify({
        message: `Time left decremented by 60 for ${auctionItems.length} items.`,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Failed to decrement time_left:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
    });
  }
}