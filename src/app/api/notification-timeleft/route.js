import { supabase } from "@/utils/supabase/client";
import { sendEmail } from "@/utils/sendEmail/sender";
import { templates } from "@/utils/sendEmail/emailTemplates";

// Теперь функция принимает второй аргумент с параметрами из URL (например, timeleft)
export async function POST(request: Request, { params }: { params: { timeleft?: string } }) {
  try {
    // Если в URL передали параметр, то переопределяем вычисленное время
    let overrideTime: number | undefined;
    if (params?.timeleft) {
      overrideTime = parseInt(params.timeleft, 10);
    }

    // Получаем текущее время в часовом поясе Киева
    const kyivTime = new Date(
      new Date().toLocaleString("en-US", { timeZone: "Europe/Kiev" })
    );

    // Запрашиваем активный аукционный лот
    const { data: item, error: fetchError } = await supabase
      .from("auction_items")
      .select("*")
      .eq("is_active", true)
      .limit(1);

    if (fetchError) {
      console.error("Error fetching auction items:", fetchError);
      return new Response(JSON.stringify({ error: fetchError.message }), { status: 500 });
    }

    if (!item || item.length === 0) {
      return new Response(
        JSON.stringify({ message: "No active auction items found." }),
        { status: 200 }
      );
    }

    const auctionItem = item[0];

    // Получаем время окончания аукциона
    const finishTime = new Date(
      `${auctionItem.date_of_finishing}T${auctionItem.time_of_finishing}`
    );

    console.log("Finish Time:", finishTime);
    console.log("Kyiv Time:", kyivTime);

    let timeLeftHours: number;
    if (overrideTime !== undefined) {
      timeLeftHours = overrideTime;
      console.log(`Переопределённое время: ${timeLeftHours} час(а/ов)`);
    } else {
      const timeDiffMs = finishTime.getTime() - kyivTime.getTime();
      timeLeftHours = Math.round(timeDiffMs / (1000 * 60 * 60));
      console.log(`Вычисленное время: ${timeLeftHours} час(а/ов)`);
    }

    // Выбираем нужный шаблон уведомления в зависимости от оставшегося времени
    let templateToUse = null;
    if (timeLeftHours === 24) {
      templateToUse = templates.auctionLastDay;
    } else if (timeLeftHours === 4) {
      templateToUse = templates.last4Hours;
    } else if (timeLeftHours === 1) {
      templateToUse = templates.last1Hour;
    } else {
      console.log("Нет шаблона для указанного времени:", timeLeftHours);
    }

    if (templateToUse) {
      await notifyUsers(auctionItem, templateToUse);
      console.log(`Уведомление отправлено для ${timeLeftHours} час(а/ов)`);
    } else {
      console.log("Уведомление не отправлено, т.к. время не соответствует шаблонам.");
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

// Функция для рассылки email всем пользователям
async function notifyUsers(item, template) {
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
