import {
  MdDashboard,
  MdPeople,
  MdLocalHospital,
  MdMedicalServices,
  MdEvent,
  MdQueue,
  MdBusiness,
  MdPerson,
  MdNotifications,
  MdHistory,
  MdSettings,
  MdInfo,
  MdAccountCircle,
  MdSchedule,
  MdCorporateFare,
  MdPayment,
  MdSearch,
  MdExtension,
} from 'react-icons/md';
import type { NavigationConfig } from '@/types/navigation';
import { NAVIGATION } from '@/i18n';

/**
 * Get navigation config with translations
 * @param t - Translation function
 * @returns Navigation config array with translated labels
 */
export const getNavigationConfig = (t: (key: string) => string): NavigationConfig => [
  {
    id: 'dashboard',
    label: t(NAVIGATION.DASHBOARD),
    path: '/dashboard',
    icon: MdDashboard,
  },
  {
    id: 'divider-1',
    label: '',
    path: '',
  },
  {
    id: 'clinics',
    label: t(NAVIGATION.CLINICS),
    path: '/clinics',
    icon: MdBusiness,
    roles: ['ADMIN'], // Only for SYSTEM/Admin users, not clinic managers
  },
  {
    id: 'clinic-info',
    label: t(NAVIGATION.CLINIC_INFO),
    path: '/clinic-info',
    icon: MdInfo,
    roles: ['MANAGER'], // Only for clinic managers/admins
  },
  {
    id: 'timetable',
    label: t(NAVIGATION.TIMETABLE),
    path: '/clinic-calendar',
    icon: MdSchedule,
    roles: ['MANAGER'], // Clinic and doctor schedules
  },
  {
    id: 'divider-2',
    label: '',
    path: '',
  },
  {
    id: 'patients',
    label: t(NAVIGATION.PATIENTS),
    path: '/patients',
    icon: MdPeople,
    roles: ['ADMIN', 'MANAGER', 'RECEPTIONIST', 'DOCTOR', 'NURSE'],
  },
  {
    id: 'doctors',
    label: t(NAVIGATION.DOCTORS),
    path: '/doctors',
    icon: MdLocalHospital,
    roles: ['ADMIN', 'MANAGER', 'RECEPTIONIST', 'DOCTOR'],
  },
  {
    id: 'services',
    label: t(NAVIGATION.SERVICES),
    path: '/services',
    icon: MdMedicalServices,
    roles: ['ADMIN', 'MANAGER', 'RECEPTIONIST'],
  },
  {
    id: 'divider-3',
    label: '',
    path: '',
  },
  {
    id: 'appointments',
    label: t(NAVIGATION.APPOINTMENTS),
    path: '/appointments',
    icon: MdEvent,
    roles: ['ADMIN', 'MANAGER', 'RECEPTIONIST', 'DOCTOR', 'NURSE'],
  },
  {
    id: 'my-appointments',
    label: t(NAVIGATION.MY_APPOINTMENTS),
    path: '/my-appointments',
    icon: MdEvent,
    roles: ['PATIENT'],
  },
  {
    id: 'my-profile',
    label: t(NAVIGATION.MY_PROFILE),
    path: '/my-profile',
    icon: MdAccountCircle,
    roles: ['PATIENT'],
  },
  {
    id: 'queue',
    label: t(NAVIGATION.QUEUE),
    path: '/queue',
    icon: MdQueue,
    roles: ['ADMIN', 'MANAGER', 'RECEPTIONIST', 'DOCTOR', 'NURSE'],
  },
  {
    id: 'users',
    label: t(NAVIGATION.USERS),
    path: '/users',
    icon: MdPerson,
    roles: ['ADMIN', 'MANAGER'], // Only for clinic admins/managers, not system admins
  },
  {
    id: 'divider-4',
    label: '',
    path: '',
  },
  {
    id: 'notifications',
    label: t(NAVIGATION.NOTIFICATIONS),
    path: '/notifications',
    icon: MdNotifications,
    roles: ['ADMIN', 'MANAGER', 'RECEPTIONIST'],
  },
  {
    id: 'activity-logs',
    label: t(NAVIGATION.ACTIVITY_LOGS),
    path: '/activity-logs',
    icon: MdHistory,
    roles: ['ADMIN', 'MANAGER'],
  },
  {
    id: 'divider-5',
    label: '',
    path: '',
  },
  {
    id: 'settings',
    label: t(NAVIGATION.SETTINGS),
    path: '/settings',
    icon: MdSettings,
  },
];

/**
 * Filter navigation items based on user role and user type
 * @param userRole - User's role
 * @param userType - User type (SYSTEM | EMPLOYEE)
 * @param t - Translation function
 * @returns Filtered navigation config
 */
