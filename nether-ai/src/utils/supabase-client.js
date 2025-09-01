import { createClient as supabaseCreateClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env.local file.');
}

export const createClient = () => {
  // Choose storage based on a user preference flag stored in localStorage.
  // Default is "remember me" on (localStorage). If explicitly set to 'false', use sessionStorage.
  let storage;
  if (typeof window !== 'undefined') {
    try {
      const remember = window.localStorage.getItem('rememberMe');
      const rememberMe = remember === null ? true : remember === 'true';
      storage = rememberMe ? window.localStorage : window.sessionStorage;
    } catch {
      // fallback to localStorage behavior if storage access fails
      storage = undefined;
    }
  }

  return supabaseCreateClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      ...(storage ? { storage } : {}),
    },
  });
};
