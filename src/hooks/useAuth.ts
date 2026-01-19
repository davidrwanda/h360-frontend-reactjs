import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import { authApi } from '@/api/auth';
import type { LoginRequest, ChangePasswordRequest, User, UserRole } from '@/types/auth';
import { useNavigate } from 'react-router-dom';

/**
 * Map permissions/user_type to role for navigation filtering
 */
const mapUserToRole = (user: User | null): UserRole | undefined => {
  if (!user) return undefined;
  
  // If user has explicit role, use it
  if (user.role) return user.role;
  
  // If permissions is ALL, treat as ADMIN
  if (user.permissions === 'ALL') return 'ADMIN';
  
  // If SYSTEM user, treat as ADMIN
  if (user.user_type === 'SYSTEM') return 'ADMIN';
  
  // Default fallback
  return undefined;
};

/**
 * Hook to get current authentication state
 */
export const useAuth = () => {
  const { user, token, isAuthenticated, isLoading: storeLoading } = useAuthStore();

  // Fetch current user if token exists but user is not loaded
  const { data: currentUser, isLoading: queryLoading } = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: authApi.getMe,
    enabled: !!token && !user,
    retry: false,
  });

  const currentUserData = user || currentUser || null;
  
  // Ensure user has username (use email if username not available)
  const normalizedUser = currentUserData
    ? {
        ...currentUserData,
        username: currentUserData.username || currentUserData.email,
      }
    : null;

  return {
    user: normalizedUser,
    token,
    isAuthenticated: isAuthenticated || !!currentUser,
    isLoading: storeLoading || queryLoading,
    // Helper to get role for navigation
    role: mapUserToRole(normalizedUser),
  };
};

/**
 * Hook for login functionality
 */
export const useLogin = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { login, setIsLoading } = useAuthStore();

  return useMutation({
    mutationFn: (credentials: LoginRequest) => authApi.login(credentials),
    onMutate: () => {
      setIsLoading(true);
    },
    onSuccess: (data) => {
      // Store token in localStorage
      localStorage.setItem('token', data.access_token);
      
      // Normalize user data (ensure username exists)
      const normalizedUser = {
        ...data.user,
        username: data.user.username || data.user.email,
      };
      
      // Update auth store
      login(normalizedUser, data.access_token);
      
      // Invalidate and refetch user data
      queryClient.setQueryData(['auth', 'me'], normalizedUser);
      
      // Navigate to dashboard
      navigate('/dashboard', { replace: true });
    },
    onError: (error: Error) => {
      console.error('Login error:', error);
      setIsLoading(false);
      // Re-throw error so component can handle it
      throw error;
    },
    onSettled: () => {
      setIsLoading(false);
    },
  });
};

/**
 * Hook for logout functionality
 */
export const useLogout = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { logout: storeLogout } = useAuthStore();

  return useMutation({
    mutationFn: () => authApi.logout(),
    onSuccess: () => {
      // Clear auth store
      storeLogout();
      
      // Clear token from localStorage
      localStorage.removeItem('token');
      
      // Clear all queries
      queryClient.clear();
      
      // Navigate to login
      navigate('/login', { replace: true });
    },
    onError: () => {
      // Even if API call fails, logout locally
      storeLogout();
      localStorage.removeItem('token');
      queryClient.clear();
      navigate('/login', { replace: true });
    },
  });
};

/**
 * Hook for changing password
 */
export const useChangePassword = () => {
  return useMutation({
    mutationFn: (data: ChangePasswordRequest) => authApi.changePassword(data),
  });
};
