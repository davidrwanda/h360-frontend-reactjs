# Dashboard Module Documentation

**Week:** 4  
**Status:** ✅ Completed  
**Date:** 2026-01-19

---

## Overview

The Dashboard module provides an overview of the system with role-based views, statistics, and quick actions. It serves as the main landing page after login and adapts its content based on the user's role and type.

---

## Features Implemented

### ✅ Role-Based Dashboards

1. **System Dashboard** (`SystemDashboard`)
   - For SYSTEM users (user_type: "SYSTEM")
   - Displays clinic and employee statistics
   - Quick actions for clinic and employee management
   - System information card

2. **Clinic Admin Dashboard** (`ClinicAdminDashboard`)
   - For ADMIN and MANAGER roles
   - Clinic-specific statistics (patients, appointments, doctors, services)
   - Quick actions for clinic management
   - Clinic information card

3. **Doctor Dashboard** (`DoctorDashboard`)
   - For DOCTOR role
   - Doctor-specific statistics (appointments, patients, schedule, slots)
   - Quick actions for doctor workflow
   - Schedule management card

4. **Receptionist Dashboard** (`ReceptionistDashboard`)
   - For RECEPTIONIST role
   - Front desk statistics (queue, appointments, check-ins, new patients)
   - Quick actions for receptionist workflow
   - Queue management card

5. **Nurse Dashboard** (`NurseDashboard`)
   - For NURSE role
   - Nursing statistics (patients, appointments, queue, assigned patients)
   - Quick actions for nurse workflow
   - Patient care card

6. **Employee Dashboard** (`EmployeeDashboard`)
   - Fallback for other employee types
   - Generic statistics placeholders
   - Basic quick actions

### ✅ Statistics Cards (`StatCard`)

- Reusable card component for displaying metrics
- Supports loading states
- Trend indicators (optional)
- Multiple variants (default, primary, success, warning, danger)
- Icon support

**Features:**
- Title and value display
- Optional trend indicators with percentage
- Loading skeleton state
- Color-coded variants
- Responsive design

### ✅ Quick Actions Widget (`QuickActions`)

- Role-based action buttons
- Links to key features
- SYSTEM users: Clinic and employee management
- EMPLOYEE users: Patients, appointments, queue (placeholders)

### ✅ Dashboard Hooks (`useDashboardStats`)

- Fetches statistics for SYSTEM users
- Uses TanStack Query for caching
- Handles loading states
- Returns:
  - Total clinics
  - Active clinics
  - Total employees
  - Active employees

---

## Components

### `StatCard`

**Location:** `src/components/dashboard/StatCard.tsx`

**Props:**
```typescript
interface StatCardProps {
  title: string;
  value: string | number;
  icon?: ReactNode;
  trend?: {
    value: number;
    label: string;
    isPositive: boolean;
  };
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger';
  loading?: boolean;
  className?: string;
}
```

**Usage:**
```tsx
<StatCard
  title="Total Clinics"
  value={stats.totalClinics}
  icon={<MdBusiness className="h-6 w-6" />}
  variant="primary"
  loading={isLoading}
/>
```

### `QuickActions`

**Location:** `src/components/dashboard/QuickActions.tsx`

**Features:**
- Automatically detects user type and role
- Shows role-specific actions:
  - **SYSTEM**: Clinic and employee management
  - **ADMIN/MANAGER**: Patient, doctor, service, appointment management
  - **DOCTOR**: Appointments, patients, schedule
  - **RECEPTIONIST**: Queue, appointments, patient registration
  - **NURSE**: Patients, appointments, queue
- Links to key features based on role

### `SystemDashboard`

**Location:** `src/components/dashboard/SystemDashboard.tsx`

**Sections:**
1. Welcome message
2. Statistics cards (4 cards)
3. Quick actions widget
4. System information card
5. Recent activity placeholder

### `EmployeeDashboard`

**Location:** `src/components/dashboard/EmployeeDashboard.tsx`

**Sections:**
1. Welcome message
2. Statistics cards (placeholders)
3. Quick actions widget
4. User information card
5. Upcoming appointments placeholder

---

## Hooks

### `useDashboardStats`

**Location:** `src/hooks/useDashboard.ts`

**Returns:**
```typescript
{
  stats: {
    totalClinics: number;
    totalEmployees: number;
    activeClinics: number;
    activeEmployees: number;
  };
  isLoading: boolean;
}
```

**Features:**
- Fetches clinic statistics (SYSTEM users only)
- Fetches employee statistics (SYSTEM users only)
- Handles loading states
- Uses TanStack Query for caching

---

## Dashboard Views

### SYSTEM User Dashboard

