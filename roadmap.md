# H360 Clinic CRM - Frontend Implementation Roadmap

**Version:** 1.0  
**Date:** 2026-01-13  
**Author:** David Ntamakemwa

---

## 🎨 **Brand Colors & Design System**

### Primary Colors

| Color Name | Hex Code | RGB | CMYK | Contrast | Usage |
|------------|----------|-----|------|----------|-------|
| **AZURE DRAGON** | `#003D7A` | 0, 61, 122 | 100, 50, 0, 52 | 1.96 (FAIL) | Primary brand color, headers, CTAs |
| **WHITE SMOKE** | `#F5F5F5` | 245, 245, 245 | 0, 0, 0, 4 | 6.72 (AA) | Backgrounds, cards |
| **BRIGHT HALO** | `#FFD166` | 255, 209, 102 | 0, 18, 60, 0 | 3.97 (AA+) | Accents, highlights, warnings |
| **CARBON** | `#333333` | 51, 51, 51 | 0, 0, 0, 80 | 13.00 (AAA) | Text, borders |
| **SMUDGED LIPS** | `#EF436B` | 239, 67, 107 | 0, 72, 55, 6 | 3.90 (AA+) | Errors, alerts, important actions |

### Gradients

- `#003D7A` → `#001A34` → `#003D7A` (Primary gradient)
- `#003D7A` → `#91ACC6` (Light gradient)
- `#333333` → `#161616` (Dark gradient)

### Typography

**Font Families:**
- **Ultra Regular** - Headings (h1-h3)
- **PT Serif Regular** - Body text, descriptions
- **Lato Regular** - UI elements, buttons, labels

**Typographic Scale (Major Third - 1.250):**
- `h1`: 3.05em (54.932px)
- `h2`: 2.44em (43.945px)
- `h3`: 1.95em (35.156px)
- `h4`: 1.56em (28.125px)
- `h5`: 1.25em (22.5px)
- `Body text`: 1em (18px)
- `Caption text`: 0.8em (14.4px)
- `Small print`: 0.64em (11.52px)

