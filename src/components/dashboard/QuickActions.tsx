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
  MdAccountCircle,
  MdSearch,
  MdHistory,
} from 'react-icons/md';
import { useTranslation, COMMON, DASHBOARD } from '@/i18n';

interface QuickAction {
  labelKey: string;
  path: string;
  icon: ReactNode;
  variant?: 'primary' | 'outline';
  descriptionKey?: string;
}

export const QuickActions = () => {
  const { user, role } = useAuth();
  const { t } = useTranslation();

  const systemActions: QuickAction[] = [
    {
      labelKey: DASHBOARD.CREATE_NEW_CLINIC,
      path: '/clinics/create',
      icon: <MdAdd className="h-4 w-4" />,
      variant: 'primary',
      descriptionKey: DASHBOARD.CREATE_CLINIC_DESC,
    },
    {
      labelKey: DASHBOARD.MANAGE_CLINICS,
      path: '/clinics',
      icon: <MdBusiness className="h-4 w-4" />,
      variant: 'outline',
    },
    {
      labelKey: DASHBOARD.MANAGE_USERS,
      path: '/users',
      icon: <MdPerson className="h-4 w-4" />,
      variant: 'outline',
    },
  ];

  const adminActions: QuickAction[] = [
    {
      labelKey: DASHBOARD.MANAGE_PATIENTS,
      path: '/patients',
      icon: <MdPeople className="h-4 w-4" />,
      variant: 'outline',
    },
    {
      labelKey: DASHBOARD.MANAGE_DOCTORS,
      path: '/doctors',
      icon: <MdLocalHospital className="h-4 w-4" />,
      variant: 'outline',
    },
    {
      labelKey: DASHBOARD.MANAGE_SERVICES,
      path: '/services',
      icon: <MdMedicalServices className="h-4 w-4" />,
      variant: 'outline',
    },
    {
      labelKey: DASHBOARD.VIEW_APPOINTMENTS,
      path: '/appointments',
      icon: <MdEvent className="h-4 w-4" />,
      variant: 'outline',
    },
  ];

  const doctorActions: QuickAction[] = [
    {
      labelKey: DASHBOARD.MY_APPOINTMENTS,
      path: '/appointments',
      icon: <MdEvent className="h-4 w-4" />,
      variant: 'primary',
    },
    {
      labelKey: DASHBOARD.MY_PATIENTS,
      path: '/patients',
      icon: <MdPeople className="h-4 w-4" />,
      variant: 'outline',
    },
    {
      labelKey: DASHBOARD.MY_SCHEDULE,
      path: '/doctors',
      icon: <MdSchedule className="h-4 w-4" />,
      variant: 'outline',
    },
  ];

  const receptionistActions: QuickAction[] = [
    {
      labelKey: DASHBOARD.QUEUE_MANAGEMENT,
      path: '/queue',
      icon: <MdQueue className="h-4 w-4" />,
      variant: 'primary',
    },
    {
      labelKey: DASHBOARD.BOOK_APPOINTMENT,
      path: '/appointments',
      icon: <MdEvent className="h-4 w-4" />,
      variant: 'outline',
    },
    {
      labelKey: DASHBOARD.REGISTER_PATIENT,
      path: '/patients',
      icon: <MdPeople className="h-4 w-4" />,
      variant: 'outline',
    },
  ];

  const nurseActions: QuickAction[] = [
    {
      labelKey: DASHBOARD.VIEW_PATIENTS,
      path: '/patients',
      icon: <MdPeople className="h-4 w-4" />,
      variant: 'outline',
    },
    {
      labelKey: DASHBOARD.VIEW_APPOINTMENTS,
      path: '/appointments',
      icon: <MdEvent className="h-4 w-4" />,
      variant: 'outline',
    },
    {
      labelKey: DASHBOARD.QUEUE_STATUS,
      path: '/queue',
      icon: <MdQueue className="h-4 w-4" />,
      variant: 'outline',
    },
  ];

  const patientActions: QuickAction[] = [
    {
      labelKey: DASHBOARD.BOOK_APPOINTMENT,
      path: '/my-appointments',
      icon: <MdEvent className="h-4 w-4" />,
      variant: 'primary',
      descriptionKey: DASHBOARD.SCHEDULE_APPOINTMENT,
    },
    {
      labelKey: DASHBOARD.MY_APPOINTMENTS,
      path: '/my-appointments',
      icon: <MdHistory className="h-4 w-4" />,
      variant: 'outline',
      descriptionKey: DASHBOARD.VIEW_APPOINTMENTS_DESC,
    },
    {
      labelKey: DASHBOARD.MY_PROFILE,
      path: '/my-profile',
      icon: <MdAccountCircle className="h-4 w-4" />,
      variant: 'outline',
      descriptionKey: DASHBOARD.MY_PROFILE_DESC,
    },
    {
      labelKey: DASHBOARD.FIND_CLINICS,
      path: '/',
      icon: <MdSearch className="h-4 w-4" />,
      variant: 'outline',
      descriptionKey: DASHBOARD.FIND_CLINICS_DESC,
    },
  ];

  const employeeActions: QuickAction[] = [
    {
      labelKey: DASHBOARD.VIEW_PATIENTS,
      path: '/patients',
      icon: <MdPeople className="h-4 w-4" />,
      variant: 'outline',
    },
    {
      labelKey: DASHBOARD.VIEW_APPOINTMENTS,
      path: '/appointments',
      icon: <MdEvent className="h-4 w-4" />,
      variant: 'outline',
    },
    {
      labelKey: DASHBOARD.QUEUE_MANAGEMENT,
      path: '/queue',
      icon: <MdQueue className="h-4 w-4" />,
      variant: 'outline',
    },
  ];

  let actions: QuickAction[] = employeeActions;

  const normalizedRole = role?.toUpperCase();
  const normalizedUserRole = user?.role?.toUpperCase();

  if (user?.user_type === 'PATIENT' || normalizedRole === 'PATIENT' || normalizedUserRole === 'PATIENT') {
    actions = patientActions;
  } else if (user?.user_type === 'SYSTEM' || user?.permissions === 'ALL' || normalizedRole === 'ADMIN' || normalizedUserRole === 'ADMIN') {
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
        <CardTitle>{t(COMMON.QUICK_ACTIONS)}</CardTitle>
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
                <div className="ml-2 flex flex-col items-start">
                  <span>{t(action.labelKey)}</span>
                  {action.descriptionKey && (
                    <span className="text-xs text-carbon/60 mt-0.5">{t(action.descriptionKey)}</span>
                  )}
                </div>
              </Button>
            </Link>
          ))}
          {(user?.user_type === 'SYSTEM' || normalizedRole === 'ADMIN' || normalizedUserRole === 'ADMIN') && (
            <div className="pt-2 mt-2 border-t border-carbon/10">
              <p className="text-xs text-carbon/60">
                {t(DASHBOARD.ADMIN_FOOTER_DESC)}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
