import { supabase } from '@/utils/supabase/client';
import { sendEmail } from '@/utils/sendEmail/sender';
import { templates } from '@/utils/sendEmail/emailTemplates';

export async function POST(request) {
  try {
    const { user_id, option_id, message, email, payment_method, cost, username, quick, video } = await request.json();

    // Validate required fields
    if (!user_id || !option_id || !message || !email || !payment_method || !cost || !username) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400 });
    }

    // Insert message into the database
    const { data: newMessage, error: insertError } = await supabase
      .from('messages')
      .insert({
        user_id,
        option_id,
        message,
        email,
        payment_method,
        cost,
        quick, // Include quick option
        video, // Include video option
      })
      .select('*')
      .single();

    if (insertError) {  
      console.error('Error inserting message:', insertError);
      return new Response(JSON.stringify({ error: 'Failed to save message' }), { status: 500 });
    }

    // Send email notification
    const template = templates['messageAccepted'];

    const emailResult = await sendEmail(
      email,
      template.subject,
      template.text(username, 'Artillery Shell', cost, message),
      template.html(username, 'Artillery Shell', cost, message)
    );

    if (!emailResult.success) {
      console.error('Error sending email:', emailResult.error);
      return new Response(JSON.stringify({ error: 'Email notification failed' }), { status: 500 });
    }

    return new Response(
      JSON.stringify({
        message: 'Message saved and email sent successfully',
        data: newMessage,
      }),
      { status: 200 }
    );
  } catch (err) {
    console.error('Internal Server Error:', err);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
  }
}