**Statistics Shown:**
- Total Clinics
- Active Clinics
- Total Employees
- Active Employees

**Quick Actions:**
- Create New Clinic
- Manage Clinics
- Manage Employees

**Information Cards:**
- System Information (user type, permissions, email)
- Recent Activity (placeholder)

### Clinic Admin Dashboard (ADMIN/MANAGER)

**Statistics Shown (Placeholders):**
- Total Patients
- Today's Appointments
- Active Doctors
- Services

**Quick Actions:**
- Manage Patients
- Manage Doctors
- Manage Services
- View Appointments

**Information Cards:**
- Clinic Information (role, email, clinic ID)
- Clinic Management overview

### Doctor Dashboard

**Statistics Shown (Placeholders):**
- Today's Appointments
- Patients Today
- Upcoming This Week
- Available Slots

**Quick Actions:**
- My Appointments
- My Patients
- My Schedule

**Information Cards:**
- Your Schedule
- Upcoming Appointments

### Receptionist Dashboard

**Statistics Shown (Placeholders):**
- Queue Length
- Today's Appointments
- Checked In
- New Patients

**Quick Actions:**
- Queue Management
- Book Appointment
- Register Patient

**Information Cards:**
- Queue Management
- Current Queue

### Nurse Dashboard

**Statistics Shown (Placeholders):**
- Patients Today
- Appointments
- Queue Status
- Assigned Patients

**Quick Actions:**
- View Patients
- View Appointments
- Queue Status

**Information Cards:**
- Patient Care
- Today's Schedule

---

## API Integration

### Current Implementation

- Uses existing `clinicsApi.list()` to get clinic count
- Uses existing `employeesApi.list()` to get employee count
- Filters active items client-side

### Future Enhancements

- Dedicated dashboard statistics endpoint (if available)
- Real-time updates via WebSocket
- Cached statistics with background refresh
- Clinic-specific statistics for EMPLOYEE users

---

## Responsive Design

- Mobile-first approach
- Grid layout adapts to screen size:
  - Mobile: 1 column
  - Tablet: 2 columns
  - Desktop: 3-4 columns
- Touch-friendly buttons
- Optimized spacing for mobile

---

## Loading States

- Skeleton loaders for statistics cards
- Loading indicators for data fetching
- Graceful error handling
- Empty states for future modules

---

## Future Enhancements

### Planned Features

1. **Charts & Graphs**
   - Appointment trends
   - Patient growth charts
   - Revenue graphs (if applicable)

2. **Real-time Updates**
   - Live queue updates
   - Real-time appointment changes
   - Notification badges

3. **Recent Activity Feed**
   - Activity log entries
   - Recent appointments
   - Recent patient registrations

4. **Clinic-Specific Dashboard**
   - For EMPLOYEE users
   - Clinic statistics
   - Today's schedule
   - Queue status

5. **Customizable Widgets**
   - Drag-and-drop layout
   - Widget preferences
   - Saved layouts

---

## Testing

### Manual Testing Checklist

- [x] SYSTEM user sees correct dashboard
- [x] EMPLOYEE user sees correct dashboard
- [x] Statistics load correctly
- [x] Quick actions navigate correctly
- [x] Loading states display properly
- [x] Responsive design works on mobile
- [x] Empty states display correctly

### Unit Tests (To Be Implemented)

- StatCard component rendering
- QuickActions role detection
- useDashboardStats hook
- Dashboard page routing

---

## File Structure

```
src/
├── components/
│   └── dashboard/
│       ├── StatCard.tsx
│       ├── QuickActions.tsx
│       ├── SystemDashboard.tsx
│       ├── EmployeeDashboard.tsx
│       └── index.ts
├── hooks/
│   └── useDashboard.ts
└── pages/
    └── DashboardPage.tsx
```

---

## Dependencies

- `@tanstack/react-query` - Data fetching and caching
- `react-router-dom` - Navigation
- `react-icons/md` - Icons
- `@/api/clinics` - Clinic API
- `@/api/employees` - Employee API
- `@/hooks/useAuth` - Authentication hook
- `@/components/ui` - Base UI components

---

## Notes

- Dashboard adapts based on `user.user_type` and `user.permissions`
- Statistics are fetched only for SYSTEM users currently
- EMPLOYEE dashboard has placeholders for future modules
- All components follow the design system and brand guidelines
- Mobile-responsive and accessible

---

## Related Modules

- **Layout & Navigation** (Week 3) - Provides navigation structure
- **Clinics Module** (Week 11) - Clinic management features
- **Employees Module** (Week 12) - Employee management features
- **Appointments Module** (Week 8) - Will populate EMPLOYEE dashboard
- **Activity Logs** (Week 14) - Will populate recent activity widget
