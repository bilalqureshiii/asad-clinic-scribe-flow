
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/components/ui/use-toast';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { ImagePlus, AlertCircle, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

// This would normally be stored in your database
// For this demo, we'll use localStorage
const LOGO_STORAGE_KEY = 'al_asad_clinic_logo';
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB in bytes
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/svg+xml'];
const ALLOWED_FILE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.svg'];

const OrganizationBranding: React.FC = () => {
  const [logo, setLogo] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Load logo from localStorage
    const savedLogo = localStorage.getItem(LOGO_STORAGE_KEY);
    if (savedLogo) {
      setLogo(savedLogo);
    }
    setLoading(false);
  }, []);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

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

    // Read the file and create a data URL
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setLogo(result);
      
      // In a real app, you would upload the file to a server here
      // For this demo, we'll just store it in localStorage
      localStorage.setItem(LOGO_STORAGE_KEY, result);
      
      setUploading(false);
      toast({
        title: "Logo Updated",
        description: "Your organization logo has been updated successfully."
      });
    };

    reader.onerror = () => {
      setError("Failed to read the file. Please try again.");
      setUploading(false);
    };

    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = () => {
    setLogo(null);
    localStorage.removeItem(LOGO_STORAGE_KEY);
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    
    toast({
      title: "Logo Removed",
      description: "Your organization logo has been removed."
    });
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
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
        <CardTitle>Organization Branding</CardTitle>
        <CardDescription>
          Update your organization's logo and branding settings.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium">Organization Logo</h3>
            <Separator className="my-2" />
            
            <div className="mt-4 space-y-4">
              <div className="flex flex-col gap-4 md:flex-row md:items-end">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium">Logo Preview</label>
                  <div className="flex h-32 w-32 items-center justify-center rounded-md border border-dashed">
                    {logo ? (
                      <div className="relative h-28 w-28">
                        <img 
                          src={logo} 
                          alt="Organization Logo" 
                          className="h-full w-full object-contain"
                        />
                      </div>
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
        </div>
      </CardContent>
    </Card>
  );
};

export default OrganizationBranding;
