# H360 Clinic CRM - Frontend

**Version:** 1.0  
**Status:** Week 1 - Project Setup & Design System ✅

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ (recommended: 20+)
- npm or yarn or pnpm

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linting
npm run lint

# Format code
npm run format

# Type check
npm run type-check
```

The app will be available at `http://localhost:3001`

---

## 📁 Project Structure

```
H360-frontend/
├── src/
│   ├── api/              # API client and endpoints
│   ├── components/       # React components
│   │   ├── ui/          # Base UI components
│   │   └── features/    # Feature-specific components
│   ├── db/              # IndexedDB setup (Dexie.js)
│   ├── features/        # Feature modules
│   ├── hooks/           # Custom React hooks
│   ├── lib/             # Library configurations
│   ├── styles/          # Global styles
│   ├── types/           # TypeScript type definitions
│   ├── utils/           # Utility functions
│   ├── App.tsx          # Main app component
│   └── main.tsx         # Entry point
├── docs/                # Documentation
├── public/              # Static assets
└── tests/               # Test files
```

---

## 🎨 Design System

### Brand Colors

- **Azure Dragon**: `#003D7A` - Primary brand color
- **White Smoke**: `#F5F5F5` - Backgrounds
- **Bright Halo**: `#FFD166` - Accents/Warnings
- **Carbon**: `#333333` - Text/Borders
- **Smudged Lips**: `#EF436B` - Errors/Alerts

### Typography

- **Headings**: Ultra Regular
- **Body**: PT Serif Regular
- **UI Elements**: Lato Regular

See `tailwind.config.js` for complete typographic scale.

---

## 🛠️ Technology Stack

- **React 18** - UI library
- **TypeScript 5** - Type safety
- **Vite** - Build tool
- **TailwindCSS** - Styling
- **React Query** - Server state management
- **Dexie.js** - IndexedDB wrapper
- **Axios** - HTTP client
- **React Router** - Routing (to be added)

---

## 📝 Environment Variables

Copy `.env.example` to `.env` and configure:

### Required Variables

```env
# Backend API URL
VITE_API_BASE_URL=http://localhost:3000/api

# Environment (development, staging, production)
VITE_ENV=development

# Google Maps API Key (for address autocomplete)
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
```

### Optional Variables

```env
# Enable Progressive Web App features
VITE_ENABLE_PWA=true

# Enable analytics tracking
VITE_ENABLE_ANALYTICS=false
```

### Google Maps API Setup

To enable address autocomplete functionality:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the following APIs:
   - Maps JavaScript API
   - Places API (New)
4. Create credentials (API Key)
5. Restrict the API key to your domain (recommended)
6. Add the API key to your `.env` file as `VITE_GOOGLE_MAPS_API_KEY`

### Environment-Specific Files

Vite supports environment-specific files:
- `.env` - Default (loaded in all environments)
- `.env.local` - Local overrides (gitignored)
- `.env.development` - Development-specific
- `.env.production` - Production-specific

**Note:** All environment variables must be prefixed with `VITE_` to be exposed to the client-side code.

---

## 🧪 Testing

Testing setup will be added in future weeks.

---

## 📚 Documentation

- [Roadmap](./roadmap.md) - Complete implementation roadmap
- [API Review](./app.review.md) - Backend API documentation
- [Module Documentation](./docs/modules/) - Individual module docs

---

## 🎯 Week 1 Status

✅ Project initialized with Vite + React + TypeScript  
✅ TailwindCSS configured with brand colors  
✅ TypeScript strict mode enabled  
✅ ESLint & Prettier configured  
✅ React Query setup  
✅ IndexedDB (Dexie.js) configured  
✅ Base UI components created  
✅ API client with interceptors  
✅ Project structure organized  

---

## 📖 Next Steps

- Week 2: Authentication Module
- Week 3: Layout & Navigation
- Week 4: Dashboard Module

See [roadmap.md](./roadmap.md) for complete schedule.

---

## 🤝 Contributing

Follow the module-based development approach outlined in the roadmap.

---

**Last Updated:** 2026-01-13
