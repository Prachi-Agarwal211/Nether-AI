import { getClient } from '@/utils/supabase-client';

// This service centralizes all direct communication with Supabase
// for authentication and CRUD around presentations.

// --- AUTHENTICATION ---

export async function signIn(email, password) {
  const supabase = getClient(); 
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
}

export async function signUpWithDetails(formData) {
  const supabase = getClient(); 
  const { email, password, firstName, lastName, username, phone, dob } = formData;
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        first_name: firstName,
        last_name: lastName,
        username: username,
        phone: phone,
        date_of_birth: dob,
      },
    },
  });
  if (error) throw error;
}

export async function sendPasswordReset(email) {
  const supabase = getClient(); 
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/update-password`,
  });
  if (error) throw error;
}

export async function signInWithGoogle() {
  const supabase = getClient(); 
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: window.location.origin + '/dashboard' },
  });
  if (error) throw error;
}

// Generic OAuth sign-in for additional providers (e.g., 'github', 'google', etc.)
export async function signInWithOAuth(provider, redirectPath = '/dashboard') {
  const supabase = getClient(); 
  const { error } = await supabase.auth.signInWithOAuth({
    provider,
    options: { redirectTo: window.location.origin + redirectPath },
  });
  if (error) throw error;
}

// Magic link / passwordless sign-in via email OTP
export async function signInWithOtp(email, redirectPath = '/dashboard') {
  const supabase = getClient(); 
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: window.location.origin + redirectPath },
  });
  if (error) throw error;
}

// --- DATA ---

export async function savePresentation(presentationData) {
  const supabase = getClient(); 
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Authentication required to save.");

  const payload = {
    id: presentationData.id || undefined,
    user_id: user.id,
    topic: presentationData.topic,
    chosen_angle: presentationData.chosenAngle,
    blueprint: presentationData.blueprint,
    recipes: presentationData.slideRecipes,
    theme_runtime: presentationData.themeRuntime,
  };

  const { data, error } = await supabase
    .from('presentations')
    .upsert(payload)
    .select('id')
    .single();

  if (error) throw error;
  return data;
}

export async function loadPresentation(id) {
  const supabase = getClient(); 
  if (!id) throw new Error("Presentation ID is required.");
  const { data, error } = await supabase
    .from('presentations')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;

  // Normalize to match store shape
  return {
    id: data.id,
    topic: data.topic || '',
    chosenAngle: data.chosen_angle || null,
    slideCount: data.slide_count || 10,
    blueprint: data.blueprint || null,
    slideRecipes: data.recipes || [],
    themeRuntime: data.theme_runtime || null,
    activeSlideIndex: 0,
  };
}
