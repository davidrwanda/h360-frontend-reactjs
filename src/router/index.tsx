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
import { EditClinicPage } from '@/pages/EditClinicPage';

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
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
      <ProtectedRoute>
        <MainLayout>
          <PlaceholderPage title="Patients" />
        </MainLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/doctors',
    element: (
      <ProtectedRoute>
        <MainLayout>
          <PlaceholderPage title="Doctors" />
        </MainLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/services',
    element: (
      <ProtectedRoute>
        <MainLayout>
          <PlaceholderPage title="Services" />
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
    path: '/employees',
    element: (
      <ProtectedRoute requiredRole={['ADMIN', 'MANAGER']}>
        <MainLayout>
          <PlaceholderPage title="Employees" />
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
          <PlaceholderPage title="Activity Logs" />
        </MainLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/settings',
    element: (
      <ProtectedRoute>
        <MainLayout>
          <PlaceholderPage title="Settings" />
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
