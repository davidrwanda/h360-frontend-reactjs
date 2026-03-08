import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ClinicContextState {
  /** The clinic currently selected as the active workspace */
  activeClinicId: string | null;
  activeClinicName: string | null;
  setActiveClinic: (clinicId: string, clinicName?: string) => void;
  clearActiveClinic: () => void;
}

export const useClinicContextStore = create<ClinicContextState>()(
  persist(
    (set) => ({
      activeClinicId: null,
      activeClinicName: null,
      setActiveClinic: (clinicId, clinicName) =>
        set({ activeClinicId: clinicId, activeClinicName: clinicName ?? null }),
      clearActiveClinic: () => set({ activeClinicId: null, activeClinicName: null }),
    }),
    { name: 'h360-clinic-context' }
  )
);
