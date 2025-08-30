import { createClient as supabaseCreateClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env.local file.');
}

// Singleton instance placeholder
let supabaseClient = null;

export const getClient = () => {
  // If an instance already exists, return it
  if (supabaseClient) {
    return supabaseClient;
  }

  // Otherwise, create a new instance
  let storage;
  if (typeof window !== 'undefined') {
    try {
      const remember = window.localStorage.getItem('rememberMe');
      const rememberMe = remember === null ? true : remember === 'true';
      storage = rememberMe ? window.localStorage : window.sessionStorage;
    } catch {
      storage = undefined;
    }
  }

  supabaseClient = supabaseCreateClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      ...(storage ? { storage } : {}),
    },
  });

  return supabaseClient;
};
