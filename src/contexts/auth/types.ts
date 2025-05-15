
import { Session, User } from '@supabase/supabase-js';

export interface UserProfile {
  id: string;
  username: string | null;
  name: string;
  role: 'doctor' | 'staff' | 'admin';
}

export interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  session: Session | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string, role?: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: (userId: string) => Promise<void>;
}
