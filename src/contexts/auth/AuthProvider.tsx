
import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { UserProfile, AuthContextType } from './types';
import { fetchProfile, login, signup, logout, clearAuthState } from './authService';

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Create a public method to refresh the profile that can be called by other components
  const refreshProfile = async (userId: string) => {
    try {
      const profileData = await fetchProfile(userId);
      setProfile(profileData);
    } catch (error) {
      console.error('Error refreshing profile:', error);
    }
  };

  useEffect(() => {
    // First check for existing session to prevent initial flash of login screen
    const initializeAuth = async () => {
      try {
        setIsLoading(true);
        
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        
        if (currentSession) {
          console.log('Session found on initialization');
          setSession(currentSession);
          setUser(currentSession.user);
          
          if (currentSession.user) {
            const profileData = await fetchProfile(currentSession.user.id);
            setProfile(profileData);
          }
        } else {
          console.log('No active session found');
          clearAuthState();
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        clearAuthState();
      } finally {
        setIsLoading(false);
      }
    };
    
    initializeAuth();
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        console.log('Auth state changed:', event, 'User ID:', currentSession?.user?.id);
        
        if (event === 'SIGNED_IN' && currentSession) {
          setSession(currentSession);
          setUser(currentSession.user);
          
          // Use setTimeout to prevent Supabase deadlocks
          setTimeout(async () => {
            if (currentSession.user) {
              const profileData = await fetchProfile(currentSession.user.id);
              setProfile(profileData);
            }
          }, 0);
        } else if (event === 'SIGNED_OUT') {
          console.log('SIGNED_OUT event detected, clearing state');
          clearAuthState();
          setUser(null);
          setSession(null);
          setProfile(null);
        } else if (event === 'TOKEN_REFRESHED' && currentSession) {
          console.log('Token refreshed, updating session');
          setSession(currentSession);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        session,
        isAuthenticated: !!user,
        login,
        signup,
        logout,
        refreshProfile,
      }}
    >
      {!isLoading && children}
    </AuthContext.Provider>
  );
};
