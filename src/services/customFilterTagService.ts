import { supabase } from '@/integrations/supabase/client';
import { 
  DatabaseCustomFilterTag, 
  CustomFilterTagCreateData, 
  CustomFilterTagUpdateData 
} from '@/services/types/database.types';

export class CustomFilterTagService {
  static async getCustomFilterTagsByUserId(userId: string): Promise<DatabaseCustomFilterTag[]> {
    const { data, error } = await supabase
      .from('custom_filter_tags')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching custom filter tags:', error);
      throw error;
    }

    return data || [];
  }

  static async createCustomFilterTag(tagData: CustomFilterTagCreateData): Promise<DatabaseCustomFilterTag> {
    const { data, error } = await supabase
      .from('custom_filter_tags')
      .insert([tagData])
      .select()
      .single();

    if (error) {
      console.error('Error creating custom filter tag:', error);
      throw error;
    }

    return data;
  }

  static async updateCustomFilterTag(id: string, updates: CustomFilterTagUpdateData): Promise<DatabaseCustomFilterTag> {
    const { data, error } = await supabase
      .from('custom_filter_tags')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating custom filter tag:', error);
      throw error;
    }

    return data;
  }

  static async deleteCustomFilterTag(id: string): Promise<void> {
    const { error } = await supabase
      .from('custom_filter_tags')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting custom filter tag:', error);
      throw error;
    }
  }

  static async getCustomFilterTagById(id: string): Promise<DatabaseCustomFilterTag | null> {
    const { data, error } = await supabase
      .from('custom_filter_tags')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Tag not found
      }
      console.error('Error fetching custom filter tag:', error);
      throw error;
    }

    return data;
  }

  static async getCustomFilterTagsByName(userId: string, name: string): Promise<DatabaseCustomFilterTag[]> {
    const { data, error } = await supabase
      .from('custom_filter_tags')
      .select('*')
      .eq('user_id', userId)
      .ilike('name', `%${name}%`)
      .order('name', { ascending: true });

    if (error) {
      console.error('Error searching custom filter tags:', error);
      throw error;
    }

    return data || [];
  }

  static async checkTagNameExists(userId: string, name: string, excludeId?: string): Promise<boolean> {
    let query = supabase
      .from('custom_filter_tags')
      .select('id')
      .eq('user_id', userId)
      .eq('name', name);

    if (excludeId) {
      query = query.neq('id', excludeId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error checking tag name existence:', error);
      throw error;
    }

    return (data || []).length > 0;
  }
}