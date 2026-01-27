import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  clinicTimetablesApi,
  doctorTimetablesApi,
  type CreateTimetableRequest,
  type CreateTimetableFromStringRequest,
  type UpdateTimetableRequest,
  type InitializeDoctorTimetableRequest,
  type DayOfWeek,
} from '@/api/timetables';

// ==================== Clinic Timetables Hooks ====================

/**
 * Hook to fetch all clinic timetables
 */
export const useClinicTimetables = (clinicId: string | undefined) => {
  return useQuery({
    queryKey: ['clinics', clinicId, 'timetables'],
    queryFn: () => clinicTimetablesApi.list(clinicId!),
    enabled: !!clinicId,
    staleTime: 1 * 60 * 1000, // 1 minute
  });
};

/**
 * Hook to fetch clinic timetables for a specific day
 */
export const useClinicTimetablesByDay = (
  clinicId: string | undefined,
  dayOfWeek: DayOfWeek | undefined
) => {
  return useQuery({
    queryKey: ['clinics', clinicId, 'timetables', 'day', dayOfWeek],
    queryFn: () => clinicTimetablesApi.getByDay(clinicId!, dayOfWeek!),
    enabled: !!clinicId && !!dayOfWeek,
    staleTime: 1 * 60 * 1000,
  });
};

/**
 * Hook to fetch a single clinic timetable by ID
 */
export const useClinicTimetable = (clinicId: string | undefined, id: string | undefined) => {
  return useQuery({
    queryKey: ['clinics', clinicId, 'timetables', id],
    queryFn: () => clinicTimetablesApi.getById(clinicId!, id!),
    enabled: !!clinicId && !!id,
  });
};

/**
 * Hook to create a clinic timetable entry
 */
export const useCreateClinicTimetable = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      clinicId,
      data,
    }: {
      clinicId: string;
      data: CreateTimetableRequest;
    }) => clinicTimetablesApi.create(clinicId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['clinics', variables.clinicId, 'timetables'] });
    },
  });
};

/**
 * Hook to create a clinic timetable entry from time strings
 */
export const useCreateClinicTimetableFromString = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      clinicId,
      data,
    }: {
      clinicId: string;
      data: CreateTimetableFromStringRequest;
    }) => clinicTimetablesApi.createFromString(clinicId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['clinics', variables.clinicId, 'timetables'] });
    },
  });
};

/**
 * Hook to update a clinic timetable
 */
export const useUpdateClinicTimetable = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      clinicId,
      id,
      data,
    }: {
      clinicId: string;
      id: string;
      data: UpdateTimetableRequest;
    }) => clinicTimetablesApi.update(clinicId, id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['clinics', variables.clinicId, 'timetables'] });
      queryClient.invalidateQueries({
        queryKey: ['clinics', variables.clinicId, 'timetables', variables.id],
      });
    },
  });
};

/**
 * Hook to delete a clinic timetable
 */
export const useDeleteClinicTimetable = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ clinicId, id }: { clinicId: string; id: string }) =>
      clinicTimetablesApi.delete(clinicId, id),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['clinics', variables.clinicId, 'timetables'] });
    },
  });
};

// ==================== Doctor Timetables Hooks ====================

/**
 * Hook to fetch all doctor timetables
 */
export const useDoctorTimetables = (doctorId: string | undefined) => {
  return useQuery({
    queryKey: ['doctors', doctorId, 'timetables'],
    queryFn: () => doctorTimetablesApi.list(doctorId!),
    enabled: !!doctorId,
    staleTime: 1 * 60 * 1000,
  });
};

/**
 * Hook to fetch doctor timetables for a specific day
 */
export const useDoctorTimetablesByDay = (
  doctorId: string | undefined,
  dayOfWeek: DayOfWeek | undefined
) => {
  return useQuery({
    queryKey: ['doctors', doctorId, 'timetables', 'day', dayOfWeek],
    queryFn: () => doctorTimetablesApi.getByDay(doctorId!, dayOfWeek!),
    enabled: !!doctorId && !!dayOfWeek,
    staleTime: 1 * 60 * 1000,
  });
};

/**
 * Hook to fetch a single doctor timetable by ID
 */
export const useDoctorTimetable = (doctorId: string | undefined, id: string | undefined) => {
  return useQuery({
    queryKey: ['doctors', doctorId, 'timetables', id],
    queryFn: () => doctorTimetablesApi.getById(doctorId!, id!),
    enabled: !!doctorId && !!id,
  });
};

/**
 * Hook to create a doctor timetable entry
 */
export const useCreateDoctorTimetable = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      doctorId,
      data,
    }: {
      doctorId: string;
      data: CreateTimetableRequest;
    }) => doctorTimetablesApi.create(doctorId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['doctors', variables.doctorId, 'timetables'] });
    },
  });
};

/**
 * Hook to create a doctor timetable entry from time strings
 */
export const useCreateDoctorTimetableFromString = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      doctorId,
      data,
    }: {
      doctorId: string;
      data: CreateTimetableFromStringRequest;
    }) => doctorTimetablesApi.createFromString(doctorId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['doctors', variables.doctorId, 'timetables'] });
    },
  });
};

/**
 * Hook to initialize doctor timetable (bulk setup)
 */
export const useInitializeDoctorTimetable = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      doctorId,
      data,
    }: {
      doctorId: string;
      data: InitializeDoctorTimetableRequest;
    }) => doctorTimetablesApi.initialize(doctorId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['doctors', variables.doctorId, 'timetables'] });
    },
  });
};

/**
 * Hook to update a doctor timetable
 */
export const useUpdateDoctorTimetable = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      doctorId,
      id,
      data,
    }: {
      doctorId: string;
      id: string;
      data: UpdateTimetableRequest;
    }) => doctorTimetablesApi.update(doctorId, id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['doctors', variables.doctorId, 'timetables'] });
      queryClient.invalidateQueries({
        queryKey: ['doctors', variables.doctorId, 'timetables', variables.id],
      });
    },
  });
};

/**
 * Hook to delete a doctor timetable
 */
export const useDeleteDoctorTimetable = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ doctorId, id }: { doctorId: string; id: string }) =>
      doctorTimetablesApi.delete(doctorId, id),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['doctors', variables.doctorId, 'timetables'] });
    },
  });
};
