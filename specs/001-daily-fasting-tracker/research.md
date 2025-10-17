# Research & Technical Decisions

**Feature**: Daily Fasting Tracker  
**Date**: October 17, 2025  
**Phase**: 0 - Research & Architecture

## Overview

This document captures technical research and decisions for implementing the daily fasting tracker feature using Next.js 14, JavaScript, MongoDB, and TailwindCSS.

---

## 1. Next.js 14 App Router Architecture

### Decision
Use Next.js 14 App Router with Server Components as the default, Client Components only when needed for interactivity.

### Rationale
- **Server Components**: Reduce JavaScript bundle size, better performance, automatic code splitting
- **App Router**: Modern routing with layouts, loading states, error boundaries
- **Co-located API Routes**: Keep API routes in `app/api/` for simplified project structure
- **File-based routing**: Intuitive URL structure matching file system

### Implementation Approach
- **Server Components for**: Layout, static pages, data fetching
- **Client Components for**: Forms, interactive UI (marked with `'use client'`)
- **Server Actions**: For form submissions where appropriate
- **API Routes**: For CRUD operations on entries and settings

### Alternatives Considered
- **Pages Router**: Rejected - older pattern, less efficient, no streaming
- **Separate backend (Express)**: Rejected - unnecessary complexity for MVP, violates YAGNI principle

---

## 2. State Management Strategy

### Decision
Use React Context API for global state (user settings), local component state for forms, no external state library needed.

### Rationale
- **Settings Context**: Share measurement/time format preferences across app
- **Form State**: React Hook Form handles form state efficiently
- **No Redux/Zustand needed**: Simple app with limited global state requirements
- **Constitution alignment**: Keep it simple, avoid unnecessary dependencies

### Implementation Approach
```javascript
// contexts/SettingsContext.js
- Provide: measurementSystem, timeFormat, updateSettings
- Persist to localStorage (MVP), MongoDB (future)
- Load on app initialization
```

### Alternatives Considered
- **Zustand**: Rejected - overkill for 2 global settings
- **Redux**: Rejected - too complex for this scope
- **Server-only state**: Rejected - need client-side for immediate UI updates

---

## 3. MongoDB Schema Design

### Decision
Two collections: `entries` and `user_settings` with Mongoose ODM for schema validation and timestamps.

### Rationale
- **Mongoose**: Type safety for JavaScript, built-in validation, middleware hooks
- **Separate collections**: Clean separation of concerns, easier to query
- **Timestamps**: Automatic `createdAt` and `updatedAt` tracking
- **Indexes**: On `date` field for fast historical queries

### Schema Structure

**Entry Schema**:
```javascript
{
  date: Date (unique index),
  firstMealTime: String (HH:mm format, 24h internally),
  lastMealTime: String (HH:mm format, 24h internally),
  fastingDuration: Number (minutes, calculated),
  sleepHours: Number,
  weight: Number (always stored in kg, converted for display),
  hungerLevel: String (enum: ['Low', 'Medium', 'High']),
  energyLevel: String (enum: ['Low Energy', 'Medium Energy', 'High Energy']),
  wellBeing: String (enum: ['Poor', 'Fair', 'Good']),
  foodNotes: String (optional),
  createdAt: Date (auto),
  updatedAt: Date (auto)
}
```

**Settings Schema**:
```javascript
{
  userId: String (hardcoded 'default' for MVP, future: auth integration),
  measurementSystem: String (enum: ['metric', 'imperial'], default: 'metric'),
  timeFormat: String (enum: ['12h', '24h'], default: '24h'),
  createdAt: Date (auto),
  updatedAt: Date (auto)
}
```

### Alternatives Considered
- **Single collection with embedded settings**: Rejected - harder to query, denormalized
- **PostgreSQL**: Rejected - MongoDB better for flexible schemas, JSON-like data
- **LocalStorage only**: Rejected - doesn't meet "persist indefinitely" requirement

---

