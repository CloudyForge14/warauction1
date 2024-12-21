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


// export async function uploadImage(file) {
//   // Заменяем пробелы на символы подчеркивания, чтобы избежать проблем с URL
//   const fileName = `${Date.now()}-${file.name.replace(/\s+/g, '_')}`;

//   try {
//     // Загружаем файл в Supabase Storage
//     const { data, error } = await supabase.storage
//       .from('auction_images') // Имя bucket
//       .upload(fileName, file);

//     if (error) {
//       console.error('Error uploading file:', error.message);
//       return null;
//     }

//     // Получаем публичный URL из Supabase Storage
//     const { data: publicUrlData } = supabase.storage
//       .from('auction_images')
//       .getPublicUrl(fileName);

//     console.log("Public URL:", publicUrlData.publicUrl); // Логируем корректный URL

//     // Возвращаем корректный публичный URL
//     return publicUrlData.publicUrl;
//   } catch (err) {
//     console.error("Unexpected error during upload:", err.message || err);
//     return null;
//   }
// }




// export async function fetchUploadedImages() {
//   const { data, error } = await supabase
//     .from('images') // Имя таблицы в Supabase
//     .select('*'); // Запрос на получение всех данных

//   if (error) {
//     console.error('Error fetching images:', error.message);
//     return [];
//   }

//   return data;
// }
