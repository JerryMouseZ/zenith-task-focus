
import { supabase } from '@/integrations/supabase/client';

// Define Profile Interface
export interface Profile {
  id: string;
  email?: string;
  full_name?: string;
  avatar_url?: string;
  timezone?: string;
  ai_model?: string | null;
  ai_base_url?: string | null;
  ai_api_key?: string | null;
  created_at: Date;
  updated_at: Date;
}

// Function to fetch the current user's profile
export async function getProfile(): Promise<Profile | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    console.log('No authenticated user found');
    return null;
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      // No profile found, create one
      console.log('No profile found, creating new profile');
      return await createProfile(user.id, user.email || '', '');
    }
    console.error('Error fetching profile:', error);
    throw error;
  }

  if (!data) return null;

  return {
     ...data,
     created_at: new Date(data.created_at),
     updated_at: new Date(data.updated_at),
  } as Profile;
}

// Function to create a new profile
async function createProfile(userId: string, email: string, fullName: string, ai_model: string | null = null, ai_base_url: string | null = null, ai_api_key: string | null = null): Promise<Profile | null> {
  const profileData = {
    id: userId,
    email: email,
    full_name: fullName,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    ai_model,
    ai_base_url,
    ai_api_key
  };

  const { data, error } = await supabase
    .from('profiles')
    .insert(profileData)
    .select('*')
    .single();

  if (error) {
    console.error('Error creating profile:', error);
    throw error;
  }

  if (!data) return null;

  return {
     ...data,
     created_at: new Date(data.created_at),
     updated_at: new Date(data.updated_at),
  } as Profile;
}

// Function to update the current user's profile
export async function updateProfile(updates: Partial<Omit<Profile, 'id' | 'created_at' | 'updated_at' | 'ai_model' | 'ai_base_url' | 'ai_api_key'>> & { ai_model?: string | null; ai_base_url?: string | null; ai_api_key?: string | null }): Promise<Profile | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated for profile update');

  const profileData: any = { 
    ...updates, 
    updated_at: new Date().toISOString()
  };

  // Remove id, created_at from updates if they somehow got there
  delete profileData.id;
  delete profileData.created_at;
  // Remove fields if not present (for type safety)
  if (!('ai_model' in profileData)) profileData.ai_model = null;
  if (!('ai_base_url' in profileData)) profileData.ai_base_url = null;
  if (!('ai_api_key' in profileData)) profileData.ai_api_key = null;

  const { data, error } = await supabase
    .from('profiles')
    .update(profileData)
    .eq('id', user.id)
    .select('*')
    .single();

  if (error) {
    console.error('Error updating profile:', error);
    throw error;
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
