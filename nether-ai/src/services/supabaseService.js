import { createClient } from '@/utils/supabase-client';

// This service centralizes all direct communication with Supabase
// for authentication and CRUD around presentations.

const supabase = createClient();

// --- AUTHENTICATION ---

export async function signIn(email, password) {
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
}

export async function signUpWithDetails(formData) {
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
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/update-password`,
  });
  if (error) throw error;
}

export async function signInWithGoogle() {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: window.location.origin + '/dashboard' },
  });
  if (error) throw error;
}

// Generic OAuth sign-in for additional providers (e.g., 'github', 'google', etc.)
export async function signInWithOAuth(provider, redirectPath = '/dashboard') {
  const { error } = await supabase.auth.signInWithOAuth({
    provider,
    options: { redirectTo: window.location.origin + redirectPath },
  });
  if (error) throw error;
}

// Magic link / passwordless sign-in via email OTP
export async function signInWithOtp(email, redirectPath = '/dashboard') {
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: window.location.origin + redirectPath },
  });
  if (error) throw error;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

// --- USER PROFILE ---

export async function getUserProfile() {
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) throw new Error("User not authenticated.");

  // Query by user_id (matches your table schema)
  const { data, error } = await supabase
    .from('profiles')
    .select('id, user_id, email, username, first_name, last_name, phone, date_of_birth')
    .eq('user_id', user.id)
    .maybeSingle();

  if (error) throw new Error(error.message || 'Failed to load profile');

  // If no row exists, create a default profile for this user
  if (!data) {
    const insertPayload = {
      user_id: user.id,
      email: user.email ?? null,
      username: user.user_metadata?.username ?? null,
      first_name: user.user_metadata?.first_name ?? null,
      last_name: user.user_metadata?.last_name ?? null,
      phone: user.user_metadata?.phone ?? null,
      date_of_birth: user.user_metadata?.date_of_birth ?? null,
    };

    const { data: created, error: insertError } = await supabase
      .from('profiles')
      .insert(insertPayload)
      .select('id, user_id, email, username, first_name, last_name, phone, date_of_birth')
      .single();

    if (insertError) throw new Error(insertError.message || 'Failed to initialize profile');
    return created;
  }

  return data;
}

export async function updateUserProfile(profileData) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("User not authenticated.");

  // Try to update by user_id
  const { data: updated, error: updateError } = await supabase
    .from('profiles')
    .update({
      username: profileData.username ?? null,
      first_name: profileData.first_name ?? null,
      last_name: profileData.last_name ?? null,
      phone: profileData.phone ?? null,
    })
    .eq('user_id', user.id)
    .select('id')
    ;

  if (updateError) throw new Error(updateError.message);

  // If no row was updated, insert one
  if (!updated || updated.length === 0) {
    const { error: insertError } = await supabase
      .from('profiles')
      .insert({
        user_id: user.id,
        email: user.email ?? null,
        username: profileData.username ?? null,
        first_name: profileData.first_name ?? null,
        last_name: profileData.last_name ?? null,
        phone: profileData.phone ?? null,
      });
    if (insertError) throw new Error(insertError.message);
  }
}

// --- DATA ---

export async function savePresentation(presentationData) {
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
