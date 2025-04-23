import { supabase } from "@/utils/supabase/client";
import { sendEmail } from "@/utils/sendEmail/sender";
import { templates } from "@/utils/sendEmail/emailTemplates";

export async function POST(request) {
  try {
    const { auctionId } = await request.json().catch(() => ({}));
    if (!auctionId) {
      return new Response(
        JSON.stringify({ error: "auctionId is required" }),
        { status: 400 }
      );
    }

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

    const finalPrice = auctionData.current_bid;
    const paymentType = lastBid.payment_type; // Now can be 'Paypal', 'Card', 'ETH', or 'BTC'
    const winnerEmail = auctionData.current_bid_user_email;
    const winnerName = auctionData.current_bid_user_name;

    if (!winnerEmail) {
      return new Response(
        JSON.stringify({ error: "Winner email not found" }),
        { status: 400 }
      );
    }

    // Handle all payment types
    let emailContent;
    switch (paymentType.toLowerCase()) {
      case "paypal":
        if (!auctionData.paypal) {
          return new Response(
            JSON.stringify({ error: "PayPal address not configured for this auction" }),
            { status: 400 }
          );
        }
        emailContent = {
          subject: templates.auctionWon.subject,
          text: templates.auctionWon.textWithPayPal(
            winnerName,
            auctionData.name,
            finalPrice,
            auctionData.paypal
          ),
          html: templates.auctionWon.htmlWithPayPal(
            winnerName,
            auctionData.name,
            finalPrice,
            auctionData.paypal
          )
        };
        break;
      case "card":
        if (!auctionData.card) {
          return new Response(
            JSON.stringify({ error: "Card number not configured for this auction" }),
            { status: 400 }
          );
        }
        emailContent = {
          subject: templates.auctionWon.subject,
          text: templates.auctionWon.textWithCard(
            winnerName,
            auctionData.name,
            finalPrice,
            auctionData.card
          ),
          html: templates.auctionWon.htmlWithCard(
            winnerName,
            auctionData.name,
            finalPrice,
            auctionData.card
          )
        };
        break;
      case "eth":
        if (!auctionData.eth_address) {
          return new Response(
            JSON.stringify({ error: "Ethereum address not configured for this auction" }),
            { status: 400 }
          );
        }
        emailContent = {
          subject: templates.auctionWon.subject,
          text: templates.auctionWon.textWithETH(
            winnerName,
            auctionData.name,
            finalPrice,
            auctionData.eth_address
          ),
          html: templates.auctionWon.htmlWithETH(
            winnerName,
            auctionData.name,
            finalPrice,
            auctionData.eth_address
          )
        };
        break;
      case "btc":
        if (!auctionData.btc_address) {
          return new Response(
            JSON.stringify({ error: "Bitcoin address not configured for this auction" }),
            { status: 400 }
          );
        }
        emailContent = {
          subject: templates.auctionWon.subject,
          text: templates.auctionWon.textWithBTC(
            winnerName,
            auctionData.name,
            finalPrice,
            auctionData.btc_address
          ),
          html: templates.auctionWon.htmlWithBTC(
            winnerName,
            auctionData.name,
            finalPrice,
            auctionData.btc_address
          )
        };
        break;
      default:
        return new Response(
          JSON.stringify({ error: "Unknown payment type" }),
          { status: 400 }
        );
    }

    // Send the email
    await sendEmail(
      winnerEmail,
      emailContent.subject,
      emailContent.text,
      emailContent.html
    );

    // Update auction status
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

