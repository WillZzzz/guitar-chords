# Design Decisions

This document tracks key design and technical decisions made during development, including rationale and alternatives considered.

## Authentication & User Management

### Decision: Supabase Authentication
**Date**: Dec 2024
**Context**: Initially used localStorage-based authentication system
**Decision**: Migrated to Supabase authentication
**Rationale**: 
- Real email verification and secure authentication flows
- Scalable user management without custom backend
- Built-in security features (password hashing, session management)
- Integration with database for user profiles
**Alternatives Considered**: Custom auth, Firebase Auth
**Impact**: More robust authentication, better user experience

### Decision: Supabase Database Integration
**Date**: Dec 2024
**Context**: Need persistent storage for user data
**Decision**: Use Supabase PostgreSQL for user profiles, favorites, chord history
**Rationale**:
- Seamless integration with Supabase Auth
- SQL database for complex queries and relationships
- Real-time subscriptions for future features
**Database Schema**:
- `user_profiles`: User metadata and preferences
- `chord_lookups`: Chord search history with counts
- `favorite_chords`: User's saved favorite chords
- `chord_progressions`: Custom user-created progressions

## Chord Data & Music Theory

### Decision: @tombatossals/chords-db Integration
**Date**: Late 2024
**Context**: Need comprehensive chord fingering database
**Decision**: Integrate @tombatossals/chords-db as primary chord data source
**Rationale**:
- Extensive chord database with multiple fingerings per chord
- Well-maintained open source library
- Detailed fingering data (frets, fingers, barres, difficulty)
- Supports advanced chord types and variations
**Implementation**: Custom integration layer to normalize data format
**Fallback**: Tonal.js for basic chord theory when specific fingerings unavailable

### Decision: Chord Naming Normalization
**Date**: Late 2024
**Context**: Different chord naming conventions between libraries
**Decision**: Implement comprehensive chord suffix normalization
**Rationale**:
- Consistent user experience across different input formats
- Support for common chord notation variations (e.g., "maj7" vs "M7")
- Better search and discovery
**Implementation**: Suffix mapping system with fallback strategies

## UI/UX Design

### Decision: Responsive Mobile-First Design
**Date**: 2024
**Context**: Guitar learning often happens on mobile devices
**Decision**: Mobile-first responsive design with touch-optimized interactions
**Rationale**:
- Primary use case is mobile/tablet for practice
- Touch-friendly chord diagrams and controls
- Progressive enhancement for desktop
**Implementation**: Tailwind CSS breakpoints, mobile-specific layouts

### Decision: Radix UI + shadcn/ui Component System
**Date**: 2024
**Context**: Need accessible, customizable UI components
**Decision**: Use Radix UI primitives with shadcn/ui styling
**Rationale**:
- Built-in accessibility features
- Customizable with Tailwind CSS
- Consistent design system
- Well-documented and maintained
**Alternatives Considered**: Material UI, Chakra UI, custom components

### Decision: Dark/Light Theme Support
**Date**: 2024
**Context**: Different user preferences for practice environments
**Decision**: Implement theme toggle with system preference detection
**Rationale**:
- Better visibility in different lighting conditions
- User preference and accessibility
- Modern UI expectation
**Implementation**: CSS variables with Tailwind CSS dark mode

## Internationalization

### Decision: Multi-language Support (English/Chinese)
**Date**: 2024
**Context**: Diverse user base with different language preferences
**Decision**: Implement i18n with English and Chinese support
**Rationale**:
- Broader user accessibility
- Music terminology translation important for learning
- Foundation for additional languages
**Implementation**: React context-based translation system
**Future**: Additional language support as needed

## Architecture Decisions

### Decision: Next.js 14 with App Router
**Date**: 2024
**Context**: Need modern React framework with good performance
**Decision**: Use Next.js 14 with App Router architecture
**Rationale**:
- Server-side rendering for better SEO and performance
- Built-in optimization features
- Modern React patterns (Server Components)
- Excellent developer experience
**Trade-offs**: Learning curve for App Router patterns

### Decision: TypeScript Throughout
**Date**: 2024
**Context**: Large codebase with complex music theory logic
**Decision**: Full TypeScript implementation
**Rationale**:
- Type safety for music theory calculations
- Better developer experience with IDE support
- Reduced runtime errors
- Self-documenting code
**Impact**: Improved code quality and maintainability

## Performance Decisions

### Decision: Chord Data Caching Strategy
**Date**: Late 2024
**Context**: Expensive chord lookups and fingering calculations
**Decision**: Multi-layer caching (memory, component-level)
**Rationale**:
- Improved user experience with faster chord loading
- Reduced API calls to chord libraries
- Better performance on slower devices
**Implementation**: React state caching with invalidation strategies

---

## Template for New Decisions

### Decision: [Title]
**Date**: [YYYY-MM]
**Context**: [What situation led to this decision?]
**Decision**: [What was decided?]
**Rationale**: [Why was this decision made?]
**Alternatives Considered**: [What other options were evaluated?]
**Implementation**: [How was it implemented?]
**Trade-offs**: [What are the pros/cons?]
**Impact**: [What was the result?]