**Note:** Ensure proper contrast ratios when using Azure Dragon (#003D7A) - always pair with White Smoke (#F5F5F5) or brighter backgrounds for readability.

---

## **Implementation Strategy**

- **One module per week** - Complete, tested, and running
- **Mobile-first design** - Responsive, touch-friendly, optimized for mobile devices
- **Best practices** - React best practices, TypeScript strict mode, component composition
- **Design system** - Consistent UI components following brand guidelines
- **Documentation** - Each module has its own `.md` documentation file
- **Testing** - Unit tests, integration tests, and e2e tests for each module
- **Code quality** - ESLint, Prettier, TypeScript strict mode, accessibility (WCAG 2.1 AA)

---

## **Module Implementation Schedule**

| Week | Module | Status | Documentation | Tests | Notes |
|------|--------|--------|----------------|-------|-------|
| Week 1 | **Project Setup & Design System** | ✅ Completed | [setup.md](./docs/modules/setup.md) | ⏳ | React + TypeScript, TailwindCSS, theme config, base components, IndexedDB setup, Tauri foundation |
| Week 2 | **Authentication Module** | ✅ Completed | [auth.md](./docs/modules/auth.md) | ⏳ | Login, logout, token management, protected routes |
| Week 3 | **Layout & Navigation** | ✅ Completed | [layout.md](./docs/modules/layout.md) | ⏳ | Responsive sidebar, header, mobile menu, role-based navigation |
| Week 4 | **Dashboard Module** | ✅ Completed | [dashboard.md](./docs/modules/dashboard.md) | ⏳ | Overview cards, charts, quick actions, role-based views |
| Week 5 | **Clinics Module** | ✅ Completed | [clinics.md](./docs/modules/clinics.md) | ⏳ | Clinic list, CRUD, timetable initialization, clinic management |
| Week 6 | **Doctors Module** | ⏳ Pending | [doctors.md](./docs/modules/doctors.md) | ⏳ | Doctor list, profiles, schedules, timetable management |
| Week 7 | **Services Module** | ⏳ Pending | [services.md](./docs/modules/services.md) | ⏳ | Service list, CRUD, doctor assignments, categories |
| Week 8 | **Appointments Module** | ⏳ Pending | [appointments.md](./docs/modules/appointments.md) | ⏳ | Booking flow, calendar view, guest booking, mobile booking |
| Week 9 | **Slots & Availability** | ⏳ Pending | [slots.md](./docs/modules/slots.md) | ⏳ | Slot selection, availability display, time picker |
| Week 10 | **Queue Management** | ⏳ Pending | [queue.md](./docs/modules/queue.md) | ⏳ | Check-in, queue display, position tracking, real-time updates |
| Week 6 | **Patients Module** | ⏳ Pending | [patients.md](./docs/modules/patients.md) | ⏳ | Patient list, registration, search, profile, mobile-optimized forms |
| Week 12 | **Employees Module** | ⏳ Pending | [employees.md](./docs/modules/employees.md) | ⏳ | Employee management, role assignment, permissions |
| Week 13 | **Notifications Module** | ⏳ Pending | [notifications.md](./docs/modules/notifications.md) | ⏳ | Notification center, templates, send notifications |
| Week 14 | **Activity Logs** | ⏳ Pending | [activity-logs.md](./docs/modules/activity-logs.md) | ⏳ | Audit trail display, filtering, export |
| Week 15 | **Settings & Profile** | ⏳ Pending | [settings.md](./docs/modules/settings.md) | ⏳ | User profile, password change, preferences |
| Week 16 | **Polish & Optimization** | ⏳ Pending | [polish.md](./docs/modules/polish.md) | ⏳ | Performance optimization, PWA, offline support, final testing |

**Legend:**
- 🔄 In Progress
- ✅ Completed
- ⏳ Pending
- 🐛 Blocked

---

## **Module Dependencies**

```
Project Setup & Design System (Week 1)
    ↓
Authentication Module (Week 2) ──┐
    ↓                              │
Layout & Navigation (Week 3) ─────┼──┐
    ↓                              │  │
Dashboard Module (Week 4) ─────────┼──┼──┐
    ↓                              │  │  │
Patients Module (Week 5) ──────────┼──┼──┼──┐
    ↓                              │  │  │  │
Doctors Module (Week 6) ───────────┼──┼──┼──┼──┐
    ↓                              │  │  │  │  │
Services Module (Week 7) ──────────┼──┼──┼──┼──┼──┐
    ↓                              │  │  │  │  │  │
Appointments Module (Week 8) ──────┼──┼──┼──┼──┼──┼──┐
    ↓                              │  │  │  │  │  │  │
Slots & Availability (Week 9) ────┼──┼──┼──┼──┼──┼──┼──┐
    ↓                              │  │  │  │  │  │  │  │
Queue Management (Week 10) ────────┼──┼──┼──┼──┼──┼──┼──┼──┐
    ↓                              │  │  │  │  │  │  │  │  │
Clinics Module (Week 11) ──────────┼──┼──┼──┼──┼──┼──┼──┼──┼──┐
    ↓                              │  │  │  │  │  │  │  │  │  │
Employees Module (Week 12) ────────┼──┼──┼──┼──┼──┼──┼──┼──┼──┼──┐
    ↓                              │  │  │  │  │  │  │  │  │  │  │
Notifications Module (Week 13) ────┼──┼──┼──┼──┼──┼──┼──┼──┼──┼──┼──┐
    ↓                              │  │  │  │  │  │  │  │  │  │  │  │
Activity Logs (Week 14) ───────────┼──┼──┼──┼──┼──┼──┼──┼──┼──┼──┼──┼──┐
    ↓                              │  │  │  │  │  │  │  │  │  │  │  │  │
Settings & Profile (Week 15) ──────┼──┼──┼──┼──┼──┼──┼──┼──┼──┼──┼──┼──┼──┐
    ↓                              │  │  │  │  │  │  │  │  │  │  │  │  │  │
Polish & Optimization (Week 16) ───┘  ┘  ┘  ┘  ┘  ┘  ┘  ┘  ┘  ┘  ┘  ┘  ┘  ┘
```

---

## **Technology Stack**

### Core
- **React 18+** - UI library
- **TypeScript 5+** - Type safety
- **Vite** - Build tool and dev server
- **React Router 6+** - Routing

### Styling
- **TailwindCSS 3+** - Utility-first CSS
- **Headless UI** - Accessible UI components
- **React Hook Form** - Form management
- **Zod** - Schema validation

### State Management
- **TanStack Query (React Query)** - Server state management with intelligent caching
- **TanStack Query Persist** - Persist queries to IndexedDB for offline support
- **Zustand** - Client state management (lightweight)
- **React Context** - Theme, auth context

### Data Storage & Caching (Fast Records)
- **IndexedDB (via Dexie.js)** - Client-side database for offline data storage
- **React Query Cache** - In-memory cache with automatic background refetching
- **React Query Persistence** - Persist cache to IndexedDB for instant app startup
- **Virtual Scrolling (TanStack Virtual)** - Efficient rendering of large lists (1000+ records)
- **Optimistic Updates** - Instant UI updates before server confirmation
- **Infinite Queries** - Efficient pagination for large datasets

### HTTP Client
- **Axios** - API requests with interceptors
- **Axios interceptors** - Token injection, error handling
- **Request deduplication** - React Query automatically deduplicates requests
- **Request cancellation** - Cancel in-flight requests when component unmounts

### UI Components
- **Radix UI** - Accessible component primitives
- **React Icons** - Icon library
- **Date-fns** - Date manipulation
- **React Datepicker** - Date selection
- **TanStack Virtual** - Virtual scrolling for large lists
- **React Window** (alternative) - Virtualization for performance

### Desktop App Framework
- **Tauri 2.0** - Modern, lightweight desktop app framework (Rust-based)
  - **Smaller bundle size** (~3MB vs Electron's ~100MB+)
  - **Better performance** - Native performance, lower memory usage
  - **Native OS integration** - File system, notifications, system tray
  - **Cross-platform** - Windows, macOS, Linux support
  - **Security** - Built-in security best practices
  - **Future-ready** - Easy migration path from web to desktop

### Mobile & PWA
- **PWA Support** - Service worker, manifest
- **Touch-friendly** - Large tap targets (min 44x44px)
- **Responsive breakpoints** - Mobile-first approach
- **Offline-first architecture** - IndexedDB + Service Worker caching

### Testing
- **Vitest** - Unit testing
- **React Testing Library** - Component testing
- **Playwright** - E2E testing
- **MSW (Mock Service Worker)** - API mocking

### Code Quality
- **ESLint** - Linting
- **Prettier** - Code formatting
- **Husky** - Git hooks
- **lint-staged** - Pre-commit checks
- **TypeScript strict mode** - Strict type checking

### Development Tools
- **React DevTools** - Debugging
- **React Query DevTools** - Query debugging
- **Error Boundary** - Error handling
- **React Error Boundary** - Error UI

---

## **Project Structure**

```
H360-frontend/
├── public/
│   ├── favicon.ico
│   ├── manifest.json
│   └── icons/
├── src/
│   ├── api/
│   │   ├── client.ts          # Axios instance
│   │   ├── endpoints.ts        # API endpoints
│   │   └── types.ts            # API types
│   ├── db/
│   │   ├── index.ts           # Dexie database setup
│   │   ├── schemas.ts          # IndexedDB schemas
│   │   └── sync.ts             # Sync logic (online/offline)
│   ├── components/
│   │   ├── ui/                 # Base UI components
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Card.tsx
│   │   │   └── ...
│   │   ├── layout/             # Layout components
│   │   │   ├── Header.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── MobileMenu.tsx
│   │   └── features/           # Feature-specific components
│   ├── features/               # Feature modules
│   │   ├── auth/
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   ├── services/
│   │   │   └── types.ts
│   │   ├── patients/
│   │   ├── appointments/
│   │   └── ...
│   ├── hooks/                  # Shared hooks
│   │   ├── useAuth.ts
│   │   ├── useApi.ts
│   │   └── ...
│   ├── store/                  # State management
│   │   ├── authStore.ts
│   │   └── ...
│   ├── utils/                  # Utilities
│   │   ├── format.ts
│   │   ├── validation.ts
│   │   └── ...
│   ├── styles/                 # Global styles
│   │   ├── globals.css
│   │   └── theme.css
│   ├── types/                  # Global types
│   │   ├── api.ts
│   │   ├── auth.ts
│   │   └── ...
│   ├── App.tsx
│   ├── main.tsx
│   └── vite-env.d.ts
├── src-tauri/                  # Tauri backend (for desktop app)
│   ├── src/
│   │   └── main.rs             # Tauri entry point
│   ├── Cargo.toml              # Rust dependencies
│   └── tauri.conf.json         # Tauri configuration
├── docs/
│   └── modules/                # Module documentation
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── .env.example
├── .gitignore
├── eslint.config.js
├── prettier.config.js
├── tailwind.config.js
├── tsconfig.json
├── vite.config.ts
├── package.json
└── README.md
```

---

## **Module Checklist**

Each module must have:

- [ ] **Module Structure**
  - [ ] Feature folder with components, hooks, services
  - [ ] Type definitions
  - [ ] API integration
  - [ ] Form validation (if applicable)

- [ ] **UI Components**
  - [ ] Mobile-responsive design
  - [ ] Touch-friendly (min 44x44px tap targets)
  - [ ] Accessibility (ARIA labels, keyboard navigation)
  - [ ] Loading states
  - [ ] Error states
  - [ ] Empty states

- [ ] **Documentation**
  - [ ] Module documentation (`.md` file)
  - [ ] Component documentation (JSDoc)
  - [ ] API integration notes

- [ ] **Testing**
  - [ ] Unit tests (components, hooks)
  - [ ] Integration tests (API calls)
  - [ ] E2E tests (critical flows)
  - [ ] Test coverage ≥ 80%

- [ ] **Code Quality**
  - [ ] ESLint passing
  - [ ] Prettier formatted
  - [ ] TypeScript strict mode
  - [ ] No console.logs in production code
  - [ ] Proper error handling

- [ ] **Best Practices**
  - [ ] Component composition
  - [ ] Custom hooks for reusable logic
  - [ ] Proper TypeScript types
  - [ ] Error boundaries
  - [ ] Loading states
  - [ ] Optimistic updates (where applicable)

- [ ] **Mobile Optimization**
  - [ ] Responsive breakpoints
  - [ ] Touch gestures
  - [ ] Mobile navigation
  - [ ] Performance optimization
  - [ ] Image optimization

---

## **Mobile-First Design Principles**

### Breakpoints
```css
sm: 640px   /* Small devices (landscape phones) */
md: 768px   /* Medium devices (tablets) */
lg: 1024px  /* Large devices (desktops) */
xl: 1280px  /* Extra large devices */
2xl: 1536px /* 2X Extra large devices */
```

### Touch Targets
- Minimum size: **44x44px** (iOS/Android guidelines)
- Spacing between targets: **8px minimum**
- Large buttons for primary actions

### Typography
- Base font size: **16px** (prevents zoom on iOS)
- Line height: **1.5** for readability
- Font scaling: Use `rem` units

### Navigation
- Bottom navigation bar for mobile
- Hamburger menu for sidebar
- Swipe gestures where appropriate
- Back button support

### Forms
- Large input fields
- Native date/time pickers on mobile
- Input type hints (email, tel, etc.)
- Validation feedback

---

## **Weekly Process**

1. **Monday**: Review module requirements, design UI mockups, plan component structure
2. **Tuesday-Wednesday**: Implement module (components, hooks, API integration)
3. **Thursday**: Write tests (unit, integration, e2e), mobile testing
4. **Friday**: Documentation, code review, final testing, mobile device testing
5. **Weekend**: Deploy to staging, demo preparation, gather feedback

---

## **API Integration Guidelines**

### Base Configuration
```typescript
// src/api/client.ts
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});
```

### Authentication Interceptor
```typescript
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

### Error Handling Interceptor
```typescript
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized - redirect to login
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

### React Query Integration
```typescript
// Use React Query for all API calls with caching
const { data, isLoading, error } = useQuery({
  queryKey: ['patients', page, limit],
  queryFn: () => fetchPatients({ page, limit }),
  staleTime: 5 * 60 * 1000, // 5 minutes - data stays fresh
  cacheTime: 30 * 60 * 1000, // 30 minutes - cache duration
});

// Infinite query for large datasets
const {
  data,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
} = useInfiniteQuery({
  queryKey: ['patients'],
  queryFn: ({ pageParam = 1 }) => fetchPatients({ page: pageParam }),
  getNextPageParam: (lastPage, pages) => lastPage.nextPage,
});
```

### IndexedDB Setup (Dexie.js)
```typescript
// src/db/index.ts
import Dexie, { Table } from 'dexie';

export interface Patient {
  id: string;
  first_name: string;
  last_name: string;
  // ... other fields
  synced_at?: Date;
}

class H360Database extends Dexie {
  patients!: Table<Patient>;
  appointments!: Table<Appointment>;
  // ... other tables

  constructor() {
    super('H360Database');
    this.version(1).stores({
      patients: 'id, patient_number, email, phone, clinic_id',
      appointments: 'id, patient_id, doctor_id, appointment_date',
    });
  }
}

export const db = new H360Database();
```

### React Query Persistence
```typescript
// Persist React Query cache to IndexedDB
import { persistQueryClient } from '@tanstack/react-query-persist-client';
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';

const persister = createSyncStoragePersister({
  storage: {
    getItem: (key) => db.getItem(key),
    setItem: (key, value) => db.setItem(key, value),
    removeItem: (key) => db.removeItem(key),
  },
});

persistQueryClient({
  queryClient,
  persister,
});
```

### Virtual Scrolling Example
```typescript
// For large lists (1000+ records)
import { useVirtualizer } from '@tanstack/react-virtual';

const VirtualizedList = ({ items }) => {
  const parentRef = useRef();
  
  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 50,
  });

  return (
    <div ref={parentRef} className="h-[600px] overflow-auto">
      {virtualizer.getVirtualItems().map((virtualItem) => (
        <div key={virtualItem.key} style={{ height: virtualItem.size }}>
          {items[virtualItem.index].name}
        </div>
      ))}
    </div>
  );
};
```

---

## **Accessibility Requirements**

- **WCAG 2.1 AA compliance**
- **Keyboard navigation** - All interactive elements accessible via keyboard
- **Screen reader support** - Proper ARIA labels
- **Color contrast** - Follow brand color contrast guidelines
- **Focus indicators** - Visible focus states
- **Alt text** - All images have alt text
- **Form labels** - All form inputs have associated labels

---

## **Performance Optimizations for Fast Records**

### Data Fetching Strategies
1. **Intelligent Caching**
   - React Query cache with 5-minute stale time
   - Background refetching for fresh data
   - Cache invalidation on mutations

2. **Pagination & Infinite Scroll**
   - Use `useInfiniteQuery` for large datasets
   - Load 20-50 records per page
   - Virtual scrolling for smooth rendering

3. **Optimistic Updates**
   - Update UI immediately before server confirmation
   - Rollback on error
   - Better perceived performance

4. **Request Deduplication**
   - React Query automatically deduplicates identical requests
   - Multiple components can use same query without extra requests

5. **IndexedDB Offline Storage**
   - Store frequently accessed data locally
   - Instant app startup with cached data
   - Sync when online

6. **Debounced Search**
   - Wait 300-500ms before triggering search
   - Reduce unnecessary API calls
   - Better user experience

### Performance Targets

- **First Contentful Paint (FCP)**: < 1.5s
- **Largest Contentful Paint (LCP)**: < 2.5s
- **Time to Interactive (TTI)**: < 3.5s
- **Cumulative Layout Shift (CLS)**: < 0.1
- **Bundle size**: < 500KB (gzipped)
- **Mobile performance**: Score > 90 (Lighthouse)
- **List rendering**: < 16ms per frame (60 FPS) with 1000+ items
- **API response time**: < 200ms (with caching)
- **Offline data access**: < 50ms (from IndexedDB)

---

## **Desktop App Architecture (Tauri)**

### Why Tauri?
- **Smaller bundle**: ~3MB vs Electron's ~100MB+
- **Better performance**: Native Rust backend, lower memory usage
- **Security**: Built-in security best practices
- **Cross-platform**: Windows, macOS, Linux
- **Future-ready**: Easy migration from web to desktop

### Tauri Setup Structure
```
H360-frontend/
├── src/                    # React app (same as web)
├── src-tauri/              # Tauri backend (Rust)
│   ├── src/
│   │   └── main.rs         # Tauri entry point
│   ├── Cargo.toml          # Rust dependencies
│   └── tauri.conf.json     # Tauri configuration
├── tauri.conf.json         # Main Tauri config
└── package.json            # Includes Tauri CLI
```

### Desktop App Features
- **Native file system access** - Export reports, import data
- **System tray integration** - Background notifications
- **Native notifications** - OS-level notifications
- **Auto-updater** - Automatic app updates
- **Window management** - Custom window controls
- **Offline-first** - Works without internet connection

### Migration Path
1. **Phase 1**: Build web app (Weeks 1-16)
2. **Phase 2**: Add Tauri wrapper (Week 17)
3. **Phase 3**: Add desktop-specific features
4. **Phase 4**: Package and distribute

### Tauri Commands (Rust Backend)
```rust
// Example: File operations
#[tauri::command]
fn export_patients_to_csv(data: Vec<Patient>) -> Result<String, String> {
    // Export logic
    Ok("exported.csv".to_string())
}

#[tauri::command]
fn read_local_config() -> Result<Config, String> {
    // Read from local file system
    Ok(config)
}
```

### React Integration
```typescript
// Use Tauri API in React
import { invoke } from '@tauri-apps/api/tauri';

const exportData = async () => {
  const result = await invoke('export_patients_to_csv', { data: patients });
  console.log('Exported to:', result);
};
```

---

## **Data Caching Strategy**

### Multi-Layer Caching
1. **React Query Cache** (In-Memory)
   - Fastest access (< 1ms)
   - Automatic invalidation
   - Background refetching

2. **IndexedDB** (Persistent Storage)
   - Survives page refresh
   - Offline access
   - Large storage capacity (GBs)

3. **Service Worker Cache** (Network)
   - API response caching
   - Offline fallback
   - Background sync

### Cache Invalidation Strategy
- **On mutation**: Invalidate related queries
- **Time-based**: 5-minute stale time
- **Manual**: Refresh button for critical data
- **Background**: Silent refetch when tab visible

### Offline Support
- **Read**: Always available from IndexedDB
- **Write**: Queue mutations, sync when online
- **Conflict resolution**: Last-write-wins or manual merge
- **Sync status**: Visual indicator for offline/online state

### Example: Patient List with Caching
```typescript
// src/features/patients/hooks/usePatients.ts
import { useQuery } from '@tanstack/react-query';
import { db } from '@/db';

export const usePatients = (filters: PatientFilters) => {
  return useQuery({
    queryKey: ['patients', filters],
    queryFn: async () => {
      // Try cache first
      const cached = await db.patients
        .where('clinic_id').equals(filters.clinic_id)
        .toArray();
      
      if (cached.length > 0 && !isStale(cached)) {
        return cached;
      }
      
      // Fetch from API
      const fresh = await fetchPatients(filters);
      
      // Update IndexedDB
      await db.patients.bulkPut(fresh);
      
      return fresh;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 30 * 60 * 1000, // 30 minutes
  });
};
```

---
## **Environment Variables**

```env
# API Configuration
VITE_API_BASE_URL=http://localhost:3000/api

# Environment
VITE_ENV=development

# Feature Flags (optional)
VITE_ENABLE_PWA=true
VITE_ENABLE_ANALYTICS=false
```

---

---

## **Notes**

- Each module should be independently testable
- Follow React best practices (hooks, composition, performance)
- Use TypeScript strictly - no `any` types
- Implement proper error handling and user feedback
- Keep components small and focused (Single Responsibility Principle)
- Use React Query for server state, Zustand for client state
- Mobile-first approach - design for mobile, enhance for desktop
- Test on real devices (iOS Safari, Android Chrome)
- Implement proper loading and error states
- Use optimistic updates for better UX
- Implement proper caching strategies
- **Virtual scrolling** for lists with 100+ items
- **IndexedDB** for offline-first architecture
- **Tauri** for future desktop app support
- **Performance monitoring** - Track API response times, render times
- **Debounced search** - Reduce API calls on user input
- **Request deduplication** - React Query handles this automatically
- **Lazy loading** - Code splitting for faster initial load
- **Image optimization** - Use WebP format, lazy loading images

---

**Last Updated:** 2026-01-13  
**Version:** 1.0