export const getFilteredNavigation = (
  userRole?: string,
  userType?: 'SYSTEM' | 'EMPLOYEE' | string,
  t?: (key: string) => string
): NavigationConfig => {
  // Default translation function if not provided (returns key as-is)
  const translate = t || ((key: string) => key);
  
  // Get navigation config with translations
  const navigationConfig = getNavigationConfig(translate);
  
  // Debug logging
  if (import.meta.env.DEV) {
    console.log('getFilteredNavigation called with:', { userRole, userType });
  }
  
  if (!userRole) {
    if (import.meta.env.DEV) {
      console.warn('getFilteredNavigation: userRole is empty/undefined');
    }
    return [];
  }

  // Normalize role: PascalCase → UPPER_SNAKE_CASE (e.g. "OrgOwner" → "ORG_OWNER")
  const normalizedRole = userRole?.replace(/([a-z])([A-Z])/g, '$1_$2').toUpperCase();
  
  // Debug logging
  if (import.meta.env.DEV) {
    console.log('getFilteredNavigation normalizedRole:', normalizedRole);
  }
  
  // Patient-specific menu: Dashboard, My Appointments, My Profile, Settings
  // Check this FIRST before other role checks
  if (normalizedRole === 'PATIENT') {
    if (import.meta.env.DEV) {
      console.log('getFilteredNavigation: Returning patient menu');
    }
    const patientMenu: NavigationConfig = [
      { id: 'dashboard', label: translate(NAVIGATION.DASHBOARD), path: '/dashboard', icon: MdDashboard },
      { id: 'divider-1', label: '', path: '' },
      { id: 'my-appointments', label: translate(NAVIGATION.MY_APPOINTMENTS), path: '/my-appointments', icon: MdEvent },
      { id: 'divider-2', label: '', path: '' },
      { id: 'my-profile', label: translate(NAVIGATION.MY_PROFILE), path: '/my-profile', icon: MdAccountCircle },
      { id: 'divider-3', label: '', path: '' },
      { id: 'settings', label: translate(NAVIGATION.SETTINGS), path: '/settings', icon: MdSettings },
    ];
    return patientMenu;
  }

  // Doctor-specific menu: Dashboard, Appointments, Patients, Services, Queue, Profile, Settings
  if (normalizedRole === 'DOCTOR') {
    if (import.meta.env.DEV) {
      console.log('getFilteredNavigation: Returning doctor menu');
    }
    const doctorMenu: NavigationConfig = [
      { id: 'dashboard', label: translate(NAVIGATION.DASHBOARD), path: '/dashboard', icon: MdDashboard },
      { id: 'divider-1', label: '', path: '' },
      { id: 'appointments', label: translate(NAVIGATION.APPOINTMENTS), path: '/appointments', icon: MdEvent },
      { id: 'divider-2', label: '', path: '' },
      { id: 'patients', label: translate(NAVIGATION.PATIENTS), path: '/patients', icon: MdPeople },
      { id: 'services', label: translate(NAVIGATION.SERVICES), path: '/services', icon: MdMedicalServices },
      { id: 'divider-3', label: '', path: '' },
      { id: 'queue', label: translate(NAVIGATION.QUEUE), path: '/queue', icon: MdQueue },
      { id: 'divider-4', label: '', path: '' },
      { id: 'my-profile', label: translate(NAVIGATION.PROFILE), path: '/my-profile', icon: MdAccountCircle },
      { id: 'divider-5', label: '', path: '' },
      { id: 'settings', label: translate(NAVIGATION.SETTINGS), path: '/settings', icon: MdSettings },
    ];
    return doctorMenu;
  }

  // ORG_OWNER: Dashboard, My Organization, Clinics, Members, Settings
  if (normalizedRole === 'ORG_OWNER') {
    const orgOwnerMenu: NavigationConfig = [
      { id: 'dashboard', label: translate(NAVIGATION.DASHBOARD), path: '/dashboard', icon: MdDashboard },
      { id: 'divider-1', label: '', path: '' },
      { id: 'my-organization', label: translate(NAVIGATION.MY_ORGANIZATION), path: '/my-organization', icon: MdCorporateFare },
      { id: 'clinics', label: translate(NAVIGATION.CLINICS), path: '/my-organization/clinics', icon: MdBusiness },
      { id: 'members', label: translate(NAVIGATION.MEMBERS), path: '/my-organization/members', icon: MdPeople },
      { id: 'divider-2', label: '', path: '' },
      { id: 'settings', label: translate(NAVIGATION.SETTINGS), path: '/settings', icon: MdSettings },
    ];
    return orgOwnerMenu;
  }

  // SYSTEM users see: Dashboard, Organizations, Users, Plans, Directory Admin, Integrations, Activity Logs, Settings
  // Clinics are accessed through the Organization detail page, not a separate nav item
  if (userType === 'SYSTEM' || normalizedRole === 'ADMIN') {
    const systemMenu: NavigationConfig = [
      { id: 'dashboard', label: translate(NAVIGATION.DASHBOARD), path: '/dashboard', icon: MdDashboard },
      { id: 'divider-1', label: '', path: '' },
      { id: 'organizations', label: translate(NAVIGATION.ORGANIZATIONS), path: '/organizations', icon: MdCorporateFare },
      { id: 'plans', label: translate(NAVIGATION.PLANS), path: '/system-admins/plans', icon: MdPayment },
      { id: 'divider-2', label: '', path: '' },
      { id: 'users', label: translate(NAVIGATION.USERS), path: '/users', icon: MdPerson },
      { id: 'activity-logs', label: translate(NAVIGATION.ACTIVITY_LOGS), path: '/activity-logs', icon: MdHistory },
      { id: 'divider-3', label: '', path: '' },
      { id: 'directory', label: translate(NAVIGATION.DIRECTORY), path: '/admin/claims', icon: MdSearch },
      { id: 'integrations', label: translate(NAVIGATION.INTEGRATIONS), path: '/integrations', icon: MdExtension },
      { id: 'divider-4', label: '', path: '' },
      { id: 'settings', label: translate(NAVIGATION.SETTINGS), path: '/settings', icon: MdSettings },
    ];
    return systemMenu;
  }

  // Regular role-based filtering for EMPLOYEE users (clinic admins/managers)
  const normalizedUserRole = userRole?.toUpperCase();
  const filtered = navigationConfig.filter((item) => {
    // Skip dividers
    if (item.id.startsWith('divider')) return true;
    // If no roles specified, accessible to all
    if (!item.roles) return true;
    // Check if user role is in allowed roles
    return item.roles.includes(userRole as 'ADMIN' | 'MANAGER' | 'RECEPTIONIST' | 'DOCTOR' | 'NURSE' | 'PATIENT');
  });

  // For clinic managers, reorder menu: Dashboard, then start from Patients
  // Remove "Clinics" menu for clinic managers (they use "Clinic Info" instead)
  if (normalizedUserRole === 'MANAGER') {
    const reordered: NavigationConfig = [];
    
    // Always start with Dashboard
    const dashboard = filtered.find(item => item.id === 'dashboard');
    if (dashboard) {
      reordered.push(dashboard);
      reordered.push({ id: 'divider-1', label: '', path: '' });
    }

    // Then add: Patients, Doctors, Services
    const clinicalItems = ['patients', 'doctors', 'services'];
    clinicalItems.forEach(id => {
      const item = filtered.find(i => i.id === id);
      if (item) reordered.push(item);
    });

    // Add divider
    reordered.push({ id: 'divider-2', label: '', path: '' });

    // Then: Appointments, Queue
    const operationalItems = ['appointments', 'queue'];
    operationalItems.forEach(id => {
      const item = filtered.find(i => i.id === id);
      if (item) reordered.push(item);
    });

    // Then: Users (below Queue)
    const usersItem = filtered.find(item => item.id === 'users');
    if (usersItem) reordered.push(usersItem);

    // Add divider
    reordered.push({ id: 'divider-3', label: '', path: '' });

    // Then: Clinic Info (instead of Clinics)
    const clinicInfoItem = filtered.find(item => item.id === 'clinic-info');
    if (clinicInfoItem) reordered.push(clinicInfoItem);

    // Then: Timetable (clinic/doctor schedules, slot generation)
    const timetableItem = filtered.find(item => item.id === 'timetable');
    if (timetableItem) reordered.push(timetableItem);

    // Add divider
    reordered.push({ id: 'divider-4', label: '', path: '' });

    // Then: Notifications, Activity Logs
    const systemItems = ['notifications', 'activity-logs'];
    systemItems.forEach(id => {
      const item = filtered.find(i => i.id === id);
      if (item) reordered.push(item);
    });

    // Integrations (API Keys, Webhooks)
    reordered.push({ id: 'integrations', label: translate(NAVIGATION.INTEGRATIONS), path: '/integrations', icon: MdExtension });

    // Add divider
    reordered.push({ id: 'divider-5', label: '', path: '' });

    // Finally: Settings
    const settingsItem = filtered.find(item => item.id === 'settings');
    if (settingsItem) reordered.push(settingsItem);

    return reordered;
  }

  return filtered;
};
