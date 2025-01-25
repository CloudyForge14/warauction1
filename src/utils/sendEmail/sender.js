import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    host: 'live.smtp.mailtrap.io', // Обновленный хост
    port: 587, // Рекомендуемый порт
    auth: {
      user: process.env.MAILTRAP_USER,
      pass: process.env.MAILTRAP_PASS,
    },
  });
  

export async function sendEmail(to, subject, text, html) {
  try {
    await transporter.sendMail({
      from: '"CloudyForge" <support@cloudyforge.com>',
      to,
      subject,
      text,
      html,
    });
    return { success: true };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error };
  }
}
