// /api/notify-auction-start.js (или .ts)
import { supabase } from "@/utils/supabase/client";
import { sendEmail } from "@/utils/sendEmail/sender";
import { templates } from "@/utils/sendEmail/emailTemplates";

export async function POST() {
  try {

    await notifyUsers(templates.auctionStarted);
    console.log("Auction start notification sent.");

    return new Response(
      JSON.stringify({ message: "Notification process completed." }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Failed to process auction notifications:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
    });
  }
}

// Вспомогательная функция для отправки email всем пользователям
async function notifyUsers(template) {
  try {
    const { data: users, error: fetchUsersError } = await supabase
      .from("users")
      .select("email, username");

    if (fetchUsersError) {
      console.error("Error fetching users:", fetchUsersError);
      return;
    }

    if (!users || users.length === 0) {
      console.log("No users found to notify.");
      return;
    }

    // Отправляем email каждому пользователю   
    for (const user of users) {
      await sendEmail(
        user.email,
        template.subject,
        template.text(user.username),
        template.html(user.username)
      );
    }
    console.log(`Emails sent`);
  } catch (error) {
    console.error("Failed to notify users:", error);
  }
}
