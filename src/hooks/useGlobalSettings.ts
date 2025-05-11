
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export interface GlobalSettings {
  id?: string;
  logo_url?: string | null;
}

export const useGlobalSettings = () => {
  const { profile } = useAuth();
  const [settings, setSettings] = useState<GlobalSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const isAdmin = profile?.role === 'admin';

  // Load settings from database
  const loadSettings = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('global_settings')
        .select('*')
        .limit(1)
        .single();

      if (error) {
        console.error('Error loading global settings:', error);
        toast({
          title: 'Failed to load global settings',
          description: error.message,
          variant: 'destructive',
        });
      } else if (data) {
        setSettings(data);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Save settings to database
  const saveSettings = async (newSettings: Partial<GlobalSettings>) => {
    if (!isAdmin) {
      toast({
        title: 'Permission denied',
        description: 'Only admins can update global settings',
        variant: 'destructive',
      });
      return false;
    }

    try {
      // Get the first record
      const { data: existingSettings } = await supabase
        .from('global_settings')
        .select('id')
        .limit(1)
        .single();

      let result;
      
      if (existingSettings) {
        // Update existing settings
        result = await supabase
          .from('global_settings')
          .update(newSettings)
          .eq('id', existingSettings.id);
      } else {
        // Insert new settings
        result = await supabase
          .from('global_settings')
          .insert(newSettings);
      }

      const { error } = result;
      
      if (error) {
        throw error;
      }

      // Reload settings
      await loadSettings();
      
      return true;
    } catch (error: any) {
      console.error('Error saving global settings:', error);
      toast({
        title: 'Failed to save global settings',
        description: error.message,
        variant: 'destructive',
      });
      return false;
    }
  };

  // Load settings on mount
  useEffect(() => {
    loadSettings();
  }, []);

  return {
    settings,
    loading,
    saveSettings,
    loadSettings,
    isAdmin
  };
};
