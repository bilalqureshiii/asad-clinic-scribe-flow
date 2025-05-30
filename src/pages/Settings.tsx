import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/auth';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Shield } from 'lucide-react';
import UserRoleManagement from '@/components/settings/UserRoleManagement';
import SystemConfig from '@/components/settings/SystemConfig';
import OrganizationBranding from '@/components/settings/OrganizationBranding';
import PrescriptionTemplate from '@/components/settings/PrescriptionTemplate';
const Settings: React.FC = () => {
  const {
    profile
  } = useAuth();
  const [activeTab, setActiveTab] = useState('roles');

  // Check if user has admin role
  const isAdmin = profile?.role === 'admin';

  // If not admin, show access denied
  if (!isAdmin) {
    return <div className="container mx-auto p-4">
        <Alert variant="destructive" className="mb-4">
          <Shield className="h-4 w-4" />
          <AlertTitle>Access Denied</AlertTitle>
          <AlertDescription>
            You don't have permission to access this page. Please contact an administrator if you need access.
          </AlertDescription>
        </Alert>
      </div>;
  }
  return <div className="container mx-auto p-4">
      <h1 className="font-bold mb-6 text-4xl text-[#195110]">Settings & Administration</h1>
      
      <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="roles">User Roles</TabsTrigger>
          <TabsTrigger value="system">System Configuration</TabsTrigger>
          <TabsTrigger value="branding">Branding</TabsTrigger>
          <TabsTrigger value="prescription">Prescription Template</TabsTrigger>
        </TabsList>
        
        <TabsContent value="roles">
          <UserRoleManagement />
        </TabsContent>
        
        <TabsContent value="system">
          <SystemConfig />
        </TabsContent>
        
        <TabsContent value="branding">
          <OrganizationBranding />
        </TabsContent>
        
        <TabsContent value="prescription">
          <PrescriptionTemplate />
        </TabsContent>
      </Tabs>
    </div>;
};
export default Settings;