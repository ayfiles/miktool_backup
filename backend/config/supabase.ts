import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.warn('Warning: Supabase credentials not configured. Product endpoints will not work.');
}

/**
 * Supabase client for read-only product access
 */
export const supabase = createClient(supabaseUrl, supabaseKey);




