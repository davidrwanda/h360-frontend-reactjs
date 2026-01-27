import { createBrowserRouter } from 'react-router-dom';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { MainLayout } from '@/components/layout';
import { LoginPage } from '@/pages/LoginPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { PlaceholderPage } from '@/pages/PlaceholderPage';
import { MenuOverviewPage } from '@/pages/MenuOverviewPage';
import { CreateClinicPage } from '@/pages/CreateClinicPage';
import { ClinicsPage } from '@/pages/ClinicsPage';
import { DeletedClinicsPage } from '@/pages/DeletedClinicsPage';
import { ClinicDetailPage } from '@/pages/ClinicDetailPage';
import { ClinicInfoPage } from '@/pages/ClinicInfoPage';
import { EditClinicPage } from '@/pages/EditClinicPage';
import { UsersPage } from '@/pages/UsersPage';
import { CreateUserPage } from '@/pages/CreateUserPage';
import { CreateClinicAdminPage } from '@/pages/CreateClinicAdminPage';
import { EditClinicAdminPage } from '@/pages/EditClinicAdminPage';
import { ActivityLogsPage } from '@/pages/ActivityLogsPage';
import { SettingsPage } from '@/pages/SettingsPage';
import { PatientsPage } from '@/pages/PatientsPage';
import { PatientDetailPage } from '@/pages/PatientDetailPage';
import { CreatePatientPage } from '@/pages/CreatePatientPage';
import { EditPatientPage } from '@/pages/EditPatientPage';
import { PatientRegisterPage } from '@/pages/PatientRegisterPage';
import { BookAppointmentPage } from '@/pages/BookAppointmentPage';
import { BookAppointmentAuthPage } from '@/pages/BookAppointmentAuthPage';
import { LandingPage } from '@/pages/LandingPage';
import { MyAppointmentsPage } from '@/pages/MyAppointmentsPage';
import { MyProfilePage } from '@/pages/MyProfilePage';
import { ForgotPasswordPage } from '@/pages/ForgotPasswordPage';
import { ResetPasswordPage } from '@/pages/ResetPasswordPage';
import { ServicesPage } from '@/pages/ServicesPage';
import { CreateServicePage } from '@/pages/CreateServicePage';
import { EditServicePage } from '@/pages/EditServicePage';
import { ServiceDetailPage } from '@/pages/ServiceDetailPage';
import { DoctorsPage } from '@/pages/DoctorsPage';
import CreateDoctorPage from '@/pages/CreateDoctorPage';
import EditDoctorPage from '@/pages/EditDoctorPage';
import DoctorDetailPage from '@/pages/DoctorDetailPage';
import { ClinicCalendarConfigPage } from '@/pages/ClinicCalendarConfigPage';
import { DoctorCalendarConfigPage } from '@/pages/DoctorCalendarConfigPage';
import { DoctorBulkSetupPage } from '@/pages/DoctorBulkSetupPage';
import { SlotGenerationPage } from '@/pages/SlotGenerationPage';
import { TimetablePage } from '@/pages/TimetablePage';

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
      <ProtectedRoute>
        <MainLayout>
          <PlaceholderPage title="Appointments" />
        </MainLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/queue',
    element: (
      <ProtectedRoute>
        <MainLayout>
          <PlaceholderPage title="Queue Management" />
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
          <PlaceholderPage title="Notifications" />
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
