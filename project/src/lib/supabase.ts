import { createClient } from '@supabase/supabase-js';
import { handleDatabaseError, AppError } from '../utils/error-handler';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new AppError(
    'Configuration Supabase manquante',
    'CONFIG_ERROR',
    500
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Wrapper pour gérer les erreurs de base de données
export async function safeQuery<T>(
  query: Promise<{ data: T | null; error: any }>
): Promise<T> {
  const { data, error } = await query;
  
  if (error) {
    throw handleDatabaseError(error);
  }
  
  if (!data) {
    throw new AppError('Aucune donnée trouvée', 'NOT_FOUND', 404);
  }
  
  return data;
}