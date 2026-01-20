import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent, Button } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';
import {
  MdBusiness,
  MdPerson,
  MdPeople,
  MdEvent,
  MdQueue,
  MdAdd,
  MdLocalHospital,
  MdMedicalServices,
  MdSchedule,
} from 'react-icons/md';

interface QuickAction {
  label: string;
  path: string;
  icon: ReactNode;
  variant?: 'primary' | 'outline';
  description?: string;
}

export const QuickActions = () => {
  const { user, role } = useAuth();

  // SYSTEM user actions
  const systemActions: QuickAction[] = [
    {
      label: 'Create New Clinic',
      path: '/clinics/create',
      icon: <MdAdd className="h-4 w-4" />,
      variant: 'primary',
      description: 'Create a clinic and assign an admin',
    },
    {
      label: 'Manage Clinics',
      path: '/clinics',
      icon: <MdBusiness className="h-4 w-4" />,
      variant: 'outline',
    },
    {
      label: 'Manage Users',
      path: '/users',
      icon: <MdPerson className="h-4 w-4" />,
      variant: 'outline',
    },
  ];

  // Clinic ADMIN actions
  const adminActions: QuickAction[] = [
    {
      label: 'Manage Patients',
      path: '/patients',
      icon: <MdPeople className="h-4 w-4" />,
      variant: 'outline',
    },
    {
      label: 'Manage Doctors',
      path: '/doctors',
      icon: <MdLocalHospital className="h-4 w-4" />,
      variant: 'outline',
    },
    {
      label: 'Manage Services',
      path: '/services',
      icon: <MdMedicalServices className="h-4 w-4" />,
      variant: 'outline',
    },
    {
      label: 'View Appointments',
      path: '/appointments',
      icon: <MdEvent className="h-4 w-4" />,
      variant: 'outline',
    },
  ];

  // DOCTOR actions
  const doctorActions: QuickAction[] = [
    {
      label: 'My Appointments',
      path: '/appointments',
      icon: <MdEvent className="h-4 w-4" />,
      variant: 'primary',
    },
    {
      label: 'My Patients',
      path: '/patients',
      icon: <MdPeople className="h-4 w-4" />,
      variant: 'outline',
    },
    {
      label: 'My Schedule',
      path: '/doctors',
      icon: <MdSchedule className="h-4 w-4" />,
      variant: 'outline',
    },
  ];

  // RECEPTIONIST actions
  const receptionistActions: QuickAction[] = [
    {
      label: 'Queue Management',
      path: '/queue',
      icon: <MdQueue className="h-4 w-4" />,
      variant: 'primary',
    },
    {
      label: 'Book Appointment',
      path: '/appointments',
      icon: <MdEvent className="h-4 w-4" />,
      variant: 'outline',
    },
    {
      label: 'Register Patient',
      path: '/patients',
      icon: <MdPeople className="h-4 w-4" />,
      variant: 'outline',
    },
  ];

  // NURSE actions
  const nurseActions: QuickAction[] = [
    {
      label: 'View Patients',
      path: '/patients',
      icon: <MdPeople className="h-4 w-4" />,
      variant: 'outline',
    },
    {
      label: 'View Appointments',
      path: '/appointments',
      icon: <MdEvent className="h-4 w-4" />,
      variant: 'outline',
    },
    {
      label: 'Queue Status',
      path: '/queue',
      icon: <MdQueue className="h-4 w-4" />,
      variant: 'outline',
    },
  ];

  // EMPLOYEE user actions (default fallback)
  const employeeActions: QuickAction[] = [
    {
      label: 'View Patients',
      path: '/patients',
      icon: <MdPeople className="h-4 w-4" />,
      variant: 'outline',
    },
    {
      label: 'View Appointments',
      path: '/appointments',
      icon: <MdEvent className="h-4 w-4" />,
      variant: 'outline',
    },
    {
      label: 'Queue Management',
      path: '/queue',
      icon: <MdQueue className="h-4 w-4" />,
      variant: 'outline',
    },
  ];

  // Determine actions based on role
  let actions: QuickAction[] = employeeActions;

  // Normalize role for comparison (handle both "Admin" and "ADMIN")
  const normalizedRole = role?.toUpperCase();
  const normalizedUserRole = user?.role?.toUpperCase();

  // SYSTEM users and Admin role users see system actions (clinics and users only)
  if (user?.user_type === 'SYSTEM' || user?.permissions === 'ALL' || normalizedRole === 'ADMIN' || normalizedUserRole === 'ADMIN') {
    actions = systemActions;
  } else if (normalizedUserRole === 'MANAGER') {
    actions = adminActions;
  } else if (normalizedUserRole === 'DOCTOR') {
    actions = doctorActions;
  } else if (normalizedUserRole === 'RECEPTIONIST') {
    actions = receptionistActions;
  } else if (normalizedUserRole === 'NURSE') {
    actions = nurseActions;
  }

  if (actions.length === 0) {
    return null;
  }

  return (
    <Card variant="elevated">
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {actions.map((action, index) => (
            <Link key={index} to={action.path} className="block">
              <Button
                variant={action.variant || 'outline'}
                size="md"
                className="w-full justify-start"
              >
                {action.icon}
                <span className="ml-2">{action.label}</span>
              </Button>
            </Link>
          ))}
          {(user?.user_type === 'SYSTEM' || normalizedRole === 'ADMIN' || normalizedUserRole === 'ADMIN') && (
            <div className="pt-2 mt-2 border-t border-carbon/10">
              <p className="text-xs text-carbon/60">
                Create and manage clinics and users. Admins manage system-level resources only.
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
