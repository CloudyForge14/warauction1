import { supabase } from '@/utils/supabase/client';

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('auction_items')
      .select('*')
      .eq('is_active', true);

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }

    return new Response(JSON.stringify(data), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
  }
}

