import { supabase } from '@/integrations/supabase/client';
import { 
  DatabasePerson, 
  PersonCreateData, 
  PersonUpdateData 
} from '@/services/types/database.types';

export class PersonService {
  static async getPersonsByUserId(userId: string): Promise<DatabasePerson[]> {
    const { data, error } = await supabase
      .from('persons')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching persons:', error);
      throw error;
    }

    return data || [];
  }

  static async createPerson(personData: PersonCreateData): Promise<DatabasePerson> {
    const { data, error } = await supabase
      .from('persons')
      .insert([personData])
      .select()
      .single();

    if (error) {
      console.error('Error creating person:', error);
      throw error;
    }

    return data;
  }

  static async updatePerson(id: string, updates: PersonUpdateData): Promise<DatabasePerson> {
    const { data, error } = await supabase
      .from('persons')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating person:', error);
      throw error;
    }

    return data;
  }

  static async deletePerson(id: string): Promise<void> {
    const { error } = await supabase
      .from('persons')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting person:', error);
      throw error;
    }
  }

  static async getPersonById(id: string): Promise<DatabasePerson | null> {
    const { data, error } = await supabase
      .from('persons')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Person not found
      }
      console.error('Error fetching person:', error);
      throw error;
    }

    return data;
  }

  static async getAvailablePersons(userId: string): Promise<DatabasePerson[]> {
    const { data, error } = await supabase
      .from('persons')
      .select('*')
      .eq('user_id', userId)
      .eq('availability', 'available')
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching available persons:', error);
      throw error;
    }

    return data || [];
  }

  static async updatePersonAvailability(id: string, availability: 'available' | 'busy' | 'unavailable'): Promise<DatabasePerson> {
    const { data, error } = await supabase
      .from('persons')
      .update({
        availability,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating person availability:', error);
      throw error;
    }

    return data;
  }
}