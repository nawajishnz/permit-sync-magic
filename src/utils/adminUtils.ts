import { supabase } from "@/integrations/supabase/client";

/**
 * Set a user's role to admin
 * @param userId The user ID to make an admin
 * @returns Promise<boolean> Success status
 */
export const setUserAsAdmin = async (userId: string): Promise<boolean> => {
  try {
    console.log('Setting user as admin:', userId);
    
    // First check if profile exists
    const { data: existingProfile, error: checkError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (checkError) {
      console.log('Profile check error:', checkError);
    }
    
    const profileData = {
      id: userId,
      role: 'admin' as const,
      updated_at: new Date().toISOString()
    };
    
    // Try direct upsert approach first - this handles both create and update cases
    console.log('Attempting direct upsert for admin profile');
    const { error: upsertError } = await supabase
      .from('profiles')
      .upsert({
        ...profileData,
        full_name: existingProfile?.full_name || 'Admin User',
        // Only set created_at if it's a new profile
        ...(existingProfile ? {} : { created_at: new Date().toISOString() })
      });
    
    if (upsertError) {
      console.error('Error upserting admin profile:', upsertError);
      
      // Fallback to specific update or insert based on error
      if (existingProfile) {
        console.log('Fallback: Updating existing profile');
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ 
            role: 'admin',
            updated_at: new Date().toISOString()
          })
          .eq('id', userId);
          
        if (updateError) {
          console.error('Fallback update also failed:', updateError);
          return false;
        }
      } else {
        console.log('Fallback: Creating new profile');
        const { error: insertError } = await supabase
          .from('profiles')
          .insert({
            ...profileData,
            full_name: 'Admin User',
            created_at: new Date().toISOString()
          });
          
        if (insertError) {
          console.error('Fallback insert also failed:', insertError);
          return false;
        }
      }
    }
    
    // Verify the admin role was set correctly with a small delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const { data: verifyProfile, error: verifyError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();
      
    if (verifyError) {
      console.error('Error verifying admin role:', verifyError);
      return false;
    }
      
    if (verifyProfile?.role !== 'admin') {
      console.error('Failed to verify admin role:', verifyProfile);
      
      // One last direct attempt
      console.log('Making final direct attempt to set admin role');
      const { error: finalError } = await supabase
        .from('profiles')
        .update({ role: 'admin' })
        .eq('id', userId);
        
      if (finalError) {
        console.error('Final update attempt failed:', finalError);
        return false;
      }
      
      // Check one more time
      const { data: finalCheck } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();
        
      if (finalCheck?.role !== 'admin') {
        return false;
      }
    }
    
    console.log('Successfully set user as admin');
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
 * @returns Promise<{success: boolean, message: string}>
 */
export const createAdminUser = async (
  email: string, 
  password: string, 
  fullName: string = "Admin User"
): Promise<{success: boolean, message: string}> => {
  try {
    console.log('Creating admin user with email:', email);
    
    // First check if the user already exists
    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (data?.user) {
      await supabase.auth.signOut(); // Sign out after checking
      console.log('User exists, updating as admin:', data.user.id);
      
      // First check if profile already has admin role
      const { data: profileData } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .single();
        
      if (profileData?.role === 'admin') {
        console.log('User already has admin role');
        return {
          success: true,
          message: 'User already exists as admin'
        };
      }
      
      const success = await setUserAsAdmin(data.user.id);
      return {
        success,
        message: success ? 'Existing user updated as admin' : 'Failed to update existing user as admin'
      };
    }
    
    // If login failed because user doesn't exist, create new user
    if (signInError) {
      console.log('User does not exist or auth error, creating new admin user:', signInError.message);
      
      // Create a new user
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          }
        }
      });
      
      if (signUpError) {
        console.error('Error creating admin user:', signUpError);
        return {
          success: false,
          message: `Failed to create admin user: ${signUpError.message}`
        };
      }
      
      if (!signUpData?.user) {
        console.error('User creation returned null user object');
        return {
          success: false,
          message: 'User creation failed, no user returned'
        };
      }
      
      // Wait briefly to ensure user is fully created in auth system
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('New user created, setting as admin:', signUpData.user.id);
      const success = await setUserAsAdmin(signUpData.user.id);
      
      // Do one more check to ensure admin role is set
      const { data: finalCheck } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', signUpData.user.id)
        .single();
        
      console.log('Final role check:', finalCheck);
      
      return {
        success: success && finalCheck?.role === 'admin',
        message: success ? 'New admin user created successfully' : 'Failed to set new user as admin'
      };
    }
    
    return {
      success: false,
      message: 'Unexpected error in admin user creation'
    };
  } catch (error) {
    console.error('Unexpected error in createAdminUser:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};
