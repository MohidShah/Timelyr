import { supabase } from './supabase';
import type { UserProfile, NotificationPreferences } from './supabase';

// Create user profile
export const createUserProfile = async (userId: string, profileData: {
  email: string;
  display_name: string;
  username?: string;
}): Promise<UserProfile> => {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .insert({
        id: userId,
        email: profileData.email,
        display_name: profileData.display_name,
        username: profileData.username || null,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating user profile:', error);
      throw error;
    }
    return data;
  } catch (error) {
    console.error('Failed to create user profile:', error);
    throw error;
  }
};

// Get user profile
export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  try {
    // Check if we're in mock mode
    const isMockMode = !import.meta.env.VITE_SUPABASE_URL || 
                      !import.meta.env.VITE_SUPABASE_ANON_KEY || 
                      import.meta.env.VITE_USE_MOCK_DB === 'true';
    
    if (isMockMode) {
      console.log('Mock: Getting user profile for', userId);
      return null;
    }

    // Add timeout to prevent hanging
    const profilePromise = supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();
      
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Profile fetch timeout')), 3000)
    );

    const { data, error } = await Promise.race([
      profilePromise,
      timeoutPromise
    ]) as any;

    if (error) {
      // Check if it's a permission error (403)
      if (error.code === '42501' || error.message?.includes('permission denied')) {
        console.warn('Permission denied for user profile, this is expected in demo mode');
      } else {
        console.warn('Error fetching user profile:', error);
      }
      return null;
    }

    return data;
  } catch (error) {
    console.warn('Failed to get user profile:', error);
    return null;
  }
};

// Update user profile
export const updateUserProfile = async (userId: string, updates: Partial<UserProfile>): Promise<UserProfile> => {
  const { data, error } = await supabase
    .from('user_profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Check username availability
export const checkUsernameAvailability = async (username: string, currentUserId?: string) => {
  // Validate format
  const usernameRegex = /^[a-zA-Z0-9_-]{3,50}$/;
  if (!usernameRegex.test(username)) {
    return { 
      available: false, 
      error: 'Username must be 3-50 characters and contain only letters, numbers, underscores, and hyphens' 
    };
  }

  // Check availability
  let query = supabase
    .from('user_profiles')
    .select('id')
    .eq('username', username.toLowerCase());

  if (currentUserId) {
    query = query.neq('id', currentUserId);
  }

  const { data, error } = await query.single();

  if (error && error.code !== 'PGRST116') {
    throw error;
  }

  return { 
    available: !data, 
    error: data ? 'Username is already taken' : null 
  };
};

// Generate username suggestions
export const generateUsernameSuggestions = async (displayName: string): Promise<string[]> => {
  const baseUsername = displayName
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 30);

  const suggestions = [baseUsername];

  // Add numbered variations
  for (let i = 1; i <= 5; i++) {
    suggestions.push(`${baseUsername}${i}`);
    suggestions.push(`${baseUsername}-${i}`);
  }

  // Add random suffix variations
  const suffixes = ['dev', 'pro', 'user', 'time', 'zone'];
  suffixes.forEach(suffix => {
    suggestions.push(`${baseUsername}-${suffix}`);
  });

  // Check availability for each suggestion
  const availableSuggestions = [];
  for (const suggestion of suggestions) {
    const { available } = await checkUsernameAvailability(suggestion);
    if (available) {
      availableSuggestions.push(suggestion);
    }
    if (availableSuggestions.length >= 5) break;
  }

  return availableSuggestions;
};

// Upload avatar
export const uploadAvatar = async (userId: string, file: File): Promise<string> => {
  const fileExt = file.name.split('.').pop();
  const fileName = `${userId}/avatar.${fileExt}`;

  // Upload to Supabase Storage
  const { data, error } = await supabase.storage
    .from('avatars')
    .upload(fileName, file, { upsert: true });

  if (error) throw error;

  // Get public URL
  const { data: urlData } = supabase.storage
    .from('avatars')
    .getPublicUrl(fileName);

  // Update profile with new avatar URL
  await updateUserProfile(userId, { avatar_url: urlData.publicUrl });

  return urlData.publicUrl;
};

// Get notification preferences
export const getNotificationPreferences = async (userId: string): Promise<NotificationPreferences | null> => {
  const { data, error } = await supabase
    .from('notification_preferences')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error && error.code !== 'PGRST116') {
    throw error;
  }

  return data;
};

// Update notification preferences
export const updateNotificationPreferences = async (
  userId: string, 
  preferences: Partial<NotificationPreferences>
): Promise<NotificationPreferences> => {
  const { data, error } = await supabase
    .from('notification_preferences')
    .upsert({
      user_id: userId,
      ...preferences,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Delete user account and all associated data
export const deleteUserAccount = async (userId: string) => {
  // Check if we're in mock mode
  const isMockMode = !import.meta.env.VITE_SUPABASE_URL || import.meta.env.VITE_USE_MOCK_DB === 'true';
  
  if (isMockMode) {
    console.log('Mock: Deleting user account:', userId);
    // In mock mode, just sign out
    await supabase.auth.signOut();
    return;
  }
  
  // Delete in order due to foreign key constraints
  const tables = [
    'link_analytics',
    'user_notifications',
    'user_preferences', 
    'support_tickets',
    'user_activity_log',
    'user_feedback',
    'link_templates', 
    'user_sessions',
    'notification_preferences',
    'timezone_links',
    'user_profiles'
  ];

  for (const table of tables) {
    try {
      const { error } = await supabase
        .from(table)
        .delete()
        .eq('user_id', userId);

      if (error) {
        console.error(`Error deleting from ${table}:`, error);
      }
    } catch (error) {
      console.error(`Error deleting from ${table}:`, error);
    }
  }

  // Delete avatar from storage
  try {
    const { error: storageError } = await supabase.storage
      .from('avatars')
      .remove([`${userId}/avatar.jpg`, `${userId}/avatar.png`, `${userId}/avatar.jpeg`]);

    if (storageError) {
      console.error('Error deleting avatar:', storageError);
    }
  } catch (error) {
    console.error('Error deleting avatar:', error);
  }

  // Sign out the user
  await supabase.auth.signOut();
};