import React, { useState, useEffect } from 'react';
import LoginForm from '@/components/auth/LoginForm';
import { useAuth } from '@/contexts/auth';
import { useGlobalSettings } from '@/hooks/useGlobalSettings';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
const LoginPage: React.FC = () => {
  const {
    login
  } = useAuth();
  const {
    settings
  } = useGlobalSettings();
  const [logo, setLogo] = useState<string | null>(null);

  // Load the logo from global settings
  useEffect(() => {
    if (settings?.logo_url) {
      setLogo(settings.logo_url);
    } else {
      // Try to get from localStorage as fallback
      const storedLogo = localStorage.getItem('organization_logo');
      if (storedLogo) {
        setLogo(storedLogo);
      }
    }
  }, [settings]);
  return <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-clinic-light to-white p-4">
      <div>
        <div className="mb-8 text-center">
          {logo ? <div className="flex justify-center mb-4">
              <Avatar className="h-24 w-24 border-2 border-[#195110]">
                <AvatarImage src={logo} alt="Al-Asad Clinic Logo" className="object-cover" />
                <AvatarFallback className="bg-[#195110] text-white text-lg">AC</AvatarFallback>
              </Avatar>
            </div> : <h1 className="text-3xl font-bold text-clinic-navy mb-2">Al-Asad Clinic</h1>}
          <p className="font-bold text-[#195110] text-2xl">Al - Asad Clinic</p>
        </div>
        <LoginForm />
      </div>
    </div>;
};
export default LoginPage;