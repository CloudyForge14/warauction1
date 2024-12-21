import { supabase } from '@/utils/supabase/client';

export async function GET() {
  try {
    
    // Fetch specific fields from Supabase
    const { data: options, error } = await supabase
    .from('options') // Table name
    .select('id, name, description, cost'); // Include 'id'
  
    if (error) {
      return new Response(JSON.stringify({ error: 'Failed to fetch options' }), { status: 500 });
    }

    return new Response(JSON.stringify(options), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
  }
}
