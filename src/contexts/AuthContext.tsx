
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { useUserSettings } from '@/hooks/useUserSettings';

interface UserProfile {
  id: string;
  username: string | null;
  name: string;
  role: 'doctor' | 'staff' | 'admin';
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string, role?: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Import the useUserSettings hook to apply settings when profile changes
  const { loadSettings } = useUserSettings();
  
  // Helper function to fetch and set user profile
  const fetchAndSetProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        setProfile(null);
      } else {
        setProfile(data as UserProfile);
        
        // Load user settings immediately when profile is set
        try {
          await loadSettings();
        } catch (settingsError) {
          console.error('Failed to load user settings:', settingsError);
        }
      }
    } catch (error) {
      console.error('Profile fetch error:', error);
      setProfile(null);
    }
  };

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        setIsLoading(true);

        if (currentSession?.user) {
          await fetchAndSetProfile(currentSession.user.id);
        } else {
          setProfile(null);
        }
        
        setIsLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      
      if (currentSession?.user) {
        fetchAndSetProfile(currentSession.user.id).then(() => {
          setIsLoading(false);
        });
      } else {
        setIsLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
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

  const signup = async (email: string, password: string, name: string, role: string = 'staff') => {
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

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: 'Logged out',
        description: 'You have been logged out successfully',
      });
    } catch (error: any) {
      toast({
        title: 'Logout failed',
        description: error.message || 'An error occurred during logout',
        variant: 'destructive',
      });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        session,
        isAuthenticated: !!user,
        isLoading,
        login,
        signup,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
