# Clinics Management Module Documentation

**Week:** 5 (Moved from Week 11)  
**Status:** ✅ Completed  
**Date:** 2026-01-19

---

## Overview

The Clinics Management module provides complete CRUD functionality for managing clinics in the system. This module is essential as it must be completed before the Patients module, as patients need to be associated with clinics.

---

## Features Implemented

### ✅ Complete CRUD Operations

1. **Create Clinic** (`CreateClinicPage`)
   - Create clinic with admin employee in one flow
   - Form validation with Zod
   - Error handling and success feedback

2. **List Clinics** (`ClinicsPage`)
   - Paginated list view
   - Search functionality (name, address, phone)
   - Filters (city, state, status)
   - Responsive table layout
   - Loading and empty states

3. **View Clinic** (`ClinicDetailPage`)
   - Detailed clinic information display
   - Contact information
   - Metadata (ID, created/updated dates)
   - Quick actions (edit, delete)

4. **Edit Clinic** (`EditClinicPage`)
   - Update clinic information
   - Form pre-populated with existing data
   - Status toggle (active/inactive)
   - Validation and error handling

5. **Delete Clinic** (Integrated)
   - Soft delete (deactivate)
   - Confirmation dialog
   - Error handling

### ✅ Components

1. **ClinicsTable** (`ClinicsTable.tsx`)
   - Responsive table component
   - Action buttons (view, edit, delete)
   - Status badges
   - Loading skeleton
   - Empty state

2. **CreateClinicWithAdminForm** (`CreateClinicWithAdminForm.tsx`)
   - Combined clinic and admin creation
   - Two-section form (clinic + admin)
   - Comprehensive validation

### ✅ Hooks

1. **useClinics** (`useClinics.ts`)
   - `useClinics()` - List clinics with filters
   - `useClinic()` - Get single clinic
   - `useCreateClinic()` - Create clinic
   - `useUpdateClinic()` - Update clinic
   - `useDeleteClinic()` - Delete/deactivate clinic

---

## Pages

### `/clinics` - Clinics List

**Features:**
- Search bar
- Filters (city, state, status)
- Paginated table
- Create button
- Action buttons per row

**Access:** ADMIN, MANAGER (SYSTEM users have access)

### `/clinics/create` - Create Clinic

**Features:**
- Create clinic form
- Create admin employee form
- Combined submission
- Navigation to clinics list on success

**Access:** ADMIN, MANAGER (SYSTEM users have access)

### `/clinics/:id` - Clinic Detail

**Features:**
- Full clinic information
- Contact details
- Metadata display
- Edit and delete actions

**Access:** ADMIN, MANAGER (SYSTEM users have access)

### `/clinics/:id/edit` - Edit Clinic

**Features:**
- Pre-populated form
- Update all clinic fields
- Status toggle
- Save/Cancel actions

**Access:** ADMIN, MANAGER (SYSTEM users have access)

---

## API Integration

### Endpoints Used

- `POST /api/clinics` - Create clinic
- `GET /api/clinics` - List clinics (with filters)
- `GET /api/clinics/:id` - Get clinic by ID
- `PATCH /api/clinics/:id` - Update clinic
- `DELETE /api/clinics/:id` - Deactivate clinic
- `POST /api/clinics/:clinicId/timetables/initialize` - Initialize timetable (available but not yet implemented in UI)

### Data Flow

1. **List View:**
   - Fetches clinics with pagination
   - Applies filters client-side via query params
   - Caches results with TanStack Query

2. **Create Flow:**
   - Creates clinic first
   - Then creates admin employee with clinic_id
   - Invalidates cache to refresh list

3. **Update Flow:**
   - Fetches clinic data
   - Pre-populates form
   - Updates on submit
   - Invalidates cache

4. **Delete Flow:**
   - Confirms action
   - Calls delete API
   - Invalidates cache
   - Navigates to list

---

## Search & Filtering

### Search
- Searches by: name, address, phone
- Real-time search (debounced)
- Resets pagination on search

### Filters
- **City** - Filter by city name
- **State** - Filter by state/province
- **Status** - Filter by active/inactive

### Pagination
- Default: 20 items per page
- Page navigation buttons
- Shows current range and total

---

## Form Validation

### Create/Edit Clinic Form

**Required Fields:**
- Clinic Name

**Optional Fields:**
- Address
- City
- State
- Zip Code
- Phone
- Email (validated if provided)
- Website (validated if provided)

**Validation Rules:**
- Email: Valid email format
- Website: Valid URL format
- All fields: Trimmed whitespace

---

## Responsive Design

- **Mobile:** Single column, stacked filters, full-width table
- **Tablet:** 2-column filters, scrollable table
- **Desktop:** 4-column filters, full table display

---

## Loading States

- Skeleton loaders for table rows
- Loading spinner for detail/edit pages
- Button loading states during mutations
- Empty states with helpful messages

---

## Error Handling

- API error messages displayed to user
- Form validation errors inline
- Network error handling
- Graceful fallbacks

---

## Future Enhancements

### Planned Features

1. **Timetable Management**
   - Initialize clinic timetable UI
   - View/edit clinic schedules
   - Bulk schedule creation

2. **Clinic Statistics**
   - Patient count per clinic
   - Employee count per clinic
   - Appointment statistics

3. **Bulk Operations**
   - Bulk activate/deactivate
   - Export clinic list
   - Import clinics

4. **Advanced Filters**
   - Date range filters
   - Multiple city/state selection
   - Sort by various fields

---

## File Structure

```
src/
├── api/
│   └── clinics.ts (API service)
├── components/
│   └── clinics/
│       ├── CreateClinicWithAdminForm.tsx
│       ├── ClinicsTable.tsx
│       └── index.ts
├── hooks/
│   └── useClinics.ts (Data fetching hooks)
├── pages/
│   ├── ClinicsPage.tsx (List)
│   ├── CreateClinicPage.tsx (Create)
│   ├── ClinicDetailPage.tsx (View)
│   └── EditClinicPage.tsx (Edit)
└── router/
    └── index.tsx (Routes)
```

---

## Dependencies

- `@tanstack/react-query` - Data fetching and caching
- `react-hook-form` - Form management
- `zod` - Schema validation
- `react-router-dom` - Navigation
- `date-fns` - Date formatting
- `react-icons/md` - Icons

---

## Testing Checklist

- [x] Create clinic with admin
- [x] List clinics with pagination
- [x] Search clinics
- [x] Filter clinics
- [x] View clinic details
- [x] Edit clinic
- [x] Delete/deactivate clinic
- [x] Loading states
- [x] Error handling
- [x] Responsive design
- [x] Form validation

---

## Notes

- Clinics must exist before patients can be registered
- SYSTEM users can manage all clinics
- ADMIN/MANAGER users can manage clinics
- Soft delete (deactivate) - clinics are not permanently deleted
- Clinic creation flow includes admin employee creation for convenience

---

## Related Modules

- **Employees Module** - Clinic admins are created during clinic creation
- **Patients Module** - Patients are associated with clinics (depends on this module)
- **Doctors Module** - Doctors are associated with clinics
- **Services Module** - Services are associated with clinics
- **Appointments Module** - Appointments require clinics
