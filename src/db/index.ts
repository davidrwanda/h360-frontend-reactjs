import Dexie, { Table } from 'dexie';

// Define interfaces for IndexedDB tables
export interface Patient {
  id: string;
  patient_id: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  clinic_id?: string;
  synced_at?: Date;
  [key: string]: unknown;
}

export interface Appointment {
  id: string;
  appointment_id: string;
  patient_id?: string;
  doctor_id: string;
  clinic_id: string;
  appointment_date: string;
  appointment_time: string;
  synced_at?: Date;
  [key: string]: unknown;
}

export interface Doctor {
  id: string;
  doctor_id: string;
  first_name: string;
  last_name: string;
  clinic_id: string;
  synced_at?: Date;
  [key: string]: unknown;
}

export interface Clinic {
  id: string;
  clinic_id: string;
  name: string;
  synced_at?: Date;
  [key: string]: unknown;
}

// Database class
class H360Database extends Dexie {
  patients!: Table<Patient>;
  appointments!: Table<Appointment>;
  doctors!: Table<Doctor>;
  clinics!: Table<Clinic>;

  constructor() {
    super('H360Database');
    
    // Define schema
    this.version(1).stores({
      patients: 'id, patient_id, patient_number, email, phone, clinic_id, synced_at',
      appointments: 'id, appointment_id, patient_id, doctor_id, clinic_id, appointment_date, synced_at',
      doctors: 'id, doctor_id, clinic_id, synced_at',
      clinics: 'id, clinic_id, synced_at',
    });
  }
}

// Create and export database instance
export const db = new H360Database();

// Helper function to check if data is stale (older than 5 minutes)
export function isStale(syncedAt?: Date): boolean {
  if (!syncedAt) return true;
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
  return syncedAt < fiveMinutesAgo;
}
