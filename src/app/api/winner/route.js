import { supabase } from "@/utils/supabase/client";
import { sendEmail } from "@/utils/sendEmail/sender";
import { templates } from "@/utils/sendEmail/emailTemplates";

export async function POST(request) {
  try {
    // Получаем auctionId из тела запроса
    const { auctionId } = await request.json().catch(() => ({}));
    if (!auctionId) {
      return new Response(
        JSON.stringify({ error: "auctionId is required" }),
        { status: 400 }
      );
    }

    // Запрашиваем конкретный лот, который завершён (time_left < 0) и активен (is_active === true)
    const { data: auctionData, error: auctionError } = await supabase
      .from("auction_items")
      .select("*")
      .eq("id", auctionId)
      .single();

    if (auctionError) {
      return new Response(
        JSON.stringify({ error: auctionError.message }),
        { status: 400 }
      );
    }
    if (!auctionData) {
      return new Response(
        JSON.stringify({ message: "No ended auction found for the provided auctionId" }),
        { status: 200 }
      );
    }

    // Получаем последний бид для данного лота
    const { data: lastBid, error: lastBidError } = await supabase
      .from("bid_history")
      .select("*")
      .eq("auction_item_id", auctionId)
      .order("bid_time", { ascending: false })
      .limit(1)
      .single();

    if (lastBidError || !lastBid) {
      return new Response(
        JSON.stringify({ error: "No bids found for this auction" }),
        { status: 400 }
      );
    }

    const finalPrice = auctionData.current_bid; // либо можно взять lastBid.bid_amount
    const paymentType = lastBid.payment_type; // 'Paypal' или 'Card'
    const winnerEmail = auctionData.current_bid_user_email;
    const winnerName = auctionData.current_bid_user_name;

    if (!winnerEmail) {
      return new Response(
        JSON.stringify({ error: "Winner email not found" }),
        { status: 400 }
      );
    }
    // TODO добавить способ оплаты криптовалютой
    // Отправляем письмо победителю в зависимости от типа оплаты
    if (paymentType === "Paypal") {
      await sendEmail(
        winnerEmail,
        templates.auctionWon.subject,
        templates.auctionWon.textWithPayPal(
          winnerName,
          auctionData.name,
          finalPrice,
          auctionData.paypal
        ),
        templates.auctionWon.htmlWithPayPal(
          winnerName,
          auctionData.name,
          finalPrice,
          auctionData.paypal
        )
      );
    } else if (paymentType === "Card") {
      await sendEmail(
        winnerEmail,
        templates.auctionWon.subject,
        templates.auctionWon.textWithCard(
          winnerName,
          auctionData.name,
          finalPrice,
          auctionData.card || "No card number found"
        ),
        templates.auctionWon.htmlWithCard(
          winnerName,
          auctionData.name,
          finalPrice,
          auctionData.card || "No card number found"
        )
      );
    } else {
      return new Response(
        JSON.stringify({ error: "Unknown payment type" }),
        { status: 400 }
      );
    }

    // Обновляем запись, устанавливая is_active в false (аукцион завершён)
    const { error: updateError } = await supabase
      .from("auction_items")
      .update({ is_active: false })
      .eq("id", auctionId);
    if (updateError) {
      return new Response(
        JSON.stringify({ error: updateError.message }),
        { status: 400 }
      );
    }

    return new Response(
      JSON.stringify({ message: "Auction finished and winner notified" }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Failed to finish auction:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500 }
    );
  }
}

