
import { supabase } from "@/integrations/supabase/client";

/**
 * Set a user's role to admin
 * @param userId The user ID to make an admin
 * @returns Promise<boolean> Success status
 */
export const setUserAsAdmin = async (userId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('profiles')
      .update({ role: 'admin' })
      .eq('id', userId);
      
    if (error) {
      console.error('Error setting user as admin:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Unexpected error in setUserAsAdmin:', error);
    return false;
  }
};

/**
 * Create an admin user for testing purposes
 * @param email Admin email
 * @param password Admin password
 * @param fullName Admin's full name
 * @returns Promise<boolean> Success status
 */
export const createAdminUser = async (
  email: string, 
  password: string, 
  fullName: string = "Admin User"
): Promise<boolean> => {
  try {
    // First try to sign up the user
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        }
      }
    });
    
    if (error) {
      console.error('Error creating admin user:', error);
      return false;
    }
    
    if (!data.user) {
      console.error('User creation failed, no user returned');
      return false;
    }
    
    // Then set the user as admin
    const success = await setUserAsAdmin(data.user.id);
    return success;
  } catch (error) {
    console.error('Unexpected error in createAdminUser:', error);
    return false;
  }
};
