
import React from 'react';
import LoginForm from '@/components/auth/LoginForm';
import { useAuth } from '@/contexts/AuthContext';

const LoginPage: React.FC = () => {
  const { login } = useAuth();

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-clinic-light to-white p-4">
      <div>
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-clinic-navy mb-2">Al-Asad Clinic</h1>
          <p className="text-gray-600">Management System</p>
        </div>
        <LoginForm onLogin={login} />
      </div>
    </div>
  );
};

export default LoginPage;
