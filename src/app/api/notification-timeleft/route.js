import { supabase } from "@/utils/supabase/client";
import { sendEmail } from "@/utils/sendEmail/sender";
import { templates } from "@/utils/sendEmail/emailTemplates";

export async function POST() {
  try {
    // 1. Получаем текущую дату и время в часовом поясе Киева
    const kyivTime = new Date(
      new Date().toLocaleString("en-US", { timeZone: "Europe/Kiev" })
    );

    // 2. Запрашиваем все активные аукционные лоты
    const { data: item, error: fetchError } = await supabase
      .from("auction_items")    
      .select("*")
      .eq("is_active", true)
      .limit(1);

    if (fetchError) {
      console.error("Error fetching auction items:", fetchError);
      return new Response(JSON.stringify({ error: fetchError.message }), {
        status: 500,
      });
    }

    if (!item || item.length === 0) {
      return new Response(
        JSON.stringify({ message: "No active auction items found." }),
        { status: 200 }
      );
    }

    const auctionItem = item[0]; // Берем первый объект из массива

    const finishTime = new Date(
      `${auctionItem.date_of_finishing}T${auctionItem.time_of_finishing}`
    );
    
    console.log(finishTime);
    console.log("kiev");

    console.log(kyivTime);
  
    const timeDiffMs = finishTime - kyivTime; // Разница во времени в миллисекундах
    const timeLeftHours = Math.round(timeDiffMs / (1000 * 60 * 60)); // Округляем до ближайшего часа
    
    console.log(timeLeftHours);
    
    

    // Если осталось примерно 4 часа, отправляем email
    if (timeLeftHours === 4) {
      await notifyUsers(item, templates.last4Hours);
      console.log("4");
    }
    
    // Если остался примерно 1 час, отправляем email
    if (timeLeftHours === 1) {
      await notifyUsers(item, templates.last1Hour);
      console.log("1");
    }
    
    

    return new Response(
      JSON.stringify({ 
        message: "Notification process completed.",
        timeLeftHours: timeLeftHours
      }),
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
async function notifyUsers(item, template) {
  try {
    // Получаем всех пользователей
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

    console.log(
      `Emails sent to all users for auction item: ${item.name} (${template.subject})`
    );
  } catch (error) {
    console.error("Failed to notify users:", error);
  }
}
