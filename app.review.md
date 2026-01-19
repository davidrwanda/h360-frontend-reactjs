# H360 Clinic CRM - Backend API Review

**Version:** 1.0  
**Date:** 2026-01-13  
**Purpose:** Comprehensive API documentation for frontend development

---

## 📋 Table of Contents

1. [System Overview](#system-overview)
2. [Authentication & Authorization](#authentication--authorization)
3. [API Base URL](#api-base-url)
4. [Common Patterns](#common-patterns)
5. [Module APIs](#module-apis)
6. [Data Models](#data-models)
7. [Error Handling](#error-handling)
8. [Business Logic Flows](#business-logic-flows)

---

## 🎯 System Overview

H360 Clinic CRM is a comprehensive clinic management system built with NestJS. The backend provides RESTful APIs for managing:

- **Authentication** - Employee and system user login
- **Employees** - Staff management with role-based access
- **Clinics** - Multi-clinic support
- **Patients** - Patient registration and management
- **Doctors** - Doctor profiles and schedules
- **Services** - Medical services offered
- **Appointments** - Appointment booking and management
- **Slots** - Time slot availability
- **Queue** - Patient queue management
- **Notifications** - SMS/Email notifications
- **Activity Logs** - Audit trail
- **Request Logs** - HTTP request logging

---

## 🔐 Authentication & Authorization

### Authentication Flow

1. **Login** → Get JWT token
2. **Include token** in all subsequent requests: `Authorization: Bearer <token>`
3. **Token expires** → Re-login required

### User Types

1. **System User** - Master admin (from environment variables)
   - Email: `SYSTEM_USER_EMAIL`
   - Password: `SYSTEM_USER_PASSWORD`
   - Full access to all clinics

2. **Employee** - Staff members (stored in database)
   - Username or email for login
   - Password stored as bcrypt hash
   - Role-based access control

### Roles

- `ADMIN` - Full access
- `MANAGER` - Management access
- `RECEPTIONIST` - Front desk operations
- `DOCTOR` - Medical staff
- `NURSE` - Nursing staff

---

## 🌐 API Base URL

**Development:** `http://localhost:3000/api`  
**Swagger Docs:** `http://localhost:3000/api/docs`

All endpoints are prefixed with `/api`

---

## 📝 Common Patterns

### Pagination

All list endpoints support pagination:

```typescript
GET /api/resource?page=1&limit=10&sortBy=created_at&sortOrder=DESC
```

**Response:**
```json
{
  "data": [...],
  "total": 100,
  "page": 1,
  "limit": 10
}
```

### Filtering & Search

Most endpoints support filtering:

```typescript
GET /api/resource?search=keyword&clinic_id=uuid&status=active
```

### Standard Response Format

**Success (200/201):**
```json
{
  "id": "uuid",
  "field1": "value1",
  "field2": "value2",
  "created_at": "2024-01-13T10:00:00Z",
  "updated_at": "2024-01-13T10:00:00Z"
}
```

**Error (4xx/5xx):**
```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request"
}
```

---

## 🔌 Module APIs

### 1. Authentication (`/api/auth`)

#### POST `/api/auth/login`
**Public endpoint** - No authentication required

**Request:**
```json
{
  "username": "johndoe" or "admin@h360.system",
  "password": "SecurePassword123!"
}
```

**Response (200):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "Bearer",
  "expires_in": "24h",
  "user": {
    "employee_id": "uuid",
    "email": "john.doe@clinic.com",
    "username": "johndoe",
    "role": "ADMIN",
    "user_type": "EMPLOYEE" or "SYSTEM",
    "clinic_id": "uuid" or null
  }
}
```

#### GET `/api/auth/me`
**Protected** - Requires JWT token

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "employee_id": "uuid",
  "email": "john.doe@clinic.com",
  "username": "johndoe",
  "role": "ADMIN",
  "user_type": "EMPLOYEE",
  "clinic_id": "uuid"
}
```

#### POST `/api/auth/change-password`
**Protected** - Requires JWT token

**Request:**
```json
{
  "current_password": "OldPassword123!",
  "new_password": "NewPassword123!",
  "confirm_password": "NewPassword123!"
}
```

#### POST `/api/auth/logout`
**Protected** - Requires JWT token

**Response (200):**
```json
{
  "message": "Logged out successfully"
}
```

---

### 2. Employees (`/api/employees`)

**Access:** Admin, Manager (varies by endpoint)

#### POST `/api/employees`
**Create employee**

**Request:**
```json
{
  "first_name": "John",
  "last_name": "Doe",
  "email": "john.doe@clinic.com",
  "username": "johndoe",
  "password": "SecurePassword123!",
  "role": "DOCTOR",
  "phone": "+1234567890",
  "clinic_id": "uuid",
  "department": "Cardiology",
  "position": "Senior Doctor",
  "hire_date": "2024-01-15",
  "employee_number": "EMP001"
}
```

#### GET `/api/employees`
**List employees with pagination**

**Query Parameters:**
- `page` (default: 1)
- `limit` (default: 10, max: 100)
- `search` - Search by name, email, username, employee number
- `role` - Filter by role
- `clinic_id` - Filter by clinic
- `is_active` - Filter by active status
- `department` - Filter by department
- `sortBy` (default: created_at)
- `sortOrder` (ASC/DESC)

#### GET `/api/employees/:id`
**Get employee by ID**

#### PATCH `/api/employees/:id`
**Update employee**

#### DELETE `/api/employees/:id`
**Deactivate employee (soft delete)**

---

### 3. Clinics (`/api/clinics`)

**Access:** Admin, Manager, Receptionist (varies by endpoint)

#### POST `/api/clinics`
**Create clinic**

**Request:**
```json
{
  "name": "City Medical Center",
  "address": "123 Main St",
  "city": "New York",
  "state": "NY",
  "zip_code": "10001",
  "phone": "+1234567890",
  "email": "info@citymedical.com",
  "website": "https://citymedical.com"
}
```

#### GET `/api/clinics`
**List clinics**

**Query Parameters:**
- `search` - Search by name, address, phone
- `city` - Filter by city
- `state` - Filter by state
- `is_active` - Filter by active status
- `page`, `limit`, `sortBy`, `sortOrder`

#### GET `/api/clinics/:id`
**Get clinic by ID**

#### PATCH `/api/clinics/:id`
**Update clinic**

#### DELETE `/api/clinics/:id`
**Deactivate clinic**

#### POST `/api/clinics/:clinicId/timetables/initialize`
**Initialize clinic timetable (bulk create)**

**Request:**
```json
{
  "schedules": [
    {
      "day": "monday",
      "time_slots": [
        {
          "start_time": { "hour": 9, "minute": 0 },
          "end_time": { "hour": 12, "minute": 0 },
          "slot_order": 1
        },
        {
          "start_time": { "hour": 14, "minute": 0 },
          "end_time": { "hour": 17, "minute": 0 },
          "slot_order": 2
        }
      ]
    }
  ],
  "replace_existing": false,
  "is_active": true
}
```

---

### 4. Patients (`/api/patients`)

**Access:** Admin, Manager, Receptionist, Doctor, Nurse (varies by endpoint)

#### POST `/api/patients`
**Create patient manually (by employee)**

**Request:**
```json
{
  "first_name": "Jane",
  "last_name": "Smith",
  "email": "jane.smith@email.com",
  "phone": "+1234567890",
  "date_of_birth": "1990-01-15",
  "gender": "F",
  "address": "456 Oak St",
  "city": "New York",
  "state": "NY",
  "zip_code": "10002",
  "clinic_id": "uuid",
  "emergency_contact_name": "John Smith",
  "emergency_contact_phone": "+1234567891"
}
```

#### POST `/api/patients/register`
**Public endpoint** - Patient self-registration with account

**Request:**
```json
{
  "first_name": "Jane",
  "last_name": "Smith",
  "email": "jane.smith@email.com",
  "phone": "+1234567890",
  "username": "janesmith",
  "password": "SecurePassword123!",
  "clinic_id": "uuid",
  "date_of_birth": "1990-01-15",
  "gender": "F",
  "address": "456 Oak St",
  "city": "New York",
  "state": "NY",
  "zip_code": "10002"
}
```

#### POST `/api/patients/:id/subscribe`
**Subscribe patient to clinic**

**Request:**
```json
{
  "clinic_id": "uuid"
}
```

#### GET `/api/patients`
**List patients**

**Query Parameters:**
- `search` - Search by name, email, phone, patient number
- `clinic_id` - Filter by clinic
- `gender` - Filter by gender (M/F/Other)
- `subscription_status` - Filter by status (pending/active/inactive)
- `has_account` - Filter by account status
- `registration_type` - Filter by type (manual/self)
- `page`, `limit`, `sortBy`, `sortOrder`

#### GET `/api/patients/:id`
**Get patient by ID**

#### PATCH `/api/patients/:id`
**Update patient**

#### DELETE `/api/patients/:id`
**Deactivate patient (Admin, Manager only)**

---

### 5. Doctors (`/api/doctors`)

**Access:** Admin, Manager, Receptionist, Doctor, Nurse (varies by endpoint)

#### POST `/api/doctors`
**Create doctor**

**Request:**
```json
{
  "first_name": "John",
  "last_name": "Smith",
  "specialty": "Cardiology",
  "sub_specialty": "Interventional Cardiology",
  "clinic_id": "uuid",
  "license_number": "MD-LIC-2024-001",
  "license_expiry_date": "2025-12-31",
  "medical_school": "Harvard Medical School",
  "years_of_experience": 15,
  "max_daily_patients": 20,
  "appointment_duration_minutes": 15,
  "accepts_new_patients": true,
  "email": "john.smith@clinic.com",
  "phone": "+1234567890"
}
```

#### GET `/api/doctors`
**List doctors**

**Query Parameters:**
- `search` - Search by name, specialty, license number
- `clinic_id` - Filter by clinic
- `specialty` - Filter by specialty
- `accepts_new_patients` - Filter by accepts new patients
- `employee_id` - Filter by employee ID
- `page`, `limit`, `sortBy`, `sortOrder`

#### GET `/api/doctors/:id`
**Get doctor by ID**

#### PATCH `/api/doctors/:id`
**Update doctor**

#### DELETE `/api/doctors/:id`
**Deactivate doctor**

#### POST `/api/doctors/:doctorId/timetables/initialize`
**Initialize doctor timetable (bulk create)**

**Request:**
```json
{
  "schedules": [
    {
      "day": "monday",
      "time_slots": [
        {
          "start_time": { "hour": 9, "minute": 0 },
          "end_time": { "hour": 12, "minute": 0 },
          "slot_order": 1
        }
      ]
    }
  ],
  "replace_existing": false,
  "is_active": true
}
```

---

### 6. Services (`/api/services`)

**Access:** Admin, Manager, Receptionist (varies by endpoint)

#### POST `/api/services`
**Create service**

**Request:**
```json
{
  "name": "General Consultation",
  "description": "Standard consultation",
  "clinic_id": "uuid",
  "duration_minutes": 30,
  "price": 100.00,
  "category": "Consultation",
  "is_active": true
}
```

#### GET `/api/services`
**List services**

**Query Parameters:**
- `search` - Search by name, description
- `clinic_id` - Filter by clinic
- `category` - Filter by category
- `is_active` - Filter by active status
- `page`, `limit`, `sortBy`, `sortOrder`

#### GET `/api/services/:id`
**Get service by ID**

#### PATCH `/api/services/:id`
**Update service**

#### DELETE `/api/services/:id`
**Deactivate service**

#### POST `/api/services/:serviceId/assign-doctor/:doctorId`
**Assign doctor to service**

#### DELETE `/api/services/:serviceId/assign-doctor/:doctorId`
**Remove doctor from service**

---

### 7. Appointments (`/api/appointments`)

**Access:** Admin, Manager, Receptionist, Doctor, Nurse (varies by endpoint)

#### POST `/api/appointments/guest`
**Public endpoint** - Create guest appointment (no account needed)

**Request:**
```json
{
  "doctor_id": "uuid",
  "clinic_id": "uuid",
  "appointment_date": "2024-01-20",
  "appointment_time": "10:00:00",
  "service_id": "uuid",
  "guest_name": "John Guest",
  "guest_phone": "+1234567890",
  "guest_email": "guest@email.com",
  "notes": "First visit"
}
```

#### POST `/api/appointments`
**Create appointment (authenticated)**

**Request:**
```json
{
  "patient_id": "uuid",
  "doctor_id": "uuid",
  "clinic_id": "uuid",
  "service_id": "uuid",
  "appointment_date": "2024-01-20",
  "appointment_time": "10:00:00",
  "notes": "Follow-up appointment"
}
```

**OR for guest booking:**
```json
{
  "doctor_id": "uuid",
  "clinic_id": "uuid",
  "appointment_date": "2024-01-20",
  "appointment_time": "10:00:00",
  "service_id": "uuid",
  "guest_name": "John Guest",
  "guest_phone": "+1234567890",
  "guest_email": "guest@email.com"
}
```

#### GET `/api/appointments`
**List appointments**

**Query Parameters:**
- `search` - Search by patient name, guest name, phone, email
- `patient_id` - Filter by patient
- `doctor_id` - Filter by doctor
- `clinic_id` - Filter by clinic
- `appointment_date` - Filter by date (YYYY-MM-DD)
- `status` - Filter by status (booked/checked_in/in_progress/completed/cancelled/no_show)
- `is_guest_booking` - Filter guest bookings
- `guest_phone` - Filter by guest phone
- `guest_email` - Filter by guest email
- `page`, `limit`, `sortBy`, `sortOrder`

#### GET `/api/appointments/patient/:patientId`
**Get appointments for a patient** (includes guest appointments linked via phone/email)

#### GET `/api/appointments/:id`
**Get appointment by ID**

#### PATCH `/api/appointments/:id`
**Update appointment**

**Request:**
```json
{
  "appointment_date": "2024-01-21",
  "appointment_time": "11:00:00",
  "status": "checked_in",
  "notes": "Updated notes"
}
```

#### PATCH `/api/appointments/:id/cancel`
**Cancel appointment**

#### PATCH `/api/appointments/:id/link-patient/:patientId`
**Link guest appointment to patient account** (Admin, Manager, Receptionist only)

---

### 8. Slots (`/api/slots`)

**Public endpoints** - No authentication required

#### GET `/api/slots/availability`
**Get available slots**

**Query Parameters:**
- `doctor_id` - Required
- `clinic_id` - Required
- `date` - Required (YYYY-MM-DD)
- `service_id` - Optional

**Response:**
```json
{
  "date": "2024-01-20",
  "doctor_id": "uuid",
  "clinic_id": "uuid",
  "available_slots": [
    {
      "slot_id": "uuid",
      "start_time": "09:00:00",
      "end_time": "09:15:00",
      "is_available": true
    }
  ]
}
```

#### POST `/api/slots/generate`
**Generate slots for a date range**

**Request:**
```json
{
  "doctor_id": "uuid",
  "clinic_id": "uuid",
  "start_date": "2024-01-20",
  "end_date": "2024-01-27",
  "service_id": "uuid"
}
```

#### GET `/api/slots`
**List slots**

**Query Parameters:**
- `doctor_id` - Filter by doctor
- `clinic_id` - Filter by clinic
- `date` - Filter by date
- `is_available` - Filter by availability
- `page`, `limit`

---

### 9. Queue (`/api/queue`)

**Access:** Admin, Manager, Receptionist, Doctor, Nurse (varies by endpoint)

#### POST `/api/queue/check-in`
**Check in patient to queue**

**Request:**
```json
{
  "appointment_id": "uuid"
}
```

**Response:**
```json
{
  "appointment_id": "uuid",
  "queue_number": 5,
  "current_position": 3,
  "estimated_wait_time_minutes": 45,
  "status": "checked_in"
}
```

#### GET `/api/queue/position/:appointmentId`
**Get queue position for appointment**

**Response:**
```json
{
  "appointment_id": "uuid",
  "queue_number": 5,
  "current_position": 3,
  "total_in_queue": 10,
  "estimated_wait_time_minutes": 45
}
```

#### GET `/api/queue/doctor/:doctorId`
**Get queue for doctor**

**Query Parameters:**
- `date` - Required (YYYY-MM-DD)

**Response:**
```json
{
  "doctor_id": "uuid",
  "date": "2024-01-20",
  "current_position": 3,
  "total_checked_in": 10,
  "queue": [
    {
      "appointment_id": "uuid",
      "queue_number": 1,
      "patient_name": "John Doe",
      "appointment_time": "09:00:00",
      "status": "checked_in"
    }
  ]
}
```

#### PATCH `/api/queue/position`
**Update current queue position** (Admin, Manager, Doctor only)

**Request:**
```json
{
  "doctor_id": "uuid",
  "date": "2024-01-20",
  "current_position": 5
}
```

#### GET `/api/queue/stats`
**Get queue statistics**

**Query Parameters:**
- `doctor_id` - Required
- `start_date` - Required (YYYY-MM-DD)
- `end_date` - Required (YYYY-MM-DD)

**Response:**
```json
{
  "doctor_id": "uuid",
  "start_date": "2024-01-20",
  "end_date": "2024-01-27",
  "total_appointments": 50,
  "average_wait_time_minutes": 25,
  "average_queue_length": 8
}
```

---

### 10. Notifications (`/api/notifications`)

**Access:** Admin, Manager, Receptionist (varies by endpoint)

#### POST `/api/notifications/send`
**Send notification**

**Request:**
```json
{
  "channel": "email",
  "type": "appointment_reminder",
  "recipient": "patient@email.com",
  "recipient_name": "John Doe",
  "subject": "Appointment Reminder",
  "message": "Your appointment is tomorrow",
  "patient_id": "uuid",
  "appointment_id": "uuid",
  "clinic_id": "uuid"
}
```

#### POST `/api/notifications/appointment/:appointmentId/reminder`
**Send appointment reminder**

#### POST `/api/notifications/bulk-send`
**Send bulk notifications**

**Request:**
```json
{
  "channel": "email",
  "type": "appointment_reminder",
  "recipients": [
    {
      "recipient": "patient1@email.com",
      "recipient_name": "John Doe",
      "patient_id": "uuid"
    }
  ],
  "clinic_id": "uuid"
}
```

#### GET `/api/notifications`
**List notifications**

**Query Parameters:**
- `channel` - Filter by channel (sms/email)
- `type` - Filter by type
- `status` - Filter by status (pending/sent/failed)
- `recipient` - Filter by recipient
- `patient_id` - Filter by patient
- `appointment_id` - Filter by appointment
- `page`, `limit`

#### GET `/api/notifications/:id`
**Get notification by ID**

#### POST `/api/notifications/:id/resend`
**Resend failed notification**

#### POST `/api/notifications/test-smtp`
**Test SMTP configuration** (Admin only)

**Request:**
```json
{
  "recipient": "test@email.com",
  "clinic_id": "uuid"
}
```

---

### 11. Notification Templates (`/api/notifications/templates`)

**Access:** Admin, Manager

#### POST `/api/notifications/templates`
**Create template**

**Request:**
```json
{
  "name": "appointment_reminder",
  "type": "email",
  "clinic_id": "uuid",
  "subject": "Appointment Reminder - {{clinic_name}}",
  "text": "Hello {{patient_name}}, your appointment is on {{appointment_date}}",
  "html": "<h1>Appointment Reminder</h1>",
  "description": "Reminder for upcoming appointments",
  "variables": ["clinic_name", "patient_name", "appointment_date"],
  "is_active": true,
  "is_default": false
}
```

#### GET `/api/notifications/templates`
**List templates**

#### GET `/api/notifications/templates/:id`
**Get template by ID**

#### PUT `/api/notifications/templates/:id`
**Update template**

#### DELETE `/api/notifications/templates/:id`
**Delete template**

---

### 12. Activity Logs (`/api/activity-logs`)

**Access:** Admin, Manager

#### GET `/api/activity-logs`
**List activity logs**

**Query Parameters:**
- `employee_id` - Filter by employee
- `action_type` - Filter by action type
- `entity_type` - Filter by entity type
- `entity_id` - Filter by entity ID
- `clinic_id` - Filter by clinic
- `start_date` - Filter from date
- `end_date` - Filter to date
- `page`, `limit`

#### GET `/api/activity-logs/:id`
**Get activity log by ID**

#### GET `/api/activity-logs/entity/:entityType/:entityId`
**Get logs for an entity**

---

### 13. Request Logs (`/api/request-logs`)

**Access:** Admin, Manager

#### GET `/api/request-logs`
**List request logs**

**Query Parameters:**
- `sent_by` - Filter by user
- `method` - Filter by HTTP method
- `request_url` - Filter by URL
- `status_code` - Filter by status code
- `clinic_id` - Filter by clinic
- `start_date` - Filter from date
- `end_date` - Filter to date
- `page`, `limit`

#### GET `/api/request-logs/:id`
**Get request log by ID**

#### GET `/api/request-logs/request/:requestId`
**Get logs by request ID**

---

### 14. Health Check (`/api/health`)

**Public endpoint**

#### GET `/api/health`

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-13T10:00:00Z"
}
```

---

## 📊 Data Models

### Common Fields

Most entities include:
- `id` (UUID) - Primary key
- `created_at` (ISO 8601 datetime)
- `updated_at` (ISO 8601 datetime)
- `is_active` (boolean) - Soft delete flag

### Employee

```typescript
{
  employee_id: string; // UUID
  first_name: string;
  last_name: string;
  full_name: string; // Computed
  email: string;
  username: string;
  role: "ADMIN" | "MANAGER" | "RECEPTIONIST" | "DOCTOR" | "NURSE";
  phone?: string;
  clinic_id?: string; // UUID
  department?: string;
  position?: string;
  hire_date?: string; // YYYY-MM-DD
  employee_number?: string;
  is_active: boolean;
  created_at: string; // ISO 8601
  updated_at: string; // ISO 8601
}
```

### Patient

```typescript
{
  patient_id: string; // UUID
  first_name: string;
  last_name: string;
  full_name: string; // Computed
  email?: string;
  phone?: string;
  date_of_birth?: string; // YYYY-MM-DD
  gender?: "M" | "F" | "Other";
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  patient_number?: string;
  has_account: boolean;
  username?: string;
  registration_type: "manual" | "self";
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  created_at: string; // ISO 8601
  updated_at: string; // ISO 8601
}
```

### Appointment

```typescript
{
  appointment_id: string; // UUID
  patient_id?: string; // UUID (null for guest bookings)
  doctor_id: string; // UUID
  clinic_id: string; // UUID
  service_id?: string; // UUID
  appointment_date: string; // YYYY-MM-DD
  appointment_time: string; // HH:mm:ss
  status: "booked" | "checked_in" | "in_progress" | "completed" | "cancelled" | "no_show";
  queue_number?: number;
  is_guest_booking: boolean;
  guest_name?: string;
  guest_phone?: string;
  guest_email?: string;
  notes?: string;
  created_at: string; // ISO 8601
  updated_at: string; // ISO 8601
}
```

### Doctor

```typescript
{
  doctor_id: string; // UUID
  first_name: string;
  last_name: string;
  full_name: string; // Computed
  specialty: string;
  sub_specialty?: string;
  clinic_id: string; // UUID
  license_number?: string;
  license_expiry_date?: string; // YYYY-MM-DD
  medical_school?: string;
  years_of_experience?: number;
  max_daily_patients?: number;
  appointment_duration_minutes?: number;
  accepts_new_patients: boolean;
  email?: string;
  phone?: string;
  is_active: boolean;
  created_at: string; // ISO 8601
  updated_at: string; // ISO 8601
}
```

### Clinic

```typescript
{
  clinic_id: string; // UUID
  name: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  phone?: string;
  email?: string;
  website?: string;
  is_active: boolean;
  created_at: string; // ISO 8601
  updated_at: string; // ISO 8601
}
```

---

## ⚠️ Error Handling

### Standard Error Response

```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request"
}
```

### Common HTTP Status Codes

- `200 OK` - Success
- `201 Created` - Resource created
- `400 Bad Request` - Validation error or bad input
- `401 Unauthorized` - Missing or invalid token
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `409 Conflict` - Resource already exists or conflict
- `500 Internal Server Error` - Server error

### Error Handling Best Practices

1. **Check status code** before parsing response
2. **Handle 401** - Redirect to login
3. **Handle 403** - Show permission error
4. **Handle 400** - Display validation errors
5. **Handle 500** - Show generic error message

---

## 🔄 Business Logic Flows

### 1. Patient Registration Flow

```
1. Patient visits registration page
2. POST /api/patients/register (public)
3. Patient account created
4. Patient can login with username/password
5. Patient can book appointments
```

### 2. Appointment Booking Flow

```
1. Patient/Employee selects doctor and date
2. GET /api/slots/availability?doctor_id=xxx&date=2024-01-20
3. Display available slots
4. User selects slot
5. POST /api/appointments (or /api/appointments/guest for guests)
6. Appointment created with status "booked"
7. Notification sent (if configured)
```

### 3. Check-in Flow

```
1. Patient arrives at clinic
2. Employee finds appointment
3. POST /api/queue/check-in { appointment_id }
4. Queue number assigned atomically
5. Appointment status changes to "checked_in"
6. GET /api/queue/position/:appointmentId to show position
```

### 4. Queue Management Flow

```
1. Doctor starts seeing patients
2. PATCH /api/queue/position { doctor_id, date, current_position: 1 }
3. System updates current position
4. GET /api/queue/doctor/:doctorId?date=2024-01-20
5. Display queue with positions
6. As appointments complete, update current_position
```

### 5. Guest Appointment Linking Flow

```
1. Guest books appointment (POST /api/appointments/guest)
2. Guest arrives and provides phone/email
3. Employee searches for patient by phone/email
4. If patient exists, PATCH /api/appointments/:id/link-patient/:patientId
5. Guest appointment linked to patient account
6. Patient can see appointment in their history
```

---

## 🎨 Frontend Integration Tips

### 1. Authentication

```typescript
// Store token in localStorage or secure storage
localStorage.setItem('token', response.access_token);

// Include in all requests
headers: {
  'Authorization': `Bearer ${token}`
}

// Handle token expiration
if (response.status === 401) {
  localStorage.removeItem('token');
  redirectToLogin();
}
```

### 2. Pagination Component

```typescript
interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

// Use in list components
const [page, setPage] = useState(1);
const [limit, setLimit] = useState(10);
const [data, setData] = useState<PaginatedResponse<Entity>>();
```

### 3. Date Formatting

```typescript
// Backend uses ISO 8601 format
// Format for display: YYYY-MM-DD or DD/MM/YYYY
const formatDate = (isoDate: string) => {
  return new Date(isoDate).toLocaleDateString();
};
```

### 4. Error Handling

```typescript
try {
  const response = await fetch('/api/resource', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'An error occurred');
  }
  
  return await response.json();
} catch (error) {
  // Handle error
  console.error(error);
}
```

---

## 📚 Additional Resources

- **Swagger Documentation:** `http://localhost:3000/api/docs`
- **Module Documentation:** `docs/modules/`
- **Solution Design:** `SSD.md`
- **Module Roadmap:** `MODULE_ROADMAP.md`

---

## 🔧 Development Notes

### Environment Variables Required

```env
NODE_ENV=development
PORT=3000
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=24h
SYSTEM_USER_EMAIL=admin@h360.system
SYSTEM_USER_PASSWORD=SecurePassword123!

DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=postgres
DATABASE_NAME=h360_clinic_crm

REDIS_HOST=localhost
REDIS_PORT=6379

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=app_password
SMTP_FROM=noreply@h360.clinic
```

### CORS Configuration

If frontend runs on different port, configure CORS in `main.ts`:

```typescript
app.enableCors({
  origin: 'http://localhost:3001', // Frontend URL
  credentials: true,
});
```

---

**Last Updated:** 2026-01-13  
**Version:** 1.0