## 4. Time Handling & Fasting Calculation

### Decision
- Store all times in 24-hour format (HH:mm) internally
- Convert for display based on user preference
- Use `date-fns` library for date/time manipulation
- Calculate fasting duration server-side on entry creation/update

### Rationale
- **Internal consistency**: Always 24h format in database prevents ambiguity
- **Display flexibility**: Convert to 12h/24h based on user settings
- **date-fns**: Lightweight, tree-shakeable, better than Moment.js
- **Server-side calculation**: Single source of truth, prevents client manipulation

### Calculation Logic
```javascript
// Calculate fasting duration between two days
function calculateFastingDuration(previousDayLastMeal, currentDayFirstMeal) {
  // Convert HH:mm strings to Date objects
  // previousDayLastMeal on day D, currentDayFirstMeal on day D+1
  // Return difference in minutes
}
```

### Edge Cases Handled
- Missing previous day data → return null
- Times spanning midnight → handled by date-based calculation
- Timezone changes → use local time, no timezone conversion (MVP)

### Alternatives Considered
- **Client-side calculation**: Rejected - can be manipulated, inconsistent
- **Store as timestamps**: Rejected - don't need full timestamps, just HH:mm
- **Moment.js**: Rejected - too heavy, deprecated, use date-fns instead

---

## 5. Unit Conversion Strategy

### Decision
- Store weight in kilograms (kg) in database
- Convert to pounds (lbs) for display when user preference is imperial
- Conversion: 1 kg = 2.20462 lbs

### Rationale
- **Single source of truth**: Metric in DB, convert on read
- **Precision**: Store in kg (decimal), round on display
- **Consistency**: All backend logic uses metric

### Implementation
```javascript
// lib/utils/unitConversion.js
export const kgToLbs = (kg) => kg * 2.20462;
export const lbsToKg = (lbs) => lbs / 2.20462;
export const formatWeight = (kg, system) => {
  return system === 'imperial' 
    ? `${kgToLbs(kg).toFixed(1)} lbs` 
    : `${kg.toFixed(1)} kg`;
};
```

### Alternatives Considered
- **Store in both units**: Rejected - data duplication, sync issues
- **Store in user's preference**: Rejected - harder to query/compare across users (future)

---

## 6. Form Validation Strategy

### Decision
Use React Hook Form for client-side forms with Joi for schema validation on API routes.

### Rationale
- **React Hook Form**: Minimal re-renders, built-in validation, small bundle
- **Joi**: Powerful schema validation for API routes, consistent with constitution
- **Double validation**: Client (UX) + Server (security)

### Validation Rules
```javascript
// Entry validation
- date: required, valid date format, not future date
- firstMealTime: required, valid HH:mm format, must be after lastMealTime
- lastMealTime: required, valid HH:mm format
- sleepHours: optional, number, 0-24 range
- weight: optional, number, positive, reasonable range (20-500 kg)
- hungerLevel: optional, enum validation
- energyLevel: optional, enum validation
- wellBeing: optional, enum validation
- foodNotes: optional, string, max 1000 characters
```

### Alternatives Considered
- **Zod**: Rejected - Joi is in constitution, equally capable
- **No server validation**: Rejected - security risk, violates best practices

---

## 7. Accessibility Implementation

### Decision
- Semantic HTML throughout
- ARIA labels for all form inputs
- Keyboard navigation for all interactive elements
- Focus management for modals/dialogs
- Screen reader tested with NVDA/JAWS

### Rationale
- **WCAG 2.1 AA required**: Constitution mandate
- **Form accessibility critical**: Many inputs, must be navigable
- **Touch targets**: 44x44px minimum (constitution requirement)

### Implementation Checklist
- [ ] All inputs have associated labels
- [ ] Color contrast ratios meet AA standards
- [ ] Focus indicators visible
- [ ] Skip to main content link
- [ ] Error messages announced to screen readers
- [ ] Keyboard-only navigation functional

