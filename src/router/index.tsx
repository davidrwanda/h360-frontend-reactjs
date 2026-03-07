import { createBrowserRouter } from 'react-router-dom';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { MainLayout } from '@/components/layout';
import { COMMON } from '@/i18n';
import { LoginPage, ForgotPasswordPage, ResetPasswordPage, PatientRegisterPage, BookAppointmentAuthPage, AcceptInvitePage } from '@/pages/auth';
import { LandingPage, PublicClinicDetailPage, BookAppointmentPage } from '@/pages/public';
import { DashboardPage } from '@/pages/dashboard';
import { OrganizationsPage, CreateOrganizationPage, EditOrganizationPage, OrganizationDetailPage, MyOrganizationPage, MyOrgClinicsPage, MyOrgMembersPage } from '@/pages/organizations';
import { ClinicsPage, CreateClinicPage, EditClinicPage, ClinicDetailPage, ClinicInfoPage, DeletedClinicsPage, ClinicCalendarConfigPage } from '@/pages/clinics';
import { UsersPage, CreateUserPage, CreateClinicAdminPage, EditClinicAdminPage } from '@/pages/users';
import { PatientsPage, CreatePatientPage, EditPatientPage, PatientDetailPage } from '@/pages/patients';
import { DoctorsPage, CreateDoctorPage, EditDoctorPage, DoctorDetailPage, DoctorCalendarConfigPage, DoctorBulkSetupPage } from '@/pages/doctors';
import { ServicesPage, CreateServicePage, EditServicePage, ServiceDetailPage } from '@/pages/services';
import { AppointmentsPage, QueuePage, MyAppointmentsPage } from '@/pages/appointments';
import { TimetablePage, SlotGenerationPage } from '@/pages/scheduling';
import { SettingsPage, MyProfilePage } from '@/pages/settings';
import { ActivityLogsPage } from '@/pages/system';
import { PlaceholderPage, MenuOverviewPage } from '@/pages/common';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <LandingPage />,
  },
  {
    path: '/home',
    element: <LandingPage />,
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/forgot-password',
    element: <ForgotPasswordPage />,
  },
  {
    path: '/reset-password',
    element: <ResetPasswordPage />,
  },
  {
    path: '/register',
    element: <PatientRegisterPage />,
  },
  {
    path: '/patients/register',
    element: <PatientRegisterPage />,
  },
  {
    path: '/book-appointment-auth',
    element: <BookAppointmentAuthPage />,
  },
  {
    path: '/book-appointment',
    element: <BookAppointmentPage />,
  },
  {
    path: '/clinic/:id',
    element: <PublicClinicDetailPage />,
  },
  {
    path: '/invite/accept',
    element: <AcceptInvitePage />,
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <MainLayout>
          <DashboardPage />
        </MainLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/dashboard',
    element: (
      <ProtectedRoute>
        <MainLayout>
          <DashboardPage />
        </MainLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/patients',
    element: (
      <ProtectedRoute requiredRole={['ADMIN', 'MANAGER', 'RECEPTIONIST', 'DOCTOR', 'NURSE']}>
        <MainLayout>
          <PatientsPage />
        </MainLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/patients/create',
    element: (
      <ProtectedRoute requiredRole={['ADMIN', 'MANAGER', 'RECEPTIONIST']}>
        <MainLayout>
          <CreatePatientPage />
        </MainLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/patients/:id',
    element: (
      <ProtectedRoute requiredRole={['ADMIN', 'MANAGER', 'RECEPTIONIST', 'DOCTOR', 'NURSE']}>
        <MainLayout>
          <PatientDetailPage />
        </MainLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/patients/:id/edit',
    element: (
      <ProtectedRoute requiredRole={['ADMIN', 'MANAGER', 'RECEPTIONIST']}>
        <MainLayout>
          <EditPatientPage />
        </MainLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/doctors',
    element: (
      <ProtectedRoute requiredRole={['ADMIN', 'MANAGER', 'RECEPTIONIST', 'DOCTOR', 'NURSE']}>
        <MainLayout>
          <DoctorsPage />
        </MainLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/doctors/create',
    element: (
      <ProtectedRoute requiredRole={['ADMIN', 'MANAGER', 'RECEPTIONIST']}>
        <MainLayout>
          <CreateDoctorPage />
        </MainLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/doctors/:id',
    element: (
      <ProtectedRoute requiredRole={['ADMIN', 'MANAGER', 'RECEPTIONIST', 'DOCTOR', 'NURSE']}>
        <MainLayout>
          <DoctorDetailPage />
        </MainLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/doctors/:id/edit',
    element: (
      <ProtectedRoute requiredRole={['ADMIN', 'MANAGER', 'RECEPTIONIST', 'DOCTOR']}>
        <MainLayout>
          <EditDoctorPage />
        </MainLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/doctors/:id/timetable',
    element: (
      <ProtectedRoute requiredRole={['ADMIN', 'MANAGER']}>
        <MainLayout>
          <DoctorCalendarConfigPage />
        </MainLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/doctors/:id/bulk-setup',
    element: (
      <ProtectedRoute requiredRole={['ADMIN', 'MANAGER']}>
        <MainLayout>
          <DoctorBulkSetupPage />
        </MainLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/services',
    element: (
      <ProtectedRoute requiredRole={['ADMIN', 'MANAGER', 'RECEPTIONIST', 'DOCTOR', 'NURSE']}>
        <MainLayout>
          <ServicesPage />
        </MainLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/services/create',
    element: (
      <ProtectedRoute requiredRole={['ADMIN', 'MANAGER']}>
        <MainLayout>
          <CreateServicePage />
        </MainLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/services/:id',
    element: (
      <ProtectedRoute requiredRole={['ADMIN', 'MANAGER', 'RECEPTIONIST', 'DOCTOR', 'NURSE']}>
        <MainLayout>
          <ServiceDetailPage />
        </MainLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/services/:id/edit',
    element: (
      <ProtectedRoute requiredRole={['ADMIN', 'MANAGER']}>
        <MainLayout>
          <EditServicePage />
        </MainLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/appointments',
    element: (
      <ProtectedRoute requiredRole={['ADMIN', 'MANAGER', 'RECEPTIONIST', 'DOCTOR', 'NURSE']}>
        <MainLayout>
          <AppointmentsPage />
        </MainLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/queue',
    element: (
      <ProtectedRoute requiredRole={['ADMIN', 'MANAGER', 'RECEPTIONIST', 'DOCTOR', 'NURSE']}>
        <MainLayout>
          <QueuePage />
        </MainLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/organizations',
    element: (
      <ProtectedRoute requiredRole={['ADMIN']}>
        <MainLayout>
          <OrganizationsPage />
        </MainLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/organizations/create',
    element: (
      <ProtectedRoute requiredRole={['ADMIN']}>
        <MainLayout>
          <CreateOrganizationPage />
        </MainLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/organizations/:id',
    element: (
      <ProtectedRoute requiredRole={['ADMIN']}>
        <MainLayout>
          <OrganizationDetailPage />
        </MainLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/organizations/:id/edit',
    element: (
      <ProtectedRoute requiredRole={['ADMIN']}>
        <MainLayout>
          <EditOrganizationPage />
        </MainLayout>
      </ProtectedRoute>
    ),
  },
  // ORG_OWNER routes — scoped to their own organization
  {
    path: '/my-organization',
    element: (
      <ProtectedRoute requiredRole={['ORG_OWNER']}>
        <MainLayout>
          <MyOrganizationPage />
        </MainLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/my-organization/edit',
    element: (
      <ProtectedRoute requiredRole={['ORG_OWNER']}>
        <MainLayout>
          <EditOrganizationPage />
        </MainLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/my-organization/clinics',
    element: (
      <ProtectedRoute requiredRole={['ORG_OWNER']}>
        <MainLayout>
          <MyOrgClinicsPage />
        </MainLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/my-organization/members',
    element: (
      <ProtectedRoute requiredRole={['ORG_OWNER']}>
        <MainLayout>
          <MyOrgMembersPage />
        </MainLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/clinics',
    element: (
      <ProtectedRoute requiredRole={['ADMIN', 'MANAGER']}>
        <MainLayout>
          <ClinicsPage />
        </MainLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/clinics/deleted',
    element: (
      <ProtectedRoute requiredRole={['ADMIN']}>
        <MainLayout>
          <DeletedClinicsPage />
        </MainLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/clinics/create',
    element: (
      <ProtectedRoute requiredRole={['ADMIN', 'MANAGER']}>
        <MainLayout>
          <CreateClinicPage />
        </MainLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/clinics/:id',
    element: (
      <ProtectedRoute requiredRole={['ADMIN', 'MANAGER']}>
        <MainLayout>
          <ClinicDetailPage />
        </MainLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/clinics/:id/edit',
    element: (
      <ProtectedRoute requiredRole={['ADMIN', 'MANAGER']}>
        <MainLayout>
          <EditClinicPage />
        </MainLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/clinics/:id/admins/create',
    element: (
      <ProtectedRoute requiredRole={['ADMIN', 'MANAGER']}>
        <MainLayout>
          <CreateClinicAdminPage />
        </MainLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/users/create',
    element: (
      <ProtectedRoute requiredRole={['ADMIN', 'MANAGER']}>
        <MainLayout>
          <CreateUserPage />
        </MainLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/clinics/:id/admins/:adminId/edit',
    element: (
      <ProtectedRoute requiredRole={['ADMIN', 'MANAGER']}>
        <MainLayout>
          <EditClinicAdminPage />
        </MainLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/users',
    element: (
      <ProtectedRoute requiredRole={['ADMIN', 'MANAGER']}>
        <MainLayout>
          <UsersPage />
        </MainLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/notifications',
    element: (
      <ProtectedRoute>
        <MainLayout>
          <PlaceholderPage titleKey={COMMON.NOTIFICATIONS} />
        </MainLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/activity-logs',
    element: (
      <ProtectedRoute requiredRole={['ADMIN', 'MANAGER']}>
        <MainLayout>
          <ActivityLogsPage />
        </MainLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/settings',
    element: (
      <ProtectedRoute>
        <MainLayout>
          <SettingsPage />
        </MainLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/clinic-info',
    element: (
      <ProtectedRoute requiredRole={['MANAGER']}>
        <MainLayout>
          <ClinicInfoPage />
        </MainLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/timetable',
    element: (
      <ProtectedRoute requiredRole={['MANAGER']}>
        <MainLayout>
          <TimetablePage />
        </MainLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/clinic-calendar',
    element: (
      <ProtectedRoute requiredRole={['MANAGER']}>
        <MainLayout>
          <ClinicCalendarConfigPage />
        </MainLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/doctor-calendar',
    element: (
      <ProtectedRoute requiredRole={['MANAGER']}>
        <MainLayout>
          <DoctorCalendarConfigPage />
        </MainLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/slot-generation',
    element: (
      <ProtectedRoute requiredRole={['MANAGER']}>
        <MainLayout>
          <SlotGenerationPage />
        </MainLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/my-appointments',
    element: (
      <ProtectedRoute requiredRole={['PATIENT']}>
        <MainLayout>
          <MyAppointmentsPage />
        </MainLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/my-profile',
    element: (
      <ProtectedRoute requiredRole={['PATIENT', 'DOCTOR']}>
        <MainLayout>
          <MyProfilePage />
        </MainLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/menu-overview',
    element: (
      <ProtectedRoute>
        <MainLayout>
          <MenuOverviewPage />
        </MainLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '*',
    element: (
      <ProtectedRoute>
        <MainLayout>
          <div className="flex min-h-[60vh] items-center justify-center">
            <div className="text-center">
              <h1 className="text-h2 text-azure-dragon mb-4">404 - Page Not Found</h1>
              <p className="text-body text-carbon/70">
                The page you're looking for doesn't exist.
              </p>
            </div>
          </div>
        </MainLayout>
      </ProtectedRoute>
    ),
  },
]);
