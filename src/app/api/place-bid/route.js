import { supabase } from '@/utils/supabase/client';

export async function POST(request, { params }) {
  const { id } = params; // Auction item ID from the URL
  const { token } = request.headers.get('Authorization')?.replace('Bearer ', '') || {};
  const { bidAmount } = await request.json();

  if (!token) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  try {
    // Verify the token and fetch user details
    const { data: user, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), { status: 401 });
    }

    // Fetch the current auction item
    const { data: item, error: itemError } = await supabase
      .from('auction_items')
      .select('*')
      .eq('id', id)
      .single();

    if (itemError || !item) {
      return new Response(JSON.stringify({ error: 'Auction item not found' }), { status: 404 });
    }

    // Ensure the new bid is higher than the current bid
    if (bidAmount <= item.current_bid) {
      return new Response(JSON.stringify({ error: 'Bid must be higher than the current bid' }), { status: 400 });
    }

    // Update the auction item with the new bid
    const { error: updateError } = await supabase
      .from('auction_items')
      .update({ current_bid: bidAmount })
      .eq('id', id);

    if (updateError) {
      return new Response(JSON.stringify({ error: 'Failed to place bid' }), { status: 500 });
    }

    return new Response(JSON.stringify({ message: 'Bid placed successfully' }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
  }
}
