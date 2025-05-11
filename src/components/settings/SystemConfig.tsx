
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/components/ui/use-toast';
import { Separator } from '@/components/ui/separator';
import { Loader2 } from 'lucide-react';

// This would normally come from your database
interface SystemSettings {
  clinicName: string;
  enableAppointments: boolean;
  enablePayments: boolean;
  allowPatientRegistration: boolean;
  requireEmailVerification: boolean;
}

// For this demo, we'll use localStorage to persist settings
// In a real app, you'd store these in your Supabase database
const SETTINGS_KEY = 'al_asad_clinic_settings';

const SystemConfig: React.FC = () => {
  const [settings, setSettings] = useState<SystemSettings>({
    clinicName: 'Al-Asad Clinic',
    enableAppointments: false,
    enablePayments: true,
    allowPatientRegistration: true,
    requireEmailVerification: false
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Load settings from localStorage (in a real app, this would be from Supabase)
  useEffect(() => {
    const savedSettings = localStorage.getItem(SETTINGS_KEY);
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
    setLoading(false);
  }, []);

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      // In a real app, this would be a Supabase update operation
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      toast({
        title: 'Settings Saved',
        description: 'Your system configuration has been updated successfully.'
      });
    } catch (error: any) {
      console.error('Error saving settings:', error);
      toast({
        title: 'Error Saving Settings',
        description: error.message || 'An unexpected error occurred',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (key: keyof SystemSettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>System Configuration</CardTitle>
        <CardDescription>
          Configure system-wide settings for the clinic application.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* General Settings */}
          <div>
            <h3 className="text-lg font-medium">General Settings</h3>
            <Separator className="my-2" />
            
            <div className="space-y-4 mt-4">
              <div className="grid w-full items-center gap-2">
                <Label htmlFor="clinicName">Clinic Name</Label>
                <Input 
                  id="clinicName"
                  value={settings.clinicName}
                  onChange={(e) => handleChange('clinicName', e.target.value)}
                />
              </div>
            </div>
          </div>
          
          {/* Feature Toggles */}
          <div>
            <h3 className="text-lg font-medium">Feature Toggles</h3>
            <Separator className="my-2" />
            
            <div className="space-y-4 mt-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="enableAppointments">Enable Appointments</Label>
                  <p className="text-sm text-muted-foreground">
                    Allow scheduling and managing appointments
                  </p>
                </div>
                <Switch 
                  id="enableAppointments"
                  checked={settings.enableAppointments}
                  onCheckedChange={(checked) => handleChange('enableAppointments', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="enablePayments">Enable Payments</Label>
                  <p className="text-sm text-muted-foreground">
                    Allow payment processing for prescriptions
                  </p>
                </div>
                <Switch 
                  id="enablePayments"
                  checked={settings.enablePayments}
                  onCheckedChange={(checked) => handleChange('enablePayments', checked)}
                />
              </div>
            </div>
          </div>
          
          {/* Security Settings */}
          <div>
            <h3 className="text-lg font-medium">Security Settings</h3>
            <Separator className="my-2" />
            
            <div className="space-y-4 mt-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="allowPatientRegistration">Allow Patient Registration</Label>
                  <p className="text-sm text-muted-foreground">
                    Allow staff users to register new patients
                  </p>
                </div>
                <Switch 
                  id="allowPatientRegistration"
                  checked={settings.allowPatientRegistration}
                  onCheckedChange={(checked) => handleChange('allowPatientRegistration', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="requireEmailVerification">Require Email Verification</Label>
                  <p className="text-sm text-muted-foreground">
                    Require users to verify email before login
                  </p>
                </div>
                <Switch 
                  id="requireEmailVerification"
                  checked={settings.requireEmailVerification}
                  onCheckedChange={(checked) => handleChange('requireEmailVerification', checked)}
                />
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-6 flex justify-end">
          <Button 
            onClick={handleSaveSettings} 
            disabled={saving}
          >
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default SystemConfig;
