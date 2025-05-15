import React, { useState } from 'react';
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
import { useUploadThing } from "@/utils/uploadthing";

const OrganizationBranding: React.FC = () => {
  const { settings, saveSettings, isAdmin } = useGlobalSettings();
  const [logoUrl, setLogoUrl] = useState<string | null>(settings?.logo_url || null);
  const [isSaving, setIsSaving] = useState(false);
  const { startUpload } = useUploadThing("imageUploader");

  const onFileChange = async (files?: File[]) => {
    if (!files) return;

    setIsSaving(true);
    try {
      const uploaded = await startUpload(files);
      if (uploaded && uploaded.length > 0) {
        const newLogoUrl = uploaded[0].url;
        setLogoUrl(newLogoUrl);
        await saveSettings({ logo_url: newLogoUrl });
        toast({
          title: 'Logo updated',
          description: 'Organization logo has been updated successfully.',
        });
      } else {
        toast({
          title: 'Upload failed',
          description: 'Failed to upload the logo. Please try again.',
          variant: 'destructive',
        });
      }
    } catch (e: any) {
      toast({
        title: 'Error',
        description: e.message || 'Something went wrong during upload.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemoveLogo = async () => {
    setIsSaving(true);
    try {
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
