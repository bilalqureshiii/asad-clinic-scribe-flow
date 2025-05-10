
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { User } from '@/types/patient';

interface AuthContextType {
  user: User | null;
  login: (role: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock user data
const mockUsers: Record<string, User> = {
  doctor: {
    id: 'doctor-1',
    username: 'doctor',
    name: 'Dr. Ahmed Khan',
    role: 'doctor',
  },
  staff: {
    id: 'staff-1',
    username: 'staff',
    name: 'Sara Ali',
    role: 'staff',
  },
  admin: {
    id: 'admin-1',
    username: 'admin',
    name: 'Admin User',
    role: 'admin',
  },
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  const login = (role: string) => {
    if (role in mockUsers) {
      setUser(mockUsers[role]);
    }
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
