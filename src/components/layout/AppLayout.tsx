
import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useAuth } from '@/contexts/auth';
import LoginPage from '@/pages/LoginPage';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';
import { Preloader } from '@/components/ui/preloader';

const AppLayout: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const isMobile = useIsMobile();
  const [showSidebar, setShowSidebar] = useState(false);

  if (isLoading) {
    return <Preloader text="Loading application..." />;
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <div className="flex h-screen flex-col md:flex-row">
      {/* Mobile Header */}
      {isMobile && (
        <div className="bg-sidebar flex items-center justify-between p-3 text-sidebar-foreground">
          <div className="flex items-center">
            <Button 
              variant="ghost" 
              size="icon"
              className="mr-2 text-white hover:bg-sidebar-accent"
              onClick={() => setShowSidebar(!showSidebar)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <span className="font-semibold">Al-Asad Clinic</span>
          </div>
        </div>
      )}

      {/* Sidebar - conditional display on mobile */}
      <div className={`
        ${isMobile ? (showSidebar ? 'block fixed inset-0 z-50' : 'hidden') : 'block w-64'} 
        md:relative md:block md:h-screen
      `}>
        {isMobile && showSidebar && (
          <div 
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={() => setShowSidebar(false)}
          />
        )}
        <div className={`
          ${isMobile ? 'w-64 h-full z-50 fixed' : 'w-full h-full'} 
          relative
        `}>
          <Sidebar onClose={() => setShowSidebar(false)} />
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-background p-3 md:p-6">
        <Outlet />
      </main>
    </div>
  );
};

export default AppLayout;
