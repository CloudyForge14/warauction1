import { supabase } from '@/utils/supabase/client';

export async function GET() {
  try {
    const { data: options, error } = await supabase
      .from('options') // Таблица в Supabase
      .select('id, name, description, cost, order')
      .order('order', { ascending: true });

    if (error) {
      return new Response(JSON.stringify({ error: 'Failed to fetch options' }), {
        status: 500,
      });
    }

    return new Response(JSON.stringify(options), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
    });
  }
}