import { supabase } from '@/integrations/supabase/client';

/**
 * Helper function to check if a user session is valid
 */
export async function checkSession() {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw error;
    return !!session;
  } catch (error) {
    console.error('Error checking session:', error);
    return false;
  }
}

/**
 * Helper function to refresh the user session
 */
export async function refreshSession() {
  try {
    const { data, error } = await supabase.auth.refreshSession();
    if (error) {
      throw error;
    }
    return {
      success: true,
      session: data.session,
      user: data.user,
    };
  } catch (error) {
    console.error('Error refreshing session:', error);
    return {
      success: false,
      error,
    };
  }
}

/**
 * Helper function to get a user's profile from the profiles table
 */
export async function getUserProfile(userId: string) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
      
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
}

/**
 * Helper function to create a user profile if it doesn't exist
 */
export async function createUserProfile(userId: string, userData: { full_name: string; role?: 'user' | 'admin' }) {
  try {
    // First check if profile exists
    const { count, error: countError } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('id', userId);
      
    if (countError) throw countError;
    
    // If profile doesn't exist, create it
    if (count === 0) {
      const { data, error } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          full_name: userData.full_name,
          role: userData.role || 'user'
        })
        .select('*')
        .single();
        
      if (error) throw error;
      return { created: true, profile: data };
    }
    
    // Profile exists, just return it
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
      
    if (error) throw error;
    return { created: false, profile: data };
  } catch (error) {
    console.error('Error in createUserProfile:', error);
    return { created: false, error };
  }
}

/**
 * Helper function to debug auth state
 */
export function setupAuthDebugger() {
  const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
    console.log('Auth state change event:', event);
    console.log('Session user:', session?.user?.id);
    console.log('Session expires:', session?.expires_at 
      ? new Date(session.expires_at * 1000).toLocaleString() 
      : 'No expiration');
  });
  
  return subscription;
} 