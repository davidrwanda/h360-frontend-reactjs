import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import { useClinicContextStore } from '@/store/clinicContextStore';
import { authApi } from '@/api/auth';
import type { LoginRequest, ChangePasswordRequest, User, UserRole } from '@/types/auth';
import { useNavigate } from 'react-router-dom';
import { useI18nStore } from '@/i18n/i18nStore';
import { SUPPORTED_LANGS } from '@/i18n/types';
import type { SupportedLang } from '@/i18n/types';

/**
 * Normalize role from API PascalCase (e.g. "OrgOwner", "NurseAssistant")
 * to frontend UPPER_SNAKE_CASE (e.g. "ORG_OWNER", "NURSE_ASSISTANT").
 *
 * Inserts underscores before uppercase letters that follow a lowercase letter,
 * then uppercases all. e.g. "OrgOwner" → "ORG_OWNER", "LabTechnician" → "LAB_TECHNICIAN"
 */
const normalizeRole = (role?: string): UserRole | undefined => {
  if (!role) return undefined;

  // PascalCase → UPPER_SNAKE_CASE
  const snaked = role.replace(/([a-z])([A-Z])/g, '$1_$2').toUpperCase();

  const validRoles: Record<string, UserRole> = {
    // Core
    'SYSTEM': 'SYSTEM',
    'PATIENT': 'PATIENT',
    // Organization
    'ORG_OWNER': 'ORG_OWNER',
    // Administrative
    'ADMIN': 'ADMIN',
    'MANAGER': 'MANAGER',
    'SUPERVISOR': 'SUPERVISOR',
    // Medical
    'DOCTOR': 'DOCTOR',
    'NURSE': 'NURSE',
    'NURSE_ASSISTANT': 'NURSE_ASSISTANT',
    'PHARMACIST': 'PHARMACIST',
    'PHARMACY_TECHNICIAN': 'PHARMACY_TECHNICIAN',
    // Support Staff
    'RECEPTIONIST': 'RECEPTIONIST',
    'OPERATOR': 'OPERATOR',
    'MEDICAL_ASSISTANT': 'MEDICAL_ASSISTANT',
    'LAB_TECHNICIAN': 'LAB_TECHNICIAN',
    'RADIOLOGIST': 'RADIOLOGIST',
    'RADIOLOGY_TECHNICIAN': 'RADIOLOGY_TECHNICIAN',
    'PHYSIOTHERAPIST': 'PHYSIOTHERAPIST',
    // Admin Support
    'HR': 'HR',
    'ACCOUNTANT': 'ACCOUNTANT',
    'ACCOUNTING_ASSISTANT': 'ACCOUNTING_ASSISTANT',
    'STOCK_MANAGER': 'STOCK_MANAGER',
    'STOCK_ASSISTANT': 'STOCK_ASSISTANT',
    'IT_SUPPORT': 'IT_SUPPORT',
    // General Support
    'SECURITY': 'SECURITY',
    'CLEANER': 'CLEANER',
    'MAINTENANCE': 'MAINTENANCE',
    'DRIVER': 'DRIVER',
    // Fallback
    'STAFF': 'STAFF',
  };

  return validRoles[snaked] || undefined;
};

/**
 * Map permissions/user_type to role for navigation filtering
 */
const mapUserToRole = (user: User | null): UserRole | undefined => {
  if (!user) return undefined;
  
  // If user has explicit role, normalize and use it FIRST
  // This handles cases where patients have role: "Patient" (capitalized)
  // Cast to string to handle API returning "Admin" instead of "ADMIN"
  if (user.role) {
    const normalized = normalizeRole(String(user.role));
    if (normalized) return normalized;
  }
  
  // Check employee object for role if available (from /api/auth/me)
  if (user.employee?.role) {
    const normalized = normalizeRole(String(user.employee.role));
    if (normalized) return normalized;
  }
  
  // Check employee_profile for role if available (legacy support)
  if (user.employee_profile?.role) {
    const normalized = normalizeRole(String(user.employee_profile.role));
    if (normalized) return normalized;
  }
  
  // Check if user_type indicates PATIENT
  if (user.user_type === 'PATIENT') {
    return 'PATIENT';
  }
  
  // If permissions is ALL, treat as ADMIN
  if (user.permissions === 'ALL') return 'ADMIN';
  
  // If SYSTEM user, treat as ADMIN
  if (user.user_type === 'SYSTEM') return 'ADMIN';
  
  // Default fallback
  return undefined;
};

/**
 * Decode JWT payload to extract fields not present in the login response user object
 * (e.g. organization_id). Returns null on failure.
 */
const decodeJwtPayload = (token: string | null): Record<string, unknown> | null => {
  if (!token) return null;
  try {
    const parts = token.split('.');
    if (parts.length !== 3 || !parts[1]) return null;
    const payload = JSON.parse(atob(parts[1]));
    return payload;
  } catch {
    return null;
  }
};