---

## 8. Testing Strategy

### Decision
- **Unit Tests**: Jest for utils, calculators, converters (pure functions)
- **Component Tests**: React Testing Library for component behavior
- **Integration Tests**: API route testing with mock MongoDB
- **E2E Tests**: Playwright for critical user flows

### Rationale
- **TDD Mandatory**: Constitution requirement
- **80% Coverage**: Constitution minimum
- **Test pyramid**: Many unit tests, fewer integration, minimal E2E
- **Fast feedback**: Unit tests run on every commit

### Test Coverage Targets
- Utils/calculators: 100% (pure functions, easy to test)
- Components: 80% (constitution minimum)
- API routes: 90% (critical business logic)
- E2E: Critical paths only (log entry, view history, edit entry)

### Test File Organization
```
tests/
├── unit/
│   ├── fastingCalculator.test.js
│   ├── unitConversion.test.js
│   ├── dateUtils.test.js
│   └── timeUtils.test.js
├── components/
│   ├── EntryForm.test.js
│   ├── HistoryList.test.js
│   └── SettingsForm.test.js
├── integration/
│   ├── api/entries.test.js
│   └── api/settings.test.js
└── e2e/
    ├── log-entry.spec.js
    ├── view-history.spec.js
    └── edit-entry.spec.js
```

---

## 9. Error Handling & Validation Feedback

### Decision
- Display validation errors inline below form fields
- Toast notifications for API errors (success/failure)
- Error boundaries for unexpected React errors
- Graceful degradation when offline

### Rationale
- **User experience**: Immediate feedback on input errors
- **Accessibility**: Error messages associated with inputs
- **Resilience**: App doesn't crash on errors

### Implementation
- React Hook Form built-in error handling
- Custom ErrorBoundary component
- API responses include descriptive error messages
- Loading states for async operations

---

## 10. Performance Optimization

### Decision
- Server Components for static content
- Dynamic imports for heavy components
- Image optimization via Next.js Image component
- Tailwind CSS purge for minimal CSS bundle

### Rationale
- **Lighthouse >90**: Constitution requirement
- **Mobile-first**: Optimize for slower connections
- **Core Web Vitals**: LCP, FID, CLS targets must be met

### Optimization Techniques
- Lazy load history list items (virtual scrolling if >100 entries)
- Debounce search/filter inputs
- Memoize expensive calculations
- Minimize JavaScript bundle with tree-shaking

---

## Technology Stack Summary

| Category | Technology | Justification |
|----------|-----------|---------------|
| Framework | Next.js 14 App Router | Constitution requirement, modern patterns |
| Language | JavaScript ES6+ | Constitution requirement |
| Styling | TailwindCSS 3 | Constitution requirement, utility-first |
| Database | MongoDB + Mongoose | Constitution requirement, flexible schemas |
| Forms | React Hook Form | Minimal re-renders, small bundle |
| Validation | Joi | Constitution requirement, powerful schemas |
| Date/Time | date-fns | Lightweight, tree-shakeable |
| Testing | Jest + RTL + Playwright | Constitution requirement, industry standard |
| State | React Context API | Simple, built-in, sufficient for scope |

---

## Risks & Mitigation

| Risk | Impact | Mitigation |
|------|--------|-----------|
| MongoDB connection issues | High | Implement retry logic, connection pooling |
| Form validation complexity | Medium | Use Joi schemas, validate server-side |
| Mobile performance | Medium | Optimize images, lazy loading, code splitting |
| Accessibility gaps | High | WCAG audit, screen reader testing |
| Test coverage <80% | High | Enforce pre-commit hooks, CI checks |

---

## Next Steps (Phase 1)

1. ✅ Complete research documentation
2. → Generate data-model.md (MongoDB schemas in detail)
3. → Generate API contracts (OpenAPI spec for REST endpoints)
4. → Generate quickstart.md (dev environment setup)
5. → Update agent context file (CLAUDE.md)
