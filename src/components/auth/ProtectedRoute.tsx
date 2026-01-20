import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Loading } from '@/components/ui';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: string[];
}

export const ProtectedRoute = ({ children, requiredRole }: ProtectedRouteProps) => {
  const { isAuthenticated, user, role, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loading size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect to login page with return url
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role-based access
  // SYSTEM users and Admin role users have full access to all routes
  // Normalize role for comparison (handle both "Admin" and "ADMIN")
  const normalizedRole = role?.toUpperCase();
  const hasFullAccess = user?.user_type === 'SYSTEM' || user?.permissions === 'ALL' || normalizedRole === 'ADMIN';
  
  // If user has full access, grant access immediately
  if (hasFullAccess) {
    return <>{children}</>;
  }
  
  // Otherwise, check role-based access
  if (requiredRole && normalizedRole) {
    const normalizedRequiredRoles = requiredRole.map(r => r.toUpperCase());
    if (!normalizedRequiredRoles.includes(normalizedRole)) {
      return (
        <div className="flex min-h-screen items-center justify-center p-4">
          <div className="text-center">
            <h1 className="text-h2 text-smudged-lips mb-4">Access Denied</h1>
            <p className="text-body text-carbon/70">
              You don't have permission to access this page.
            </p>
            {(user?.user_type === 'SYSTEM' || normalizedRole === 'ADMIN') && (
              <p className="mt-2 text-sm text-carbon/50">
                System users and Admin role users can access all clinic and employee management features.
              </p>
            )}
          </div>
        </div>
      );
    }
  }

  return <>{children}</>;
};
