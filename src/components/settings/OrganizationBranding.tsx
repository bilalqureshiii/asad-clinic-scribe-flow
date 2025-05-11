
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/components/ui/use-toast';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { ImagePlus, AlertCircle, Loader2, Palette } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useUserSettings } from '@/hooks/useUserSettings';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

// Maximum file size and allowed file types
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB in bytes
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/svg+xml'];
const ALLOWED_FILE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.svg'];

// Color palette options
const colorOptions = [
  // Neutral colors
  '#FFFFFF', '#F1F0FB', '#D3E4FD', '#E5DEFF', '#FFDEE2', '#FDE1D3', '#FEC6A1', '#FEF7CD', '#F2FCE2',
  // Light colors
  '#C8C8C9', '#9F9EA1', '#8A898C', '#8E9196', '#AAADB0', '#33C3F0', '#0EA5E9', '#1EAEDB', '#0FA0CE',
  // Bold colors
  '#9b87f5', '#7E69AB', '#6E59A5', '#8B5CF6', '#D946EF', '#F97316', '#ea384c', '#403E43', '#1A1F2C',
  // Dark colors
  '#221F26', '#333333', '#555555', '#222222', '#888888', '#999999', '#000000', '#222', '#333'
];

const OrganizationBranding: React.FC = () => {
  const { user } = useAuth();
  const { settings, loading: settingsLoading, saveSettings } = useUserSettings();
  
  const [logo, setLogo] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Color customization states
  const [sidebarColor, setSidebarColor] = useState<string>('#1A365D'); // Default sidebar color
  const [backgroundColor, setBackgroundColor] = useState<string>('#F1F0FB'); // Default background color
  const [primaryColor, setPrimaryColor] = useState<string>('#20B2AA'); // Default primary color

  useEffect(() => {
    if (!settingsLoading) {
      // Set logo and colors from database settings
      if (settings) {
        if (settings.logo_url) {
          setLogo(settings.logo_url);
        }
        
        if (settings.sidebar_color) {
          setSidebarColor(settings.sidebar_color);
        }
        
        if (settings.background_color) {
          setBackgroundColor(settings.background_color);
        }
        
        if (settings.primary_color) {
          setPrimaryColor(settings.primary_color);
        }
      }
      
      setLoading(false);
    }
  }, [settings, settingsLoading]);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    // Reset errors
    setError(null);

    // Check file type
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      setError(`Invalid file type. Please upload ${ALLOWED_FILE_EXTENSIONS.join(', ')} files only.`);
      return;
    }

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      setError(`File is too large. Maximum size is 5MB.`);
      return;
    }

    setUploading(true);

    try {
      // Create a unique filename for storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `logos/${fileName}`;

      // Read the file and create a data URL for preview
      const reader = new FileReader();
      reader.onload = async (e) => {
        const result = e.target?.result as string;
        setLogo(result);
        
        // Save the logo URL to database
        const success = await saveSettings({ 
          logo_url: result
        });
        
        if (success) {
          toast({
            title: "Logo Updated",
            description: "Your organization logo has been updated successfully."
          });
        }
        
        setUploading(false);
      };

      reader.onerror = () => {
        setError("Failed to read the file. Please try again.");
        setUploading(false);
      };

      reader.readAsDataURL(file);
    } catch (error: any) {
      setError(error.message || "Failed to upload logo. Please try again.");
      setUploading(false);
    }
  };

  const handleRemoveLogo = async () => {
    setLogo(null);
    
    // Save the removal to database
    const success = await saveSettings({ logo_url: null });
    
    if (success) {
      toast({
        title: "Logo Removed",
        description: "Your organization logo has been removed."
      });
    }
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };
  
  // Handle color change for different UI elements
  const handleColorChange = async (colorType: string, value: string) => {
    switch (colorType) {
      case 'sidebar':
        setSidebarColor(value);
        document.documentElement.style.setProperty('--sidebar-background', hexToHsl(value));
        
        await saveSettings({ sidebar_color: value });
        
        toast({
          title: "Sidebar Color Updated",
          description: "Your sidebar color has been updated."
        });
        break;
        
      case 'background':
        setBackgroundColor(value);
        document.documentElement.style.setProperty('--background', hexToHsl(value));
        
        await saveSettings({ background_color: value });
        
        toast({
          title: "Background Color Updated",
          description: "Your background color has been updated."
        });
        break;
        
      case 'primary':
        setPrimaryColor(value);
        document.documentElement.style.setProperty('--primary', hexToHsl(value));
        
        await saveSettings({ primary_color: value });
        
        toast({
          title: "Primary Color Updated",
          description: "Your primary accent color has been updated."
        });
        break;
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

  if (loading || settingsLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Organization Branding</CardTitle>
        <CardDescription>
          Update your organization's logo and color scheme.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          {/* Logo Section */}
          <div>
            <h3 className="text-lg font-medium">Organization Logo</h3>
            <Separator className="my-2" />
            
            <div className="mt-4 space-y-4">
              <div className="flex flex-col gap-4 md:flex-row md:items-end">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium">Logo Preview</label>
                  <div className="flex h-32 w-32 items-center justify-center rounded-full border border-dashed">
                    {logo ? (
                      <Avatar className="h-28 w-28">
                        <AvatarImage src={logo} alt="Organization Logo" />
                        <AvatarFallback>Logo</AvatarFallback>
                      </Avatar>
                    ) : (
                      <div className="flex flex-col items-center justify-center text-sm text-muted-foreground">
                        <ImagePlus className="mb-2 h-8 w-8" />
                        <span>No logo uploaded</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex flex-col gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".jpg,.jpeg,.png,.svg,image/jpeg,image/png,image/svg+xml"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <div className="space-y-2">
                    <Button 
                      onClick={triggerFileInput}
                      disabled={uploading}
                      className="w-full sm:w-auto"
                    >
                      {uploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      {logo ? 'Change Logo' : 'Upload Logo'}
                    </Button>
                    {logo && (
                      <Button 
                        variant="outline" 
                        onClick={handleRemoveLogo}
                        className="w-full sm:w-auto"
                      >
                        Remove Logo
                      </Button>
                    )}
                  </div>
                </div>
              </div>
              
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              <div className="text-sm text-muted-foreground">
                <p>Supported file formats: JPG, PNG, SVG</p>
                <p>Maximum file size: 5MB</p>
              </div>
            </div>
          </div>

          {/* Color Customization Section */}
          <div>
            <h3 className="text-lg font-medium flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Color Customization
            </h3>
            <Separator className="my-2" />

            {/* Sidebar Color */}
            <div className="mt-6 space-y-4">
              <div>
                <h4 className="font-medium mb-2">Side Navbar Color</h4>
                <div className="flex flex-col space-y-2">
                  <div className="flex items-center gap-2 mb-2">
                    <div 
                      className="h-6 w-6 rounded-full border border-gray-300" 
                      style={{ backgroundColor: sidebarColor }}
                    />
                    <span className="text-sm">{sidebarColor}</span>
                  </div>
                  <div className="grid grid-cols-6 sm:grid-cols-9 gap-2">
                    {colorOptions.map((color) => (
                      <button
                        key={`sidebar-${color}`}
                        type="button"
                        onClick={() => handleColorChange('sidebar', color)}
                        className={`h-8 w-8 rounded-full border-2 ${
                          sidebarColor === color ? 'border-ring' : 'border-transparent'
                        } hover:scale-110 transition-transform`}
                        style={{ backgroundColor: color }}
                        title={color}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Background Color */}
              <div>
                <h4 className="font-medium mb-2">Background Color</h4>
                <div className="flex flex-col space-y-2">
                  <div className="flex items-center gap-2 mb-2">
                    <div 
                      className="h-6 w-6 rounded-full border border-gray-300" 
                      style={{ backgroundColor: backgroundColor }}
                    />
                    <span className="text-sm">{backgroundColor}</span>
                  </div>
                  <div className="grid grid-cols-6 sm:grid-cols-9 gap-2">
                    {colorOptions.map((color) => (
                      <button
                        key={`background-${color}`}
                        type="button"
                        onClick={() => handleColorChange('background', color)}
                        className={`h-8 w-8 rounded-full border-2 ${
                          backgroundColor === color ? 'border-ring' : 'border-transparent'
                        } hover:scale-110 transition-transform`}
                        style={{ backgroundColor: color }}
                        title={color}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Primary Button/Accent Color */}
              <div>
                <h4 className="font-medium mb-2">Primary Button/Accent Color</h4>
                <div className="flex flex-col space-y-2">
                  <div className="flex items-center gap-2 mb-2">
                    <div 
                      className="h-6 w-6 rounded-full border border-gray-300" 
                      style={{ backgroundColor: primaryColor }}
                    />
                    <span className="text-sm">{primaryColor}</span>
                  </div>
                  <div className="grid grid-cols-6 sm:grid-cols-9 gap-2">
                    {colorOptions.map((color) => (
                      <button
                        key={`primary-${color}`}
                        type="button"
                        onClick={() => handleColorChange('primary', color)}
                        className={`h-8 w-8 rounded-full border-2 ${
                          primaryColor === color ? 'border-ring' : 'border-transparent'
                        } hover:scale-110 transition-transform`}
                        style={{ backgroundColor: color }}
                        title={color}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 p-4 bg-muted rounded-md">
              <h4 className="font-medium mb-2">Live Preview</h4>
              <div className="flex space-x-2">
                <Button size="sm">Primary Button</Button>
                <Button size="sm" variant="outline">Outline Button</Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default OrganizationBranding;
