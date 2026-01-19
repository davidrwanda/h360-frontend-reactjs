import { useMutation, useQueryClient } from '@tanstack/react-query';
import { clinicsApi, type CreateClinicRequest } from '@/api/clinics';
import { employeesApi, type CreateEmployeeRequest } from '@/api/employees';

interface CreateClinicWithAdminRequest {
  clinic: CreateClinicRequest;
  admin: {
    first_name: string;
    last_name: string;
    email: string;
    username: string;
    password: string;
    phone?: string;
    department?: string;
    position?: string;
  };
}

/**
 * Hook for creating a clinic and then creating an ADMIN employee for that clinic
 * This follows the flow: Create Clinic → Create Admin Employee for Clinic
 */
export const useCreateClinicWithAdmin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateClinicWithAdminRequest) => {
      // Step 1: Create clinic
      const clinic = await clinicsApi.create(data.clinic);

      // Step 2: Create ADMIN employee for the clinic
      const adminEmployee: CreateEmployeeRequest = {
        first_name: data.admin.first_name,
        last_name: data.admin.last_name,
        email: data.admin.email,
        username: data.admin.username,
        password: data.admin.password,
        role: 'ADMIN',
        clinic_id: clinic.clinic_id,
        phone: data.admin.phone,
        department: data.admin.department || 'Administration',
        position: data.admin.position || 'Clinic Administrator',
      };

      const employee = await employeesApi.create(adminEmployee);

      return {
        clinic,
        employee,
      };
    },
    onSuccess: () => {
      // Invalidate clinics and employees queries to refresh lists
      queryClient.invalidateQueries({ queryKey: ['clinics'] });
      queryClient.invalidateQueries({ queryKey: ['employees'] });
    },
    onError: (error) => {
      console.error('Error creating clinic with admin:', error);
      throw error;
    },
  });
};

/**
 * Hook for creating a clinic only
 */
export const useCreateClinic = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateClinicRequest) => clinicsApi.create(data),
    onSuccess: (_data) => {
      queryClient.invalidateQueries({ queryKey: ['clinics'] });
    },
  });
};

/**
 * Hook for creating an employee for a clinic
 */
export const useCreateEmployee = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateEmployeeRequest) => employeesApi.create(data),
    onSuccess: (_data) => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
    },
  });
};
