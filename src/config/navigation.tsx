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
} from 'react-icons/md';
import type { NavigationConfig } from '@/types/navigation';

export const navigationConfig: NavigationConfig = [
  {
    id: 'dashboard',
    label: 'Dashboard',
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
    label: 'Clinics',
    path: '/clinics',
    icon: MdBusiness,
    roles: ['ADMIN', 'MANAGER'], // SYSTEM users have access
  },
  {
    id: 'employees',
    label: 'Employees',
    path: '/employees',
    icon: MdPerson,
    roles: ['ADMIN', 'MANAGER'], // SYSTEM users have access
  },
  {
    id: 'divider-2',
    label: '',
    path: '',
  },
  {
    id: 'patients',
    label: 'Patients',
    path: '/patients',
    icon: MdPeople,
    roles: ['ADMIN', 'MANAGER', 'RECEPTIONIST', 'DOCTOR', 'NURSE'],
  },
  {
    id: 'doctors',
    label: 'Doctors',
    path: '/doctors',
    icon: MdLocalHospital,
    roles: ['ADMIN', 'MANAGER', 'RECEPTIONIST', 'DOCTOR'],
  },
  {
    id: 'services',
    label: 'Services',
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
    label: 'Appointments',
    path: '/appointments',
    icon: MdEvent,
    roles: ['ADMIN', 'MANAGER', 'RECEPTIONIST', 'DOCTOR', 'NURSE'],
  },
  {
    id: 'queue',
    label: 'Queue',
    path: '/queue',
    icon: MdQueue,
    roles: ['ADMIN', 'MANAGER', 'RECEPTIONIST', 'DOCTOR', 'NURSE'],
  },
  {
    id: 'divider-4',
    label: '',
    path: '',
  },
  {
    id: 'notifications',
    label: 'Notifications',
    path: '/notifications',
    icon: MdNotifications,
    roles: ['ADMIN', 'MANAGER', 'RECEPTIONIST'],
  },
  {
    id: 'activity-logs',
    label: 'Activity Logs',
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
    label: 'Settings',
    path: '/settings',
    icon: MdSettings,
  },
];

/**
 * Filter navigation items based on user role and user type
 */
export const getFilteredNavigation = (
  userRole?: string,
  userType?: 'SYSTEM' | 'EMPLOYEE'
): NavigationConfig => {
  if (!userRole) return [];

  // SYSTEM users only see: Dashboard, Clinics, Employees, Activity Logs, Settings
  if (userType === 'SYSTEM') {
    const allowedItems = [
      'dashboard',
      'clinics',
      'employees',
      'activity-logs',
      'settings',
    ];

    const filtered = navigationConfig.filter((item) => {
      // Allow only specific items for SYSTEM users
      return allowedItems.includes(item.id);
    });

    // Add dividers between sections
    const cleaned: NavigationConfig = [];
    
    for (let i = 0; i < filtered.length; i++) {
      const item = filtered[i];
      if (!item) continue;

      // Add divider before clinics (after dashboard)
      if (item.id === 'clinics' && filtered[i - 1]?.id === 'dashboard') {
        cleaned.push({ id: 'divider-1', label: '', path: '' });
      }
      
      // Add divider before activity-logs (after employees)
      if (item.id === 'activity-logs' && filtered[i - 1]?.id === 'employees') {
        cleaned.push({ id: 'divider-2', label: '', path: '' });
      }
      
      // Add divider before settings (after activity-logs)
      if (item.id === 'settings' && filtered[i - 1]?.id === 'activity-logs') {
        cleaned.push({ id: 'divider-3', label: '', path: '' });
      }

      cleaned.push(item);
    }

    return cleaned;
  }

  // Regular role-based filtering for EMPLOYEE users
  return navigationConfig.filter((item) => {
    // Skip dividers
    if (item.id.startsWith('divider')) return true;
    // If no roles specified, accessible to all
    if (!item.roles) return true;
    // Check if user role is in allowed roles
    return item.roles.includes(userRole as 'ADMIN' | 'MANAGER' | 'RECEPTIONIST' | 'DOCTOR' | 'NURSE');
  });
};
