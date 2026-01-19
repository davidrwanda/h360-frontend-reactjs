# Week 1: Project Setup & Design System

**Status:** ✅ Completed  
**Date:** 2026-01-13

---

## Overview

Week 1 focused on setting up the foundation of the H360 Clinic CRM frontend application. This includes project initialization, design system configuration, and base infrastructure setup.

---

## ✅ Completed Tasks

### 1. Project Initialization
- ✅ React 18 + TypeScript 5 + Vite setup
- ✅ TypeScript strict mode configuration
- ✅ Path aliases configured (`@/*` → `./src/*`)
- ✅ Development server configured (port 3001)

### 2. Styling & Design System
- ✅ TailwindCSS 3+ installed and configured
- ✅ Brand colors integrated:
  - Azure Dragon (#003D7A)
  - White Smoke (#F5F5F5)
  - Bright Halo (#FFD166)
  - Carbon (#333333)
  - Smudged Lips (#EF436B)
- ✅ Typography scale configured (Major Third - 1.250)
- ✅ Custom fonts (Ultra, PT Serif, Lato) linked
- ✅ Mobile-first responsive breakpoints
- ✅ Touch-friendly minimum sizes (44x44px)

### 3. Code Quality Tools
- ✅ ESLint configured with TypeScript rules
- ✅ Prettier configured for code formatting
- ✅ TypeScript strict mode enabled
- ✅ Git hooks ready (Husky can be added later)

### 4. State Management & Data
- ✅ React Query (TanStack Query) configured
  - 5-minute stale time
  - 30-minute cache duration
  - Optimized defaults
- ✅ IndexedDB setup with Dexie.js
  - Database schema defined
  - Helper functions for stale checking
- ✅ API client (Axios) configured
  - Request interceptor for auth tokens
  - Response interceptor for error handling
  - 401 redirect to login

### 5. Base UI Components
- ✅ **Button** - Primary, secondary, outline, ghost, danger variants
- ✅ **Input** - With label, error, and helper text support
- ✅ **Card** - Default, outline, elevated variants
- ✅ **Loading** - Spinner component with size variants
- ✅ All components follow accessibility guidelines
- ✅ Mobile-optimized (minimum 44x44px touch targets)

### 6. Project Structure
```
src/
├── api/              # API client
├── components/ui/    # Base UI components
├── db/               # IndexedDB setup
├── lib/              # Library configs
├── styles/           # Global styles
├── utils/            # Utilities
└── ...
```

---

## 📦 Dependencies Installed

### Core
- `react` ^18.3.1
- `react-dom` ^18.3.1
- `typescript` ^5.5.4
- `vite` ^5.4.6

### State & Data
- `@tanstack/react-query` ^5.59.0
- `@tanstack/react-query-persist-client` ^5.59.0
- `@tanstack/react-virtual` ^3.11.0
- `dexie` ^4.0.1
- `axios` ^1.7.7
- `zustand` ^5.0.1

### UI & Forms
- `tailwindcss` ^3.4.13
- `react-hook-form` ^7.53.0
- `zod` ^3.23.8
- `react-icons` ^5.3.0

### Utilities
- `clsx` ^2.1.1
- `tailwind-merge` ^2.5.2
- `date-fns` ^4.1.0

---

## 🎨 Design System Implementation

### Colors
All brand colors are available as TailwindCSS utilities:
- `bg-azure-dragon`, `text-azure-dragon`
- `bg-white-smoke`, `text-white-smoke`
- `bg-bright-halo`, `text-bright-halo`
- `bg-carbon`, `text-carbon`
- `bg-smudged-lips`, `text-smudged-lips`

### Typography
Font sizes follow the Major Third scale:
- `text-h1` → 3.05em (54.932px)
- `text-h2` → 2.44em (43.945px)
- `text-h3` → 1.95em (35.156px)
- `text-h4` → 1.56em (28.125px)
- `text-h5` → 1.25em (22.5px)
- `text-body` → 1em (18px)
- `text-caption` → 0.8em (14.4px)
- `text-small` → 0.64em (11.52px)

### Font Families
- `font-heading` → Ultra Regular
- `font-body` → PT Serif Regular
- `font-ui` → Lato Regular

---

## 🔧 Configuration Files

### TypeScript (`tsconfig.json`)
- Strict mode enabled
- Path aliases configured
- No unused locals/parameters
- Force consistent casing

### TailwindCSS (`tailwind.config.js`)
- Brand colors extended
- Typography scale configured
- Custom fonts added
- Mobile-first breakpoints

### ESLint (`.eslintrc.cjs`)
- TypeScript recommended rules
- React hooks rules
- No `any` types allowed
- Unused variables error

### Prettier (`.prettierrc`)
- Single quotes
- 2-space indentation
- 100 character line width
- Trailing commas

---

## 📝 Usage Examples

### Using Base Components

```tsx
import { Button, Input, Card, CardHeader, CardTitle, CardContent } from '@/components/ui';

function Example() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Example Card</CardTitle>
      </CardHeader>
      <CardContent>
        <Input label="Name" placeholder="Enter name" />
        <Button variant="primary" size="md">Submit</Button>
      </CardContent>
    </Card>
  );
}
```

### Using React Query

```tsx
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/api/client';

function usePatients() {
  return useQuery({
    queryKey: ['patients'],
    queryFn: () => apiClient.get('/patients').then(res => res.data),
  });
}
```

### Using IndexedDB

```tsx
import { db } from '@/db';

// Store patient
await db.patients.put({
  id: '1',
  patient_id: 'uuid',
  first_name: 'John',
  last_name: 'Doe',
  synced_at: new Date(),
});

// Query patients
const patients = await db.patients.where('clinic_id').equals('clinic-uuid').toArray();
```

---

## 🧪 Testing

Testing infrastructure will be set up in future weeks. Current focus is on:
- Manual testing of components
- Visual verification of design system
- API client testing with mock data

---

## 🐛 Known Issues

None at this time.

---

## 📚 References

- [Roadmap](../roadmap.md) - Complete implementation roadmap
- [API Review](../../app.review.md) - Backend API documentation
- [TailwindCSS Docs](https://tailwindcss.com/docs)
- [React Query Docs](https://tanstack.com/query/latest)
- [Dexie.js Docs](https://dexie.org/)

---

## ✅ Checklist

- [x] Project initialized
- [x] TailwindCSS configured
- [x] Brand colors integrated
- [x] Typography scale configured
- [x] TypeScript strict mode
- [x] ESLint & Prettier
- [x] React Query setup
- [x] IndexedDB setup
- [x] API client configured
- [x] Base UI components created
- [x] Project structure organized
- [x] Documentation created

---

**Next Week:** Authentication Module
