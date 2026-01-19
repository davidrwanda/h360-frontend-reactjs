# Clinics Management API

**Base Path:** `/api/clinics`  
**Access:** Admin, Manager, Receptionist (varies by endpoint)

---

## Available Endpoints

### 1. Create Clinic
**POST** `/api/clinics`

**Access:** Admin, Manager

**Request Body:**
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

**Response:**
```json
{
  "clinic_id": "uuid",
  "name": "City Medical Center",
  "address": "123 Main St",
  "city": "New York",
  "state": "NY",
  "zip_code": "10001",
  "phone": "+1234567890",
  "email": "info@citymedical.com",
  "website": "https://citymedical.com",
  "is_active": true,
  "created_at": "2024-01-13T10:00:00Z",
  "updated_at": "2024-01-13T10:00:00Z"
}
```

---

### 2. List Clinics
**GET** `/api/clinics`

**Access:** Admin, Manager, Receptionist

**Query Parameters:**
- `page` (default: 1) - Page number
- `limit` (default: 10, max: 100) - Items per page
- `search` - Search by name, address, phone
- `city` - Filter by city
- `state` - Filter by state
- `is_active` - Filter by active status (true/false)
- `sortBy` (default: created_at) - Sort field
- `sortOrder` (ASC/DESC) - Sort order

**Example:**
```
GET /api/clinics?page=1&limit=20&search=Medical&city=New York&is_active=true
```

**Response:**
```json
{
  "data": [
    {
      "clinic_id": "uuid",
      "name": "City Medical Center",
      ...
    }
  ],
  "total": 50,
  "page": 1,
  "limit": 20
}
```

---

### 3. Get Clinic by ID
**GET** `/api/clinics/:id`

**Access:** Admin, Manager, Receptionist

**Response:**
```json
{
  "clinic_id": "uuid",
  "name": "City Medical Center",
  ...
}
```

---

### 4. Update Clinic
**PATCH** `/api/clinics/:id`

**Access:** Admin, Manager

**Request Body:**
```json
{
  "name": "Updated Clinic Name",
  "phone": "+1234567891",
  "is_active": true
}
```

**Response:** Updated clinic object

---

### 5. Deactivate Clinic
**DELETE** `/api/clinics/:id`

**Access:** Admin, Manager

**Response:**
```json
{
  "message": "Clinic deactivated successfully"
}
```

---

### 6. Initialize Clinic Timetable
**POST** `/api/clinics/:clinicId/timetables/initialize`

**Access:** Admin, Manager

**Request Body:**
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
    },
    {
      "day": "tuesday",
      "time_slots": [
        {
          "start_time": { "hour": 9, "minute": 0 },
          "end_time": { "hour": 17, "minute": 0 },
          "slot_order": 1
        }
      ]
    }
  ],
  "replace_existing": false,
  "is_active": true
}
```

**Response:**
```json
{
  "message": "Timetable initialized successfully"
}
```

---

## Usage in Frontend

```typescript
import { clinicsApi } from '@/api/clinics';

// Create clinic
const newClinic = await clinicsApi.create({
  name: 'City Medical Center',
  address: '123 Main St',
  city: 'New York',
  phone: '+1234567890',
  email: 'info@citymedical.com',
});

// List clinics
const clinics = await clinicsApi.list({
  page: 1,
  limit: 20,
  search: 'Medical',
  is_active: true,
});

// Get clinic by ID
const clinic = await clinicsApi.getById('clinic-uuid');

// Update clinic
const updated = await clinicsApi.update('clinic-uuid', {
  name: 'Updated Name',
  phone: '+1234567891',
});

// Initialize timetable
await clinicsApi.initializeTimetable('clinic-uuid', {
  schedules: [
    {
      day: 'monday',
      time_slots: [
        {
          start_time: { hour: 9, minute: 0 },
          end_time: { hour: 17, minute: 0 },
          slot_order: 1,
        },
      ],
    },
  ],
  replace_existing: false,
  is_active: true,
});
```

---

## Notes

- All endpoints require authentication (JWT token)
- SYSTEM users (with permissions: "ALL") have Admin access
- Pagination is supported on list endpoint
- Search is case-insensitive
- Soft delete (deactivate) - clinic is not permanently deleted
