import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export interface UserSettings {
  id?: string;
  user_id: string;
  sidebar_color?: string | null;
  background_color?: string | null;
  primary_color?: string | null;
}

export const useUserSettings = () => {
  const auth = useAuth(); // Now this hook will be used outside the AuthProvider
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(true);

  // Load settings from database
  const loadSettings = useCallback(async () => {
    if (!auth.user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', auth.user.id)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned" error code
        console.error('Error loading settings:', error);
        toast({
          title: 'Failed to load settings',
          description: error.message,
          variant: 'destructive',
        });
      } else if (data) {
        setSettings(data);
        applySettings(data);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  }, [auth.user]);

  // Save settings to database
  const saveSettings = async (newSettings: Partial<UserSettings>) => {
    if (!auth.user) return false;

    try {
      const updatedSettings = {
        ...newSettings,
        user_id: auth.user.id,
      };

      // Check if settings exist
      const { data: existingSettings } = await supabase
        .from('user_settings')
        .select('id')
        .eq('user_id', auth.user.id)
        .single();

      let result;
      
      if (existingSettings) {
        // Update existing settings
        result = await supabase
          .from('user_settings')
          .update(updatedSettings)
          .eq('user_id', auth.user.id);
      } else {
        // Insert new settings
        result = await supabase
          .from('user_settings')
          .insert(updatedSettings);
      }

      const { error } = result;
      
      if (error) {
        throw error;
      }

      // Immediately apply settings to DOM
      if (newSettings.sidebar_color || newSettings.background_color || newSettings.primary_color) {
        applySettings({
          ...settings,
          ...newSettings,
          user_id: auth.user.id
        });
      }

      // Reload settings
      await loadSettings();
      
      return true;
    } catch (error: any) {
      console.error('Error saving settings:', error);
      toast({
        title: 'Failed to save settings',
        description: error.message,
        variant: 'destructive',
      });
      return false;
    }
  };

  // Apply settings to CSS variables
  const applySettings = (settings: UserSettings) => {
    if (settings.sidebar_color) {
      document.documentElement.style.setProperty('--sidebar-background', hexToHsl(settings.sidebar_color));
    }
    
    if (settings.background_color) {
      document.documentElement.style.setProperty('--background', hexToHsl(settings.background_color));
    }
    
    if (settings.primary_color) {
      document.documentElement.style.setProperty('--primary', hexToHsl(settings.primary_color));
    }
  };

  // Convert hex color to HSL format for CSS variables
  const hexToHsl = (hex: string): string => {
    // Convert hex to RGB
    let r = 0, g = 0, b = 0;
    
    // 3 digits
    if (hex.length === 4) {
      r = parseInt(hex[1] + hex[1], 16);
      g = parseInt(hex[2] + hex[2], 16);
      b = parseInt(hex[3] + hex[3], 16);
    } 
    // 6 digits
    else if (hex.length === 7) {
      r = parseInt(hex.slice(1, 3), 16);
      g = parseInt(hex.slice(3, 5), 16);
      b = parseInt(hex.slice(5, 7), 16);
    }
    
    // Convert RGB to HSL
    r /= 255;
    g /= 255;
    b /= 255;
    
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;
    
    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      
      h *= 60;
    }
    
    return `${Math.round(h)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
  };

  // Listen for profile loaded events
  useEffect(() => {
    const handleProfileLoaded = () => {
      if (auth.user) {
        loadSettings();
      }
    };

    window.addEventListener('profileLoaded', handleProfileLoaded);
    
    // Also load settings when user changes
    if (auth.user?.id) {
      loadSettings();
    }
    
    return () => {
      window.removeEventListener('profileLoaded', handleProfileLoaded);
    };
  }, [auth.user?.id, loadSettings]);

  return {
    settings,
    loading,
    saveSettings,
    loadSettings,
    applySettings
  };
};
