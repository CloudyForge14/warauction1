import { supabase } from '@/utils/supabase/client';

export async function updateProfilePicture(userId, avatarUrl) {
  const { error } = await supabase
    .from('users')
    .update({ avatar_url: avatarUrl })
    .eq('id', userId);

  if (error) {
    console.error('Failed to update profile picture:', error.message);
    return { error: error.message };
  }

  return { success: true };
}
