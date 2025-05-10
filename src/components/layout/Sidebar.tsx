
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { User, FileText, UserPlus, Calendar, Settings, LogOut } from 'lucide-react';

const Sidebar: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const NavItem: React.FC<{ href: string; icon: React.ReactNode; children: React.ReactNode }> = ({ 
    href, 
    icon, 
    children 
  }) => {
    return (
      <Link
        to={href}
        className={cn(
          "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all",
          isActive(href) 
            ? "bg-sidebar-accent text-sidebar-accent-foreground" 
            : "text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
        )}
      >
        {icon}
        <span>{children}</span>
      </Link>
    );
  };

  return (
    <div className="flex flex-col h-full bg-sidebar p-4 text-sidebar-foreground w-64 border-r border-slate-200">
      <div className="py-4 mb-10">
        <h1 className="text-xl font-bold text-center">Al-Asad Clinic</h1>
        {user && (
          <div className="mt-2 text-center text-sm opacity-75">
            <div>Logged in as:</div>
            <div className="font-semibold">{user.name}</div>
            <div className="capitalize">{user.role}</div>
          </div>
        )}
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
        
        {(user?.role === 'staff' || user?.role === 'admin') && (
          <NavItem href="/registration" icon={<UserPlus className="h-4 w-4" />}>
            New Registration
          </NavItem>
        )}
        
        {user?.role === 'admin' && (
          <NavItem href="/settings" icon={<Settings className="h-4 w-4" />}>
            Settings
          </NavItem>
        )}
      </nav>
      
      <div className="border-t border-sidebar-border pt-4 mt-auto">
        <button
          onClick={logout}
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm w-full text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
        >
          <LogOut className="h-4 w-4" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
