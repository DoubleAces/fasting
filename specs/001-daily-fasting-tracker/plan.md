# Implementation Plan: Daily Fasting Tracker

**Branch**: `001-daily-fasting-tracker` | **Date**: October 17, 2025 | **Spec**: [spec.md](./spec.md)  
**Input**: Feature specification from `/specs/001-daily-fasting-tracker/spec.md`

**Note**: This plan follows the constitution requirements: Next.js App Router, JavaScript, TailwindCSS, MongoDB, TDD mandatory.

## Summary

Build a daily fasting tracker that allows users to log meal times, health metrics, and automatically calculates fasting duration between consecutive days. Users can configure their preferred measurement system (metric/imperial) and time format (12h/24h). The system provides historical data viewing with full CRUD operations on daily entries. This is a mobile-first, responsive web application prioritizing data security and accessibility.

## Technical Context

**Language/Version**: JavaScript ES6+ with Node.js 18+ (Next.js 14+)  
**Primary Dependencies**: Next.js 14, React 18, TailwindCSS 3, Mongoose, React Hook Form, date-fns  
**Storage**: MongoDB with Mongoose ODM  
**Testing**: Jest + React Testing Library (unit/integration), Playwright (E2E)  
**Target Platform**: Web (mobile-first responsive, optimized for touch)  
**Project Type**: Web application (Next.js App Router architecture)  
**Performance Goals**: LCP <2.5s, FID <100ms, CLS <0.1, page load <3s on 3G  
**Constraints**: WCAG 2.1 AA compliance, 80% test coverage, offline-tolerant forms  
**Scale/Scope**: Single-user MVP, ~10 components, 5-8 API routes, <500 daily entries expected

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### ✅ Compliance Check

| Principle | Status | Notes |
|-----------|--------|-------|
| Next.js Best Practices | ✅ PASS | Using App Router, Server Components, proper data fetching |
| Mobile-First Responsive | ✅ PASS | Touch targets 44x44px, responsive breakpoints, progressive enhancement |
| Test-Driven Development | ✅ PASS | Tests written first, 80% coverage required, Jest + RTL + Playwright |
| Component Architecture | ✅ PASS | Atomic design (atoms/molecules/organisms), isolated components |
| User Privacy & Security | ✅ PASS | Health data protection, no external tracking, localStorage for MVP |
| Performance & Accessibility | ✅ PASS | Target Lighthouse >90, WCAG 2.1 AA, semantic HTML |

### Required Gates
- [x] No implementation details leaked into spec
- [x] All functional requirements testable
- [x] Technology stack aligns with constitution
- [x] TDD workflow planned
- [x] Mobile-first approach documented

## Project Structure

### Documentation (this feature)

```
specs/001-daily-fasting-tracker/
├── spec.md              # Feature specification
├── plan.md              # This file
├── research.md          # Phase 0 output (technical decisions)
├── data-model.md        # Phase 1 output (MongoDB schemas)
├── quickstart.md        # Phase 1 output (dev setup guide)
├── contracts/           # Phase 1 output (API contracts)
│   └── api-spec.json   # OpenAPI/REST endpoint definitions
├── checklists/
│   └── requirements.md  # Spec quality checklist
└── tasks.md             # Phase 2 output (NOT created yet - /speckit.tasks)
```

### Source Code (repository root)

```
fasting/                 # Next.js App Router project
├── src/
│   ├── app/            # Next.js App Router
│   │   ├── layout.js   # Root layout
│   │   ├── page.js     # Home/Dashboard
│   │   ├── log/
│   │   │   └── page.js # Daily log entry form
│   │   ├── history/
│   │   │   └── page.js # Historical entries view
│   │   ├── settings/
│   │   │   └── page.js # User preferences
│   │   └── api/        # API Routes
│   │       ├── entries/
│   │       │   ├── route.js        # GET/POST entries
│   │       │   └── [id]/route.js   # GET/PUT/DELETE by ID
│   │       └── settings/
│   │           └── route.js        # GET/PUT user settings
│   ├── components/     # React components
│   │   ├── atoms/      # Button, Input, Select, Label
│   │   ├── molecules/  # FormField, TimeInput, RatingSelector
│   │   ├── organisms/  # EntryForm, EntryCard, HistoryList, SettingsForm
│   │   └── templates/  # PageLayout, FormLayout
│   ├── lib/            # Utilities
│   │   ├── db.js       # MongoDB connection
│   │   ├── models/     # Mongoose schemas
│   │   │   ├── Entry.js
│   │   │   └── Settings.js
│   │   ├── utils/      # Helper functions
│   │   │   ├── dateUtils.js
│   │   │   ├── timeUtils.js
│   │   │   ├── unitConversion.js
│   │   │   └── fastingCalculator.js
│   │   └── validation/ # Schema validation
│   │       └── entrySchema.js
│   └── styles/
│       └── globals.css # Tailwind imports + custom styles
├── tests/
│   ├── unit/           # Unit tests (utils, calculators)
│   ├── integration/    # API route tests
│   ├── components/     # Component tests (RTL)
│   └── e2e/            # Playwright tests
│       ├── log-entry.spec.js
│       ├── view-history.spec.js
│       └── settings.spec.js
├── public/             # Static assets
├── .env.local          # Environment variables (MongoDB URI)
├── next.config.js      # Next.js configuration
├── tailwind.config.js  # Tailwind configuration
├── jest.config.js      # Jest configuration
├── playwright.config.js # Playwright configuration
└── package.json        # Dependencies

```

**Structure Decision**: Using Next.js 14 App Router architecture with co-located API routes. This is a single-project web application following the constitution's Next.js best practices. Components organized by atomic design principles. Tests separated by type (unit/integration/e2e) for clarity. MongoDB connection and models centralized in `lib/` for reusability.

## Complexity Tracking

*No violations - all constitution principles are satisfied*

No additional complexity beyond constitution requirements. The architecture is straightforward:
- Single Next.js project (no separate backend)
- Standard App Router structure
- Atomic design component organization
- Test types clearly separated
- MongoDB with Mongoose (constitution-approved stack)

