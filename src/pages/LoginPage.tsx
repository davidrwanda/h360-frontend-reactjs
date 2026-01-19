import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { LoginForm } from '@/components/auth/LoginForm';

export const LoginPage = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // If already authenticated, redirect to intended page or dashboard
    if (isAuthenticated) {
      const from = (location.state as { from?: Location })?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location]);

  if (isAuthenticated) {
    return null; // Will redirect
  }

  return <LoginForm />;
};
