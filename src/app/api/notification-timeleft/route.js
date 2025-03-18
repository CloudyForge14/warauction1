import { supabase } from "@/utils/supabase/client";
import { sendEmail } from "@/utils/sendEmail/sender";
import { templates } from "@/utils/sendEmail/emailTemplates";

export async function POST(request) {
  try {
    // Пробуем распарсить тело запроса, если оно пришло
    let overrideTime;
    try {
      const body = await request.json();
      if (body && body.timeleft) {
        overrideTime = parseInt(body.timeleft, 10);
        console.log(`Переопределённое время из body: ${overrideTime}`);
      }
    } catch (err) {
      console.log("Нет валидного JSON в body, считаем время автоматически");
    }

    // Получаем текущее время по Киеву
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
      console.error("Ошибка получения аукционных лотов:", fetchError);
      return new Response(JSON.stringify({ error: fetchError.message }), {
        status: 500,
      });
    }

    if (!item || item.length === 0) {
      return new Response(
        JSON.stringify({ message: "Активные аукционные лоты не найдены." }),
        { status: 200 }
      );
    }

    const auctionItem = item[0];

    // Формируем дату окончания аукциона
    const finishTime = new Date(
      `${auctionItem.date_of_finishing}T${auctionItem.time_of_finishing}`
    );

    console.log("Finish Time:", finishTime);
    console.log("Kyiv Time:", kyivTime);

    let timeLeftHours;
    if (overrideTime !== undefined) {
      timeLeftHours = overrideTime;
    } else {
      const timeDiffMs = finishTime.getTime() - kyivTime.getTime();
      timeLeftHours = Math.round(timeDiffMs / (1000 * 60 * 60));
    }
    console.log(`Оставшееся время: ${timeLeftHours} часов`);

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
      console.log(`Уведомление отправлено для ${timeLeftHours} часов`);
    } else {
      console.log("Уведомление не отправлено, т.к. время не соответствует шаблонам.");
    }

    return new Response(
      JSON.stringify({
        message: "Notification process completed.",
        timeLeftHours: timeLeftHours,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Ошибка в процессе уведомлений:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
    });
  }
}

// Вспомогательная функция для рассылки email всем пользователям
async function notifyUsers(item, template) {
  try {
    const { data: users, error: fetchUsersError } = await supabase
      .from("users")
      .select("email, username");

    if (fetchUsersError) {
      console.error("Ошибка получения пользователей:", fetchUsersError);
      return;
    }

    if (!users || users.length === 0) {
      console.log("Пользователи не найдены для уведомления.");
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
    console.error("Ошибка при отправке уведомлений:", error);
  }
}
