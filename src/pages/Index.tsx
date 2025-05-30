
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/auth';

const Index = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    // Automatically redirect to the dashboard if authenticated
    if (isAuthenticated) {
      console.log('User is authenticated, redirecting to dashboard');
      navigate('/dashboard');
    } else {
      // If not authenticated, the AppLayout will show the login page
      console.log('Not authenticated, showing login page');
    }
  }, [isAuthenticated, navigate]);

  return null;
};

export default Index;