/**
 * Hook to get current authentication state
 */
export const useAuth = () => {
  const { user, token, refreshToken, isAuthenticated, isLoading: storeLoading } = useAuthStore();

  // Always fetch current user from /api/auth/me if token exists
  // This ensures we have the latest user data including full_name, first_name, last_name
  const { data: currentUser, isLoading: queryLoading } = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: authApi.getMe,
    enabled: !!token,
    retry: false,
    // Use the fetched user data if available, otherwise fall back to stored user
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
  });

  // Prefer currentUser from API over stored user to ensure we have latest data
  const currentUserData = currentUser || user || null;

  // Extract organization_id from JWT if not present on user object
  // The login response user often lacks organization_id but the JWT payload has it
  const jwtPayload = decodeJwtPayload(token);
  const jwtOrgId = jwtPayload?.organization_id as string | undefined;

  // Ensure user has username (use email if username not available)
  const normalizedUser = currentUserData
    ? {
        ...currentUserData,
        username: currentUserData.username || currentUserData.email,
        // Merge organization_id from JWT if not already on the user or employee
        organization_id: currentUserData.organization_id || currentUserData.employee?.organization_id || jwtOrgId || null,
      }
    : null;

  return {
    user: normalizedUser,
    token,
    refreshToken,
    isAuthenticated: isAuthenticated || !!currentUser,
    isLoading: storeLoading || queryLoading,
    // Helper to get role for navigation
    role: mapUserToRole(normalizedUser),
  };
};

/**
 * Hook for login functionality
 */
export const useLogin = (options?: { skipNavigation?: boolean }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { login, setIsLoading } = useAuthStore();
  const setLang = useI18nStore((s) => s.setLang);

  return useMutation({
    mutationFn: (credentials: LoginRequest) => authApi.login(credentials),
    onMutate: () => {
      setIsLoading(true);
    },
    onSuccess: (data) => {
      // Store tokens in localStorage
      localStorage.setItem('access_token', data.access_token);
      localStorage.setItem('refresh_token', data.refresh_token);

      // Set language from user's preferred_lang if valid
      if (data.user.preferred_lang && SUPPORTED_LANGS.includes(data.user.preferred_lang as SupportedLang)) {
        setLang(data.user.preferred_lang as SupportedLang);
      }

      // Normalize user data (ensure username exists)
      const normalizedUser = {
        ...data.user,
        username: data.user.username || data.user.email,
      };

      // Update auth store
      login(normalizedUser, data.access_token, data.refresh_token);

      // Invalidate and refetch user data from /api/auth/me to get complete patient/employee data
      // This ensures we get the full user object with nested patient/employee profiles
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
      queryClient.refetchQueries({ queryKey: ['auth', 'me'] });

      // Navigate to dashboard only if navigation is not skipped
      if (!options?.skipNavigation) {
        navigate('/dashboard', { replace: true, state: { fromLogin: true } });
      }
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
  const { logout: storeLogout, refreshToken } = useAuthStore();
  const clearActiveClinic = useClinicContextStore((s) => s.clearActiveClinic);

  const doLogout = () => {
    storeLogout();
    clearActiveClinic();
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    queryClient.clear();
    navigate('/login', { replace: true });
  };

  return useMutation({
    mutationFn: () => authApi.logout(refreshToken || undefined),
    onSuccess: doLogout,
    onError: doLogout,
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

/**
 * Hook for forgot password (request OTP)
 */
export const useForgotPassword = () => {
  return useMutation({
    mutationFn: (email: string) => authApi.forgotPassword(email),
  });
};

/**
 * Hook for reset password with OTP
 */
export const useResetPassword = () => {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (data: {
      email: string;
      otp_code: string;
      new_password: string;
      confirm_password: string;
    }) => authApi.resetPassword(data),
    onSuccess: () => {
      // Navigate to login after successful password reset
      navigate('/login', { replace: true });
    },
  });
};

/**
 * Hook for fetching current user's organization memberships.
 * GET /api/auth/me/memberships
 */
export const useMyMemberships = (options?: { enabled?: boolean }) => {
  const { isAuthenticated } = useAuthStore();
  return useQuery({
    queryKey: ['auth', 'memberships'],
    queryFn: authApi.getMemberships,
    enabled: isAuthenticated && (options?.enabled !== false),
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Hook for accepting an organization invitation.
 * Server returns JWT — caller handles login via onSuccess.
 */
export const useAcceptInvitation = () => {
  return useMutation({
    mutationFn: (data: {
      token: string;
      email: string;
      first_name: string;
      last_name: string;
      password: string;
      phone?: string;
    }) => authApi.acceptInvitation(data),
  });
};
