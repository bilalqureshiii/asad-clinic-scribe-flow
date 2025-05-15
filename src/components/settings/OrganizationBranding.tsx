
import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/auth';
import { useGlobalSettings } from '@/hooks/useGlobalSettings';
import { toast } from '@/components/ui/use-toast';
import { ImageIcon } from 'lucide-react';

// Local storage key for the logo
const LOGO_STORAGE_KEY = 'organization_logo';

const OrganizationBranding: React.FC = () => {
  const { settings, saveSettings, isAdmin } = useGlobalSettings();
  const [logoUrl, setLogoUrl] = useState<string | null>(settings?.logo_url || null);
  const [isSaving, setIsSaving] = useState(false);

  // Load logo from localStorage on component mount
  useEffect(() => {
    const storedLogo = localStorage.getItem(LOGO_STORAGE_KEY);
    if (storedLogo && !logoUrl) {
      setLogoUrl(storedLogo);
    } else if (settings?.logo_url && !logoUrl) {
      setLogoUrl(settings.logo_url);
      // Save to localStorage for future use
      localStorage.setItem(LOGO_STORAGE_KEY, settings.logo_url);
    }
  }, [settings?.logo_url, logoUrl]);

  const onFileChange = async (files?: File[]) => {
    if (!files || files.length === 0) return;
    
    const file = files[0];
    setIsSaving(true);
    
    try {
      // Validate file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        throw new Error('File size exceeds 2MB limit');
      }
      
      // Validate file type
      const validTypes = ['image/jpeg', 'image/png', 'image/svg+xml', 'image/gif'];
      if (!validTypes.includes(file.type)) {
        throw new Error('Invalid file type. Only JPEG, PNG, SVG, and GIF are supported');
      }
      
      // Convert file to base64
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const base64String = e.target?.result as string;
          
          // Store in localStorage
          localStorage.setItem(LOGO_STORAGE_KEY, base64String);
          
          // Update state and settings
          setLogoUrl(base64String);
          await saveSettings({ logo_url: base64String });
          
          toast({
            title: 'Logo updated',
            description: 'Organization logo has been updated successfully.',
          });
        } catch (error: any) {
          toast({
            title: 'Error saving settings',
            description: error.message || 'Failed to save settings',
            variant: 'destructive',
          });
        } finally {
          setIsSaving(false);
        }
      };
      
      reader.onerror = () => {
        toast({
          title: 'Upload failed',
          description: 'Failed to read the image file.',
          variant: 'destructive',
        });
        setIsSaving(false);
      };
      
      reader.readAsDataURL(file);
    } catch (e: any) {
      toast({
        title: 'Error',
        description: e.message || 'Something went wrong during upload.',
        variant: 'destructive',
      });
      setIsSaving(false);
    }
  };

  const handleRemoveLogo = async () => {
    setIsSaving(true);
    try {
      // Remove from localStorage
      localStorage.removeItem(LOGO_STORAGE_KEY);
      
      // Update settings
      await saveSettings({ logo_url: null });
      setLogoUrl(null);
      toast({
        title: 'Logo removed',
        description: 'Organization logo has been removed.',
      });
    } catch (e: any) {
      toast({
        title: 'Error',
        description: e.message || 'Failed to remove logo.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Organization Branding</CardTitle>
        <CardDescription>
          Customize your clinic's branding by uploading a logo.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="flex items-center space-x-4">
          <div className="shrink-0 rounded-full overflow-hidden w-20 h-20 relative">
            {logoUrl ? (
              <img
                src={logoUrl}
                alt="Organization Logo"
                className="object-cover h-full w-full"
              />
            ) : (
              <div className="flex items-center justify-center h-full w-full bg-muted text-muted-foreground">
                <ImageIcon className="h-6 w-6" />
              </div>
            )}
          </div>
          <div>
            <Label htmlFor="logo-upload">Upload Logo</Label>
            <Input
              id="logo-upload"
              type="file"
              accept="image/*"
              disabled={!isAdmin || isSaving}
              className="hidden"
              onChange={(e: any) => onFileChange(e.target.files ? Array.from(e.target.files) : undefined)}
            />
            <div className="flex gap-2 mt-2">
              <Button
                variant="outline"
                asChild
                disabled={!isAdmin || isSaving}
              >
                <label htmlFor="logo-upload" className="cursor-pointer">
                  {isSaving ? 'Uploading...' : 'Choose File'}
                </label>
              </Button>
              {logoUrl && (
                <Button
                  variant="destructive"
                  onClick={handleRemoveLogo}
                  disabled={!isAdmin || isSaving}
                >
                  Remove Logo
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default OrganizationBranding;
