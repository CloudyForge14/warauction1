import { sendEmail } from '@/utils/sendEmail/sender';
import { templates } from '@/utils/sendEmail/emailTemplates'

export async function POST(request) {
  const { email, username, templateType = 'welcome' } = await request.json();

  // Получаем шаблон по типу
  const template = templates[templateType];
  if (!template) {
    return new Response(
      JSON.stringify({ error: 'Invalid template type' }),
      { status: 400 }
    );
  }

  // Отправляем письмо
  const result = await sendEmail(
    email,
    template.subject,
    template.text(username),
    template.html(username)
  );
  
  if (!result.success) {
    return new Response(
      JSON.stringify({ error: 'Failed to send email' }),
      { status: 500 }
    );
  }

  return new Response(
    JSON.stringify({ message: 'Email sent successfully' }),
    { status: 200 }
  );
}
