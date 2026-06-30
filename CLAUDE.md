# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # start dev server at localhost:3000
npm run build    # production build
npm run lint     # ESLint
```

No test suite is configured.

## Environment

Requires `.env.local` (copy from `.env.local.example`):
```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

The app runs without Supabase — `lib/supabase.ts` returns a `null` client and all auth/user features degrade gracefully when env vars are missing or placeholder values.

## Architecture

**Entry point**: `app/page.tsx` → `components/main-content.tsx`, which hosts three tabs: Chord Finder, Reverse Chord Finder, and Progression Builder.

### Chord data pipeline

All chord lookups go through `lib/chord-utils.ts:getChordData()`, which tries three sources in priority order:

1. **`@tombatossals/chords-db`** via `lib/chords-db-integration.ts` — curated fingering data, primary source
2. **Custom library** via `lib/chord-libraries.ts` — hand-curated fallback
3. **`chord-fingering` npm package** via `lib/chord-fingering-integration.ts` — last resort

Music theory (intervals, scales, related chords, reverse chord identification) uses **Tonal.js** via `lib/tonal-integration.ts`.

### Audio

`lib/audio-utils.ts` is the active implementation (Web Audio API, iPhone-compatible with timeout handling). The other files (`audio-utils-hybrid.ts`, `audio-utils-improved.ts`, `audio-utils-ios-fix.ts`, `audio-utils-simple.ts`, `audio-html5-fallback.ts`) are experimental variants — do not use them unless intentionally switching implementations.

### Auth & user features

- `lib/supabase.ts` — Supabase client + all DB helper functions (chord lookups, favorites, progressions)
- `contexts/auth-context.tsx` — React context wrapping Supabase auth
- `components/auth/` — auth modal and user menu
- `components/user-features/` — favorites, saved progressions, chord notebook (all require auth)
- `lib/local-storage.ts` — persistence for unauthenticated users
- Database schema: `supabase-schema.sql`; setup script: `scripts/create-tables.sql`

### i18n

English + Chinese. Translations live in `lib/locales/en.json` and `lib/locales/zh.json`. `lib/i18n.ts` resolves dot-notation keys with parameter interpolation. `contexts/language-context.tsx` exposes the `t()` function used throughout components.

### UI components

`components/ui/` contains shadcn/ui components (Radix UI primitives + Tailwind). Do not edit these directly — treat them as a library layer.

Chord diagram rendering: `components/chord-diagram.tsx` (full size) and `components/mini-chord-diagram.tsx` (compact, used in progression builder).
