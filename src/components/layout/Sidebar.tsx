import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/auth';
import { User, FileText, UserPlus, Calendar, Settings, LogOut, X } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';
import { useGlobalSettings } from '@/hooks/useGlobalSettings';
interface SidebarProps {
  onClose?: () => void;
}
const Sidebar: React.FC<SidebarProps> = ({
  onClose
}) => {
  const {
    profile,
    logout
  } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [logo, setLogo] = useState<string | null>(null);
  const isMobile = useIsMobile();
  const {
    settings
  } = useGlobalSettings();

  // Load the logo from global settings
  useEffect(() => {
    if (settings?.logo_url) {
      setLogo(settings.logo_url);
    }
  }, [settings]);
  const isActive = (path: string) => {
    return location.pathname === path;
  };
  const handleLogout = async () => {
    console.log('Logout initiated from sidebar, user role:', profile?.role);
    if (onClose) {
      onClose();
    }
    try {
      // Call the logout function from AuthContext
      await logout();
      // Navigation is now handled within the logout function
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };
  const NavItem: React.FC<{
    href: string;
    icon: React.ReactNode;
    children: React.ReactNode;
  }> = ({
    href,
    icon,
    children
  }) => {
    return <Link to={href} onClick={onClose} className={cn("flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all", isActive(href) ? "bg-sidebar-accent text-sidebar-accent-foreground" : "text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground")}>
        {icon}
        <span>{children}</span>
      </Link>;
  };
  return <div className="flex flex-col h-full p-4 text-sidebar-foreground w-full border-r border-slate-200 bg-[#4c9146]">
      {isMobile && <div className="flex justify-between items-center mb-4">
          <h2 className="font-semibold">Menu</h2>
          <Button variant="ghost" size="icon" onClick={onClose} className="text-white hover:bg-sidebar-accent">
            <X className="h-5 w-5" />
          </Button>
        </div>}
      
      <div className="py-4 mb-10">
        {logo ? <div className="flex justify-center mb-3">
            <Avatar className="h-16 w-16">
              <AvatarImage src={logo} alt="Organization Logo" className="object-cover" />
              <AvatarFallback>Logo</AvatarFallback>
            </Avatar>
          </div> : <h1 className="text-xl font-bold text-center mb-3">Al-Asad Clinic</h1>}
        {profile && <div className="mt-2 text-center text-sm opacity-75">
            <div>Logged in as:</div>
            <div className="font-semibold">{profile.name}</div>
            <div className="capitalize">{profile.role}</div>
          </div>}
      </div>

      <nav className="space-y-1 flex-1">
        <NavItem href="/dashboard" icon={<Calendar className="h-4 w-4" />}>
          Dashboard
        </NavItem>
        
        <NavItem href="/patients" icon={<User className="h-4 w-4" />}>
          Patients
        </NavItem>
        
        <NavItem href="/prescriptions" icon={<FileText className="h-4 w-4" />}>
          Prescriptions
        </NavItem>
        
        {(profile?.role === 'staff' || profile?.role === 'admin') && <NavItem href="/registration" icon={<UserPlus className="h-4 w-4" />}>
            New Registration
          </NavItem>}
        
        {profile?.role === 'admin' && <NavItem href="/settings" icon={<Settings className="h-4 w-4" />}>
            Settings
          </NavItem>}
      </nav>
      
      <div className="border-t border-sidebar-border pt-4 mt-auto">
        <button onClick={handleLogout} className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm w-full text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground" data-testid="logout-button">
          <LogOut className="h-4 w-4" />
          <span>Logout</span>
        </button>
      </div>
    </div>;
};
export default Sidebar;