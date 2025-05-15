
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { UserProfile } from './types';

// Helper function to fetch and set user profile
export const fetchProfile = async (userId: string): Promise<UserProfile | null> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching profile:', error);
      return null;
    } else {
      // Dispatch a custom event that other components can listen for
      window.dispatchEvent(new CustomEvent('profileLoaded', { 
        detail: { profileId: userId }
      }));
      
      return data as UserProfile;
    }
  } catch (error) {
    console.error('Profile fetch error:', error);
    return null;
  }
};

// Authentication methods
export const login = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw error;
    }

    toast({
      title: 'Login successful',
      description: 'You have been logged in successfully',
    });
  } catch (error: any) {
    toast({
      title: 'Login failed',
      description: error.message || 'An error occurred during login',
      variant: 'destructive',
    });
    throw error;
  }
};

export const signup = async (email: string, password: string, name: string, role: string = 'staff') => {
  try {
    // Validate that role is one of the allowed values
    const validRole = ['doctor', 'staff', 'admin'].includes(role) ? role : 'staff';
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          role: validRole,
        },
      },
    });

    if (error) {
      throw error;
    }

    toast({
      title: 'Signup successful',
      description: 'Your account has been created. You may need to verify your email before continuing.',
    });
  } catch (error: any) {
    toast({
      title: 'Signup failed',
      description: error.message || 'An error occurred during signup',
      variant: 'destructive',
    });
    throw error;
  }
};

export const logout = async () => {
  try {
    console.log('Logout initiated from authService');
    
    // First clear local state to ensure UI updates immediately
    clearAuthState();
    
    // Then send logout request to Supabase
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      throw error;
    }
    
    console.log('Supabase logout successful');
    
    // Force a full page reload rather than using React Router navigation
    window.location.href = '/';
    
    toast({
      title: 'Logged out',
      description: 'You have been logged out successfully',
    });
  } catch (error: any) {
    console.error('Logout error:', error);
    toast({
      title: 'Logout failed',
      description: error.message || 'An error occurred during logout',
      variant: 'destructive',
    });
    
    // Even if the API call fails, clear local state and redirect
    clearAuthState();
    window.location.href = '/';
  }
};

// Clear all auth state and local data
export const clearAuthState = () => {
  console.log('Clearing auth state');
  
  // Clear auth token from local storage
  localStorage.removeItem('sb-izksnjgriegahapwyakp-auth-token');
  
  // Clear any other app-specific cached data
  sessionStorage.clear();
};
