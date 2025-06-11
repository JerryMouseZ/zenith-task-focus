import { supabase } from '@/integrations/supabase/client';

// Define Profile Interface
export interface Profile {
  id: string;
  email?: string;
  full_name?: string;
  avatar_url?: string;
  timezone?: string; // Added
  created_at: Date;
  updated_at: Date;
}

// Function to fetch the current user's profile
export async function getProfile(): Promise<Profile | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    // Or throw new Error('User not authenticated');
    return null;
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (error) {
    console.error('Error fetching profile:', error);
    // Or throw error;
    return null;
  }
  if (!data) return null;

  return {
     ...data,
     created_at: new Date(data.created_at),
     updated_at: new Date(data.updated_at),
  } as Profile;
}

// Function to update the current user's profile
export async function updateProfile(updates: Partial<Omit<Profile, 'id' | 'created_at' | 'updated_at'>>): Promise<Profile | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated for profile update');

  const profileData: any = { ...updates, updated_at: new Date().toISOString() };

  // Remove id, created_at from updates if they somehow got there
  delete profileData.id;
  delete profileData.created_at;

  const { data, error } = await supabase
    .from('profiles')
    .update(profileData)
    .eq('id', user.id)
    .select('*')
    .single();

  if (error) {
    console.error('Error updating profile:', error);
    throw error; // Rethrow to be handled by the caller
  }
  if (!data) return null;

  return {
     ...data,
     created_at: new Date(data.created_at),
     updated_at: new Date(data.updated_at),
  } as Profile;
}

export const profileService = {
  getProfile,
  updateProfile,
};
