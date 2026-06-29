# System Design Overview

This document provides a comprehensive overview of the Guitar Chord Theory application's architecture, components, and design patterns.

## Application Architecture

### High-Level Architecture
```
┌─────────────────────────────────────────────────────────────┐
│                     Client (Next.js)                       │
├─────────────────────────────────────────────────────────────┤
│  UI Layer (React Components)                               │
│  ├─ Auth (UserMenu, AuthModal)                            │
│  ├─ Chord Finder (ChordFinder, ChordDisplay)              │
│  ├─ Progression Builder (ChordProgressionBuilder)         │
│  └─ Common (ThemeToggle, LanguageToggle)                  │
├─────────────────────────────────────────────────────────────┤
│  Business Logic Layer                                      │
│  ├─ Contexts (AuthContext, LanguageContext)               │
│  ├─ Utils (chord-utils, chord-db-integration)             │
│  └─ Types (TypeScript interfaces)                         │
├─────────────────────────────────────────────────────────────┤
│  Data Layer                                                │
│  ├─ Supabase Client (auth, database)                      │
│  ├─ Chord Libraries (@tombatossals/chords-db, tonal)      │
│  └─ Local Storage (preferences, cache)                    │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                 External Services                          │
│  ├─ Supabase (Auth + PostgreSQL)                          │
│  ├─ Vercel (Hosting)                                       │
│  └─ Music Theory Libraries                                 │
└─────────────────────────────────────────────────────────────┘
```

## Core Components

### 1. Authentication System
**Location**: `components/auth/`, `contexts/auth-context.tsx`
**Purpose**: User authentication and session management
**Key Features**:
- Email/password authentication via Supabase
- Session persistence and auto-refresh
- User profile management
- Protected routes and features

**Flow**:
1. User signs up/in through AuthModal
2. Supabase handles authentication
3. AuthContext manages user state globally
4. UserMenu displays user info and logout

### 2. Chord Discovery System
**Location**: `components/chord-finder.tsx`, `lib/chord-utils.ts`
**Purpose**: Core chord search and display functionality
**Key Features**:
- Multiple input methods (note picker, text search)
- Integration with @tombatossals/chords-db
- Fallback to tonal.js for basic theory
- Multiple fingering options per chord
- Difficulty classification

**Data Flow**:
1. User selects chord (via picker or search)
2. chord-utils.ts processes request
3. Queries @tombatossals/chords-db first
4. Falls back to tonal.js if needed
5. Returns normalized chord data
6. ChordDisplay renders fingerings and theory

### 3. Chord Progression Builder
**Location**: `components/chord-progression-builder.tsx`
**Purpose**: Create and manage chord progressions
**Key Features**:
- Drag-and-drop chord arrangement
- Common progression templates
- Playback functionality
- Save/load user progressions
- Export capabilities

### 4. Internationalization System
**Location**: `contexts/language-context.tsx`, `lib/translations/`
**Purpose**: Multi-language support
**Supported Languages**: English, Chinese
**Implementation**: React Context with JSON translation files

### 5. Theme System
**Location**: `components/theme-toggle.tsx`, `components/theme-provider.tsx`
**Purpose**: Dark/light mode support
**Implementation**: CSS variables with Tailwind CSS dark mode classes

## Data Models

### User Data (Supabase)
```typescript
interface UserProfile {
  id: string
  email: string
  display_name: string | null
  created_at: string
  updated_at: string
}

interface ChordLookup {
  id: string
  user_id: string
  chord_name: string
  chord_data: any
  looked_up_at: string
  lookup_count: number
}

interface FavoriteChord {
  id: string
  user_id: string
  chord_name: string
  chord_data: any
  notes: string | null
  created_at: string
}

interface ChordProgression {
  id: string
  user_id: string
  name: string
  description: string | null
  chords: any[]
  tags: string[]
  is_public: boolean
  created_at: string
  updated_at: string
}
```

### Chord Data Models
```typescript
interface ChordInfo {
  name: string
  variations: number
  quality: string
  notes: string[]
  intervals: string[]
  fingerings: ChordFingering[]
}

interface ChordFingering {
  positionString: string
  positions: number[]
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced'
  name: string
  description: string
  fingers: number[]
  barres?: BarreInfo[]
}
```

## Key Design Patterns

### 1. Context-Based State Management
- **AuthContext**: Global user authentication state
- **LanguageContext**: Internationalization state
- **ThemeProvider**: Theme switching state
**Rationale**: Avoids prop drilling, provides clean separation of concerns

### 2. Compound Component Pattern
- Used in UI components (DropdownMenu, Dialog, etc.)
- Provides flexible, composable interfaces
- Maintains consistent styling and behavior

### 3. Provider Pattern
- Wrapping components for global state
- Clean dependency injection
- Easy testing and mocking

### 4. Custom Hooks Pattern
- `useAuth()`: Authentication state and actions
- `useLanguage()`: Translation functions and current language
- Encapsulates complex logic, provides clean APIs

## Performance Optimizations

### 1. Chord Data Caching
- Memory caching of frequently accessed chords
- Component-level memoization
- Prevents redundant API calls

### 2. Code Splitting
- Next.js automatic code splitting
- Lazy loading of heavy components
- Reduced initial bundle size

### 3. Image Optimization
- Next.js Image component for chord diagrams
- Responsive image loading
- WebP format support

### 4. Static Generation
- Pre-rendered pages where possible
- Faster initial page loads
- Better SEO performance

## Security Considerations

### 1. Authentication Security
- Supabase handles password hashing and session management
- JWT tokens for API authentication
- Secure HTTP-only cookies
- Email verification for new accounts

### 2. Data Validation
- Input sanitization for user-generated content
- TypeScript for type safety
- Server-side validation via Supabase RLS

### 3. Environment Variables
- Sensitive keys stored in environment variables
- Client-side vs server-side variable separation
- Development/production environment isolation

## Deployment Architecture

### Production Environment
- **Hosting**: Vercel
- **Database**: Supabase (PostgreSQL)
- **CDN**: Vercel Edge Network
- **Domain**: Custom domain with SSL

### CI/CD Pipeline
1. Code pushed to Git repository
2. Vercel automatically builds and deploys
3. Environment variables injected
4. Static assets optimized and cached

## Monitoring & Analytics

### Error Tracking
- Next.js built-in error boundaries
- Console logging for debugging
- User feedback through toast notifications

### Performance Monitoring
- Vercel Analytics for page performance
- Core Web Vitals tracking
- Bundle size monitoring

## Future Architecture Considerations

### 1. Scalability
- Consider Redis caching for high traffic
- Database read replicas for chord lookups
- CDN for static chord diagram images

### 2. Real-time Features
- WebSocket integration for collaborative progressions
- Live practice sessions
- Real-time user presence

### 3. Offline Support
- Service worker for chord data caching
- IndexedDB for offline storage
- Progressive Web App features

### 4. Mobile Apps
- React Native for native mobile apps
- Shared business logic between web and mobile
- Platform-specific optimizations

---

## Updating This Document

This document should be updated when:
- New major features are added
- Architecture patterns change
- New external dependencies are introduced
- Performance optimizations are implemented
- Security considerations change

**Last Updated**: December 2024
**Next Review**: Quarterly or when significant changes occur