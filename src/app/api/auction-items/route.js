import { supabase } from '@/utils/supabase/client';

export async function GET() {
  try {
    const { data: items, error } = await supabase
      .from('auction_items')
      .select('*')
      .eq('is_active', true); // Fetch only active items

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }

    return new Response(JSON.stringify(items), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Failed to fetch auction items.' }), { status: 500 });
  }
}


export async function uploadImage(file) {
  const fileName = `${Date.now()}-${file.name}`;
const { data, error } = await supabase.storage
  .from('auction_images') // Здесь имя bucket
  .upload(fileName, file);


  if (error) {
    console.error('Error uploading image:', error.message);
    return null;
  }

  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/auction-images/${fileName}`;
}



export async function fetchUploadedImages() {
  const { data, error } = await supabase
    .from('images') // Имя таблицы в Supabase
    .select('*'); // Запрос на получение всех данных

  if (error) {
    console.error('Error fetching images:', error.message);
    return [];
  }

  return data;
}
