import { supabase } from "@/utils/supabase/client";
import { sendEmail } from "@/utils/sendEmail/sender";
import { templates } from "@/utils/sendEmail/emailTemplates";

export async function POST(request) {
  try {
    // 1. Ищем ВСЕ аукционы, у которых время вышло (или date_of_finishing < NOW()).
    //    Плюс, проверяем, что они ещё не "закрыты" (is_active = true)
    const { data: endedAuctions, error: endedError } = await supabase
      .from("auction_items")
      .select("*")
      .lt("time_left", 0)      // или другой критерий, например date_of_finishing < now()
      .eq("is_active", true);
    console.log(endedAuctions);
    if (endedError) {
      return new Response(JSON.stringify({ error: endedError.message }), {
        status: 400,
      });
    }

    if (!endedAuctions || endedAuctions.length === 0) {
      return new Response(
        JSON.stringify({ message: "No ended auctions found" }),
        { status: 200 }
      );
    }

    // 2. Для каждого такого лота — достаём последнюю ставку (победителя) и отправляем письмо
    let notifiedCount = 0; // для статистики, сколько лотов обработали
    for (const item of endedAuctions) {
      // 2a. Находим последнюю ставку (победную)
      const { data: lastBid, error: lastBidError } = await supabase
        .from("bid_history")
        .select("*")
        .eq("auction_item_id", item.id)
        .order("bid_time", { ascending: false })
        .limit(1)
        .single();

      // Если нет ставок — пропускаем
      if (lastBidError || !lastBid) {
        console.log(`No bids found for item ID=${item.id}, skipping...`);
        continue;
      }

      // 2b. Достаём нужные данные
      const finalPrice = item.current_bid; // или lastBid.bid_amount
      const paymentType = lastBid.payment_type; // 'Paypal' или 'Card'
      const winnerEmail = item.current_bid_user_email;
      const winnerName = item.current_bid_user_name;

      if (!winnerEmail) {
        console.log(`No winner email found for item ID=${item.id}, skipping...`);
        continue;
      }

      // 2c. Отправляем письмо с реквизитами
      if (paymentType === "Paypal") {
        // item.paypal — PayPal email продавца
        await sendEmail(
          winnerEmail,
          templates.auctionWon.subject,
          templates.auctionWon.textWithPayPal(
            winnerName,
            item.name,
            finalPrice,
            item.paypal
          ),
          templates.auctionWon.htmlWithPayPal(
            winnerName,
            item.name,
            finalPrice,
            item.paypal
          )
        );
      } else if (paymentType === "Card") {
        // item.card — номер или реквизиты
        await sendEmail(
          winnerEmail,
          templates.auctionWon.subject,
          templates.auctionWon.textWithCard(
            winnerName,
            item.name,
            finalPrice,
            item.card || "No card number found"
          ),
          templates.auctionWon.htmlWithCard(
            winnerName,
            item.name,
            finalPrice,
            item.card || "No card number found"
          )
        );
      } else {
        console.log(`Unknown payment type for item ID=${item.id}`);
        continue;
      }

      notifiedCount++;

      // 2d. Ставим is_active = false, чтобы не отправлять повторно
      await supabase
        .from("auction_items")
        .update({ is_active: false })
        .eq("id", item.id);
    }

    // 3. Возвращаем результат
    return new Response(
      JSON.stringify({
        message: `Notified winners for ${notifiedCount} ended auctions.`,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Failed to notify winners via cron:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
    });
  }
}
